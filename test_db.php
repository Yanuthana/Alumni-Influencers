<?php
define('BASEPATH', __DIR__ . '/system/');
define('APPPATH', __DIR__ . '/application/');
define('ENVIRONMENT', 'development');

require_once BASEPATH . 'core/Common.php';
require_once BASEPATH . 'core/Controller.php';

// Not easy to bootstrap CI this way.
// Let's just make a direct HTTP request to the API instead!
