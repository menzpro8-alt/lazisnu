<?php
/**
 * Database Configuration
 * LAZISNU Financial Application
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'lazisnu_db');
define('DB_USER', 'lazisnu');
define('DB_PASS', 'lazisnu');
define('DB_CHARSET', 'utf8mb4');

/**
 * Get PDO database connection
 */
function getDB() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed']);
            exit;
        }
    }
    
    return $pdo;
}
