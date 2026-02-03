<?php

declare(strict_types=1);

require_once __DIR__ . '/../app/core/Database.php';
require_once __DIR__ . '/../app/core/Model.php';
require_once __DIR__ . '/../app/controllers/BaseController.php';

require_once __DIR__ . '/../app/models/Admin.php';
require_once __DIR__ . '/../app/models/GiaSu.php';
require_once __DIR__ . '/../app/models/PhuHuynh.php';
require_once __DIR__ . '/../app/models/HocSinh.php';
require_once __DIR__ . '/../app/models/GiaSuMonHoc.php';
require_once __DIR__ . '/../app/models/MonHoc.php';

require_once __DIR__ . '/../app/controllers/AdminController.php';
require_once __DIR__ . '/../app/controllers/GiaSuController.php';
require_once __DIR__ . '/../app/controllers/PhuHuynhController.php';
require_once __DIR__ . '/../app/controllers/HocSinhController.php';
require_once __DIR__ . '/../app/controllers/GiaSuMonHocController.php';
require_once __DIR__ . '/../app/controllers/MonHocController.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
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

$path = preg_replace('#^/api#', '', $path);
$path = trim((string)$path, '/');
$parts = $path === '' ? [] : explode('/', $path);

$resource = $parts[0] ?? '';
$id = isset($parts[1]) && ctype_digit($parts[1]) ? (int)$parts[1] : null;
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$resource = str_replace('-', '_', $resource);

$controller = match ($resource) {
    'admin', 'admins' => new AdminController(),
    'gia_su', 'gia_sus' => new GiaSuController(),
    'phu_huynh', 'phu_huynhs' => new PhuHuynhController(),
    'hoc_sinh', 'hoc_sinhs' => new HocSinhController(),
    'gia_su_mon_hoc', 'gia_su_mon_hocs' => new GiaSuMonHocController(),
    'mon_hoc', 'mon_hocs' => new MonHocController(),
    default => null,
};

if ($controller === null) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Unknown resource'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if ($id === null) {
        if ($method === 'GET') {
            $controller->index();
            exit;
        }
        if ($method === 'POST') {
            $controller->store();
            exit;
        }

        http_response_code(405);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'GET') {
        $controller->show($id);
        exit;
    }
    if ($method === 'PUT' || $method === 'PATCH') {
        $controller->update($id);
        exit;
    }
    if ($method === 'DELETE') {
        $controller->destroy($id);
        exit;
    }

    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
