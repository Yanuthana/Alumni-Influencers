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
    
    public function resetPassword(){

    }
}