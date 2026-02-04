<?php
/**
 * Router Class
 * Xử lý routing cho API
 */

class Router
{
    private static $routes = [
        'GET' => [],
        'POST' => [],
        'PUT' => [],
        'DELETE' => []
    ];

    /**
     * Đăng ký route GET
     */
    public static function get(string $path, callable|array $handler): void
    {
        self::$routes['GET'][$path] = $handler;
    }

    /**
     * Đăng ký route POST
     */
    public static function post(string $path, callable|array $handler): void
    {
        self::$routes['POST'][$path] = $handler;
    }

    /**
     * Đăng ký route PUT
     */
    public static function put(string $path, callable|array $handler): void
    {
        self::$routes['PUT'][$path] = $handler;
    }

    /**
     * Đăng ký route DELETE
     */
    public static function delete(string $path, callable|array $handler): void
    {
        self::$routes['DELETE'][$path] = $handler;
    }

    /**
     * Xử lý request
     */
    public static function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = self::getUri();

        // Handle preflight
        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        // Tìm route phù hợp
        $routes = self::$routes[$method] ?? [];
        
        foreach ($routes as $pattern => $handler) {
            $params = self::matchRoute($pattern, $uri);
            
            if ($params !== false) {
                self::callHandler($handler, $params);
                return;
            }
        }

        // Không tìm thấy route
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'API endpoint không tồn tại',
            'path' => $uri,
            'method' => $method
        ], JSON_UNESCAPED_UNICODE);
    }

    /**
     * Lấy URI từ request
     */
    private static function getUri(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        
        // Loại bỏ query string
        if (strpos($uri, '?') !== false) {
            $uri = strstr($uri, '?', true);
        }

        // Loại bỏ base path (hỗ trợ nhiều trường hợp)
        $basePaths = [
            '/QuanLyTrungTamGiaSu/backend/public/index.php',
            '/QuanLyTrungTamGiaSu/backend/public'
        ];
        
        foreach ($basePaths as $basePath) {
            if (strpos($uri, $basePath) === 0) {
                $uri = substr($uri, strlen($basePath));
                break;
            }
        }

        return $uri ?: '/';
    }

    /**
     * So khớp route pattern với URI
     * Hỗ trợ tham số động: /users/{id}
     */
    private static function matchRoute(string $pattern, string $uri): array|false
    {
        // Chuyển pattern thành regex
        $regex = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $pattern);
        $regex = '#^' . $regex . '$#';

        if (preg_match($regex, $uri, $matches)) {
            // Lọc chỉ lấy named captures
            return array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        }

        return false;
    }

    /**
     * Gọi handler
     */
    private static function callHandler(callable|array $handler, array $params): void
    {
        if (is_array($handler)) {
            [$class, $method] = $handler;
            call_user_func_array([$class, $method], $params);
        } else {
            call_user_func_array($handler, $params);
        }
    }
}
