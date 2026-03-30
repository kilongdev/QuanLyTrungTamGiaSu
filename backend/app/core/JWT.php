<?php
class JWT
{
    private static $secretKey = null;
    private static $expireTime = 3600;
    private static $initialized = false;
    private static $leeway = 60; // Thêm 60s để tránh lỗi lệch giờ hệ thống

    private static function init(): void
    {
        if (self::$initialized) return;
        
        $envPath = __DIR__ . '/../../.env';
        
        // Nếu không tìm thấy .env ở thư mục gốc, thử tìm ở thư mục hiện tại (phòng hờ cấu hình XAMPP)
        if (!file_exists($envPath)) {
            $envPath = __DIR__ . '/../.env';
        }

        if (!file_exists($envPath)) {
            $key = bin2hex(random_bytes(32));
            file_put_contents($envPath, "JWT_SECRET_KEY=$key\nJWT_EXPIRE_TIME=86400\n");
        }
        
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                [$key, $value] = explode('=', $line, 2);
                $_ENV[trim($key)] = trim($value);
            }
        }
        
        // Cố định Secret Key: Nếu không có trong .env, hãy dùng một chuỗi cố định thay vì random mỗi request
        self::$secretKey = $_ENV['JWT_SECRET_KEY'] ?? 'your_default_fixed_secret_key_for_dev';
        self::$expireTime = (int)($_ENV['JWT_EXPIRE_TIME'] ?? 86400);
        self::$initialized = true;
    }

    public static function encode(array $payload): string
    {
        self::init();
        
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];

        $payload['iat'] = time();
        $payload['exp'] = time() + self::$expireTime;

        $base64Header = self::base64UrlEncode(json_encode($header));
        $base64Payload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac(
            'sha256',
            $base64Header . '.' . $base64Payload,
            self::$secretKey,
            true
        );
        $base64Signature = self::base64UrlEncode($signature);

        return $base64Header . '.' . $base64Payload . '.' . $base64Signature;
    }

    public static function decode(string $token)
    {
        self::init();
        
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }

        [$base64Header, $base64Payload, $base64Signature] = $parts;

        $signature = hash_hmac(
            'sha256',
            $base64Header . '.' . $base64Payload,
            self::$secretKey,
            true
        );
        $validSignature = self::base64UrlEncode($signature);

        if ($base64Signature !== $validSignature) {
            error_log("JWT Error: Signature mismatch");
            return false;
        }

        $payload = json_decode(self::base64UrlDecode($base64Payload), true);

        // Kiểm tra thời gian hết hạn với leeway
        if (isset($payload['exp']) && ($payload['exp'] + self::$leeway) < time()) {
            error_log("JWT Error: Token expired. Exp: " . $payload['exp'] . " Current: " . time());
            return false;
        }

        return $payload;
    }

    public static function getTokenFromHeader(): ?string
    {
        $authHeader = '';

        // Try getallheaders() first (available in most server configs)
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';
        }

        // Fallback to $_SERVER if getallheaders() not available or Authorization not found
        if (!$authHeader) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        }

        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public static function setSecretKey(string $key): void
    {
        self::$secretKey = $key;
    }

    public static function setExpireTime(int $seconds): void
    {
        self::$expireTime = $seconds;
    }
}
