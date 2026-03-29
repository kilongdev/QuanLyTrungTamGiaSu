<?php
/**
 * Điểm Danh Routes
 * Quản lý điểm danh
 */

require_once __DIR__ . '/../controllers/DiemDanhController.php';

Router::get('/diemdanh/lich/{lich_hoc_id}', [new DiemDanhController(), 'getByLich']);
Router::get('/diemdanh/lophoc/{lopHocId}', [new DiemDanhController(), 'getByClass']);
Router::post('/diemdanh/save', [new DiemDanhController(), 'saveDanhSach']);
Router::post('/diemdanh/lophoc/{id}/save-today', [new DiemDanhController(), 'saveAttendanceForToday']);
