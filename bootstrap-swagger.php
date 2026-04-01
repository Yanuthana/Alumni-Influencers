<?php
// bootstrap-swagger.php

// Define CodeIgniter 3 constants to prevent "No direct script access allowed"
define('BASEPATH', __DIR__ . '/system/');
define('APPPATH', __DIR__ . '/application/');
define('VIEWPATH', APPPATH . 'views/');
define('ENVIRONMENT', 'development');

// Mock CI_Controller so we can load controllers without errors
if (!class_exists('CI_Controller')) {
    class CI_Controller {
        public function __construct() {}
        public function __get($key) { return null; }
    }
}

// Pre-load the base controller
if (file_exists(APPPATH . 'core/BaseApiController.php')) {
    require_once APPPATH . 'core/BaseApiController.php';
}

// Autoloader for controllers (since CI3 doesn't use PSR-4 for them)
spl_autoload_register(function ($class) {
    $file = APPPATH . 'controllers/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});
