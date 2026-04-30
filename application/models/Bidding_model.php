<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Bidding_model extends CI_Model
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model('slotresult_model');
    }

    private function getAlumniId($user_id)
    {
        $row = $this->db->get_where('alumni', ['user_id' => $user_id])->row_array();
        return $row ? $row['alumni_id'] : false;
    }

    // Shows slots that people can bid on
    public function getAvailableSlots()
    {
        $currentTime  = time();
        $todayStr     = date('Y-m-d', $currentTime);
        $tomorrowStr  = date('Y-m-d', strtotime('+1 day',  $currentTime));
        $dayAfterStr  = date('Y-m-d', strtotime('+2 days', $currentTime));

        $sixPMToday   = strtotime($todayStr . ' 18:00:00');
        $isPast6PM    = $currentTime >= $sixPMToday;

        // Ensure tomorrow's slot exists always
        $this->ensureSlotExists($tomorrowStr);

        // After 6 PM, also ensure the day-after-tomorrow slot
        if ($isPast6PM) {
            $this->ensureSlotExists($dayAfterStr);
        }

        $slots = [];

        // ── Today's slot (biddable until 6 PM) ──────────────
        if (!$isPast6PM) {
            $todaySlot = $this->db->get_where('Slot', ['slot_date' => $todayStr])->row_array();
            if ($todaySlot) {
                $todaySlot['is_locked']   = false;
                $todaySlot['lock_reason'] = null;
                $todaySlot['opens_at']    = null;
                $slots[] = $todaySlot;
            }
        }

        // ── Tomorrow's slot (locked until 6 PM today) ───────
        $tomorrowSlot = $this->db->get_where('Slot', ['slot_date' => $tomorrowStr])->row_array();
        if ($tomorrowSlot) {
            $tomorrowSlot['is_locked']   = !$isPast6PM;           // locked before 6 PM
            $tomorrowSlot['lock_reason'] = !$isPast6PM ? 'Opens at 6 PM today' : null;
            $tomorrowSlot['opens_at']    = !$isPast6PM ? ($todayStr . ' 18:00:00') : null;
            $slots[] = $tomorrowSlot;
        }

        return $slots;
    }

    /**
     * Ensures a slot for a specific date exists in the database.
     * Bidding start time is 6 PM of the previous day.
     * Bidding end time is 6 PM of the slot date.
     */
    private function ensureSlotExists($date)
    {
        $query = $this->db->get_where('Slot', ['slot_date' => $date]);

        if ($query->num_rows() == 0) {
            // Previous day's 6 PM
            $prevDate = date('Y-m-d', strtotime($date . ' -1 day'));
            $biddingStartTime = $prevDate . ' 18:00:00';

            // Slot day's 6 PM
            $biddingEndTime = $date . ' 17:59:59';

            $data = [
                'slot_date' => $date,
                'bidding_start_time' => $biddingStartTime,
                'bidding_end_time' => $biddingEndTime,
                'status' => 'ACTIVE'
            ];

            $this->db->insert('Slot', $data);
        }
    }

    /**
     * Cron-safe: ensure a slot exists for a given slot_date.
     * slot_date is the "result date" at 18:00.
     */
    public function ensure_slot_exists(string $slotDate): void
    {
        $this->ensureSlotExists($slotDate);
    }


    // Places a new bid
    public function place_bid($bidpayload)
    {
        // Get alumni id
        $alumniId = $this->getAlumniId($bidpayload['user_id']);
        if (!$alumniId) {
            return ['status' => false, 'message' => 'Alumni account not found'];
        }

        // Did they win 3 times already?
        if ($this->slotresult_model->hasReachedMonthlyLimit($alumniId)) {
            return ['status' => false, 'message' => 'You have reached your monthly win limit (3 wins). You cannot bid until next month.'];
        }

        // Check if slot exists
        $slot = $this->db->get_where('Slot', ['slot_id' => $bidpayload['slot_id']])->row_array();
        if (!$slot) {
            return ['status' => false, 'message' => 'Slot not found'];
        }

        // Is it the right time to bid?
        $currentTime = date('Y-m-d H:i:s');
        if ($currentTime < $slot['bidding_start_time'] || $currentTime > $slot['bidding_end_time']) {
            return ['status' => false, 'message' => 'Bidding is currently closed for this slot'];
        }

        // Check if bid already there
        $existingBid = $this->db->get_where('Bid', [
            'alumni_id' => $alumniId,
            'slot_id'   => $bidpayload['slot_id']
        ])->row_array();

        if ($existingBid) {
            return ['status' => false, 'message' => 'You have already placed a bid for this slot.Update the slot'];
        } else {
            // Save bid
            $data = [
                'alumni_id'  => $alumniId,
                'slot_id'    => $bidpayload['slot_id'],
                'bid_amount' => $bidpayload['bid_amount'],
                'status'     => 'ACTIVE' // Default status for new bids
            ];

            // Insert into the Bids table
            if ($this->db->insert('Bid', $data)) {
                return ['status' => true, 'message' => 'Bid placed successfully', 'bid_id' => $this->db->insert_id()];
            }
        }

        return ['status' => false, 'message' => 'Internal error occurred while placing bid'];
    }

    public function cancel_bid($bidpayload)
    {
        $bidId = $bidpayload['bid_id'];
        $alumniId = $this->getAlumniId($bidpayload['user_id']);

        $bid = $this->db->get_where('Bid', ['bid_id' => $bidId])->row_array();
        if (!$bid) {
            return ['status' => false, 'message' => 'Bid not found'];
        }

        if ($bid['alumni_id'] != $alumniId) {
            return ['status' => false, 'message' => 'You are not authorized to cancel this bid'];
        }

        if ($bid['status'] != 'ACTIVE') {
            return ['status' => false, 'message' => 'Bid is not active'];
        }

        $this->db->where('bid_id', $bidId);
        $this->db->update('Bid', ['status' => 'CANCELLED']);

        return ['status' => true, 'message' => 'Bid cancelled successfully'];
    }

    public function update_bid($bidpayload)
    {
        $bidId = $bidpayload['bid_id'];
        $alumniId = $this->getAlumniId($bidpayload['user_id']);
        $bidAmount = $bidpayload['bid_amount'];

        $bid = $this->db->get_where('Bid', ['bid_id' => $bidId])->row_array();
        if (!$bid) {
            return ['status' => false, 'message' => 'Bid not found'];
        }

        if ($bid['alumni_id'] != $alumniId) {
            return ['status' => false, 'message' => 'You are not authorized to update this bid'];
        }


        $this->db->where('bid_id', $bidId);
        $this->db->update('Bid', ['bid_amount' => $bidAmount, 'status' => 'ACTIVE', 'updated_at' => date('Y-m-d H:i:s')]);

        return ['status' => true, 'message' => 'Bid updated successfully'];
    }

    public function view_bid_status($bidpayload)
    {
        $bidId = $bidpayload['bid_id'];
        $alumniId = $this->getAlumniId($bidpayload['user_id']);

        $bid = $this->db->get_where('Bid', ['bid_id' => $bidId])->row_array();
        if (!$bid) {
            return ['status' => false, 'message' => 'Bid not found'];
        }

        if ($bid['alumni_id'] != $alumniId) {
            return ['status' => false, 'message' => 'You are not authorized to view this bid'];
        }
        $slotId = $bid['slot_id'];

        // Get all active bids for this slot to compare and return as a list
        $this->db->select('bid_id, bid_amount');
        $this->db->where('slot_id', $slotId);
        $this->db->where('status', 'ACTIVE');
        $this->db->order_by('bid_amount', 'DESC');
        $allBids = $this->db->get('Bid')->result_array();

        // Check if I am winning
        $isWinning = false;
        if ($bid['status'] == 'ACTIVE') {
            $isWinning = true;
            foreach ($allBids as $b) {
                if ($b['bid_id'] != $bidId && $b['bid_amount'] >= $bid['bid_amount']) {
                    $isWinning = false;
                    break;
                }
            }
        }

        return [
            'status' => true,
            'message' => 'Bid status retrieved successfully',
            'data' => [
                'bid_id' => $bidId,
                'my_bid_amount' => $bid['bid_amount'],
                'bid_status' => $isWinning ? 'WINNING' : 'NOT WINNING',
            ]
        ];
    }

    public function view_bidding_history($userId)
    {
        $alumniId = $this->getAlumniId($userId);
        if (!$alumniId) {
            return ['status' => false, 'message' => 'Alumni account not found'];
        }

        $this->db->select('b.bid_id, b.slot_id, s.slot_date, b.bid_amount, b.status as result_status');
        $this->db->from('Bid b');
        $this->db->join('Slot s', 'b.slot_id = s.slot_id');
        $this->db->where('b.alumni_id', $alumniId);
        $this->db->order_by('s.slot_date', 'DESC');

        $query = $this->db->get();

        return [
            'status' => true,
            'message' => 'Bidding history fetched successfully',
            'data' => $query->result_array()
        ];
    }

    public function get_slot_by_date($date)
    {
        $query = $this->db->get_where('Slot', ['slot_date' => $date]);
        return $query->row_array();
    }
}

