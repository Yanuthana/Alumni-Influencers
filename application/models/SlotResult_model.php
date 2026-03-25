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
     * Automatically predict and save the winner for TODAY's slot.
     *
     * This method is designed to be called by a cron job at 18:00 (6 PM).
     * It processes the slot for the current day.
     *
     * Workflow:
     *  1. Find today's slot (slot_date = today).
     *  2. Check if a result already exists for this slot.
     *  3. Find the highest ACTIVE bid for this slot.
     *  4. Insert a row into Slot_Result.
     *  5. Upsert the winner's monthly_limit row (inc wins_count).
     *  6. Mark the winning bid as WON and all others as LOST.
     *  7. Mark the winner's alumni_profiles row with is_winner = 1.
     *  8. Send an email notification to the winner.
     *
     * Cron example (runs at 18:00 every day):
     *   0 18 * * * /Applications/XAMPP/xamppfiles/bin/php \
     *              /Applications/XAMPP/xamppfiles/htdocs/Alumni-Influencers/cron_winner.php >> /tmp/alumni_cron.log 2>&1
     *
     * @return array ['status' => bool, 'message' => string, 'data' => array|null]
     */
    public function predict_winner() {
        $today = date('Y-m-d');

        // 1. Get today's slot
        $slot = $this->db->get_where('Slot', ['slot_date' => $today])->row_array();
        if (!$slot) {
            return ['status' => false, 'message' => "No slot found for today ({$today})"];
        }

        $slotId = $slot['slot_id'];

        // 2. Check if result already recorded for this slot
        $existing = $this->db->get_where('Slot_Result', ['slot_id' => $slotId])->row_array();
        if ($existing) {
            return [
                'status'  => false,
                'message' => "Winner already predicted for slot on {$today}",
                'data'    => $existing,
            ];
        }

        // 3. Find the highest ACTIVE bid for this slot
        $this->db->select('Bid.bid_id, Bid.alumni_id, Bid.bid_amount');
        $this->db->from('Bid');
        $this->db->where('Bid.slot_id', $slotId);
        $this->db->where('Bid.status', 'ACTIVE');
        $this->db->order_by('Bid.bid_amount', 'DESC');
        $this->db->limit(1);
        $winningBid = $this->db->get()->row_array();

        if (!$winningBid) {
            return ['status' => false, 'message' => "No active bids found for slot on {$today}. No winner to predict."];
        }

        $winningBidId   = $winningBid['bid_id'];
        $winnerAlumniId = $winningBid['alumni_id'];

        // 4. Insert into Slot_Result
        $this->db->insert('Slot_Result', [
            'slot_id'           => $slotId,
            'winning_bid_id'    => $winningBidId,
            'winning_alumni_id' => $winnerAlumniId,
        ]);
        $resultId = $this->db->insert_id();

        // 5. Upsert winner's monthly_limit record
        $this->_incrementMonthlyWinCount($winnerAlumniId);

        // 6. Mark winning bid as WON, all other active bids for this slot as LOST
        $this->db->where('bid_id', $winningBidId);
        $this->db->update('Bid', ['status' => 'WON']);

        $this->db->where('slot_id', $slotId);
        $this->db->where('bid_id !=', $winningBidId);
        $this->db->where('status', 'ACTIVE');
        $this->db->update('Bid', ['status' => 'LOST']);

        // 7. Mark winner's profile as winner (is_winner = 1)
        $existingProfile = $this->db
            ->get_where('alumni', ['alumni_id' => $winnerAlumniId])
            ->row_array();

        if ($existingProfile) {
            $this->db->where('alumni_id', $winnerAlumniId);
            $this->db->update('alumni', ['is_active_winner' => 1]);
        } else {
            $this->db->insert('alumni', [
                'alumni_id' => $winnerAlumniId,
                'is_active_winner' => 1,
            ]);
        }
       
        return [
            'status'  => true,
            'message' => "Winner predicted and saved successfully for slot on {$today}",
            'data'    => [
                'result_id'        => $resultId,
                'slot_id'          => $slotId,
                'slot_date'        => $today,
                'winning_bid_id'   => $winningBidId,
                'winner_alumni_id' => $winnerAlumniId,
                'winning_amount'   => $winningBid['bid_amount'],
                
            ]
        ];
    }   

    // ---------------------------------------------------------------
    // MONTHLY WIN LIMIT HELPERS
    // ---------------------------------------------------------------

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

    // ---------------------------------------------------------------
    // VIEW SLOT RESULT
    // ---------------------------------------------------------------

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

    // ---------------------------------------------------------------
    // VIEW MONTHLY LIMIT STATUS (for an alumni)
    // ---------------------------------------------------------------

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
