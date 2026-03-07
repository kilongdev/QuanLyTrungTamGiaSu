<?php
/**
 * Đánh Giá Routes
 * Quản lý đánh giá gia sư
 */

require_once __DIR__ . '/../controllers/DanhGiaController.php';

Router::get('/danhgia/giasu/{gia_su_id}', [new DanhGiaController(), 'getByGiaSu']);
Router::get('/danhgia/trungbinh/{gia_su_id}', [new DanhGiaController(), 'getAverageScore']);
Router::post('/danhgia/save', [new DanhGiaController(), 'save']);
Router::delete('/danhgia/delete/{id}', [new DanhGiaController(), 'delete']);
