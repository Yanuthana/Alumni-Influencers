<?php
defined('BASEPATH') or exit('No direct script access allowed');
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * @property CI_Input  $input
 * @property CI_Output $output
 * @property CI_Loader $load
 * @property CI_Config $config
 */
class BaseApiController extends CI_Controller
{
    protected const JWT_KEY = 'SUPER_SECRET_KEY_12345_CHANGE_ME_IN_PRODUCTION';

    public function __construct()
    {
        parent::__construct();
    }


    protected function _respond(int $status, array $body): void
    {
        $this->output
            ->set_status_header($status)
            ->set_content_type('application/json', 'utf-8')
            ->set_output(json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->output->_display();
        exit;
    }

    /**
     * Decode JSON request body. Responds 400 if body is not valid JSON.
     */
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

    /**
     * Extract Bearer token from Authorization header.
     * Returns null if not present.
     */
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

    protected function _require_role(array $allowed_roles)
    {
        $token = $this->_bearer_token();
        if (!$token) {
            $this->_respond(401, ['status' => 'error', 'message' => 'Bearer token is required']);
        }

        try {
            $decoded = JWT::decode($token, new Key(self::JWT_KEY, 'HS256'));
            $user = (array) $decoded;
        } catch (Exception $e) {
            $this->_respond(401, ['status' => 'error', 'message' => 'Invalid or expired token: ' . $e->getMessage()]);
        }

        if (!in_array($user['role'], $allowed_roles)) {
            $this->_respond(403, ['status' => 'error', 'message' => 'Forbidden: Restricted access']);
        }

        return $user; // Return user so the controller can use the data
    }

}
