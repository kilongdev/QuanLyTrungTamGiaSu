<?php
/**
 * Phụ Huynh (Parent) Routes
 * Quản lý phụ huynh
 */

require_once __DIR__ . '/../controllers/PhuHuynhController.php';

Router::get('/phuhuynh', ['PhuHuynhController', 'index']);
Router::get('/phuhuynh/{id}', ['PhuHuynhController', 'show']);
Router::post('/phuhuynh/create', ['PhuHuynhController', 'store']);
Router::put('/phuhuynh/update/{id}', ['PhuHuynhController', 'update']);
Router::delete('/phuhuynh/delete/{id}', ['PhuHuynhController', 'destroy']);
