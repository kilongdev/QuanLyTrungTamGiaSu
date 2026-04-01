<?php
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/api', PHP_URL_PATH);
$route = preg_replace('#^/api#', '', $path);
$_GET['route'] = $_GET['route'] ?? ($route ?: '/');

require '/var/www/html/QuanLyTrungTamGiaSu/backend/public/api.php';
