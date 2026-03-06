<?php
require_once __DIR__ . '/../core/JWT.php';

class AuthMiddleware
{
    public static function authenticate()
    {
        $token = JWT::getTokenFromHeader();

        if (!$token) {
            self::unauthorized('Token không được cung cấp');
            return false;
        }

        $payload = JWT::decode($token);

        if (!$payload) {
            self::unauthorized('Token không hợp lệ hoặc đã hết hạn');
            return false;
        }

        return $payload;
    }

    public static function authorize(array $allowedRoles)
    {
        $user = self::authenticate();

        if (!$user) {
            return false;
        }

        $userRole = $user['role'] ?? '';

        if (!in_array($userRole, $allowedRoles)) {
            self::forbidden('Bạn không có quyền truy cập');
            return false;
        }

        return $user;
    }

    private static function unauthorized(string $message): void
    {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => $message
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    private static function forbidden(string $message): void
    {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => $message
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}
