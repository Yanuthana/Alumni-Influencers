<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Profile_model extends CI_Model {
    
    public function __construct()
    {
        parent::__construct();
    }

    private function getAlumniId($user_id){
        $row = $this->db->get_where('alumni',['user_id'=>$user_id])->row_array();
        return $row ? $row['alumni_id'] : false;
    }
 
    public function getProfile($user_id){
       $alumni_id = $this->getAlumniId($user_id);
       if(!$alumni_id) return false;

       return $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
    }

    public function uploadProfileImage($user_id, $image_url){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'profile_image' => $image_url,
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;
    }

    public function updateLinkedinUrl($user_id, $linkedin_url){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'linkedin_url' => $linkedin_url,
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;
    }

    public function updateDegrees($user_id, $degrees){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'degrees' => json_encode($degrees),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;  
    }

    public function updateCertifications($user_id, $certifications){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'certifications' => json_encode($certifications),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;  
    }

    public function updateLicenses($user_id, $licenses){  
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'licenses' => json_encode($licenses),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;  
    }

    public function updateProfessionalCourses($user_id, $professional_courses){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'professional_courses' => json_encode($professional_courses),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;  
    }

    public function updateEmploymentHistory($user_id, $employment_history){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'employment_history' => json_encode($employment_history),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;  
    }


    public function addDegree($user_id, $degree_data){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $profile = $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
        if(!$profile) return false;
        
        $existing = !empty($profile['degrees']) ? json_decode($profile['degrees'], true) : [];
        if(!is_array($existing)) $existing = [];
        $existing[] = $degree_data;
        
        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'degrees' => json_encode($existing),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;  
    }

    public function addCertification($user_id, $certification_data){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $profile = $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
        if(!$profile) return false;
        
        $existing = !empty($profile['certifications']) ? json_decode($profile['certifications'], true) : [];
        if(!is_array($existing)) $existing = [];
        $existing[] = $certification_data;
        
        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'certifications' => json_encode($existing),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;  
    }

    public function addLicenses($user_id, $license_data){  
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $profile = $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
        if(!$profile) return false;
        
        $existing = !empty($profile['licenses']) ? json_decode($profile['licenses'], true) : [];
        if(!is_array($existing)) $existing = [];
        $existing[] = $license_data;
        
        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'licenses' => json_encode($existing),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;  
    }

    public function addProfessionalCourse($user_id, $course_data){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $profile = $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
        if(!$profile) return false;
        
        $existing = !empty($profile['professional_courses']) ? json_decode($profile['professional_courses'], true) : [];
        if(!is_array($existing)) $existing = [];
        $existing[] = $course_data;
        
        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'professional_courses' => json_encode($existing),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;  
    }

    public function addEmploymentHistory($user_id, $employment_data){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $profile = $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
        if(!$profile) return false;
        
        $existing = !empty($profile['employment_history']) ? json_decode($profile['employment_history'], true) : [];
        if(!is_array($existing)) $existing = [];
        $existing[] = $employment_data;
        
        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'employment_history' => json_encode($existing),
            'updated_at' => date('Y-m-d H:i:s')
        ]);
        return $this->db->affected_rows() > 0;  
    }

    public function deleteDegree($user_id, $index){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $profile = $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
        if(!$profile) return false;

        $degrees = json_decode($profile['degrees'], true);

        if(isset($degrees[$index])){
            unset($degrees[$index]);
        }

        $degrees = array_values($degrees);

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'degrees' => json_encode($degrees),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        return true;
    }

    public function deleteCertification($user_id, $index){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $profile = $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
        if(!$profile) return false;

        $certifications = json_decode($profile['certifications'], true);

        if(isset($certifications[$index])){
            unset($certifications[$index]);
        }

        $certifications = array_values($certifications);

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'certifications' => json_encode($certifications),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        return true;
    }

    public function deleteLicense($user_id, $index){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $profile = $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
        if(!$profile) return false;

        $licenses = json_decode($profile['licenses'], true);

        if(isset($licenses[$index])){
            unset($licenses[$index]);
        }

        $licenses = array_values($licenses);

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'licenses' => json_encode($licenses),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        return true;
    }

    public function deleteProfessionalCourse($user_id, $index){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $profile = $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
        if(!$profile) return false;

        $courses = json_decode($profile['professional_courses'], true);

        if(isset($courses[$index])){
            unset($courses[$index]);
        }

        $courses = array_values($courses);

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'professional_courses' => json_encode($courses),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        return true;
    }

    public function deleteEmploymentHistory($user_id, $index){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $profile = $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
        if(!$profile) return false;

        $employment_history = json_decode($profile['employment_history'], true);

        if(isset($employment_history[$index])){
            unset($employment_history[$index]);
        }

        $employment_history = array_values($employment_history);

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni_profiles', [
            'employment_history' => json_encode($employment_history),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        return true;
    }

    public function updateProfileCompletionStatus($user_id){
        $alumni_id = $this->getAlumniId($user_id);
        if(!$alumni_id) return false;

        $profile = $this->db->get_where('alumni_profiles', ['alumni_id' => $alumni_id])->row_array();
        if(!$profile) return false;

        $fields_to_check = [
            'profile_image', 
            'linkedin_url', 
            'degrees', 
            'certifications', 
            'licenses', 
            'professional_courses', 
            'employment_history'
        ];

        foreach($fields_to_check as $field){
            // Check for empty strings, nulls, or empty JSON arrays
            $val = $profile[$field];
            if(empty($val) || $val == '[]' || $val == 'null'){
                 return 'incomplete';
            }
        }

        $this->db->where('alumni_id', $alumni_id);
        $this->db->update('alumni', ['profile_completion_status' => 'completed']);

        return 'completed';
    }

}