<?php
/**
 * Test POST API - Tạo admin mới
 */

header('Content-Type: application/json; charset=utf-8');

$ch = curl_init();

$url = 'http://localhost/QuanLyTrungTamGiaSu/backend/public/api.php?route=/api/admin';

$data = [
    'email' => 'Minhthang123@test.com',
    'mat_khau' => '123456',
    'ho_ten' => 'Admin Test',
    'so_dien_thoai' => '0123456789'
];

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo json_encode([
        'success' => false,
        'error' => $error
    ]);
} else {
    echo $response;
}
?>
