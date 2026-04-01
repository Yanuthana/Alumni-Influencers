<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Alumni_model extends CI_Model {

    protected $table = 'alumni';

    public function __construct()
    {
        parent::__construct();
    }

    public function insert(array $data)
    {
        return $this->db->insert($this->table, $data);
    }

    public function get_by_user_id(int $user_id)
    {
        return $this->db
                    ->where('user_id', $user_id)
                    ->get($this->table)
                    ->row_array();
    }
}
