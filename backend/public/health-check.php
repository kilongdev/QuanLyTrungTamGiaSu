<?php
/**
 * Health Check Endpoint
 * Use this to monitor production server status
 * Access: https://yourdomain.com/health-check.php
 */

header('Content-Type: application/json; charset=utf-8');

$health = [
    'status' => 'healthy',
    'timestamp' => date('Y-m-d H:i:s'),
    'checks' => []
];

// 1. Check PHP version
$health['checks']['php'] = [
    'version' => PHP_VERSION,
    'status' => version_compare(PHP_VERSION, '7.4.0', '>=') ? 'ok' : 'error'
];

// 2. Check .env file exists
$envPath = __DIR__ . '/../.env';
$health['checks']['env_file'] = [
    'exists' => file_exists($envPath),
    'status' => file_exists($envPath) ? 'ok' : 'error'
];

// 3. Check PHPMailer installed
$phpmailerPath = __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
$health['checks']['phpmailer'] = [
    'installed' => file_exists($phpmailerPath),
    'status' => file_exists($phpmailerPath) ? 'ok' : 'error'
];

// 4. Check environment variables
require_once __DIR__ . '/../app/core/Env.php';
$health['checks']['smtp_config'] = [
    'host' => Env::get('SMTP_HOST') ? '✓' : '✗',
    'username' => Env::get('SMTP_USERNAME') ? '✓' : '✗',
    'password' => Env::get('SMTP_PASSWORD') ? '✓' : '✗',
    'status' => (Env::get('SMTP_HOST') && Env::get('SMTP_USERNAME') && Env::get('SMTP_PASSWORD')) ? 'ok' : 'warning'
];

// 5. Check database connection (if applicable)
try {
    require_once __DIR__ . '/../app/core/Database.php';
    $db = Database::getInstance();
    $health['checks']['database'] = [
        'connected' => true,
        'status' => 'ok'
    ];
} catch (Exception $e) {
    $health['checks']['database'] = [
        'connected' => false,
        'error' => $e->getMessage(),
        'status' => 'error'
    ];
}

// 6. Check file permissions
$writableDirs = [
    __DIR__ . '/../logs' => 'logs',
];

foreach ($writableDirs as $dir => $name) {
    if (!file_exists($dir)) {
        @mkdir($dir, 0777, true);
    }
    $health['checks']["writable_{$name}"] = [
        'path' => basename($dir),
        'writable' => is_writable($dir),
        'status' => is_writable($dir) ? 'ok' : 'warning'
    ];
}

// 7. Check environment mode
$health['checks']['environment'] = [
    'mode' => Env::get('APP_ENV', 'development'),
    'is_production' => Env::isProduction(),
    'status' => 'info'
];

// Determine overall health
$hasErrors = false;
$hasWarnings = false;

foreach ($health['checks'] as $check) {
    if (isset($check['status'])) {
        if ($check['status'] === 'error') {
            $hasErrors = true;
        } elseif ($check['status'] === 'warning') {
            $hasWarnings = true;
        }
    }
}

if ($hasErrors) {
    $health['status'] = 'unhealthy';
    http_response_code(503);
} elseif ($hasWarnings) {
    $health['status'] = 'degraded';
} else {
    $health['status'] = 'healthy';
}

// Hide sensitive info in production
if (Env::isProduction()) {
    unset($health['checks']['smtp_config']['username']);
    unset($health['checks']['smtp_config']['password']);
}

echo json_encode($health, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
