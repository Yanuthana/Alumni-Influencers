<?php
defined('BASEPATH') or exit('No direct script access allowed');
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use OpenApi\Annotations as OA;

/**
 * Base API Controller - common stuff for all APIs
 */
class BaseApiController extends CI_Controller
{
    protected $JWT_KEY;

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Api_log_model', 'api_logs');
        $this->JWT_KEY = $_ENV['JWT_KEY'] ?? getenv('JWT_KEY') ?: null;
    }


    protected function _respond(int $status, array $body): void
    {
        $this->_log_request($status);

        $this->output
            ->set_status_header($status)
            ->set_content_type('application/json', 'utf-8')
            ->set_output(json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->output->_display();
        exit;
    }

    // Saves the request to the database
    private function _log_request(int $status): void
    {
        $consumer = $this->input->get_request_header('X-Consumer-Username', TRUE) 
                  ?: $this->input->get_request_header('X-Consumer-ID', TRUE)
                  ?: 'unknown';

        $this->api_logs->create_log([
            'client_id'  => $consumer,
            'endpoint'   => $this->input->server('REQUEST_METHOD') . ' ' . $this->input->server('REQUEST_URI'),
            'status'     => $status,
            'ip_address' => $this->input->ip_address(),
        ]);
    }

    // Gets the JSON body from the request
    protected function _json_body(): array
    {
        $raw  = file_get_contents('php://input');
        $data = json_decode($raw, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Request body must be valid JSON'
            ]);
        }
        return $data;
    }

    // Gets the bearer token from headers
    protected function _bearer_token(): ?string
    {
        $header = $this->input->get_request_header('Authorization', TRUE);
        if ($header && preg_match('/Bearer\s+(.+)$/i', $header, $m)) {
            return trim($m[1]);
        }
        return null;
    }

    /**
     * Load and initialise the email library using config/email.php settings.
     */
    protected function _load_email(): void
    {
        $this->load->config('email', TRUE);
        $config = $this->config->item('email');
        $this->load->library('email', $config);
    }

    // Checks if the API key is valid
    protected function _require_api_key(): string
    {
        // 1. Check for identifier injected by Kong
        $consumer = $this->input->get_request_header('X-Consumer-Username', TRUE);
        
        if (!empty($consumer)) {
            return $consumer;
        }

        // 2. Development Fallback: allow raw apikey header if not in production
        if (ENVIRONMENT !== 'production') {
            $apikey = $this->input->get_request_header('apikey', TRUE);
            if (!empty($apikey)) {
                return 'dev_consumer';
            }
        }

        // 3. Reject the request if no valid identity is found
        $this->_respond(401, [
            'status'  => 'error',
            'message' => 'Valid API Key is required inside the "apikey" header.'
        ]);
        
        return ''; 
    }

    protected function _require_role(array $allowed_roles)
    {
        $token = $this->_bearer_token();
        if (!$token) {
            $this->_respond(401, ['status' => 'error', 'message' => 'Bearer token is required']);
            return;
        }

        try {
            $decoded = JWT::decode($token, new Key($this->JWT_KEY, 'HS256'));
            $user = (array) $decoded;
        } catch (Exception $e) {
            $this->_respond(401, ['status' => 'error', 'message' => 'Invalid or expired token: ' . $e->getMessage()]);
        }

        if (!in_array($user['role'], $allowed_roles)) {
            $this->_respond(403, ['status' => 'error', 'message' => 'Forbidden: Restricted access']);
        }

        return $user; // Return user so the controller can use the data
    }

    protected function _require_authenticated_user()
    {
        $token = $this->_bearer_token();
        if (!$token) {
            $this->_respond(401, ['status' => 'error', 'message' => 'Bearer token is required']);
            return;
        }

        try {
            return (array) JWT::decode($token, new Key($this->JWT_KEY, 'HS256'));
        } catch (Exception $e) {
            $this->_respond(401, ['status' => 'error', 'message' => 'Invalid or expired token: ' . $e->getMessage()]);
        }
    }

}
