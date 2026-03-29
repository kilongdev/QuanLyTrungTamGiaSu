<?php
/**
 * Học Phí Routes
 * Quản lý học phí
 */

require_once __DIR__ . '/../controllers/HocPhiController.php';

Router::get('/hocphi', ['HocPhiController', 'getAll']);
Router::get('/hocphi/check-overdue', ['HocPhiController', 'checkOverdue']);
Router::get('/hocphi/send-overdue-notifications', ['HocPhiController', 'sendOverdueNotifications']);
Router::get('/hocphi/chitiet/{id}', ['HocPhiController', 'getDetail']);
Router::get('/hocphi/{id}', ['HocPhiController', 'getByDangKy']);
Router::post('/hocphi/create', ['HocPhiController', 'create']);
Router::put('/hocphi/update/{id}', ['HocPhiController', 'updateStatus']);
Router::delete('/hocphi/delete/{id}', ['HocPhiController', 'delete']);
