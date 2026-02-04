<?php
/**
 * Auth Middleware
 * Kiểm tra JWT Token cho các route cần xác thực
 */

require_once __DIR__ . '/../core/JWT.php';

class AuthMiddleware
{
    /**
     * Xác thực request
     * 
     * @return array|false User data nếu hợp lệ, false nếu không
     */
    public static function authenticate()
    {
        // Lấy token từ header
        $token = JWT::getTokenFromHeader();

        if (!$token) {
            self::unauthorized('Token không được cung cấp');
            return false;
        }

        // Giải mã token
        $payload = JWT::decode($token);

        if (!$payload) {
            self::unauthorized('Token không hợp lệ hoặc đã hết hạn');
            return false;
        }

        return $payload;
    }

    /**
     * Kiểm tra role của user
     * 
     * @param array $allowedRoles Danh sách role được phép
     * @return array|false User data nếu có quyền
     */
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

    /**
     * Response 401 Unauthorized
     */
    private static function unauthorized(string $message): void
    {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => $message
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    /**
     * Response 403 Forbidden
     */
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
