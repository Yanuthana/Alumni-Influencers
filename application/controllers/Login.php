<?php
defined('BASEPATH') OR exit('No direct script access allowed');


class Login extends CI_Controller {
    function __construct() {
        parent::__construct();
        
    }
    public function index() {
        $this->load->view('login');
    }

    public function login() {
        $email = $this->input->post('email');
        $password = $this->input->post('password');
        
        $this->load->model('User_model');
        $user = $this->User_model->find_by_email($email);

        // Debugging tip: print_r($user); to see the data structure if it still fails

        if ($user && password_verify($password, $user['password_hash'])) {
            // Success: Set session and redirect
            $this->session->set_userdata([
                'user_id' => $user['user_id'],
                'email'   => $user['email'],
                'role'    => $user['role'],
                'logged_in' => TRUE
            ]);
            
            echo "Login successful! Welcome " . $user['email']; 
            // redirect('dashboard'); 
        } else {
            echo "Invalid email or password";
            echo "<br>";
            echo $user['password_hash'];
            echo "<br>";
            echo $password;
            // redirect('login');
        }
    }

    public function signup(){

    }

    public function logout(){

    }  
    
    public function verifyEmail(){

    }
    public function resetPassword(){

    }
}