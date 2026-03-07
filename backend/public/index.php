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

// ===== AUTHENTICATION & OTP =====
require_once __DIR__ . '/../app/routes/auth.php';

// ===== SYSTEM MANAGEMENT =====
require_once __DIR__ . '/../app/routes/lophoc.php';
require_once __DIR__ . '/../app/routes/monhoc.php';
require_once __DIR__ . '/../app/routes/giasumonhoc.php';
require_once __DIR__ . '/../app/routes/dangkylop.php';
require_once __DIR__ . '/../app/routes/lichhoc.php';
require_once __DIR__ . '/../app/routes/diemdanh.php';
require_once __DIR__ . '/../app/routes/yeucau.php';
require_once __DIR__ . '/../app/routes/danhgia.php';

// ===== USER MANAGEMENT =====
require_once __DIR__ . '/../app/routes/giasu.php';
require_once __DIR__ . '/../app/routes/hocsinhroutes.php';
require_once __DIR__ . '/../app/routes/phuhuynhroutes.php';

// ===== ADMIN MANAGEMENT =====
require_once __DIR__ . '/../app/routes/admin.php';

// ===== COMMUNICATION =====
require_once __DIR__ . '/../app/routes/thongbao.php';
require_once __DIR__ . '/../app/routes/tinnhan.php';

// ===== FINANCE =====
require_once __DIR__ . '/../app/routes/hocphi.php';
require_once __DIR__ . '/../app/routes/luonggiasu.php';
require_once __DIR__ . '/../app/routes/doanhthu.php';

Router::dispatch();
