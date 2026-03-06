<?php
Router::post('/auth/login', ['AuthController', 'login']);
Router::post('/auth/register', ['AuthController', 'register']);
Router::get('/auth/me', ['AuthController', 'me']);
Router::post('/auth/refresh', ['AuthController', 'refresh']);
Router::post('/auth/logout', ['AuthController', 'logout']);

Router::post('/otp/send', ['OTPController', 'sendEmail']);
Router::post('/otp/verify', ['OTPController', 'verify']);


require_once __DIR__ . '/../app/controllers/LopHocController.php';
Router::get('/lophoc', [new LopHocController(), 'index']);
Router::post('/lophoc/create', [new LopHocController(), 'create']);
Router::delete('/lophoc/delete/{id}', [new LopHocController(), 'delete']);
Router::put('/lophoc/update/{id}', [new LopHocController(), 'update']);
Router::get('/lophoc/{id}', [new LopHocController(), 'show']);

require_once __DIR__ . '/../app/controllers/DangKyLopController.php';
Router::post('/dangkylop/create', [new DangKyLopController(), 'create']);
Router::put('/dangkylop/status/{id}', [new DangKyLopController(), 'updateStatus']);
Router::get('/dangkylop/lop/{lop_hoc_id}', [new DangKyLopController(), 'getByLop']);


require_once __DIR__ . '/../app/controllers/LichHocController.php';
Router::post('/lichhoc/create', [new LichHocController(), 'create']);
Router::get('/lichhoc/lop/{lop_hoc_id}', [new LichHocController(), 'getByLop']);
Router::delete('/lichhoc/delete/{id}', [new LichHocController(), 'delete']);

require_once __DIR__ . '/../app/controllers/DiemDanhController.php';
Router::post('/diemdanh/save', [new DiemDanhController(), 'saveDanhSach']);
Router::get('/diemdanh/lich/{lich_hoc_id}', [new DiemDanhController(), 'getByLich']);


require_once __DIR__ . '/../app/controllers/YeuCauController.php';
Router::post('/yeucau/create', [new YeuCauController(), 'create']);
Router::get('/yeucau', [new YeuCauController(), 'getAll']);
Router::get('/yeucau/nguoitao/{nguoi_tao_id}/{loai_nguoi_tao}', [new YeuCauController(), 'getByNguoiTao']);
Router::put('/yeucau/status/{id}', [new YeuCauController(), 'updateStatus']);
Router::delete('/yeucau/delete/{id}', [new YeuCauController(), 'delete']);

require_once __DIR__ . '/../app/controllers/DanhGiaController.php';
Router::post('/danhgia/save', [new DanhGiaController(), 'save']);
Router::get('/danhgia/giasu/{gia_su_id}', [new DanhGiaController(), 'getByGiaSu']);
Router::get('/danhgia/trungbinh/{gia_su_id}', [new DanhGiaController(), 'getAverageScore']);
Router::delete('/danhgia/delete/{id}', [new DanhGiaController(), 'delete']);
