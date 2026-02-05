<?php
/**
 * API Entry Point
 */

// CORS Headers - Cho phép Frontend (React) gọi API từ domain khác
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Xử lý preflight request (OPTIONS) của trình duyệt
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../app/core/Router.php';

// Lấy route từ query string
$route = isset($_GET['route']) ? $_GET['route'] : '/api/admin';

// Tạo fake REQUEST_URI
$_SERVER['REQUEST_URI'] = $route;

// Tạo instance Router
$router = new Router();

// Load routes
// Tự động load tất cả các file định tuyến trong thư mục routes
foreach (glob(__DIR__ . '/../app/routes/*.php') as $routeFile) {
    require_once $routeFile;
}

// Dispatch route
$router->dispatch();
?>
