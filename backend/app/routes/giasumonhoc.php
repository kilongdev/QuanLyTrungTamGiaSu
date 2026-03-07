<?php
/**
 * Gia Sư - Môn Học Routes
 * Quan hệ giữa gia sư và môn học
 */

require_once __DIR__ . '/../controllers/GiaSuMonHocController.php';

Router::get('/giasumonhoc', ['GiaSuMonHocController', 'getAll']);
Router::get('/giasumonhoc/{id}', ['GiaSuMonHocController', 'getById']);
Router::post('/giasumonhoc/create', ['GiaSuMonHocController', 'create']);
Router::put('/giasumonhoc/update/{id}', ['GiaSuMonHocController', 'update']);
Router::delete('/giasumonhoc/delete/{id}', ['GiaSuMonHocController', 'delete']);
