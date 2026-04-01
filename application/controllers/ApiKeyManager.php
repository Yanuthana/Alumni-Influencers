<?php
defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';
use OpenApi\Annotations as OA;

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
    private $kong_admin_url;

    public function __construct()
    {
        parent::__construct();
        // Use environment variable, fallback to hardcoded if not set
        $this->kong_admin_url = getenv('KONG_ADMIN_URL');
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
    /**
 * @OA\Delete(
 *     path="/api/api-key-management/revoke",
 *     summary="Revoke API key",
 *     tags={"API Key Management"},
 *     security={{"bearerAuth": {}, "apiKeyAuth": {}}},
 *     @OA\Parameter(name="username", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Parameter(name="key_id", in="query", required=true, @OA\Schema(type="string")),
 *     @OA\Response(response=200, description="Key revoked"),
 *     @OA\Response(response=400, description="Failed to revoke")
 * )
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
    /**
 * @OA\Get(
 *     path="/api/api-key-management/stats",
 *     summary="View key statistics",
 *     tags={"API Key Management"},
 *     security={{"bearerAuth": {}, "apiKeyAuth": {}}},
 *     @OA\Response(response=200, description="Stats returned")
 * )
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
    /**
 * @OA\Get(
 *     path="/api/api-key-management/logs",
 *     summary="View API logs",
 *     tags={"API Key Management"},
 *     security={{"bearerAuth": {}, "apiKeyAuth": {}}},
 *     @OA\Parameter(name="limit", in="query", required=false, @OA\Schema(type="integer")),
 *     @OA\Parameter(name="offset", in="query", required=false, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="Logs returned")
 * )
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
     * @OA\Get(
     *     path="/api/api-key-management/swagger",
     *     summary="Developer Swagger documentation viewer",
     *     tags={"API Key Management"},
     *     security={{"bearerAuth": {}, "apiKeyAuth": {}}},
     *     @OA\Response(response=200, description="HTML documentation viewer")
     * )
     */
    public function swagger_ui()
    {
        $this->_require_api_key();
        $this->_require_role(['developer']);
        
        $path = FCPATH . 'swagger-ui/index.html';
        if (!file_exists($path)) {
            $this->_respond(404, ['status' => 'error', 'message' => 'Swagger UI index file not found']);
        }
        
        $html = file_get_contents($path);
        
        $json_url = base_url('swagger.json');
        $html = str_replace('http://localhost/Alumni-Influencers/swagger.json', $json_url, $html);
        
        $this->output
            ->set_content_type('text/html')
            ->set_output($html);
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
