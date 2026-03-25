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
// REST API Routes base Auth Controller (Auth.php)
// All accept JSON bodies and return JSON responses
// =================================================================
$route['api/register']         = 'Auth/register';
$route['api/verify-email']     = 'Auth/verify_email';
$route['api/login']            = 'Auth/login';
$route['api/logout']           = 'Auth/logout';
$route['api/forgot-password']  = 'Auth/forgot_password';
$route['api/verify-otp']       = 'Auth/verify_otp';
$route['api/reset-password']   = 'Auth/reset_password';

// Alumni Profile Routes
$route['api/get_profile']                     = 'AlumniProfile/get_profile';
$route['api/update_profile_image']            = 'AlumniProfile/update_profile_image';
$route['api/update_linkedin_url']             = 'AlumniProfile/update_linkedin_url';

// Degrees
$route['api/add_degrees']                     = 'AlumniProfile/add_degrees';
$route['api/update_degrees']                  = 'AlumniProfile/update_degrees';
$route['api/delete_degrees']                  = 'AlumniProfile/delete_degrees';

// Certifications
$route['api/add_certifications']              = 'AlumniProfile/add_certifications';
$route['api/update_certifications']           = 'AlumniProfile/update_certifications';
$route['api/delete_certifications']           = 'AlumniProfile/delete_certifications';

// Licenses
$route['api/add_licenses']                    = 'AlumniProfile/add_licenses';
$route['api/update_licenses']                 = 'AlumniProfile/update_licenses';
$route['api/delete_licenses']                 = 'AlumniProfile/delete_licenses';

// Professional Courses
$route['api/add_professional_courses']        = 'AlumniProfile/add_professional_courses';
$route['api/update_professional_courses']     = 'AlumniProfile/update_professional_courses';
$route['api/delete_professional_courses']     = 'AlumniProfile/delete_professional_courses';

// Employment History
$route['api/add_employment_history']          = 'AlumniProfile/add_employment_history';
$route['api/update_employment_history']       = 'AlumniProfile/update_employment_history';
$route['api/delete_employment_history']       = 'AlumniProfile/delete_employment_history';

$route['api/update_completion_status']        = 'AlumniProfile/update_completion_status';

// Bidding System Routes
$route['api/view_slots']                      = 'BiddingSystem/view_slots';
$route['api/place_bid']                       = 'BiddingSystem/place_bid';
$route['api/cancel_bid']                      = 'BiddingSystem/cancel_bid';
$route['api/update_bid']                      = 'BiddingSystem/update_bid';
$route['api/view_bid_status']                 = 'BiddingSystem/view_bid_status';
$route['api/view_bidding_history']            = 'BiddingSystem/view_bidding_history';
$route['api/view__status']       = 'BiddingSystem/view_monthly_limit_status';

// Slot Result Routes (winner prediction)
$route['api/predict_winner']                  = 'SlotResult/predict_winner';    // POST – manual admin trigger
$route['api/slot_result']                     = 'SlotResult/slot_result';        // GET  – any alumni
$route['api/monthly_limit_status']            = 'SlotResult/monthly_limit_status'; // GET – any alumni

// View Winner Route
$route['api/view_winner']                     = 'ViewWinner/view_winner'; // GET - any alumni

// ─── Automated Cron Job Route ──────────────────────────────────────────────
// Called every day at 18:00 (6 PM) by the system cron job.
// Protected by a shared secret key (?cron_key=CRON_SECRET_KEY_CHANGE_ME)
// or executed via CLI using cron_winner.php.
$route['api/cron/winner_selection']           = 'Cron/winner_selection';  // GET – cron only