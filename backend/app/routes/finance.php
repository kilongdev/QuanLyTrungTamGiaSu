<?php
require_once __DIR__ . '/../controllers/HocPhiController.php';
require_once __DIR__ . '/../controllers/LuongGiaSuController.php';
require_once __DIR__ . '/../controllers/DoanhThuController.php';

// --- HỌC PHÍ ---
$router->get('/api/hocphi', function() { (new HocPhiController())->getAll(); });
$router->get('/api/hocphi/dangky/{id}', function($id) { (new HocPhiController())->getByDangKy($id); });
$router->post('/api/hocphi', function() { (new HocPhiController())->create(); });
$router->put('/api/hocphi/{id}/status', function($id) { (new HocPhiController())->updateStatus($id); });

// --- LƯƠNG GIA SƯ ---
$router->get('/api/luong', function() { (new LuongGiaSuController())->getAll(); });
$router->get('/api/luong/giasu/{id}', function($id) { (new LuongGiaSuController())->getByGiaSu($id); });
$router->post('/api/luong', function() { (new LuongGiaSuController())->create(); });

// --- DOANH THU ---
$router->get('/api/doanhthu', function() { (new DoanhThuController())->getReport(); });
$router->get('/api/doanhthu/{id}', function($id) { (new DoanhThuController())->getDetails($id); });
$router->post('/api/doanhthu', function() { (new DoanhThuController())->createReport(); });
?>
