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
 *   0 18 * * * curl -s "http://localhost/Alumni-Influencers/api/cron/winner_selection?cron_key=CRON_SECRET_KEY_CHANGE_ME" >> /tmp/alumni_winner_cron.log 2>&1
 *
 * Or via PHP CLI (no web server needed):
 *   0 18 * * * /Applications/XAMPP/xamppfiles/bin/php /Applications/XAMPP/xamppfiles/htdocs/Alumni-Influencers/cron_winner.php >> /tmp/alumni_winner_cron.log 2>&1
 *
 * @OA\Tag(
 *     name="Cron Jobs",
 *     description="Automated scheduled tasks"
 * )
 * @property SlotResult_model $slotresult_model
 * @property Bidding_model    $bidding_model
 */
class Cron extends CI_Controller
{

    /**
     * Must match the cron_key query parameter sent by the cron job.
     * Change this in production! Store in a config file ideally.
     */
    private $CRON_SECRET;

    public function __construct()
    {
        parent::__construct();
        $this->CRON_SECRET = getenv('CRON_SECRET');
        $this->load->model('slotresult_model');
        $this->load->model('bidding_model');
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
    /**
     * @OA\Get(
     *     path="/api/cron/winner_selection",
     *     summary="Select winner for today's slot",
     *     tags={"Cron Jobs"},
     *     @OA\Parameter(name="cron_key", in="query", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Executed"),
     *     @OA\Response(response=403, description="Invalid cron key")
     * )
     */
    public function winner_selection()
    {
        // Verify shared secret (works for both CLI and HTTP cron calls)
        $key = $this->input->get('cron_key');

        // When called from CLI via cron_winner.php the key is injected via argv
        if (php_sapi_name() === 'cli') {
            // CLI execution is inherently trusted; skip key check
        } elseif ($key !== $this->CRON_SECRET) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Forbidden: invalid cron key']);
            exit;
        }

        $timestamp = date('Y-m-d H:i:s');

        // 1) Automate Slot Creation for TODAY and FUTURE slots
        // We ensure slots for the next 7 days exist. This must happen BEFORE winner selection
        // so that today's slot exists in the database even if it was never created manually.
        $slotsCreated = [];
        for ($i = 0; $i <= 7; $i++) {
            $futureDate = date('Y-m-d', strtotime("+$i days"));
            $this->bidding_model->ensure_slot_exists($futureDate);
            $slotsCreated[] = $futureDate;
        }

        // 2) Predict winner for TODAY'S slot (and any pending past slots)
        $winnerResult = $this->slotresult_model->predict_winner();

        $response = [
            'executed_at' => $timestamp,
            'slot_automation' => [
                'status'  => 'success',
                'message' => 'Verified/Created slots for the next 7 days',
                'dates'   => $slotsCreated
            ],
            'winner_selection' => [
                'status'  => $winnerResult['status'] ? 'success' : 'error',
                'message' => $winnerResult['message'],
                'processed_count' => $winnerResult['processed_count'] ?? 0,
                'results' => $winnerResult['details'] ?? null
            ]
        ];

        $this->output
            ->set_status_header(200)
            ->set_content_type('application/json', 'utf-8')
            ->set_output(json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->output->_display();
        exit;
    }
}
