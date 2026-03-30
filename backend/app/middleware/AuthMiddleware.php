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

        if ($payload === false) {
            self::unauthorized('Token không hợp lệ hoặc đã hết hạn');
            return false;
        }

        // Ép kiểu về array để tránh lỗi "Cannot use object of type stdClass as array"
        return (array) $payload;
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
        // Bổ sung CORS header cho phản hồi lỗi
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => $message
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    private static function forbidden(string $message): void
    {
        // Bổ sung CORS header cho phản hồi lỗi
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");

        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => $message
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}
