<?php
/**
 * Lịch Học Routes
 * Quản lý lịch học
 */

require_once __DIR__ . '/../controllers/LichHocController.php';

Router::get('/lichhoc/lop/{lop_hoc_id}', [new LichHocController(), 'getByLop']);
Router::post('/lichhoc/create', [new LichHocController(), 'create']);
Router::delete('/lichhoc/delete/{id}', [new LichHocController(), 'delete']);
Router::get('/lichhoc', [new LichHocController(), 'getAll']);
Router::put('/lichhoc/status/{id}', [new LichHocController(), 'updateStatus']);
Router::get('/lichhoc/giasu/{gia_su_id}', [new LichHocController(), 'getByGiaSu']);
Router::get('/lichhoc/phuhuynh/{phu_huynh_id}', [new LichHocController(), 'getByPhuHuynh']);
Router::get('/lichhoc/hocsinh/{hoc_sinh_id}', [new LichHocController(), 'getByHocSinh']);
Router::put('/lichhoc/update/{id}', [new LichHocController(), 'update']);