<?php
defined('BASEPATH') or exit('No direct script access allowed');


require_once APPPATH . 'core/BaseApiController.php';
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Bidding System",
 *     description="Endpoints for slot bidding"
 * )
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
    /**
     * @OA\Get(
     *     path="/api/slots",
     *     summary="View available bidding slots (today + tomorrow)",
     *     tags={"Bidding System"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(response=200, description="Array of available slots with is_locked metadata"),
     *     @OA\Response(response=500, description="Error fetching slots")
     * )
     *
     * Returns up to two slots:
     *   - Today's slot  : visible & biddable when current time < 18:00
     *   - Tomorrow's slot : always visible; is_locked=true until 18:00 today
     */
    public function view_slots()
    {
        $this->_require_role(['alumni']);
        $slots = $this->bidding_model->getAvailableSlots();

        if (!empty($slots)) {
            $this->_respond(200, [
                'status'  => 'success',
                'message' => 'Available slots fetched successfully',
                'data'    => $slots        // always an array
            ]);
        } else {
            $this->_respond(500, [
                'status'  => 'error',
                'message' => 'Unable to fetch or generate slots',
            ]);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/bids",
     *     summary="Place a new bid",
     *     tags={"Bidding System"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             required={"slot_id","bid_amount"},
     *             @OA\Property(property="slot_id", type="integer", example=1),
     *             @OA\Property(property="bid_amount", type="number", example=50.0)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Bid placed"),
     *     @OA\Response(response=400, description="Invalid input or bid rejected")
     * )
     */
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
                'message' => $result['message'],
                'bid_id'  => $result['bid_id']
            ]);
        } else {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => $result['message']
            ]);
        }
    }


    /**
     * @OA\Delete(
     *     path="/api/bids",
     *     summary="Cancel a bid",
     *     tags={"Bidding System"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             required={"bid_id"},
     *             @OA\Property(property="bid_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Bid canceled"),
     *     @OA\Response(response=400, description="Invalid input")
     * )
     */
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

    /**
     * @OA\Put(
     *     path="/api/bids",
     *     summary="Update a bid amount",
     *     tags={"Bidding System"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             required={"bid_id", "bid_amount"},
     *             @OA\Property(property="bid_id", type="integer", example=1),
     *             @OA\Property(property="bid_amount", type="number", example=60.0)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Bid updated"),
     *     @OA\Response(response=400, description="Invalid input")
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/bidsstatus",
     *     summary="Get specific bid status",
     *     tags={"Bidding System"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             required={"bid_id"},
     *             @OA\Property(property="bid_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Status returned"),
     *     @OA\Response(response=400, description="Invalid bid_id")
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/bids/history",
     *     summary="View alumni bidding history",
     *     tags={"Bidding System"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(response=200, description="History returned")
     * )
     */
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
