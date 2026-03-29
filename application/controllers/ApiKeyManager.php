<?php
defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';

/**
 * @OA\Tag(
 *     name="API Key Management",
 *     description="Endpoints for managing API keys and viewing usage stats"
 * )
 * @property Api_log_model $api_logs
 */
class ApiKeyManager extends BaseApiController
{
    /**
     * Kong Admin API Base URL
     */
    private $kong_admin_url = 'http://127.0.0.1:8001';

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Api_log_model', 'api_logs');
    }

    /**
     * @OA\Get(
     *     path="/api/api-key-management/list",
     *     summary="List API keys for a consumer",
     *     tags={"API Key Management"},
     *     security={{"bearerAuth": {}, "apiKeyAuth": {}}},
     *     @OA\Parameter(name="username", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="List of keys"),
     *     @OA\Response(response=404, description="Consumer not found")
     * )
     */
    public function list_keys()
    {
        $this->_require_api_key();
        $user = $this->_require_role(['developer']);
        $username = $this->input->get('username') ?: $user['email'];
        $this->_ensure_consumer_exists($username);

        $url = "{$this->kong_admin_url}/consumers/{$username}/key-auth";
        $response = $this->_curl_request($url);
        
        $data = json_decode($response, true);

        if (isset($data['error'])) {
             $this->_respond(404, [
                'status'  => 'error',
                'message' => 'Consumer not found or Kong error',
                'details' => $data
            ]);
        }

        $this->_respond(200, [
            'status' => 'success',
            'data'   => $data['data'] ?? []
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/api-key-management/generate",
     *     summary="Generate a new API key",
     *     tags={"API Key Management"},
     *     security={{"bearerAuth": {}, "apiKeyAuth": {}}},
     *     @OA\Parameter(name="username", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=201, description="Key generated"),
     *     @OA\Response(response=400, description="Failed to generate")
     * )
     */
    public function generate_key()
    {
        $this->_require_api_key();
        $user = $this->_require_role(['developer']);
        $username = $this->input->get('username') ?: $user['email'];
        $this->_ensure_consumer_exists($username);

        $url = "{$this->kong_admin_url}/consumers/{$username}/key-auth";
        $response = $this->_curl_request($url, 'POST');
        
        $data = json_decode($response, true);

        if (isset($data['message']) && !isset($data['key'])) {
             $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Failed to generate key',
                'details' => $data
            ]);
        }

        $this->_respond(201, [
            'status'  => 'success',
            'message' => 'API Key generated successfully',
            'data'    => $data
        ]);
    }

    /**
     * Revoke API Key
     * DELETE /api/api-key-management/revoke?username=developer1&key_id=<key-id>
     */
    public function revoke_key()
    {
        $this->_require_api_key();
        $user = $this->_require_role(['developer']);
        $username = $this->input->get('username') ?: $user['email'];
        $this->_ensure_consumer_exists($username);
        $key_id   = $this->input->get('key_id');

        if (!$key_id) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'key_id is required'
            ]);
        }

        $url = "{$this->kong_admin_url}/consumers/{$username}/key-auth/{$key_id}";
        $response = $this->_curl_request($url, 'DELETE');
        
        // Kong returns empty body on successful delete, or error json
        $data = json_decode($response, true);

        if ($data && isset($data['message'])) {
             $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Failed to revoke key',
                'details' => $data
            ]);
        }

        $this->_respond(200, [
            'status'  => 'success',
            'message' => "Key {$key_id} for consumer {$username} has been revoked."
        ]);
    }

    /**
     * View Key Statistics
     * GET /api/api-key-management/stats
     */
    public function stats()
    {
        $this->_require_api_key();
        $this->_require_role(['developer']);
        $stats = $this->api_logs->get_key_stats();
        
        $this->_respond(200, [
            'status' => 'success',
            'data'   => $stats
        ]);
    }

    /**
     * View Full API Logs
     * GET /api/api-key-management/logs
     */
    public function logs()
    {
        $this->_require_api_key();
        $this->_require_role(['developer']);
        
        $limit = (int) $this->input->get('limit') ?: 50;
        $offset = (int) $this->input->get('offset') ?: 0;
        
        $logs = $this->api_logs->get_all_logs($limit, $offset);
        
        $this->_respond(200, [
            'status' => 'success',
            'data'   => $logs
        ]);
    }

    /**
     * Access API Documentation
     * GET /api/api-key-management/docs
     */
    public function docs()
    {
        $this->_require_api_key();
        $this->_require_role(['developer']);
        $docs = [
            'project'     => 'Alumni Influencers API',
            'auth_method' => 'API Key Authentication',
            'how_to_use'  => 'Pass your API Key in the "apikey" header for every request.',
            'header_example' => [
                'apikey' => 'your_generated_key_here'
            ],
            'curl_example' => 'curl -H "apikey: your_key" ' . base_url('api/alumni/profile'),
            'endpoints' => [
                [
                    'endpoint'    => 'api/alumni/profile',
                    'method'      => 'GET',
                    'description' => 'Retrieve the logged-in alumni profile details.'
                ],
                [
                    'endpoint'    => 'api/slots',
                    'method'      => 'GET',
                    'description' => 'List all available bidding slots.'
                ],
                [
                    'endpoint'    => 'api/bids',
                    'method'      => 'POST',
                    'description' => 'Place a new bid on a slot.'
                ],
                [
                    'endpoint'    => 'api/featured-alumni',
                    'method'      => 'GET',
                    'description' => 'Get the current daily featured alumni.'
                ]
            ],
            'view_stats'  => base_url('api/api-key-management/stats'),
            'view_logs'   => base_url('api/api-key-management/logs'),
            'key_operations' => [
                'generate_key' => 'POST ' . base_url('api/api-key-management/generate?username=<your_username>'),
                'list_keys'    => base_url('api/api-key-management/list?username=<your_username>'),
                'revoke_key'   => 'DELETE ' . base_url('api/api-key-management/revoke?username=<your_username>&key_id=<key_id>'),
                'view_stats'   => base_url('api/api-key-management/stats'),
                'view_logs'    => base_url('api/api-key-management/logs')
            ]
        ];

        $this->_respond(200, [
            'status' => 'success',
            'data'   => $docs
        ]);
    }

    /**
     * Ensure a consumer exists in Kong. Creates it if it doesn't.
     */
    private function _ensure_consumer_exists(string $username)
    {
        $url = "{$this->kong_admin_url}/consumers/{$username}";
        $response = $this->_curl_request($url);
        $data = json_decode($response, true);

        if (isset($data['message']) && $data['message'] === 'Not found') {
            // Consumer not found, create it
            $this->_curl_request("{$this->kong_admin_url}/consumers", 'POST', ['username' => $username]);
        }
    }

    /**
     * Helper to perform cURL requests to Kong Admin API
     */
    private function _curl_request(string $url, string $method = 'GET', array $data = [])
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);

        if ($method === 'POST' && !empty($data)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        }
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        curl_close($ch);
        
        return $response;
    }
}
