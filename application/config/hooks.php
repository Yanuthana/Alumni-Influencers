<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| Hooks
| -------------------------------------------------------------------------
*/

// Set security headers after controller instance is created
$hook['post_controller_constructor'][] = array(
    'class'    => 'SecurityHeaders',
    'function' => 'send_headers',
    'filename' => 'SecurityHeaders.php',
    'filepath' => 'hooks'
);
