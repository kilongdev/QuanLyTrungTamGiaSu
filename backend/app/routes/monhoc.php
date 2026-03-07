<?php
/**
 * Môn Học Routes
 * Quản lý môn học
 */

require_once __DIR__ . '/../controllers/MonHocController.php';

Router::get('/monhoc', ['MonHocController', 'getAll']);
Router::get('/monhoc/{id}', ['MonHocController', 'getById']);
Router::post('/monhoc/create', ['MonHocController', 'create']);
Router::put('/monhoc/update/{id}', ['MonHocController', 'update']);
Router::delete('/monhoc/delete/{id}', ['MonHocController', 'delete']);
