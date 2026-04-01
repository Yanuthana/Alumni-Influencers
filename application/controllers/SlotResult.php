<?php
defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Slot Result",
 *     description="Endpoints for slot results and win limits"
 * )
 * @property SlotResult_model $slotresult_model
 * @property Bidding_model    $bidding_model
 */
class SlotResult extends BaseApiController {

    function __construct() {
        parent::__construct();
        $this->load->model('slotresult_model');
    }

    
    private function _get_user_id() {
        $this->_require_role(['alumni']);
        $user_id = $this->input->get('user_id');
        if (!$user_id) {
            $this->_respond(400, ['status' => 'error', 'message' => 'user_id query parameter is required']);
        }
        return $user_id;
    }

    /**
     * @OA\Get(
     *     path="/api/slots/result",
     *     summary="View winner details for a specific slot",
     *     tags={"Slot Result"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             required={"slot_id"},
     *             @OA\Property(property="slot_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Winner details"),
     *     @OA\Response(response=404, description="No winner found")
     * )
     */
    public function slot_result() {
        $this->_get_user_id(); 
     
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

    /**
 * @OA\Get(
 *     path="/api/alumni/monthly-limit-status",
 *     summary="Get monthly win limit status",
 *     tags={"Slot Result"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="Status returned"),
 *     @OA\Response(response=400, description="Invalid input")
 * )
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
