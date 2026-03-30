<?php
/**
 * Lớp Học Routes
 * Quản lý lớp học
 */

require_once __DIR__ . '/../controllers/LopHocController.php';

Router::get('/lophoc/available', [new LopHocController(), 'getAvailable']);
Router::get('/lophoc', [new LopHocController(), 'index']);
Router::get('/lophoc/{id}', [new LopHocController(), 'show']);
Router::post('/lophoc/create', [new LopHocController(), 'create']);
Router::put('/lophoc/update/{id}', [new LopHocController(), 'update']);
Router::delete('/lophoc/delete/{id}', [new LopHocController(), 'delete']);
