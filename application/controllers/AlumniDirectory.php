<?php

defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';

class AlumniDirectory extends BaseApiController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
    }

    public function index()
    {
        $this->_require_authenticated_user();

        $programme = $this->input->get('programme');
        $graduation_year = $this->input->get('graduation_year');
        $industry = $this->input->get('industry');

        $this->db->select('u.first_name, u.second_name, u.user_name as email, ap.*');
        $this->db->from('alumni a');
        $this->db->join('users u', 'u.user_id = a.user_id');
        $this->db->join('alumni_profiles ap', 'ap.alumni_id = a.alumni_id');
        
        $results = $this->db->get()->result_array();

        $filtered = [];

        foreach ($results as $row) {
            $degrees = json_decode($row['degrees'] ?? '[]', true) ?: [];
            $employment = json_decode($row['employment_history'] ?? '[]', true) ?: [];

            // Apply filters
            $matchProgramme = empty($programme);
            $matchYear = empty($graduation_year);
            if (!empty($programme) || !empty($graduation_year)) {
                foreach ($degrees as $deg) {
                    if (!empty($programme) && stripos($deg['title'] ?? '', $programme) !== false) {
                        $matchProgramme = true;
                    }
                    if (!empty($graduation_year) && ($deg['year'] ?? '') == $graduation_year) {
                        $matchYear = true;
                    }
                }
            }

            $matchIndustry = empty($industry);
            if (!empty($industry)) {
                foreach ($employment as $emp) {
                    if (stripos($emp['position'] ?? '', $industry) !== false || stripos($emp['company'] ?? '', $industry) !== false) {
                        $matchIndustry = true;
                        break;
                    }
                }
            }

            if ($matchProgramme && $matchYear && $matchIndustry) {
                // Remove sensitive/huge fields before returning
                $row['degrees'] = $degrees;
                $row['employment_history'] = $employment;
                $row['certifications'] = json_decode($row['certifications'] ?? '[]', true) ?: [];
                unset($row['licenses']);
                unset($row['professional_courses']);
                $filtered[] = $row;
            }
        }

        $this->_respond(200, [
            'status' => 'success',
            'data' => $filtered
        ]);
    }
}
