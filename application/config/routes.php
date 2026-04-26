<?php
defined('BASEPATH') or exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/userguide3/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
$route['default_controller'] = 'Auth';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

// =================================================================
// RESTful API Routes (resource-based + correct HTTP verbs)
//
// Notes:
// - CodeIgniter 3 supports HTTP-verb routing via:
//     $route['path']['get|post|put|patch|delete'] = 'Controller/method'
// - Controllers are kept as-is wherever possible.
// - Old action-style routes are kept below as OPTIONAL backward-compat routes (commented).
// =================================================================

// -------------------------
// /api/auth/*
// -------------------------
$route['api/auth/register']['post']                = 'Auth/register';
$route['api/auth/email/verify']['post']            = 'Auth/verify_email';
$route['api/auth/sessions']['post']                = 'Auth/login';          
$route['api/auth/sessions']['delete']              = 'Auth/logout';         
$route['api/auth/password/forgot']['post']         = 'Auth/forgot_password';
$route['api/auth/password/otp/verify']['post']     = 'Auth/verify_otp';
$route['api/auth/password/reset']['post']          = 'Auth/reset_password';

// -------------------------
// /api/alumni/*
// -------------------------
// Profile
$route['api/alumni/profile']['get']                = 'AlumniProfile/get_profile';
$route['api/alumni/profile/image']['put']          = 'AlumniProfile/update_profile_image';
$route['api/alumni/profile/linkedin']['put']       = 'AlumniProfile/update_linkedin_url';
$route['api/alumni/profile/completion-status']['get'] = 'AlumniProfile/update_completion_status';

// Directory
$route['api/alumni/directory']['get']              = 'AlumniDirectory/index';

// Degrees 
$route['api/alumni/degrees']['post']               = 'AlumniProfile/add_degrees';
$route['api/alumni/degrees']['put']                = 'AlumniProfile/update_degrees';
$route['api/alumni/degrees']['delete']             = 'AlumniProfile/delete_degrees';

// Certifications
$route['api/alumni/certifications']['post']        = 'AlumniProfile/add_certifications';
$route['api/alumni/certifications']['put']         = 'AlumniProfile/update_certifications';
$route['api/alumni/certifications']['delete']      = 'AlumniProfile/delete_certifications';

// Licenses
$route['api/alumni/licenses']['post']              = 'AlumniProfile/add_licenses';
$route['api/alumni/licenses']['put']               = 'AlumniProfile/update_licenses';
$route['api/alumni/licenses']['delete']            = 'AlumniProfile/delete_licenses';

// Professional Courses
$route['api/alumni/professional_courses']['post']  = 'AlumniProfile/add_professional_courses';
$route['api/alumni/professional_courses']['put']   = 'AlumniProfile/update_professional_courses';
$route['api/alumni/professional_courses']['delete']= 'AlumniProfile/delete_professional_courses';

// Employment History
$route['api/alumni/employment_history']['post']    = 'AlumniProfile/add_employment_history';
$route['api/alumni/employment_history']['put']     = 'AlumniProfile/update_employment_history';
$route['api/alumni/employment_history']['delete']  = 'AlumniProfile/delete_employment_history';

// Limits / results
$route['api/alumni/monthly-limit-status']['get']   = 'SlotResult/monthly_limit_status';

// -------------------------
// /api/slots
// -------------------------
$route['api/slots']['get']                         = 'BiddingSystem/view_slots';

$route['api/slots/result']['get']                  = 'SlotResult/slot_result';

$route['api/slots/winner-prediction']['post']      = 'SlotResult/predict_winner';

// -------------------------
// /api/bids
// -------------------------
$route['api/bids']['post']                         = 'BiddingSystem/place_bid';
$route['api/bids/history']['get']                  = 'BiddingSystem/view_bidding_history';

$route['api/bids']['put']                          = 'BiddingSystem/update_bid';
$route['api/bids']['delete']                       = 'BiddingSystem/cancel_bid';
$route['api/bidsstatus']['post']                    = 'BiddingSystem/view_bid_status';

// -------------------------
// /api/dashboard/*
// -------------------------
$route['api/dashboard/personal']['get']            = 'DashboardAnalytics/personal';
$route['api/dashboard/global']['get']              = 'DashboardAnalytics/global';

// -------------------------
// /api/featured-alumni
// -------------------------
$route['api/featured-alumni']['get']               = 'ViewWinner/view_winner';

// -------------------------
// /api/cron/*
// -------------------------
$route['api/cron/winner-selection']['get']         = 'Cron/winner_selection';
$route['api/cron/winner-selection']['post']        = 'Cron/winner_selection';


// -------------------------
// /api/api-key-management/*
// -------------------------
$route['api/api-key-management/generate']['post']  = 'ApiKeyManager/generate_key';
$route['api/api-key-management/list']['get']       = 'ApiKeyManager/list_keys';
$route['api/api-key-management/revoke']['delete']   = 'ApiKeyManager/revoke_key';
$route['api/api-key-management/stats']['get']      = 'ApiKeyManager/stats';
$route['api/api-key-management/logs']['get']       = 'ApiKeyManager/logs';
$route['api/api-key-management/docs']['get']       = 'ApiKeyManager/docs';
$route['api/api-key-management/swagger']['get']    = 'ApiKeyManager/swagger_ui';

