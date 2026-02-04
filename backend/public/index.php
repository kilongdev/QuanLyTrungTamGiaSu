<?php
/**
 * API Entry Point
 * Quản Lý Trung Tâm Gia Sư - Auth Only
 */

// CORS Headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoload Core
require_once __DIR__ . '/../app/core/Database.php';
require_once __DIR__ . '/../app/core/JWT.php';
require_once __DIR__ . '/../app/core/Router.php';

// Autoload Services
require_once __DIR__ . '/../app/services/OTPService.php';

// Autoload Controllers
require_once __DIR__ . '/../app/controllers/AuthController.php';
require_once __DIR__ . '/../app/controllers/OTPController.php';

// Autoload Middleware
require_once __DIR__ . '/../app/middleware/AuthMiddleware.php';

// Load Routes
require_once __DIR__ . '/../routes/api.php';

// Dispatch
Router::dispatch();
