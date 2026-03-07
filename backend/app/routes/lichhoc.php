<?php
/**
 * Lịch Học Routes
 * Quản lý lịch học
 */

require_once __DIR__ . '/../controllers/LichHocController.php';

Router::get('/lichhoc/lop/{lop_hoc_id}', [new LichHocController(), 'getByLop']);
Router::post('/lichhoc/create', [new LichHocController(), 'create']);
Router::delete('/lichhoc/delete/{id}', [new LichHocController(), 'delete']);
