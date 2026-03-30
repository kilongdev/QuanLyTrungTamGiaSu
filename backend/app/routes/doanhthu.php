<?php
/**
 * Doanh Thu Routes
 * Quản lý doanh thu
 */

require_once __DIR__ . '/../controllers/DoanhThuController.php';

Router::get('/doanhthu/overview', ['DoanhThuController', 'getOverview']);
Router::post('/doanhthu/process', ['DoanhThuController', 'processMonthly']);
Router::get('/doanhthu', ['DoanhThuController', 'getReport']);
Router::get('/doanhthu/{id}', ['DoanhThuController', 'getDetails']);
Router::post('/doanhthu/create', ['DoanhThuController', 'createReport']);
