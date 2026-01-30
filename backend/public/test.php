<?php
// File test đơn giản

header('Content-Type: application/json; charset=utf-8');

$response = [
    'status' => 'success',
    'message' => 'Backend PHP đang hoạt động!',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'server_info' => [
        'software' => $_SERVER['SERVER_SOFTWARE'] ?? 'N/A',
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A'
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
