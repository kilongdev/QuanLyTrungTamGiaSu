<?php
/**
 * Lớp Học Routes
 * Quản lý lớp học
 */

require_once __DIR__ . '/../controllers/LopHocController.php';

// Specific routes first (to avoid conflicts with parameterized routes)
Router::post('/lophoc/create', [new LopHocController(), 'create']);
Router::put('/lophoc/update/{id}', [new LopHocController(), 'update']);
Router::delete('/lophoc/delete/{id}', [new LopHocController(), 'delete']);

// Routes with parameters - more specific first
Router::get('/lophoc/{id}/students', [new LopHocController(), 'getStudentsByClass']);
Router::post('/lophoc/{id}/add-student', [new LopHocController(), 'addStudent']);
Router::delete('/lophoc/{id}/remove-student/{studentId}', [new LopHocController(), 'removeStudent']);

// Generic routes last
Router::get('/lophoc', [new LopHocController(), 'index']);
Router::get('/lophoc/{id}', [new LopHocController(), 'show']);
