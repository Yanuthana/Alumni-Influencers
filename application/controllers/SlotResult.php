<?php
defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';

/**
 * SlotResult Controller
 *
 * Handles:
 *  - POST api/predict_winner          → Trigger winner prediction for today's slot (admin/cron)
 *  - GET  api/slot_result             → View winner details for a given slot
 *  - GET  api/monthly_limit_status    → View an alumni's monthly win count
 *
 * @property SlotResult_model $slotresult_model
 * @property Bidding_model    $bidding_model
 */
class SlotResult extends BaseApiController {

    function __construct() {
        parent::__construct();
        $this->load->model('slotresult_model');
    }

    // ---------------------------------------------------------------
    // Helper: resolve user_id from query string (alumni role required)
    // ---------------------------------------------------------------
    private function _get_user_id() {
        $this->_require_role(['alumni']);
        $user_id = $this->input->get('user_id');
        if (!$user_id) {
            $this->_respond(400, ['status' => 'error', 'message' => 'user_id query parameter is required']);
        }
        return $user_id;
    }

    // ---------------------------------------------------------------
    // POST api/predict_winner
    // Protected: admin only (internal / cron-triggered endpoint)
    // In production you would call this via a cron job at 18:00 daily.
    // ---------------------------------------------------------------
    /**
     * Triggered every day at 6 PM (via cron job or admin call).
     *
     * Cron example (runs at 18:00 every day):
     *   0 18 * * * curl -s -X POST http://yourdomain.com/api/predict_winner \
     *                    -H "Authorization: Bearer <admin_token>"
     */
    public function predict_winner() {
        $this->_require_role(['developer']);

        $result = $this->slotresult_model->predict_winner();

        if ($result['status']) {
            $response = [
                'status'  => 'success',
                'message' => $result['message'],
            ];
            if (!empty($result['data'])) {
                $response['data'] = $result['data'];
            }
            $this->_respond(200, $response);
        } else {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => $result['message'],
            ]);
        }
    }

    // ---------------------------------------------------------------
    // GET api/slot_result?slot_id=X&user_id=Y
    // ---------------------------------------------------------------
    /**
     * View the winner details for a specific slot.
     * Any authenticated alumni can view this.
     */
    public function slot_result() {
        $this->_get_user_id(); // Just verifies auth

     
        $d=$this->_json_body();
        $slotId=$d['slot_id'];

        $result = $this->slotresult_model->get_slot_result($slotId);

        if ($result['status']) {
            $this->_respond(200, [
                'status'  => 'success',
                'message' => $result['message'],
                'data'    => $result['data'],
            ]);
        } else {
            $this->_respond(404, [
                'status'  => 'error',
                'message' => $result['message'],
            ]);
        }
    }

    // ---------------------------------------------------------------
    // GET api/monthly_limit_status?user_id=X
    // ---------------------------------------------------------------
    /**
     * Returns how many wins the authenticated alumni has this month
     * and whether they are still allowed to bid.
     */
    public function monthly_limit_status() {
        $userId = $this->_get_user_id();

        $result = $this->slotresult_model->get_monthly_limit_status($userId);

        if ($result['status']) {
            $this->_respond(200, [
                'status'  => 'success',
                'message' => $result['message'],
                'data'    => $result['data'],
            ]);
        } else {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => $result['message'],
            ]);
        }
    }
}
