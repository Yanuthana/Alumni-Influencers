<?php
/**
 * cron_winner.php ─ CLI bootstrap for the 6 PM winner-selection job.
 *
 * Run this script every day at 6:00 PM (18:00) via macOS crontab:
 *
 *   crontab -e
 *   0 18 * * * /Applications/XAMPP/xamppfiles/bin/php \
 *              /Applications/XAMPP/xamppfiles/htdocs/Alumni-Influencers/cron_winner.php \
 *              >> /tmp/alumni_winner_cron.log 2>&1
 *
 * The script boots CodeIgniter in CLI mode and calls
 * Cron::winner_selection() which runs predict_winner() on the model.
 */

// ── 1. Tell CodeIgniter this is a CLI request ────────────────────────
define('STDIN', fopen('php://stdin', 'r'));

// ── 2. Fake a CLI-friendly server environment ───────────────────────
$_SERVER['HTTP_HOST']      = 'localhost';
$_SERVER['REQUEST_URI']    = '/api/cron/winner_selection';
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['SCRIPT_NAME']    = '/index.php';
$_SERVER['REMOTE_ADDR']    = '127.0.0.1';
$_GET['cron_key']          = 'CRON_CLI'; // CLI path skips key validation

// ── 3. Point to CodeIgniter front-controller ─────────────────────────
$_SERVER['SCRIPT_FILENAME'] = __DIR__ . '/index.php';
chdir(__DIR__);

echo "\n[" . date('Y-m-d H:i:s') . "] Running midnight winner selection...\n";

// ── 4. Boot CodeIgniter ──────────────────────────────────────────────
require_once __DIR__ . '/index.php';
