<?php

defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';

use OpenApi\Annotations as OA;

/**
 * Controller for alumni profile stuff
 */
class AlumniProfile extends BaseApiController{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Profile_model', 'profile_model');
    }

    /**
     * Helper to get user_id from query parameter
     */
    private function _get_user_id() {
        $this->_require_role(['alumni']);
        $user_id = $this->input->get('user_id');
        if (!$user_id) {
            $this->_respond(400, ['status' => 'error', 'message' => 'user_id query parameter is required']);
        }
        return $user_id;
    }

    // Gets the profile for a user
    public function get_profile(){
        $user_id = $this->_get_user_id();
      
        $profile = $this->profile_model->getProfile($user_id);
        if(!$profile) {
            $this->_respond(404,['status'=>'error','message'=>'Profile not found']);
            return;
        }

        return $this->_respond(200,['status'=>'success','data'=>$profile]);
    }

    // Updates profile picture
    public function update_profile_image()
    {
        $user_id = $this->_get_user_id();
        $d= $this->_json_body();
        $profile_image_url = $d['profile_image_url']??'';

        if(empty($profile_image_url)){
            $this->_respond(400,['status'=>'error','message'=>'Profile image URL is required']);
            return;
        }

        $profile = $this->profile_model->uploadProfileImage($user_id,$profile_image_url);

        return $this->_respond(200,['status'=>'success','data'=>$profile]);
    
    }

    // Updates LinkedIn link
    public function update_linkedin_url()
    {
        $user_id = $this->_get_user_id();
        $d= $this->_json_body();
        $linkedin_url = $d['linkedin_url']??'';

        if(empty($linkedin_url)){
            $this->_respond(400,['status'=>'error','message'=>'LinkedIn URL is required']);
            return;
        }

        $profile = $this->profile_model->updateLinkedinUrl($user_id,$linkedin_url);

        return $this->_respond(200,['status'=>'success','data'=>$profile]);
    
    }

    /**
 * @OA\Post(
 *     path="/api/alumni/degrees",
 *     summary="Add a new degree",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="degree", type="string", example="BSc Computer Science")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Added"),
 *     @OA\Response(response=400, description="Invalid input")
 * )
 */
    public function add_degrees(){
        $user_id = $this->_get_user_id();
        $d= $this->_json_body();
        $degree = $d['degree']??'';

        if(empty($degree)){
            $this->_respond(400,['status'=>'error','message'=>'Degree is required']);
            return;
        }

        $profile = $this->profile_model->addDegree($user_id,$degree);

        return $this->_respond(200,['status'=>'success','data'=>$profile]);
    
    }


    /**
 * @OA\Put(
 *     path="/api/alumni/degrees",
 *     summary="Update degrees list (JSON)",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="degrees", type="string", example="['BSc CS', 'MSc AI']")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Updated")
 * )
 */
    public function update_degrees()
    {
        $user_id = $this->_get_user_id();
        $d= $this->_json_body();
        $degrees = $d['degrees']??'';

        if(empty($degrees)){
            $this->_respond(400,['status'=>'error','message'=>'Degrees is required']);
            return;
        }

        $profile = $this->profile_model->updateDegrees($user_id,$degrees);

        return $this->_respond(200,['status'=>'success','data'=>$profile]);
    
    }

    /**
 * @OA\Delete(
 *     path="/api/alumni/degrees",
 *     summary="Delete a degree by index",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="index", type="integer", example=0)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Deleted"),
 *     @OA\Response(response=400, description="Invalid index")
 * )
 */
    public function delete_degrees(){
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $index = $d['index'] ?? null;

        if ($index === null) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Index is required']);
            return;
        }

        $success = $this->profile_model->deleteDegree($user_id, $index);

        if ($success) {
            return $this->_respond(200, ['status' => 'success', 'message' => 'Degree deleted successfully']);
        } else {
            return $this->_respond(500, ['status' => 'error', 'message' => 'Failed to delete degree']);
        }
    }
    /**
 * @OA\Post(
 *     path="/api/alumni/certifications",
 *     summary="Add a new certification",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="certification", type="string", example="AWS Certified Developer")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Added")
 * )
 */
    public function add_certifications()
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $certification = $d['certification'] ?? '';

        if (empty($certification)) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Certification is required']);
            return;
        }

        $profile = $this->profile_model->addCertification($user_id, $certification);

        return $this->_respond(200, ['status' => 'success', 'data' => $profile]);
    }

    /**
 * @OA\Put(
 *     path="/api/alumni/certifications",
 *     summary="Update certifications list (JSON)",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="certifications", type="string", example="['AWS Certified Developer', 'Google Cloud Engineer']")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Updated")
 * )
 */
    public function update_certifications()
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $certifications = $d['certifications'] ?? '';

        if (empty($certifications)) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Certifications is required']);
            return;
        }

        $profile = $this->profile_model->updateCertifications($user_id, $certifications);

        return $this->_respond(200, ['status' => 'success', 'data' => $profile]);
    }

    /**
 * @OA\Delete(
 *     path="/api/alumni/certifications",
 *     summary="Delete a certification by index",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="index", type="integer", example=0)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Deleted"),
 *     @OA\Response(response=400, description="Invalid index")
 * )
 */
    public function delete_certifications()
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $index = $d['index'] ?? null;

        if ($index === null) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Index is required']);
            return;
        }

        $success = $this->profile_model->deleteCertification($user_id, $index);

        if ($success) {
            return $this->_respond(200, ['status' => 'success', 'message' => 'Certification deleted successfully']);
        } else {
            return $this->_respond(500, ['status' => 'error', 'message' => 'Failed to delete certification']);
        }
    }

    /**
 * @OA\Post(
 *     path="/api/alumni/licenses",
 *     summary="Add a new license",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="licenses", type="string", example="Driver License")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Added")
 * )
 */
    public function add_licenses()      
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $license = $d['licenses'] ?? '';

        if (empty($license)) {
            $this->_respond(400, ['status' => 'error', 'message' => 'License is required']);
            return;
        }

        $profile = $this->profile_model->addLicenses($user_id, $license);

        return $this->_respond(200, ['status' => 'success', 'data' => $profile]);
    }

    /**
 * @OA\Put(
 *     path="/api/alumni/licenses",
 *     summary="Update licenses list (JSON)",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="licenses", type="string", example="['License A', 'License B']")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Updated")
 * )
 */
    public function update_licenses()
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $licenses = $d['licenses'] ?? '';

        if (empty($licenses)) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Licenses is required']);
            return;
        }

        $profile = $this->profile_model->updateLicenses($user_id, $licenses);

        return $this->_respond(200, ['status' => 'success', 'data' => $profile]);
    }

    /**
 * @OA\Delete(
 *     path="/api/alumni/licenses",
 *     summary="Delete a license by index",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="index", type="integer", example=0)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Deleted"),
 *     @OA\Response(response=400, description="Invalid index")
 * )
 */
    public function delete_licenses()
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $index = $d['index'] ?? null;

        if ($index === null) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Index is required']);
            return;
        }

        $success = $this->profile_model->deleteLicense($user_id, $index);

        if ($success) {
            return $this->_respond(200, ['status' => 'success', 'message' => 'License deleted successfully']);
        } else {
            return $this->_respond(500, ['status' => 'error', 'message' => 'Failed to delete license']);
        }
    }

    /**
 * @OA\Post(
 *     path="/api/alumni/professional_courses",
 *     summary="Add a new professional course",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="course", type="string", example="Advanced PHP")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Added")
 * )
 */
    public function add_professional_courses()
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $course = $d['course'] ?? '';

        if (empty($course)) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Course is required']);
            return;
        }

        $profile = $this->profile_model->addProfessionalCourse($user_id, $course);

        return $this->_respond(200, ['status' => 'success', 'data' => $profile]);
    }

    /**
 * @OA\Put(
 *     path="/api/alumni/professional_courses",
 *     summary="Update professional courses list (JSON)",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="professional_courses", type="string", example="['Course 1', 'Course 2']")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Updated")
 * )
 */
    public function update_professional_courses()
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $professional_courses = $d['professional_courses'] ?? '';

        if (empty($professional_courses)) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Professional courses is required']);
            return;
        }

        $profile = $this->profile_model->updateProfessionalCourses($user_id, $professional_courses);

        return $this->_respond(200, ['status' => 'success', 'data' => $profile]);
    }

    /**
 * @OA\Delete(
 *     path="/api/alumni/professional_courses",
 *     summary="Delete a professional course by index",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="index", type="integer", example=0)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Deleted"),
 *     @OA\Response(response=400, description="Invalid index")
 * )
 */
    public function delete_professional_courses()
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $index = $d['index'] ?? null;

        if ($index === null) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Index is required']);
            return;
        }

        $success = $this->profile_model->deleteProfessionalCourse($user_id, $index);

        if ($success) {
            return $this->_respond(200, ['status' => 'success', 'message' => 'Professional course deleted successfully']);
        } else {
            return $this->_respond(500, ['status' => 'error', 'message' => 'Failed to delete professional course']);
        }
    }

    /**
 * @OA\Post(
 *     path="/api/alumni/employment_history",
 *     summary="Add employment history entry",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="employment_data", type="string", example="Software Engineer at Google")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Added")
 * )
 */
    public function add_employment_history()
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $employment_data = $d['employment_data'] ?? '';

        if (empty($employment_data)) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Employment data is required']);
            return;
        }

        $profile = $this->profile_model->addEmploymentHistory($user_id, $employment_data);

        return $this->_respond(200, ['status' => 'success', 'data' => $profile]);
    }

    /**
 * @OA\Put(
 *     path="/api/alumni/employment_history",
 *     summary="Update employment history (JSON)",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="employment_history", type="string", example="['Job 1', 'Job 2']")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Updated")
 * )
 */
    public function update_employment_history()
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $employment_history = $d['employment_history'] ?? '';

        if (empty($employment_history)) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Employment history is required']);
            return;
        }

        $profile = $this->profile_model->updateEmploymentHistory($user_id, $employment_history);

        return $this->_respond(200, ['status' => 'success', 'data' => $profile]);
    }

    /**
 * @OA\Delete(
 *     path="/api/alumni/employment_history",
 *     summary="Delete employment history entry by index",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         @OA\JsonContent(
 *             @OA\Property(property="index", type="integer", example=0)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Deleted"),
 *     @OA\Response(response=400, description="Invalid index")
 * )
 */
    public function delete_employment_history()
    {
        $user_id = $this->_get_user_id();
        $d = $this->_json_body();
        $index = $d['index'] ?? null;

        if ($index === null) {
            $this->_respond(400, ['status' => 'error', 'message' => 'Index is required']);
            return;
        }

        $success = $this->profile_model->deleteEmploymentHistory($user_id, $index);

        if ($success) {
            return $this->_respond(200, ['status' => 'success', 'message' => 'Employment history deleted successfully']);
        } else {
            return $this->_respond(500, ['status' => 'error', 'message' => 'Failed to delete employment history']);
        }
    }


    
    
    /**
 * @OA\Get(
 *     path="/api/alumni/profile/completion-status",
 *     summary="Get profile completion status",
 *     tags={"Alumni Profile"},
 *     security={{"bearerAuth": {}}},
 *     @OA\Parameter(name="user_id", in="query", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="Status returned")
 * )
 */
    public function update_completion_status(){
        $user_id = $this->_get_user_id();
        $status = $this->profile_model->updateProfileCompletionStatus($user_id);

        if($status === 'completed'){
            return $this->_respond(200, ['status' => 'success', 'message' => 'Profile completed successfully']);
        } elseif($status === 'incomplete') {
            return $this->_respond(200, ['status' => 'success', 'message' => 'Profile is incomplete. Please ensure all sections have information.']);
        } else {
            return $this->_respond(404, ['status' => 'error', 'message' => 'Alumni profile not found']);
        }
    }

}