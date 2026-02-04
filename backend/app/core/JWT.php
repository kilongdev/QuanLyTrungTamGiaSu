<?php
class JWT
{
    private static $secretKey = null;
    private static $expireTime = 3600;
    private static $initialized = false;

    private static function init(): void
    {
        if (self::$initialized) return;
        
        $envPath = __DIR__ . '/../../.env';
        
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
        
        self::$secretKey = $_ENV['JWT_SECRET_KEY'] ?? bin2hex(random_bytes(32));
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
            return false;
        }

        $payload = json_decode(self::base64UrlDecode($base64Payload), true);

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }

    public static function getTokenFromHeader(): ?string
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

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
