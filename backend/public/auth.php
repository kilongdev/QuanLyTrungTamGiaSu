<?php
/**
 * Test JWT Authentication
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../app/core/JWT.php';
require_once __DIR__ . '/../app/controllers/AuthController.php';

$uri = $_SERVER['REQUEST_URI'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Simple routing
if (strpos($uri, '/auth/login') !== false && $method === 'POST') {
    AuthController::login();
} 
elseif (strpos($uri, '/auth/register') !== false && $method === 'POST') {
    AuthController::register();
} 
elseif (strpos($uri, '/auth/me') !== false && $method === 'GET') {
    AuthController::me();
} 
else {
    // Hướng dẫn test
    echo json_encode([
        'status' => 'success',
        'message' => 'JWT Authentication API',
        'endpoints' => [
            'POST /auth/login' => [
                'description' => 'Đăng nhập',
                'body' => [
                    'email' => 'admin@example.com',
                    'password' => '123456'
                ]
            ],
            'POST /auth/register' => [
                'description' => 'Đăng ký',
                'body' => [
                    'name' => 'Tên người dùng',
                    'email' => 'email@example.com',
                    'password' => 'matkhau',
                    'role' => 'student|tutor|admin'
                ]
            ],
            'GET /auth/me' => [
                'description' => 'Lấy thông tin user (cần token)',
                'headers' => [
                    'Authorization' => 'Bearer <token>'
                ]
            ]
        ],
        'test_accounts' => [
            [
                'email' => 'admin@example.com',
                'password' => '123456',
                'role' => 'admin'
            ],
            [
                'email' => 'tutor@example.com',
                'password' => '123456',
                'role' => 'tutor'
            ]
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
