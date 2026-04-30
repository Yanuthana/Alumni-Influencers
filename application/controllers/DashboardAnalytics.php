<?php
defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';

use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Dashboard",
 *     description="Endpoints for fetching alumni insights and statistics"
 * )
 */
class DashboardAnalytics extends BaseApiController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Dashboard_model', 'dashboard_model');
    }

    /**
     * @OA\Get(
     *     path="/api/dashboard/personal",
     *     summary="Get personal dashboard insights",
     *     tags={"Dashboard"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(response=200, description="Personal insights returned"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=404, description="No data found")
     * )
     */

    public function personal()
    {
        $user = $this->_require_role(['alumni']);
        $data = $this->dashboard_model->getPersonalInsights($user['user_id']);

        if (!$data) {
            $this->_respond(404, [
                'status' => 'error',
                'message' => 'No personal dashboard data available',
            ]);
            return;
        }

        $this->_respond(200, [
            'status' => 'success',
            'message' => 'Personal dashboard insights fetched successfully',
            'data' => $data,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/dashboard/global",
     *     summary="Get global dashboard insights",
     *     tags={"Dashboard"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(response=200, description="Global insights returned"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function global()
    {
        $this->_require_authenticated_user();
        $data = $this->dashboard_model->getGlobalInsights();

        $this->_respond(200, [
            'status' => 'success',
            'message' => 'Global dashboard insights fetched successfully',
            'data' => $data,
        ]);
    }
}
