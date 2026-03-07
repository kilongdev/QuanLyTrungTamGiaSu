<?php
/**
 * Học Sinh (Student) Routes
 * Quản lý học sinh
 */

require_once __DIR__ . '/../controllers/HocSinhController.php';

Router::get('/hocsinh', ['HocSinhController', 'index']);
Router::get('/hocsinh/{id}', ['HocSinhController', 'show']);
Router::get('/hocsinh/phuhuynh/{id}', ['HocSinhController', 'getByPhuHuynh']);
Router::post('/hocsinh/create', ['HocSinhController', 'store']);
Router::put('/hocsinh/update/{id}', ['HocSinhController', 'update']);
Router::delete('/hocsinh/delete/{id}', ['HocSinhController', 'destroy']);
