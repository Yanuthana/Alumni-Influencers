<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Api_log_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Persist one API access log row.
     */
    public function create_log(array $payload): bool
    {
        $data = [
            'client_id'   => isset($payload['client_id']) ? (string) $payload['client_id'] : null,
            'endpoint'    => isset($payload['endpoint']) ? (string) $payload['endpoint'] : null,
            'status'      => isset($payload['status']) ? (int) $payload['status'] : 500,
            'ip_address'  => isset($payload['ip_address']) ? (string) $payload['ip_address'] : null,
            'created_at'  => date('Y-m-d H:i:s'),
        ];

        return (bool) $this->db->insert('api_logs', $data);
    }

    /**
     * Get API request statistics grouped by client_id.
     */
    public function get_key_stats(): array
    {
        return $this->db
                    ->select('client_id, COUNT(*) AS requests')
                    ->group_by('client_id')
                    ->get('api_logs')
                    ->result_array();
    }

    /**
     * Get all API logs.
     */
    public function get_all_logs(int $limit = 100, int $offset = 0): array
    {
        return $this->db
                    ->order_by('created_at', 'DESC')
                    ->limit($limit, $offset)
                    ->get('api_logs')
                    ->result_array();
    }
}
