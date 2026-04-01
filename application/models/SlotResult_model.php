<?php
defined('BASEPATH') or exit('No direct script access allowed');

class SlotResult_model extends CI_Model {

    public function __construct()
    {
        parent::__construct();
    }

    // ---------------------------------------------------------------
    // HELPER
    // ---------------------------------------------------------------

    /**
     * Returns the alumni_id for a given user_id, or false if not found.
     */
    private function getAlumniId($user_id) {
        $row = $this->db->get_where('alumni', ['user_id' => $user_id])->row_array();
        return $row ? $row['alumni_id'] : false;
    }

    // ---------------------------------------------------------------
    // WINNER PREDICTION
    // Runs automatically at 6:00 PM (18:00) via cron job.
    // Selects the highest bid from today's slot.
    // ---------------------------------------------------------------

    /**
     * Select and persist winners for all slots on a given slot_date.
     *
     * Tie-breaker when multiple bids share the same max bid_amount:
     *  - lowest bid_id wins (earliest inserted)
     *
     * Notes:
     *  - "Today's bids" are implicitly the bids for slots where Slot.slot_date = $slotDate.
     *  - Winner validity 6PM→6PM is driven by your Slot bidding window; this job runs at 18:00.
     *
     * @return array ['status' => bool, 'message' => string, 'data' => array|null]
     */
    public function predict_winners_for_date(string $slotDate): array
    {
        // 1) Load the single slot for the requested date.
        // Business rule: exactly ONE slot exists per slot_date (result date at 18:00).
        $slots = $this->db->get_where('Slot', ['slot_date' => $slotDate])->result_array();
        if (!$slots) {
            return ['status' => false, 'message' => "No slot found for slot_date ({$slotDate})"];
        }
        if (count($slots) > 1) {
            return [
                'status'  => false,
                'message' => "Data integrity error: multiple slots found for slot_date ({$slotDate}). Expected exactly 1."
            ];
        }

        $processed   = [];
        $created     = 0;
        $skipped     = 0;
        $noBids      = 0;
        $winnerIds   = [];

        $this->db->trans_start();

        foreach ($slots as $slot) {
            $slotId = $slot['slot_id'];

            // 2) Skip if already has a result for this slot_id
            $existing = $this->db->get_where('Slot_Result', ['slot_id' => $slotId])->row_array();
            if ($existing) {
                $skipped++;
                $processed[] = [
                    'slot_id' => $slotId,
                    'status'  => 'skipped',
                    'message' => 'Winner already selected for this slot',
                    'data'    => $existing,
                ];
                continue;
            }

            // 3) Highest ACTIVE bid for this slot, with deterministic tie-breaker
            $this->db->select('Bid.bid_id, Bid.alumni_id, Bid.bid_amount');
            $this->db->from('Bid');
            $this->db->where('Bid.slot_id', $slotId);
            $this->db->where('Bid.status', 'ACTIVE');
            $this->db->order_by('Bid.bid_amount', 'DESC');
            $this->db->order_by('Bid.bid_id', 'ASC');
            $this->db->limit(1);
            $winningBid = $this->db->get()->row_array();

            if (!$winningBid) {
                $noBids++;
                $processed[] = [
                    'slot_id' => $slotId,
                    'status'  => 'no_bids',
                    'message' => 'No active bids for this slot',
                ];
                continue;
            }

            $winningBidId   = $winningBid['bid_id'];
            $winnerAlumniId = $winningBid['alumni_id'];

            // 4) Insert Slot_Result
            $this->db->insert('Slot_Result', [
                'slot_id'           => $slotId,
                'winning_bid_id'    => $winningBidId,
                'winning_alumni_id' => $winnerAlumniId,
            ]);
            $resultId = $this->db->insert_id();

            // 5) Increment monthly limit wins_count
            $this->_incrementMonthlyWinCount($winnerAlumniId);

            // 6) Mark winning bid as WON, all other ACTIVE bids as LOST
            $this->db->where('bid_id', $winningBidId);
            $this->db->update('Bid', ['status' => 'WON']);

            $this->db->where('slot_id', $slotId);
            $this->db->where('bid_id !=', $winningBidId);
            $this->db->where('status', 'ACTIVE');
            $this->db->update('Bid', ['status' => 'LOST']);

            $winnerIds[] = $winnerAlumniId;
            $created++;

            $processed[] = [
                'slot_id' => $slotId,
                'status'  => 'created',
                'message' => 'Winner selected',
                'data'    => [
                    'result_id'        => $resultId,
                    'slot_id'          => $slotId,
                    'slot_date'        => $slotDate,
                    'winning_bid_id'   => $winningBidId,
                    'winner_alumni_id' => $winnerAlumniId,
                    'winning_amount'   => $winningBid['bid_amount'],
                ],
            ];
        }

        // 7) Mark current active winners; expire previous ones (system-wide flag)
        // If you later need per-slot active winners, prefer a dedicated table keyed by slot_id.
        $this->db->update('alumni', ['is_active_winner' => 0]);

        $winnerIds = array_values(array_unique(array_filter($winnerIds)));
        if (!empty($winnerIds)) {
            $this->db->where_in('alumni_id', $winnerIds);
            $this->db->update('alumni', ['is_active_winner' => 1]);
        }

        $this->db->trans_complete();

        if ($this->db->trans_status() === false) {
            return ['status' => false, 'message' => 'Database transaction failed while selecting winners'];
        }

        return [
            'status'  => true,
            'message' => "Winner selection finished for slot_date ({$slotDate})",
            'data'    => [
                'slot_date' => $slotDate,
                'totals'    => [
                    'slots'    => 1,
                    'created'  => $created,
                    'skipped'  => $skipped,
                    'no_bids'  => $noBids,
                ],
                'results'   => $processed,
            ],
        ];
    }

