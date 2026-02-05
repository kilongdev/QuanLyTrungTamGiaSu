<?php
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
