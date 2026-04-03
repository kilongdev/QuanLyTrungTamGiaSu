<?php
require_once __DIR__ . '/../controllers/PhuHuynhController.php';

// Định nghĩa các route cho Phụ Huynh
Router::get('/phuhuynh', 'PhuHuynhController::index');
Router::get('/phuhuynh/{id}', 'PhuHuynhController::show');
Router::post('/phuhuynh', 'PhuHuynhController::store');
Router::put('/phuhuynh/{id}', 'PhuHuynhController::update');
Router::delete('/phuhuynh/{id}', 'PhuHuynhController::destroy');

Router::get('/phuhuynh/{id}/dashboard', 'PhuHuynhController::dashboard');
Router::get('/phuhuynh/{id}/children', 'PhuHuynhController::children');
Router::get('/phuhuynh/{id}/tutors', 'PhuHuynhController::tutors');
Router::get('/phuhuynh/{id}/payments', 'PhuHuynhController::payments');
Router::get('/phuhuynh/{id}/profile', 'PhuHuynhController::profile');
Router::put('/phuhuynh/{id}/profile', 'PhuHuynhController::updateProfile');