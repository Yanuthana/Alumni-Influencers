<?php
defined('BASEPATH') or exit('No direct script access allowed');


require_once APPPATH . 'core/BaseApiController.php';

/**
 * @property Bidding_model $bidding_model
 */
class BiddingSystem extends BaseApiController
{

    function __construct()
    {
        parent::__construct();
        $this->load->model('bidding_model');
    }

    /**
     * View tomorrow's bidding slot.
     * Triggers slot generation if it's after 6 PM.
     */
    private function _get_user_id()
    {
        $this->_require_role(['alumni']);
        $user_id = $this->input->get('user_id');
        if (!$user_id) {
            $this->_respond(400, ['status' => 'error', 'message' => 'user_id query parameter is required']);
        }
        return $user_id;
    }
    public function view_slots()
    {
        // Get tomorrow's slot (this will auto-create slots if needed)
        $this->_require_role(['alumni']);
        $slot = $this->bidding_model->getTomorrowSlot();

        if ($slot) {
            $this->_respond(200, [
                'status' => 'success',
                'message' => 'Slot details fetched successfully',
                'data' => $slot
            ]);
        } else {
            $this->_respond(500, [
                'status' => 'error',
                'message' => 'Unable to fetch or generate slot',
            ]);
        }
    }

    public function place_bid()
    {
        $d = $this->_json_body();
        $userId = $this->_get_user_id();

        // Validate required fields
        if (empty($d['slot_id']) || empty($d['bid_amount'])) {
            $this->_respond(400, [
                'status' => 'error',
                'message' => 'slot_id and bid_amount are required'
            ]);
        }

        $bidpayload = [
            'slot_id'    => $d['slot_id'],
            'bid_amount' => $d['bid_amount'],
            'user_id'    => $userId
        ];

        $result = $this->bidding_model->place_bid($bidpayload);

        if ($result['status']) {
            $this->_respond(200, [
                'status'  => 'success',
                'message' => $result['message']
            ]);
        } else {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => $result['message']
            ]);
        }
    }


    public function cancel_bid()
    {
        $d = $this->_json_body();
        $userId = $this->_get_user_id();

        if (empty($d['bid_id'])) {
            $this->_respond(400, [
                'status' => 'error',
                'message' => 'bid_id is required'
            ]);
        }

        $bidpayload = [
            'bid_id' => $d['bid_id'],
            'user_id' => $userId
        ];
        $result = $this->bidding_model->cancel_bid($bidpayload);

        if ($result['status']) {
            $this->_respond(200, [
                'status'  => 'success',
                'message' => $result['message']
            ]);
        } else {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => $result['message']
            ]);
        }
    }

    public function update_bid()
    {

        $d = $this->_json_body();
        $userId = $this->_get_user_id();

        if (empty($d['bid_id']) || empty($d['bid_amount'])) {
            $this->_respond(400, [
                'status' => 'error',
                'message' => 'bid_id and bid_amount are required'
            ]);
        }

        $bidpayload = [
            'bid_id' => $d['bid_id'],
            'bid_amount' => $d['bid_amount'],
            'user_id' => $userId
        ];
        $result = $this->bidding_model->update_bid($bidpayload);

        if ($result['status']) {
            $this->_respond(200, [
                'status'  => 'success',
                'message' => $result['message']
            ]);
        } else {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => $result['message']
            ]);
        }
    }

    public function view_bid_status()
    {
        $d = $this->_json_body();
        $userId = $this->_get_user_id();

        if (empty($d['bid_id'])) {
            $this->_respond(400, [
                'status' => 'error',
                'message' => 'bid_id is required'
            ]);
        }

        $bidpayload = [
            'bid_id' => $d['bid_id'],
            'user_id' => $userId
        ];
        $result = $this->bidding_model->view_bid_status($bidpayload);

        if ($result['status']) {
            $this->_respond(200, [
                'status'  => 'success',
                'message' => $result['message'],
                'data'    => $result['data']
            ]);
        } else {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => $result['message']
            ]);
        }
    }

    public function view_bidding_history()
    {
        $userId = $this->_get_user_id();

        $result = $this->bidding_model->view_bidding_history($userId);

        if ($result['status']) {
            $this->_respond(200, [
                'status'  => 'success',
                'message' => $result['message'],
                'data'    => $result['data']
            ]);
        } else {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => $result['message']
            ]);
        }
    }
}
