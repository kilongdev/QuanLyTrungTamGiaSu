<?php
/**
 * API Routes - Auth Only
 * Đăng nhập, Đăng ký cho Admin, Gia Sư, Phụ Huynh
 */

// ==================== AUTH ====================
Router::post('/auth/login', ['AuthController', 'login']);
Router::post('/auth/register', ['AuthController', 'register']);
Router::get('/auth/me', ['AuthController', 'me']);
Router::post('/auth/refresh', ['AuthController', 'refresh']);
Router::post('/auth/logout', ['AuthController', 'logout']);

// ==================== OTP ====================
Router::post('/otp/send', ['OTPController', 'sendEmail']);   // Gửi OTP qua Email
Router::post('/otp/verify', ['OTPController', 'verify']);    // Xác minh OTP

// ==================== THỐNG KÊ ====================
Router::get('/thong-ke/tong-quan', ['ThongKeController', 'overview']);
Router::get('/thong-ke/doanh-thu', ['ThongKeController', 'revenue']);
