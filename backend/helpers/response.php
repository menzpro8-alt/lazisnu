<?php
/**
 * Response Helper
 * Standardized JSON response format
 */

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function successResponse($data = null, $message = 'Success', $statusCode = 200) {
    $response = [
        'success' => true,
        'message' => $message,
    ];
    if ($data !== null) {
        $response['data'] = $data;
    }
    jsonResponse($response, $statusCode);
}

function errorResponse($message = 'Error', $statusCode = 400, $errors = null) {
    $response = [
        'success' => false,
        'message' => $message,
    ];
    if ($errors !== null) {
        $response['errors'] = $errors;
    }
    jsonResponse($response, $statusCode);
}

function paginatedResponse($data, $total, $page, $perPage) {
    jsonResponse([
        'success' => true,
        'data' => $data,
        'pagination' => [
            'total' => (int)$total,
            'page' => (int)$page,
            'per_page' => (int)$perPage,
            'total_pages' => ceil($total / $perPage),
        ]
    ]);
}

/**
 * Get JSON input from request body
 */
function getJsonInput() {
    $input = json_decode(file_get_contents('php://input'), true);
    return $input ?: [];
}

/**
 * Validate required fields
 */
function validateRequired($data, $fields) {
    $errors = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $errors[] = "Field '$field' is required";
        }
    }
    return $errors;
}
