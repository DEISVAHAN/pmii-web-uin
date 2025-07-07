<?php
namespace App\Core;

class Router
{
    public static $routes = [
        'GET' => [],
        'POST' => [],
        'PUT' => [],
        'DELETE' => []
    ];

    public static $middlewareGroups = [];

    // Fungsi definisi route
    public static function get($route, $action) {
        self::$routes['GET'][$route] = $action;
    }

    public static function post($route, $action) {
        self::$routes['POST'][$route] = $action;
    }

    public static function put($route, $action) {
        self::$routes['PUT'][$route] = $action;
    }

    public static function delete($route, $action) {
        self::$routes['DELETE'][$route] = $action;
    }

    public static function group(array $options, callable $callback) {
        $previous = self::$middlewareGroups;
        self::$middlewareGroups = $options['middleware'] ?? [];
        $callback();
        self::$middlewareGroups = $previous;
    }

    // Fungsi untuk mengeksekusi permintaan
    public function dispatch($requestUri = null, $requestMethod = null) {
        $method = $requestMethod ?? $_SERVER['REQUEST_METHOD'];
        $uri = $requestUri ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Coba cocokkan route statis
        if (isset(self::$routes[$method][$uri])) {
            return $this->invoke(self::$routes[$method][$uri]);
        }

        // Coba cocokkan route dinamis (misal: /api/news/{id})
        foreach (self::$routes[$method] as $route => $action) {
            $pattern = preg_replace('/\{[a-zA-Z0-9_]+\}/', '([a-zA-Z0-9_-]+)', $route);
            $pattern = str_replace('/', '\/', $pattern);
            $pattern = '/^' . $pattern . '$/';

            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches);
                return $this->invoke($action, $matches);
            }
        }

        // Tidak ditemukan
        http_response_code(404);
        echo json_encode(['error' => '404 Not Found: ' . $uri]);
    }

    private function invoke($action, $params = []) {
        // Tangani action dalam bentuk 'Controller@method'
        if (is_string($action)) {
            [$controllerName, $methodName] = explode('@', $action);

            $fullController = "\\App\\Controllers\\$controllerName";
            if (!class_exists($fullController)) {
                http_response_code(500);
                echo json_encode(['error' => "Controller $fullController tidak ditemukan."]);
                return;
            }

            $controller = new $fullController();

            // Middleware (sederhana - implementasi lanjut bisa disambungkan ke RoleMiddleware)
            foreach (self::$middlewareGroups as $middleware) {
                $this->runMiddleware($middleware);
            }

            if (!method_exists($controller, $methodName)) {
                http_response_code(500);
                echo json_encode(['error' => "Method $methodName tidak ditemukan di $controllerName"]);
                return;
            }

            return call_user_func_array([$controller, $methodName], $params);
        }

        // Jika Closure (jika diperlukan untuk rute sederhana)
        if (is_callable($action)) {
            return call_user_func_array($action, $params);
        }

        http_response_code(500);
        echo json_encode(['error' => 'Rute tidak valid']);
    }

    private function runMiddleware($middlewareName) {
        $fullMiddleware = "\\App\\Middleware\\" . ucfirst($middlewareName) . "Middleware";

        if (!class_exists($fullMiddleware)) {
            http_response_code(500);
            echo json_encode(['error' => "Middleware $fullMiddleware tidak ditemukan"]);
            exit;
        }

        $middleware = new $fullMiddleware();
        if (!method_exists($middleware, 'handle')) {
            http_response_code(500);
            echo json_encode(['error' => "Middleware $middlewareName tidak memiliki metode handle()"]);
            exit;
        }

        $middleware->handle();
    }
}
