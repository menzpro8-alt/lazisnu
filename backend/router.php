<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$apiDir = __DIR__ . '/api';

// Serve static files from api/ if they exist
if ($uri !== '/' && file_exists($apiDir . $uri)) {
    return false;
}

// Strip /api/ prefix so frontend can use http://localhost:8000/api/...
$route = preg_replace('#^/api/#', '', $uri);
$route = ltrim($route, '/');

$_GET['route'] = $route;
$_SERVER['REQUEST_URI'] = '/?route=' . $route;
require $apiDir . '/index.php';
