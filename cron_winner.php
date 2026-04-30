<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log that script started
file_put_contents('/tmp/debug.txt', "Started: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

// Change directory
chdir(__DIR__);

// Proper CLI call
$command = '/Applications/XAMPP/xamppfiles/bin/php index.php cron winner_selection';

// Execute and capture output
$output = shell_exec($command);

// Log output
file_put_contents('/tmp/debug.txt', "Output: " . $output . "\n", FILE_APPEND);
echo $output;
