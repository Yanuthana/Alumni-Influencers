<?php
// Script to run the cron job from CLI
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log start time
file_put_contents('/tmp/debug.txt', "Started: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

chdir(__DIR__);

// Run the CI cron command
$command = '/Applications/XAMPP/xamppfiles/bin/php index.php cron winner_selection';
$output = shell_exec($command);

// Log what happened
file_put_contents('/tmp/debug.txt', "Output: " . $output . "\n", FILE_APPEND);
echo $output;
