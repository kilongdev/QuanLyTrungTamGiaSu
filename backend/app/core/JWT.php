<?php
/**
 * JWT (JSON Web Token) Helper Class
 * Dùng để tạo và xác thực token
 */

class JWT
{
    // Secret key - NÊN đặt trong file .env
    private static $secretKey = 'your-secret-key-here-change-in-production';
    
    // Thời gian hết hạn token (1 giờ = 3600 giây)
    private static $expireTime = 3600;

    /**
     * Tạo JWT Token
     * 
     * @param array $payload Dữ liệu cần mã hóa (user_id, email, role...)
     * @return string JWT Token
     */
    public static function encode(array $payload): string
    {
        // Header
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];

        // Thêm thời gian vào payload
        $payload['iat'] = time(); // Issued at
        $payload['exp'] = time() + self::$expireTime; // Expiration time

        // Encode Header và Payload
        $base64Header = self::base64UrlEncode(json_encode($header));
        $base64Payload = self::base64UrlEncode(json_encode($payload));

        // Tạo Signature
        $signature = hash_hmac(
            'sha256',
            $base64Header . '.' . $base64Payload,
            self::$secretKey,
            true
        );
        $base64Signature = self::base64UrlEncode($signature);

        // Ghép lại thành JWT
        return $base64Header . '.' . $base64Payload . '.' . $base64Signature;
    }

    /**
     * Giải mã và xác thực JWT Token
     * 
     * @param string $token JWT Token
     * @return array|false Payload nếu hợp lệ, false nếu không
     */
    public static function decode(string $token)
    {
        // Tách token thành 3 phần
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }

        [$base64Header, $base64Payload, $base64Signature] = $parts;

        // Xác thực Signature
        $signature = hash_hmac(
            'sha256',
            $base64Header . '.' . $base64Payload,
            self::$secretKey,
            true
        );
        $validSignature = self::base64UrlEncode($signature);

        if ($base64Signature !== $validSignature) {
            return false; // Signature không hợp lệ
        }

        // Decode Payload
        $payload = json_decode(self::base64UrlDecode($base64Payload), true);

        // Kiểm tra hết hạn
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false; // Token đã hết hạn
        }

        return $payload;
    }

    /**
     * Lấy token từ Header Authorization
     * 
     * @return string|null Token hoặc null
     */
    public static function getTokenFromHeader(): ?string
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Base64 URL Encode
     */
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL Decode
     */
    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Đặt secret key (dùng khi load từ config)
     */
    public static function setSecretKey(string $key): void
    {
        self::$secretKey = $key;
    }

    /**
     * Đặt thời gian hết hạn
     */
    public static function setExpireTime(int $seconds): void
    {
        self::$expireTime = $seconds;
    }
}
