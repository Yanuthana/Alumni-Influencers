<?php
defined('BASEPATH') or exit('No direct script access allowed');

require_once APPPATH . 'core/BaseApiController.php';
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="System",
 *     description="API health and gateway integration"
 * )
 */
class Api extends BaseApiController
{
    /**
     * @OA\Get(
     *     path="/api",
     *     summary="API Health Check",
     *     tags={"System"},
     *     security={{"apiKeyAuth": {}}},
     *     @OA\Response(response=200, description="API is running")
     * )
     */
    public function index()
    {
        $this->_require_api_key();
        $this->_respond(200, [
            'status'  => 'success',
            'message' => 'Alumni Influencers API is running.',
        ]);
    }

}

