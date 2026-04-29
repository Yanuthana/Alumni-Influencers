<?php
defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';

/**
 * @OA\Tag(
 *     name="Featured Alumni",
 *     description="Endpoints for viewing daily winners"
 * )
 * @property SlotResult_model $slotresult_model
 * @property Api_log_model $api_log_model
 * @property CI_Security $security
 */
class  ViewWinner extends BaseApiController
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model('slotresult_model');
    }

    private function _kong_header(string $name): ?string
    {
        $header = $this->input->get_request_header($name, true);
        if ($header === null) {
            return null;
        }

        $header = trim($header);
        return $header === '' ? null : $this->security->xss_clean($header);
    }


    private function _is_from_kong(): bool
    {
        // Prefer Kong-native headers (present even before auth headers are injected).
        // This avoids false 403s if Kong is in front but consumer headers are not forwarded for some reason.
        if (!empty($this->_kong_header('X-Kong-Request-Id'))) {
            return true;
        }
        if (!empty($this->_kong_header('X-Kong-Proxy-Latency')) || !empty($this->_kong_header('X-Kong-Upstream-Latency'))) {
            return true;
        }

        // Fallback: Kong injects consumer headers after authentication succeeds.
        return !empty($this->_kong_header('X-Consumer-Username')) || !empty($this->_kong_header('X-Consumer-ID'));
    }


    /**
     * @OA\Get(
     *     path="/api/featured-alumni",
     *     summary="View the daily featured alumni",
     *     tags={"Featured Alumni"},
     *     security={{"apiKeyAuth": {}}},
     *     @OA\Parameter(name="slot_id", in="query", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Winner found"),
     *     @OA\Response(response=404, description="No winner for this slot")
     * )
     */
    // public function view_winner()
    // {
    //     $this->_require_api_key();

    //     if (!$this->_is_from_kong() && !$this->_allow_non_kong_request()) {
    //         $this->_respond(403, [
    //             'status'  => 'error',
    //             'message' => 'Forbidden: request must pass through Kong gateway (or provide valid gateway_key outside Kong)',
    //         ]);
    //     }

    //     $slotIdRaw = $this->input->get('slot_id', true);
    //     $slotId = filter_var($slotIdRaw, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

    //     if ($slotId === false) {
    //         $this->_respond(400, [
    //             'status'  => 'error',
    //             'message' => 'slot_id query parameter is required and must be a positive integer',
    //         ]);
    //     }

    //     $result = $this->slotresult_model->view_winner($slotId);

    //     if ($result['status']) {
    //         $this->_respond(200, [
    //             'status'  => 'success',
    //             'message' => $result['message'],
    //             'data'    => $result['data'],
    //         ]);
    //     } else {
    //         $this->_respond(404, [
    //             'status'  => 'error',
    //             'message' => $result['message'],
    //         ]);
    //     }
    // }


    public function view_winner()
    {
        $this->_require_api_key();

        if (!$this->_is_from_kong()) {
            $this->_respond(403, [
                'status'  => 'error',
                'message' => 'Forbidden: request must pass through Kong gateway',
            ]);
            return;
        }

        $slotIdRaw = $this->input->get('slot_id', true);
        $slotId = filter_var($slotIdRaw, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        if ($slotId === false) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'slot_id must be a positive integer',
            ]);
            return;
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
