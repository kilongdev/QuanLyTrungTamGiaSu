<?php
/**
 * Admin Routes
 * Quản lý tài khoản Admin
 */

require_once __DIR__ . '/../controllers/AdminController.php';

// Admin management
Router::get('/admin', ['AdminController', 'getAll']);
Router::get('/admin/{id}', ['AdminController', 'getById']);
Router::post('/admin/create', ['AdminController', 'create']);
Router::put('/admin/update/{id}', ['AdminController', 'update']);
Router::delete('/admin/delete/{id}', ['AdminController', 'delete']);
Router::post('/admin/login', ['AdminController', 'login']);

