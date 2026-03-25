<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Cron Controller
 *
 * Handles scheduled jobs that run automatically without a JWT token.
 * The endpoint is protected by a shared secret key passed as a query
 * parameter so that external callers cannot trigger it accidentally.
 *
 * Cron job (6:00 PM every day):
 *   0 18 * * * curl -s "http://localhost/Alumni-Influencers/api/cron/winner_selection?cron_key=CRON_SECRET_KEY_CHANGE_ME" >> /tmp/alumni_cron.log 2>&1
 *
 * Or via PHP CLI (no web server needed):
 *   0 18 * * * /Applications/XAMPP/xamppfiles/bin/php /Applications/XAMPP/xamppfiles/htdocs/Alumni-Influencers/cron_winner.php >> /tmp/alumni_cron.log 2>&1
 *
 * @property CI_Input      $input
 * @property CI_Output     $output
 * @property CI_Loader     $load
 * @property SlotResult_model $slotresult_model
 */
class Cron extends CI_Controller {

    /**
     * Must match the cron_key query parameter sent by the cron job.
     * Change this in production! Store in a config file ideally.
     */
    private const CRON_SECRET = 'CRON_SECRET_KEY_CHANGE_ME';

    public function __construct() {
        parent::__construct();
        $this->load->model('slotresult_model');
    }

    // ---------------------------------------------------------------
    // GET/POST  api/cron/winner_selection?cron_key=<secret>
    // Called automatically every day at 6:00 PM (18:00) by the cron job.
    // ---------------------------------------------------------------

    /**
     * Automatically select the winner for today's slot.
     *
     * This method is meant to be triggered ONLY by the cron job at 18:00.
     * It validates a shared secret key before executing the logic.
     */
    public function winner_selection() {
        // Verify shared secret (works for both CLI and HTTP cron calls)
        $key = $this->input->get('cron_key');

        // When called from CLI via cron_winner.php the key is injected via argv
        if (php_sapi_name() === 'cli') {
            // CLI execution is inherently trusted; skip key check
        } elseif ($key !== self::CRON_SECRET) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Forbidden: invalid cron key']);
            exit;
        }

        $timestamp = date('Y-m-d H:i:s');
        $result    = $this->slotresult_model->predict_winner();

        $response = [
            'executed_at' => $timestamp,
            'status'      => $result['status'] ? 'success' : 'error',
            'message'     => $result['message'],
        ];

        if (!empty($result['data'])) {
            $response['data'] = $result['data'];
        }

        $this->output
            ->set_status_header($result['status'] ? 200 : 400)
            ->set_content_type('application/json', 'utf-8')
            ->set_output(json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->output->_display();
        exit;
    }
}
