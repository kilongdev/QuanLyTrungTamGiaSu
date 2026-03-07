<?php
/**
 * Thông Báo Routes
 * Quản lý thông báo
 */

require_once __DIR__ . '/../controllers/ThongBaoController.php';

Router::get('/thongbao', ['ThongBaoController', 'getMyNotifications']);
Router::post('/thongbao/create', ['ThongBaoController', 'send']);
Router::put('/thongbao/read/{id}', ['ThongBaoController', 'markRead']);
