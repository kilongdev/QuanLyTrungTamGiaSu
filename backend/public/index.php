<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../app/core/Database.php';
require_once __DIR__ . '/../app/core/JWT.php';
require_once __DIR__ . '/../app/core/Router.php';

require_once __DIR__ . '/../app/controllers/AuthController.php';
require_once __DIR__ . '/../app/controllers/OTPController.php';

require_once __DIR__ . '/../app/middleware/AuthMiddleware.php';

require_once __DIR__ . '/../routes/api.php';

Router::dispatch();
