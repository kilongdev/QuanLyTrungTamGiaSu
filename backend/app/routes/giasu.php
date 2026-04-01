<?php
/**
 * Gia Sư (Tutor) Routes
 * Quản lý gia sư
 */

require_once __DIR__ . '/../controllers/GiaSuController.php';

Router::get('/giasu', ['GiaSuController', 'index']);
Router::get('/giasu/{id}', ['GiaSuController', 'show']);
Router::get('/giasu/media/{type}/{filename}', ['GiaSuController', 'media']);
Router::post('/giasu/create', ['GiaSuController', 'store']);
Router::put('/giasu/update/{id}', ['GiaSuController', 'update']);
Router::put('/giasu/approve/{id}', ['GiaSuController', 'approve']);
Router::delete('/giasu/delete/{id}', ['GiaSuController', 'destroy']);
