<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * SecurityHeaders Hook
 * Sends essential security headers for كل responses.
 */
class SecurityHeaders {

    public function send_headers() {
        // Cron/CLI runs should not emit HTTP headers.
        if (php_sapi_name() === 'cli') {
            return;
        }

        $CI =& get_instance();

        // Prevent Clickjacking
        header('X-Frame-Options: SAMEORIGIN');

        // Prevent MIME type sniffing
        header('X-Content-Type-Options: nosniff');

        // Block XSS in older browsers
        header('X-XSS-Protection: 1; mode=block');

        // Standard Referrer Policy
        header('Referrer-Policy: strict-origin-when-cross-origin');

        // Content Security Policy (Basic default for API)
        header("Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval';");

        // Set HSTS if on HTTPS (optional but good practice)
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        }

        // CORS Setup (Broad for dev, restrict in prod)
        header('Access-Control-Allow-Origin: *'); 
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header('Status: 200 OK');
            exit;
        }
    }
}
