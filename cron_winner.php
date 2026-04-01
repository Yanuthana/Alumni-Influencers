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

// Run CodeIgniter via its native CLI routing:
//   php index.php cron winner_selection
//
// This avoids relying on fake HTTP server variables and ensures the correct controller/method runs.
chdir(__DIR__);

// Ensure argv looks like a normal CI CLI invocation.
$_SERVER['argv'] = ['index.php', 'cron', 'winner_selection'];
$_SERVER['argc'] = count($_SERVER['argv']);

require_once __DIR__ . '/index.php';
