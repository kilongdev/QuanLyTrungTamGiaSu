<?php
class Router
{
    private static $routes = [
        'GET' => [],
        'POST' => [],
        'PUT' => [],
        'DELETE' => []
    ];

    public static function get(string $path, callable|array $handler): void
    {
        self::$routes['GET'][$path] = $handler;
    }

    public static function post(string $path, callable|array $handler): void
    {
        self::$routes['POST'][$path] = $handler;
    }

    public static function put(string $path, callable|array $handler): void
    {
        self::$routes['PUT'][$path] = $handler;
    }

    public static function delete(string $path, callable|array $handler): void
    {
        self::$routes['DELETE'][$path] = $handler;
    }

    public static function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = self::getUri();

        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        $routes = self::$routes[$method] ?? [];
        
        foreach ($routes as $pattern => $handler) {
            $params = self::matchRoute($pattern, $uri);
            
            if ($params !== false) {
                self::callHandler($handler, $params);
                return;
            }
        }

        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'API endpoint không tồn tại',
            'path' => $uri,
            'method' => $method
        ], JSON_UNESCAPED_UNICODE);
    }

    private static function getUri(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        
        if (strpos($uri, '?') !== false) {
            $uri = strstr($uri, '?', true);
        }

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

    private static function matchRoute(string $pattern, string $uri): array|false
    {
        $regex = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $pattern);
        $regex = '#^' . $regex . '$#';

        if (preg_match($regex, $uri, $matches)) {
            return array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        }

        return false;
    }

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
