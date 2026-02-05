<?php
/**
 * Router class - Xử lý định tuyến API
 */
class Router {
    private $routes = [];
    private $method;
    private $path;

    public function __construct() {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->path = $_SERVER['REQUEST_URI'] ?? '/';
        // Loại bỏ query string
        if (strpos($this->path, '?') !== false) {
            $this->path = substr($this->path, 0, strpos($this->path, '?'));
        }
        // Nếu không có path, mặc định là /
        if (empty($this->path)) {
            $this->path = '/';
        }
    }

    /**
     * Đăng ký route GET
     */
    public function get($pattern, $callback) {
        $this->routes['GET'][$pattern] = $callback;
    }

    /**
     * Đăng ký route POST
     */
    public function post($pattern, $callback) {
        $this->routes['POST'][$pattern] = $callback;
    }

    /**
     * Đăng ký route PUT
     */
    public function put($pattern, $callback) {
        $this->routes['PUT'][$pattern] = $callback;
    }

    /**
     * Đăng ký route DELETE
     */
    public function delete($pattern, $callback) {
        $this->routes['DELETE'][$pattern] = $callback;
    }

    /**
     * Thực thi routing
     */
    public function dispatch() {
        if (!isset($this->routes[$this->method])) {
            $this->notFound();
            return;
        }

        foreach ($this->routes[$this->method] as $pattern => $callback) {
            if ($this->matchRoute($pattern, $matches)) {
                call_user_func_array($callback, $matches);
                return;
            }
        }

        $this->notFound();
    }

    /**
     * Kiểm tra route pattern với path hiện tại
     */
    private function matchRoute($pattern, &$matches) {
        // Chuyển đổi pattern thành regex
        // /api/admin -> /api/admin
        // /api/admin/{id} -> /api/admin/(\d+)
        $pattern = preg_replace_callback('/{(\w+)}/', function($m) {
            return '(?P<' . $m[1] . '>\d+)';
        }, $pattern);

        $pattern = '#^' . $pattern . '$#';

        if (preg_match($pattern, $this->path, $match)) {
            $matches = array_filter($match, function($key) {
                return !is_numeric($key);
            }, ARRAY_FILTER_USE_KEY);
            return true;
        }

        return false;
    }

    /**
     * Getter cho path
     */
    public function getPath() {
        return $this->path;
    }

    /**
     * Getter cho method
     */
    public function getMethod() {
        return $this->method;
    }

    /**
     * 404 Not Found
     */
    private function notFound() {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint không tồn tại'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>
