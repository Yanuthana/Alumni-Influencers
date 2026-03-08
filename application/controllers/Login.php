<?php
defined('BASEPATH') OR exit('No direct script access allowed');


class Login extends CI_Controller {
    function __construct() {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->helper('url');
        $this->load->library('session');
    }

    public function index() {
        $this->load->view('login');
    }

    public function login() {
        $email    = $this->input->post('email');
        $password = $this->input->post('password');
        
        $user = $this->User_model->find_by_email($email);

        if ($user && password_verify($password, $user['password_hash'])) {
            if ($user['email_verified'] == 0) {
                $this->session->set_flashdata('error', 'Your email is not verified. Please check your inbox for the verification link.');
                redirect('Login');
                return;
            }

            // Success: Set session and redirect
            $this->session->set_userdata([
                'user_id'   => $user['user_id'],
                'email'     => $user['user_name'],
                'role'      => $user['role'],
                'logged_in' => TRUE
            ]);
            
            redirect('dashboard');
        } else {
            $this->session->set_flashdata('error', 'Invalid email or password.');
            redirect('Login');
        }
    }

    public function logout(){

    }  
    
    public function forgotPassword(){
        $this->load->view('forgot_password');
    }

    public function sendOtp() {
        $email = $this->input->post('email');

        if (!$email) {
            $this->session->set_flashdata('error', 'Please enter your email address.');
            redirect('Login/forgotPassword');
            return;
        }

        // Check user exists
        $user = $this->User_model->find_by_email($email);
        if (!$user) {
            // Don't reveal whether email exists – show same success UI
            $this->session->set_flashdata('info', 'If that email is registered, an OTP has been sent.');
            redirect('Login/forgotPassword');
            return;
        }

        // Generate a secure 6-digit OTP
        $otp        = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        // Persist OTP to DB
        $this->User_model->save_otp($email, $otp, $expires_at);

        // Send email with OTP
        $this->load->config('email', TRUE);
        $emailConfig = $this->config->item('email');        // returns array from email.php
        $this->load->library('email', $emailConfig);

        $this->email->from('no-reply@alumni-influencers.com', 'Alumni Influencers');
        $this->email->to($email);
        $this->email->subject('Your Password Reset OTP');
        $this->email->message($this->_otp_email_body($otp, $user['first_name'] ?? 'User'));

        if (!$this->email->send()) {
            $this->session->set_flashdata('error', 'Failed to send OTP email. Please try again.');
            redirect('Login/forgotPassword');
            return;
        }

        // Store email in session for next steps (not a security risk as it's wiped after reset)
        $this->session->set_userdata('reset_email', $email);

        redirect('Login/verifyOtp');
    }

    // -------------------------------------------------------------------
    // STEP 2: Show OTP input form
    // -------------------------------------------------------------------
    public function verifyOtp() {
        // Guard: must come from sendOtp step
        if (!$this->session->userdata('reset_email')) {
            redirect('Login/forgotPassword');
            return;
        }
        $data['email'] = $this->session->userdata('reset_email');
        $this->load->view('otp_verify', $data);
    }

    // -------------------------------------------------------------------
    // STEP 2 POST: Validate OTP
    // -------------------------------------------------------------------
    public function checkOtp() {
        $email = $this->session->userdata('reset_email');
        $otp   = $this->input->post('otp');

        if (!$email || !$otp) {
            redirect('Login/forgotPassword');
            return;
        }

        $user = $this->User_model->verify_otp($email, $otp);

        if (!$user) {
            $this->session->set_flashdata('error', 'Invalid or expired OTP. Please try again.');
            redirect('Login/verifyOtp');
            return;
        }

        // Mark OTP as verified in session – allow password change
        $this->session->set_userdata('otp_verified', TRUE);
        redirect('Login/resetPassword');
    }

    // -------------------------------------------------------------------
    // STEP 3: Show new password form
    // -------------------------------------------------------------------
    public function resetPassword() {
        if (!$this->session->userdata('reset_email') || !$this->session->userdata('otp_verified')) {
            redirect('Login/forgotPassword');
            return;
        }
        $this->load->view('reset_password');
    }

    // -------------------------------------------------------------------
    // STEP 3 POST: Save new password
    // -------------------------------------------------------------------
    public function savePassword() {
        $email    = $this->session->userdata('reset_email');
        $verified = $this->session->userdata('otp_verified');

        if (!$email || !$verified) {
            redirect('Login/forgotPassword');
            return;
        }

        $password        = $this->input->post('password');
        $confirm_password = $this->input->post('confirm_password');

        if (!$password || strlen($password) < 8) {
            $this->session->set_flashdata('error', 'Password must be at least 8 characters.');
            redirect('Login/resetPassword');
            return;
        }

        if ($password !== $confirm_password) {
            $this->session->set_flashdata('error', 'Passwords do not match.');
            redirect('Login/resetPassword');
            return;
        }

        $new_hash = password_hash($password, PASSWORD_DEFAULT);
        $this->User_model->update_password($email, $new_hash);

        // Clean up session reset data
        $this->session->unset_userdata(['reset_email', 'otp_verified']);

        $this->session->set_flashdata('success', 'Password reset successfully! You can now log in with your new password.');
        redirect('Login');
    }

    // -------------------------------------------------------------------
    // Helper: OTP email HTML body
    // -------------------------------------------------------------------
    private function _otp_email_body(string $otp, string $name): string {
        return '
        <div>
            <div>
                <h1>Alumni Influencers</h1>
                <p>Password Reset Request</p>
            </div>
            <div>
                <p>Hi <strong>' . htmlspecialchars($name) . '</strong>,</p>
                <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
                <div>
                    <span>' . $otp . '</span>
                </div>
                <p>If you did not request this, you can safely ignore this email.</p>
            </div>
            <div>
                <p>© 2026 Alumni Influencers. All rights reserved.</p>
            </div>
        </div>';
    }
}