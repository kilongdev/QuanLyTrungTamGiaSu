<?php
require_once __DIR__ . '/../controllers/PhuHuynhController.php';

// Định nghĩa các route cho Phụ Huynh
Router::get('/phuhuynh', 'PhuHuynhController::index');
Router::get('/phuhuynh/{id}', 'PhuHuynhController::show');
Router::post('/phuhuynh', 'PhuHuynhController::store');
Router::put('/phuhuynh/{id}', 'PhuHuynhController::update');
Router::delete('/phuhuynh/{id}', 'PhuHuynhController::destroy');