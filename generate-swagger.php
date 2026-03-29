<?php

require __DIR__ . '/vendor/autoload.php';

// Define CI3 constants to prevent "No direct script access allowed" errors
if (!defined('BASEPATH')) define('BASEPATH', __DIR__ . '/system/');
if (!defined('APPPATH')) define('APPPATH', __DIR__ . '/application/');
if (!defined('ENVIRONMENT')) define('ENVIRONMENT', 'development');

// Pre-load the base controller so the generator can resolve sub-classes
require_once APPPATH . 'core/BaseApiController.php';

/**
 * @OA\Info(
 *     title="Alumni Influencers API",
 *     version="1.0.0",
 *     description="API documentation for the Alumni Influencers platform"
 * )
 * @OA\Server(
 *     url="http://localhost/Alumni-Influencers",
 *     description="Local Development Server"
 * )
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */

$openapi = (new \OpenApi\Generator())->generate([
    __DIR__ . '/application/controllers',
    __DIR__ . '/application/core',
    __FILE__ 
]);

file_put_contents(__DIR__ . '/swagger.json', $openapi->toJson());

echo "Swagger JSON generated successfully!";