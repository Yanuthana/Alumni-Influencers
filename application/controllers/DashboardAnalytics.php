<?php
defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';

class DashboardAnalytics extends BaseApiController
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Dashboard_model', 'dashboard_model');
    }

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
