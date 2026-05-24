<?php
/**
 * Simple JWT Helper (HMAC-SHA256)
 * For production, consider using firebase/php-jwt
 */

define('JWT_SECRET', 'lazisnu_secret_key_change_in_production_2024');
define('JWT_EXPIRY', 86400); // 24 hours

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Create JWT token
 */
function createToken($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $payloadJson = json_encode($payload);
    
    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode($payloadJson);
    
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);
    
    return "$base64Header.$base64Payload.$base64Signature";
}

/**
 * Verify and decode JWT token
 */
function verifyToken($token) {
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        return false;
    }
    
    [$base64Header, $base64Payload, $base64Signature] = $parts;
    
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $expectedSignature = base64UrlEncode($signature);
    
    if (!hash_equals($expectedSignature, $base64Signature)) {
        return false;
    }
    
    $payload = json_decode(base64UrlDecode($base64Payload), true);
    
    if (!$payload || !isset($payload['exp'])) {
        return false;
    }
    
    if ($payload['exp'] < time()) {
        return false;
    }
    
    return $payload;
}

/**
 * Get token from Authorization header
 */
function getBearerToken() {
    $headers = '';
    
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers = $requestHeaders['Authorization'];
        }
    }
    
    if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        return $matches[1];
    }
    
    return null;
}
