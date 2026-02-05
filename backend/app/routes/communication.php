<?php
require_once __DIR__ . '/../controllers/ThongBaoController.php';
require_once __DIR__ . '/../controllers/TinNhanController.php';

// --- THÔNG BÁO ---
$router->get('/api/thongbao', function() { (new ThongBaoController())->getMyNotifications(); });
$router->post('/api/thongbao', function() { (new ThongBaoController())->send(); });
$router->put('/api/thongbao/{id}/read', function($id) { (new ThongBaoController())->markRead($id); });

// --- TIN NHẮN ---
$router->get('/api/tinnhan', function() { (new TinNhanController())->getConversation(); });
$router->post('/api/tinnhan', function() { (new TinNhanController())->send(); });
?>
