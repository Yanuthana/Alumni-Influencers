<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Cron Controller - runs daily tasks
 */
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Cron",
 *     description="Endpoints for automated system tasks (e.g., daily winner selection)"
 * )
 */
class Cron extends CI_Controller
{
    private $CRON_SECRET;

    public function __construct()
    {
        parent::__construct();
        $this->CRON_SECRET = getenv('CRON_SECRET');
        $this->load->model('slotresult_model');
        $this->load->model('bidding_model');
    }

    /**
     * @OA\Get(
     *     path="/cron/winner_selection",
     *     summary="Trigger daily winner selection and slot generation",
     *     tags={"Cron"},
     *     @OA\Parameter(name="cron_key", in="query", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Tasks executed successfully"),
     *     @OA\Response(response=403, description="Invalid cron key")
     * )
     */

    // Handles picking a winner and making new slots at 6 PM
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

        // 1) Make slots for today and next week
        $slotsCreated = [];
        for ($i = 0; $i <= 7; $i++) {
            $futureDate = date('Y-m-d', strtotime("+$i days"));
            $this->bidding_model->ensure_slot_exists($futureDate);
            $slotsCreated[] = $futureDate;
        }

        // 2) Pick today's winner (and fix any missed days)
        $winnerResult = $this->slotresult_model->predict_winner();

        $response = [
            'executed_at' => $timestamp,
            'slot_automation' => [
                'status'  => 'success',
                'message' => 'Made/checked slots for next 7 days',
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
