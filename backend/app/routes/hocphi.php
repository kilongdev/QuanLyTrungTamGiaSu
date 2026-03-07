<?php
/**
 * Học Phí Routes
 * Quản lý học phí
 */

require_once __DIR__ . '/../controllers/HocPhiController.php';

Router::get('/hocphi', ['HocPhiController', 'getAll']);
Router::get('/hocphi/{id}', ['HocPhiController', 'getByDangKy']);
Router::post('/hocphi/create', ['HocPhiController', 'create']);
Router::put('/hocphi/update/{id}', ['HocPhiController', 'updateStatus']);
