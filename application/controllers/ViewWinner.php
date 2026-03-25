<?php
defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';

/**
 * @property SlotResult_model $slotresult_model
 */
class  ViewWinner extends BaseApiController
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model('slotresult_model');
    }

    public function view_winner()
    {
        $slotId = $this->input->get('slot_id');
        if (!$slotId) {
            $this->_respond(400, ['status' => 'error', 'message' => 'slot_id query parameter is required']);
        }
        $result = $this->slotresult_model->view_winner($slotId);
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
}
