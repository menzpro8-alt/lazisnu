<?php
/**
 * Auth API Handler
 */

require_once __DIR__ . '/../middleware/auth.php';

function handleAuth($method, $action) {
    switch ($action) {
        case 'login':
            if ($method !== 'POST') errorResponse('Method not allowed', 405);
            login();
            break;
        case 'me':
            if ($method !== 'GET') errorResponse('Method not allowed', 405);
            getMe();
            break;
        case 'change-password':
            if ($method !== 'POST') errorResponse('Method not allowed', 405);
            changePassword();
            break;
        default:
            errorResponse('Endpoint tidak ditemukan', 404);
    }
}

function login() {
    $input = getJsonInput();
    $errors = validateRequired($input, ['username', 'password']);
    
    if (!empty($errors)) {
        errorResponse('Validasi gagal', 422, $errors);
    }
    
    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.*, o.name as org_name, o.level as org_level 
        FROM users u 
        JOIN organizations o ON u.org_id = o.id 
        WHERE u.username = ? AND u.is_active = 1
    ");
    $stmt->execute([$input['username']]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($input['password'], $user['password'])) {
        errorResponse('Username atau password salah', 401);
    }
    
    // Update last login
    $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);
    
    $token = createToken([
        'user_id' => $user['id'],
        'org_id' => $user['org_id'],
        'role' => $user['role'],
    ]);
    
    successResponse([
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'role' => $user['role'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'org_id' => $user['org_id'],
            'org_name' => $user['org_name'],
            'org_level' => $user['org_level'],
        ]
    ], 'Login berhasil');
}

function getMe() {
    $user = authenticate();
    successResponse([
        'id' => $user['id'],
        'username' => $user['username'],
        'name' => $user['name'],
        'role' => $user['role'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'org_id' => $user['org_id'],
        'org_name' => $user['org_name'],
        'org_level' => $user['org_level'],
    ]);
}

function changePassword() {
    $user = authenticate();
    $input = getJsonInput();
    $errors = validateRequired($input, ['current_password', 'new_password']);
    
    if (!empty($errors)) {
        errorResponse('Validasi gagal', 422, $errors);
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $userData = $stmt->fetch();
    
    if (!password_verify($input['current_password'], $userData['password'])) {
        errorResponse('Password lama tidak sesuai', 400);
    }
    
    if (strlen($input['new_password']) < 6) {
        errorResponse('Password baru minimal 6 karakter', 400);
    }
    
    $hashedPassword = password_hash($input['new_password'], PASSWORD_DEFAULT);
    $stmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, $user['id']]);
    
    successResponse(null, 'Password berhasil diubah');
}
