<?php
/**
 * Lương Gia Sư Routes
 * Quản lý lương gia sư
 */

require_once __DIR__ . '/../controllers/LuongGiaSuController.php';

Router::get('/luong', ['LuongGiaSuController', 'getAll']);
Router::get('/luong/giasu/{id}', ['LuongGiaSuController', 'getByGiaSu']);
Router::post('/luong/create', ['LuongGiaSuController', 'create']);
