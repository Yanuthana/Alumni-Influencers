<?php
defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="Alumni Influencers API",
 *     version="1.0.0",
 *     description="API documentation for the Alumni Influencers Bidding System"
 * )
 * @OA\Server(
 *     url="http://localhost/Alumni-Influencers",
 *     description="Local Development Server"
 * )
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 * @OA\SecurityScheme(
 *     securityScheme="apiKeyAuth",
 *     type="apiKey",
 *     in="header",
 *     name="apikey"
 * )
 * @property User_model $users
 * @property CI_Email $email
 */

class Auth extends BaseApiController
{

    public function __construct()
    {
        parent::__construct();
        $this->load->model('User_model', 'users');
    }

    // =================================================================
    // POST /api/auth/register
    // Body: { first_name, last_name, email, password, role,
    //         date_of_birth, phone_number }
    // =================================================================
    /**
     * @OA\Post(
     *     path="/api/auth/register",
     *     summary="Register a new user",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"first_name","last_name","email","password","role","date_of_birth","phone_number"},
     *             @OA\Property(property="first_name", type="string", example="John"),
     *             @OA\Property(property="last_name", type="string", example="Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@westminster.ac.uk"),
     *             @OA\Property(property="password", type="string", format="password", example="secret123"),
     *             @OA\Property(property="role", type="string", enum={"student", "alumni", "developer"}, example="alumni"),
     *             @OA\Property(property="date_of_birth", type="string", format="date", example="1990-01-01"),
     *             @OA\Property(property="phone_number", type="string", example="+1234567890")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Registration successful"),
     *     @OA\Response(response=400, description="Invalid input"),
     *     @OA\Response(response=403, description="University email required"),
     *     @OA\Response(response=409, description="Email already registered")
     * )
     */
    public function register(): void
    {
        $d = $this->_json_body();

        // --- Required field validation ---
        $required = [
            'first_name',
            'last_name',
            'email',
            'password',
            'role',
            'date_of_birth',
            'phone_number'
        ];
        foreach ($required as $field) {
            if (empty($d[$field])) {
                $this->_respond(400, [
                    'status'  => 'error',
                    'message' => "Field '{$field}' is required"
                ]);
            }
        }

        if (!filter_var($d['email'], FILTER_VALIDATE_EMAIL)) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Invalid email format'
            ]);
        }

        if (!in_array($d['role'], ['student', 'alumni', 'developer'])) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Role must be one of: student, alumni, developer'
            ]);
        }

        // --- University Email Domain Check (Alumni/Student only) ---
        if ($d['role'] === 'alumni' || $d['role'] === 'student') {
            $allowed_domains = ['@westminster.ac.uk', '@my.westminster.ac.uk'];
            $is_valid_domain = false;
            foreach ($allowed_domains as $domain) {
                if (strtolower(substr($d['email'], -strlen($domain))) === $domain) {
                    $is_valid_domain = true;
                    break;
                }
            }

            if (!$is_valid_domain) {
                $this->_respond(403, [
                    'status'  => 'error',
                    'message' => 'Only University of Westminster emails are allowed for accounts.'
                ]);
            }
        }

        if (strlen($d['password']) < 6) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Password must be at least 6 characters'
            ]);
        }

        // --- Duplicate email check ---
        if ($this->users->find_by_email($d['email'])) {
            $this->_respond(409, [
                'status'  => 'error',
                'message' => 'This email is already registered'
            ]);
        }

        // --- Build user data ---
        $token     = bin2hex(random_bytes(16));
        $user_data = [
            'first_name'         => $d['first_name'],
            'second_name'        => $d['last_name'],
            'user_name'          => $d['email'],
            'password_hash'      => password_hash($d['password'], PASSWORD_BCRYPT),
            'role'               => $d['role'],
            'date_of_birth'      => $d['date_of_birth'],
            'phone_number'       => $d['phone_number'],
            'created_at'         => date('Y-m-d H:i:s'),
            'verification_token' => $token,
            'email_verified'     => 0
        ];

        $role_data = [];
        if ($d['role'] === 'alumni') {
            $role_data = [
                'is_active_winner'          => 0,
                'profile_completion_status' => 'pending'
            ];
        }

        // --- Persist ---
        $user_id = $this->users->register($user_data, $role_data, $d['role']);
        if (!$user_id) {
            $this->_respond(500, [
                'status'  => 'error',
                'message' => 'Registration failed. Please try again.'
            ]);
        }

        // --- Send verification email ---
        $this->_load_email();
        $verification_link = base_url('api/auth/email/verify');
        $name        = htmlspecialchars($d['first_name']);
        $this->email->from('no-reply@alumni-influencers.com', 'Alumni Influencers');
        $this->email->to($d['email']);
        $this->email->subject('Verify Your Email – Alumni Influencers');
        $this->email->message("
             Hi {$name},<br><br>
             Please click the link below to verify your email:<br>
             <a href='{$verification_link}'>Verify Email</a><br><br>
             Thank you!
        ");
        $email_sent = $this->email->send();

        $this->_respond(201, [
            'status'  => 'success',
            'message' => $email_sent
                ? 'Registration successful. A verification email has been sent.'
                : 'Registration successful, but verification email failed. Contact support.',
            'data'    => ['user_id' => $user_id]
        ]);
    }

    // =================================================================
    // POST /api/auth/email/verify
    // Body: { token }
    // =================================================================
    public function verify_email(): void
    {
        $d     = $this->_json_body();
        $token = $d['token'] ?? '';

        if (!$token) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Verification token is required'
            ]);
        }

        $user = $this->users->get_by_token($token);
        if (!$user) {
            $this->_respond(404, [
                'status'  => 'error',
                'message' => 'Invalid or expired verification token'
            ]);
        }

        $user_id = isset($user->user_id) ? $user->user_id : $user->id;
        $this->users->verify_email($user_id);

        $this->_respond(200, [
            'status'  => 'success',
            'message' => 'Email verified successfully. You can now log in.'
        ]);
    }

    // =================================================================
    // POST /api/auth/sessions
    // Body: { email, password }
    // =================================================================
    /**
     * @OA\Post(
     *     path="/api/auth/sessions",
     *     summary="Login and get JWT token",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="john@westminster.ac.uk"),
     *             @OA\Property(property="password", type="string", format="password", example="secret123")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Login successful"),
     *     @OA\Response(response=401, description="Invalid credentials")
     * )
     */
    public function login(): void
    {
        $d        = $this->_json_body();
        $email    = $d['email']    ?? '';
        $password = $d['password'] ?? '';

        if (!$email || !$password) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Email and password are required'
            ]);
        }

        $user = $this->users->find_by_email($email);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->_respond(401, [
                'status'  => 'error',
                'message' => 'Invalid email or password'
            ]);
        }

        if ($user['email_verified'] == 0) {
            $this->_respond(403, [
                'status'  => 'error',
                'message' => 'Email not verified. Please check your inbox.'
            ]);
        }

        // --- Generate a JWT token ---
        $expires_at = time() + (24 * 60 * 60); // 24 hours
        $payload = [
            'user_id'    => $user['user_id'],
            'first_name' => $user['first_name'],
            'email'      => $user['user_name'],
            'role'       => $user['role'],
            'exp'        => $expires_at
        ];

        $api_token = JWT::encode($payload, self::JWT_KEY, 'HS256');

        $this->_respond(200, [
            'status'  => 'success',
            'message' => 'Login successful',
            'data'    => [
                'user_id'    => $user['user_id'],
                'first_name' => $user['first_name'],
                'email'      => $user['user_name'],
                'role'       => $user['role'],
                'api_token'  => $api_token,
                'expires_at' => date('Y-m-d H:i:s', $expires_at)
            ]
        ]);
    }

    // =================================================================
    // DELETE /api/auth/sessions
    // Header: Authorization: Bearer <api_token>
    // =================================================================
    public function logout(): void
    {
        $token = $this->_bearer_token();
        if (!$token) {
            $this->_respond(401, [
                'status'  => 'error',
                'message' => 'Authorization header with Bearer token is required'
            ]);
        }

        try {
            JWT::decode($token, new Key(self::JWT_KEY, 'HS256'));
        } catch (Exception $e) {
            $this->_respond(401, [
                'status'  => 'error',
                'message' => 'Invalid or expired token'
            ]);
        }


        $this->_respond(200, [
            'status'  => 'success',
            'message' => 'Logged out successfully'
        ]);
    }

    // =================================================================
    // POST /api/auth/password/forgot
    // Body: { email }
    // =================================================================
    public function forgot_password(): void
    {
        $d     = $this->_json_body();
        $email = $d['email'] ?? '';

        if (!$email) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Email is required'
            ]);
        }

        $user = $this->users->find_by_email($email);

        // Anti-enumeration: always return 200 whether email exists or not
        if (!$user) {
            $this->_respond(200, [
                'status'  => 'success',
                'message' => 'If that email is registered, an OTP has been sent.'
            ]);
        }

        $otp        = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));
        $this->users->save_otp($email, $otp, $expires_at);

        $this->_load_email();
        $name = htmlspecialchars($user['first_name'] ?? 'User');
        $this->email->from('no-reply@alumni-influencers.com', 'Alumni Influencers');
        $this->email->to($email);
        $this->email->subject('Your Password Reset OTP – Alumni Influencers');
        $this->email->message("
            <div style='font-family:Arial,sans-serif;max-width:520px;margin:auto'>
                <h2>Password Reset OTP</h2>
                <p>Hi <strong>{$name}</strong>,</p>
                <p>Your one-time password (OTP) is:</p>
                <div style='font-size:36px;font-weight:bold;letter-spacing:12px;
                            background:#f1f5f9;padding:18px 32px;border-radius:8px;
                            display:inline-block;margin:16px 0'>{$otp}</div>
                <p>This OTP expires in <strong>10 minutes</strong>.</p>
                <p style='color:#64748b;font-size:13px'>If you did not request this, you can safely ignore this email.</p>
            </div>
        ");

        if (!$this->email->send()) {
            $this->_respond(500, [
                'status'  => 'error',
                'message' => 'Failed to send OTP email. Please try again.'
            ]);
        }

        $this->_respond(200, [
            'status'  => 'success',
            'message' => 'OTP sent successfully. Please check your email.'
        ]);
    }

    // =================================================================
    // POST /api/auth/password/otp/verify
    // Body: { email, otp }
    // Response includes: reset_token — client must use this in /api/reset-password
    // =================================================================
    public function verify_otp(): void
    {
        $d     = $this->_json_body();
        $email = $d['email'] ?? '';
        $otp   = $d['otp']   ?? '';

        if (!$email || !$otp) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Both email and otp are required'
            ]);
        }

        $user = $this->users->verify_otp($email, $otp);
        if (!$user) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Invalid or expired OTP'
            ]);
        }

        // Generate a short-lived reset token — stateless, no session needed
        $reset_token = bin2hex(random_bytes(32));
        $expires_at  = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        $this->users->save_reset_token($email, $reset_token, $expires_at);

        $this->_respond(200, [
            'status'  => 'success',
            'message' => 'OTP verified. Use the reset_token to set your new password.',
            'data'    => [
                'reset_token' => $reset_token,
                'expires_at'  => $expires_at
            ]
        ]);
    }

    // =================================================================
    // POST /api/auth/password/reset
    // Body: { reset_token, password, confirm_password }
    // =================================================================
    public function reset_password(): void
    {
        $d           = $this->_json_body();
        $reset_token = $d['reset_token']      ?? '';
        $password    = $d['password']         ?? '';
        $confirm     = $d['confirm_password'] ?? '';

        if (!$reset_token || !$password || !$confirm) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'reset_token, password, and confirm_password are all required'
            ]);
        }

        if (strlen($password) < 8) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Password must be at least 8 characters'
            ]);
        }

        if ($password !== $confirm) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Passwords do not match'
            ]);
        }

        $user = $this->users->verify_reset_token($reset_token);
        if (!$user) {
            $this->_respond(400, [
                'status'  => 'error',
                'message' => 'Invalid or expired reset token'
            ]);
        }

        $new_hash = password_hash($password, PASSWORD_DEFAULT);
        $this->users->update_password($user['user_name'], $new_hash);
        $this->users->clear_reset_token($user['user_name']);

        $this->_respond(200, [
            'status'  => 'success',
            'message' => 'Password reset successfully. You can now log in with your new password.'
        ]);
    }

    // =================================================================
    // GET / (Default Route)
    // =================================================================
    public function index(): void
    {
        $this->_respond(200, [
            'status'  => 'success',
            'message' => 'Alumni Influencers API is running.'
        ]);
    }
}
