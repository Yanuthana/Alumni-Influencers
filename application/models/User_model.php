<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User_model extends CI_Model {

    protected $table = 'users';
    public function __construct()
    {
        parent::__construct();
    }

    public function insert(array $data)
    {
        $this->db->insert($this->table, $data);
        return $this->db->insert_id();
    }

    /**
     * Registers a user and their specific role details
     * 
     * @param array $user_data Data for the users table
     * @param array $role_data Data for the specific role table (students, alumni, or developers)
     * @param string $role The role name
     * @return int|bool The new user_id or false on failure
     */
    public function register(array $user_data, array $role_data, string $role)
    {
        $this->db->trans_start();

        // Insert into parent table
        $user_id = $this->insert($user_data);
        
        // Add user_id to role data
        $role_data['user_id'] = $user_id;

        // Insert into specific role table
        switch ($role) {
            case 'student':
                $this->db->insert('students', $role_data);
                break;
            case 'alumni':
                $this->db->insert('alumni', $role_data);
                $alumni_id = $this->db->insert_id();
                
                // Automatically create a blank profile for the alumni
                $this->db->insert('alumni_profiles', [
                    'alumni_id'  => $alumni_id,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
                break;
            case 'developer':
                $this->db->insert('developer', $role_data);
                break;
        }

        $this->db->trans_complete();

        if ($this->db->trans_status() === FALSE) {
            return false;
        }

        return $user_id;
    }

   
    public function find_by_email(string $email)
    {
        return $this->db
                    ->where('user_name', $email)
                    ->get($this->table)
                    ->row_array();
    }

    public function get_by_token($token) {
        return $this->db->get_where('users', ['verification_token' => $token])->row();
    }

    public function verify_email($user_id) {
        $data = [
            'email_verified' => 1,
            'verification_token' => null
        ];
        $this->db->where('user_id', $user_id);
        $this->db->update('users', $data);
    }

    // =========================================================
    // OTP — Password Reset Step 1
    // =========================================================

    /** Save a 6-digit OTP and its expiry time for the given user email. */
    public function save_otp(string $email, string $otp, string $expires_at) {
        $user = $this->db->get_where('users', ['user_name' => $email])->row();
        if (!$user) {
            return false; 
        }
        $user_id = $user->user_id;

       $existing = $this->db->get_where('user_password_resets', ['user_id' => $user_id])->row();

    if ($existing) {
        // Update existing record
        $this->db->where('user_id', $user_id);
        $this->db->update('user_password_resets', [
            'otp' => $otp,
            'otp_expires_at' => $expires_at,
            'reset_token' => null,
            'reset_token_expires_at' => null
        ]);
    } else {
        $this->db->insert('user_password_resets', [
            'user_id' => $user_id,
            'otp' => $otp,
            'otp_expires_at' => $expires_at
        ]);
    }

    return $this->db->affected_rows() > 0;
    }

    /** Returns user row if OTP is correct and not expired, else false. */
    public function verify_otp(string $email, string $otp) {
        $user = $this->db->get_where('users', ['user_name' => $email])->row();
        if (!$user) {
            return false;
        }
        $user_id = $user->user_id;

        $user = $this->db
                    ->where('user_id', $user_id)
                    ->where('otp', $otp)
                    ->where('otp_expires_at >=', date('Y-m-d H:i:s'))
                    ->get('user_password_resets')
                    ->row_array();
        return $user ?: false;
    }

    // =========================================================
    // Reset Token — Password Reset Step 2  (stateless, no session)
    // =========================================================

    /** Save a short-lived reset token after OTP is verified. */
    public function save_reset_token(string $email, string $token, string $expires_at) {
        $user= $this->db->get_where('users', ['user_name' => $email])->row();
         if (!$user) {
        return false;
    }
    $user_id = $user->user_id;

    $existing = $this->db->get_where('user_password_resets', ['user_id' => $user_id])->row();

    if ($existing) {
        $this->db->where('user_id', $user_id);
        $this->db->update('user_password_resets', [
            'reset_token' => $token,
            'reset_token_expires_at' => $expires_at,
            'otp' => null,
            'otp_expires_at' => null
        ]);
    } else {
        $this->db->insert('user_password_resets', [
            'user_id' => $user_id,
            'reset_token' => $token,
            'reset_token_expires_at' => $expires_at
        ]);
    }

    return $this->db->affected_rows() > 0;
    }

    /** Returns user row if reset token is valid and not expired, else false. */
    public function verify_reset_token(string $token) {
      $reset = $this->db
        ->where('reset_token', $token)
        ->where('reset_token_expires_at >=', date('Y-m-d H:i:s'))
        ->get('user_password_resets')
        ->row_array();

    if (!$reset) {
        return false;
    }

    $user = $this->db->get_where('users', ['user_id' => $reset['user_id']])->row_array();
    return $user ?: false;
    }

    /** Clear reset token fields after password has been updated. */
    public function clear_reset_token(string $email) {
    $user = $this->db->get_where('users', ['user_name' => $email])->row();
    if (!$user) {
        return false;
    }
    $user_id = $user->user_id;

    $this->db->where('user_id', $user_id);
    $this->db->update('user_password_resets', [
        'reset_token' => null,
        'reset_token_expires_at' => null
    ]);

    return $this->db->affected_rows() > 0;
    }

    // =========================================================
    // Password Update
    // =========================================================

    /** Update password hash and clear OTP fields. */
    public function update_password(string $email, string $new_password_hash) {
        $this->db->where('user_name', $email);
        $this->db->update($this->table, [
            'password_hash'      => $new_password_hash,
        ]);
        return $this->db->affected_rows() > 0;
    }

    // =========================================================
    // API Token — Login / Logout (stateless Bearer token auth)
    // =========================================================

    /** Save a Bearer API token for a user (generated on login). */
    public function save_api_token(int $user_id, string $token, string $expires_at) {
       return $this->db->insert('user_api_tokens', [
        'user_id' => $user_id,
        'api_token' => $token,
        'expires_at' => $expires_at
    ]);
    }

    /** Find a user by their active API token (checks expiry). */
    public function find_by_api_token(string $token) {
        return $this->db
        ->select('users.*')
        ->from('user_api_tokens')
        ->join('users', 'users.user_id = user_api_tokens.user_id')
        ->where('user_api_tokens.api_token', $token)
        ->where('user_api_tokens.expires_at >=', date('Y-m-d H:i:s'))
        ->get()
        ->row_array();
    }

    /** Invalidate (clear) the API token on logout. */
    public function clear_api_token(int $user_id) {
        return $this->db
        ->where('user_id', $user_id)
        ->delete('user_api_tokens');
    }

}