    /**
     * Backward-compatible wrapper: selects winners for today's slot_date.
     */
    public function predict_winner(): array
    {
        return $this->predict_winners_for_date(date('Y-m-d'));
    }

 
    /**
     * Increment the win count for an alumni in the current month/year.
     * Inserts a new record if one doesn't exist yet.
     */
    private function _incrementMonthlyWinCount($alumniId) {
        $month = (int) date('m');
        $year  = (int) date('Y');

        $record = $this->db->get_where('monthly_limit', [
            'alumni_id' => $alumniId,
            'month'     => $month,
            'year'      => $year,
        ])->row_array();

        if ($record) {
            // Increment existing record
            $this->db->where('alumni_id', $alumniId);
            $this->db->where('month', $month);
            $this->db->where('year', $year);
            $this->db->set('wins_count', 'wins_count + 1', false);
            $this->db->update('monthly_limit');
        } else {
            // Create new record for this month (wins_count starts at 1)
            $this->db->insert('monthly_limit', [
                'alumni_id'  => $alumniId,
                'month'      => $month,
                'year'       => $year,
                'wins_count' => 1,
                'max_limit'  => 3,
            ]);
        }
    }

    /**
     * Check whether an alumni has reached their monthly win limit (3 wins).
     * This is called before placing a bid.
     *
     * @param int $alumniId
     * @return bool  true = limit reached (cannot bid), false = can still bid
     */
    public function hasReachedMonthlyLimit($alumniId) {
        $month = (int) date('m');
        $year  = (int) date('Y');

        $record = $this->db->get_where('monthly_limit', [
            'alumni_id' => $alumniId,
            'month'     => $month,
            'year'      => $year,
        ])->row_array();

        if (!$record) {
            return false; // No wins yet this month
        }

        return $record['wins_count'] >= $record['max_limit'];
    }

    /**
     * Get the result (winner details) for a specific slot.
     */
    public function get_slot_result($slotId) {
        $this->db->select('Slot_Result.result_id, Slot_Result.slot_id, Slot_Result.winning_bid_id, Slot_Result.selected_at,
                           Bid.bid_amount, Bid.alumni_id,
                           alumni.alumni_id, 
                           CONCAT(users.first_name, " ", users.second_name) as full_name, users.user_name as email');
        $this->db->from('Slot_Result');
        $this->db->join('Bid',    'Bid.bid_id = Slot_Result.winning_bid_id', 'left');
        $this->db->join('alumni', 'alumni.alumni_id = Bid.alumni_id', 'left');
        $this->db->join('users',  'users.user_id = alumni.user_id', 'left');
        $this->db->where('Slot_Result.slot_id', $slotId);
        $result = $this->db->get()->row_array();

        if (!$result) {
            return ['status' => false, 'message' => 'No result found for this slot'];
        }

        return ['status' => true, 'message' => 'Slot result fetched successfully', 'data' => $result];
    }

    public function view_winner($slotId)
    {
        $this->db->select('ap.*, CONCAT(u.first_name, " ", u.second_name) as full_name, u.user_name as email, sr.selected_at');
        $this->db->from('Slot_Result sr');
        $this->db->join('alumni a', 'a.alumni_id = sr.winning_alumni_id');
        $this->db->join('users u', 'u.user_id = a.user_id');
        $this->db->join('alumni_profiles ap', 'ap.alumni_id = sr.winning_alumni_id', 'left');
        $this->db->where('sr.slot_id', $slotId);

        $query = $this->db->get();
        $result = $query->row_array();

        if (!$result) {
            return ['status' => false, 'message' => 'Winner details not found for this slot'];
        }

        // Decode JSON profile fields
        $jsonFields = ['degrees', 'certifications', 'licenses', 'professional_courses', 'employment_history'];
        foreach ($jsonFields as $field) {
            if (!empty($result[$field])) {
                $result[$field] = json_decode($result[$field], true);
            }
        }

        return ['status' => true, 'message' => 'Winner profile fetched successfully', 'data' => $result];
    }

    /**
     * Return monthly win limit status for the authenticated alumni.
     */
    public function get_monthly_limit_status($userId) {
        $alumniId = $this->getAlumniId($userId);
        if (!$alumniId) {
            return ['status' => false, 'message' => 'Alumni account not found'];
        }

        $month = (int) date('m');
        $year  = (int) date('Y');

        $record = $this->db->get_where('monthly_limit', [
            'alumni_id' => $alumniId,
            'month'     => $month,
            'year'      => $year,
        ])->row_array();

        $winsCount = $record ? (int) $record['wins_count'] : 0;
        $maxLimit  = $record ? (int) $record['max_limit']  : 3;
        $remaining = max(0, $maxLimit - $winsCount);

        return [
            'status'  => true,
            'message' => 'Monthly limit status fetched successfully',
            'data'    => [
                'alumni_id'    => $alumniId,
                'month'        => $month,
                'year'         => $year,
                'wins_count'   => $winsCount,
                'max_limit'    => $maxLimit,
                'wins_remaining' => $remaining,
                'can_bid'      => $remaining > 0,
            ]
        ];
    }
}
