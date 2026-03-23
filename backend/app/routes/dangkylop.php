<?php
/**
 * Đăng Ký Lớp Routes
 * Quản lý đăng ký lớp học
 */

require_once __DIR__ . '/../controllers/DangKyLopController.php';

Router::get('/dangkylop/lop/{lop_hoc_id}', [new DangKyLopController(), 'getByLop']);
Router::get('/dangkylop/lop/{lop_hoc_id}/daduyet', [new DangKyLopController(), 'getHocSinhDaDuyetByLop']);
Router::post('/dangkylop/create', [new DangKyLopController(), 'create']);
Router::put('/dangkylop/status/{id}', [new DangKyLopController(), 'updateStatus']);
Router::get('/dangkylop/all', [new DangKyLopController(), 'getAll']);
Router::get('/dangkylop/phuhuynh/{phu_huynh_id}', [new DangKyLopController(), 'getByPhuHuynh']);