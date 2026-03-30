<?php
require_once __DIR__ . '/../controllers/PhuHuynhController.php';

/**
 * Định nghĩa các route cho Phụ Huynh
 */
Router::get('/phuhuynh/dashboard', ['PhuHuynhController', 'getDashboardData']);
Router::get('/phuhuynh/profile', ['PhuHuynhController', 'getProfile']);
Router::get('/phuhuynh/my-hoc-phi', ['PhuHuynhController', 'getHocPhiCuaToi']);
Router::get('/phuhuynh/history-hoc-phi', ['PhuHuynhController', 'getLichSuHocPhi']);
Router::get('/phuhuynh/notifications', ['PhuHuynhController', 'getNotifications']);
Router::get('/phuhuynh/child/{id}', ['PhuHuynhController', 'getChildDetails']);
Router::get('/phuhuynh/my-students', ['PhuHuynhController', 'getMyStudents']);
Router::get('/phuhuynh/my-tutors', ['PhuHuynhController', 'getMyTutors']);

// Các route quản lý (thường dành cho Admin)
Router::get('/phuhuynh', ['PhuHuynhController', 'index']);
Router::get('/phuhuynh/{id}', ['PhuHuynhController', 'show']);
Router::post('/phuhuynh', ['PhuHuynhController', 'store']);
Router::put('/phuhuynh/{id}', ['PhuHuynhController', 'update']);
Router::delete('/phuhuynh/{id}', ['PhuHuynhController', 'destroy']);