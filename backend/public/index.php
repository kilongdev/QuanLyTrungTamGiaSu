<?php
/**
 * Entry point cho Backend API
 * Quản Lý Trung Tâm Gia Sư
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Lấy URI path
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$path = parse_url($requestUri, PHP_URL_PATH);
$path = is_string($path) ? $path : '/';

$scriptName = (string)($_SERVER['SCRIPT_NAME'] ?? '');
$scriptDir = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');
if ($scriptDir !== '' && str_starts_with($path, $scriptDir)) {
    $path = substr($path, strlen($scriptDir));
    if ($path === false || $path === '') {
        $path = '/';
    }
}

if (str_starts_with($path, '/index.php')) {
    $path = substr($path, strlen('/index.php'));
    if ($path === false || $path === '') {
        $path = '/';
    }
}

if (str_starts_with($path, '/api')) {
    require __DIR__ . '/../routes/api.php';
    exit;
}

// Response mặc định
$response = [
    'status' => 'success',
    'message' => 'Chào mừng đến với API Quản Lý Trung Tâm Gia Sư!',
    'version' => '1.0.0',
    'endpoints' => [
        'GET /' => 'Trang chủ API',
        'GET /test.php' => 'Test API',
        'GET /api/tutors' => 'Danh sách gia sư (coming soon)',
        'GET /api/students' => 'Danh sách học sinh (coming soon)',
        'GET /api/classes' => 'Danh sách lớp học (coming soon)'
    ],
    'request_info' => [
        'method' => $requestMethod,
        'uri' => $requestUri,
        'timestamp' => date('Y-m-d H:i:s')
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
