<?php
<<<<<<< HEAD
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
=======
/**
 * API Entry Point
 * URL: http://localhost/.../backend/public/api.php?route=/api/admin
 */

header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'success' => true,
    'message' => '✅ API Server Running!',
    'endpoints' => [
        'GET /api/admin' => 'Lấy tất cả admin',
        'GET /api/admin/{id}' => 'Lấy admin by ID',
        'POST /api/admin' => 'Tạo admin mới',
        'PUT /api/admin/{id}' => 'Cập nhật admin',
        'DELETE /api/admin/{id}' => 'Xóa admin',
        'POST /api/admin/login' => 'Đăng nhập'
    ],
    'how_to_use' => 'http://localhost/.../backend/public/api.php?route=/api/admin'
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
>>>>>>> minhthang
