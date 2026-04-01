<?php

require __DIR__ . '/vendor/autoload.php';

use OpenApi\Annotations as OA;

// Define CI3 constants
if (!defined('BASEPATH')) define('BASEPATH', __DIR__ . '/system/');
if (!defined('APPPATH')) define('APPPATH', __DIR__ . '/application/');
if (!defined('ENVIRONMENT')) define('ENVIRONMENT', 'development');

// Mock CodeIgniter core classes so we can include controllers without errors
if (!class_exists('CI_Controller')) {
    class CI_Controller {
        public function __construct() {}
        public function __get($key) { return null; }
    }
}

// Manually include core files and controllers to satisfy ReflectionAnalyser
require_once APPPATH . 'core/BaseApiController.php';
foreach (glob(APPPATH . 'controllers/*.php') as $file) {
    require_once $file;
}

$openapi = (new \OpenApi\Generator())->generate([
    APPPATH . 'controllers',
    APPPATH . 'core'
]);

file_put_contents(__DIR__ . '/swagger.json', $openapi->toJson());
echo "Swagger JSON generated successfully!\n";