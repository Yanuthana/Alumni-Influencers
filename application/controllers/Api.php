<?php
defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';

/**
 * @OA\Tag(
 *     name="System",
 *     description="API health and gateway integration"
 * )
 */
class Api extends BaseApiController
{
    /**
     * @OA\Get(
     *     path="/api",
     *     summary="API Health Check",
     *     tags={"System"},
     *     security={{"apiKeyAuth": {}}},
     *     @OA\Response(response=200, description="API is running")
     * )
     */
    public function index()
    {
        $this->_require_api_key();
        $this->_respond(200, [
            'status'  => 'success',
            'message' => 'Alumni Influencers API is running.',
        ]);
    }

    public function logs()
    {
        $this->_require_api_key();

        // Get JSON from Kong
        $data = json_decode(file_get_contents('php://input'), true);

        if(!$data) {
            echo json_encode(['status'=>'error','message'=>'No data received']);
            return;
        }

        $log = [
            'client_id'  => $data['consumer']['username'] ?? 'unknown',
            'endpoint'   => $data['request']['uri'] ?? '',
            'status'     => $data['response']['status'] ?? 0,
            'ip_address' => $data['client_ip'] ?? '',
        ];

        $this->db->insert('api_logs', $log);
        echo json_encode(['status'=>'success','message'=>'Log saved']);
    }
}

