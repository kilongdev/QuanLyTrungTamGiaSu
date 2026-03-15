<?php
/**
 * Yêu Cầu Routes
 * Quản lý yêu cầu
 */

require_once __DIR__ . '/../controllers/YeuCauController.php';

Router::get('/yeucau', [new YeuCauController(), 'getAll']);
Router::get('/yeucau/nguoitao/{nguoi_tao_id}/{loai_nguoi_tao}', [new YeuCauController(), 'getByNguoiTao']);
Router::post('/yeucau/create', [new YeuCauController(), 'create']);
Router::put('/yeucau/status/{id}', [new YeuCauController(), 'updateStatus']);
Router::put('/yeucau/update/{id}', [new YeuCauController(), 'update']);
Router::delete('/yeucau/delete/{id}', [new YeuCauController(), 'delete']);
