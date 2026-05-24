<?php
/**
 * Users API Handler
 */

require_once __DIR__ . '/../middleware/auth.php';

function handleUsers($method, $id) {
    $user = authenticate();
    
    switch ($method) {
        case 'GET':
            if ($id) {
                getUser($user, $id);
            } else {
                getUsers($user);
            }
            break;
        case 'POST':
            requireAdmin($user);
            createUser($user);
            break;
        case 'PUT':
            requireAdmin($user);
            updateUser($user, $id);
            break;
        case 'DELETE':
            requireAdmin($user);
            deleteUser($user, $id);
            break;
        default:
            errorResponse('Method not allowed', 405);
    }
}

function getUsers($user) {
    $db = getDB();
    $orgIds = getAccessibleOrgIds($user);
    $placeholders = implode(',', array_fill(0, count($orgIds), '?'));
    
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? min(100, max(1, (int)$_GET['per_page'])) : 20;
    $offset = ($page - 1) * $perPage;
    $search = $_GET['search'] ?? '';
    
    $where = "u.org_id IN ($placeholders)";
    $params = $orgIds;
    
    if ($search) {
        $where .= " AND (u.name LIKE ? OR u.username LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    // Count total
    $stmt = $db->prepare("SELECT COUNT(*) FROM users u WHERE $where");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();
    
    // Fetch data
    $stmt = $db->prepare("
        SELECT u.id, u.org_id, u.username, u.name, u.role, u.email, u.phone, 
               u.is_active, u.last_login, u.created_at,
               o.name as org_name, o.level as org_level
        FROM users u
        JOIN organizations o ON u.org_id = o.id
        WHERE $where
        ORDER BY u.created_at DESC
        LIMIT $perPage OFFSET $offset
    ");
    $stmt->execute($params);
    $users = $stmt->fetchAll();
    
    paginatedResponse($users, $total, $page, $perPage);
}

function getUser($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.id, u.org_id, u.username, u.name, u.role, u.email, u.phone,
               u.is_active, u.last_login, u.created_at,
               o.name as org_name, o.level as org_level
        FROM users u
        JOIN organizations o ON u.org_id = o.id
        WHERE u.id = ?
    ");
    $stmt->execute([$id]);
    $targetUser = $stmt->fetch();
    
    if (!$targetUser) {
        errorResponse('User tidak ditemukan', 404);
    }
    
    if (!hasOrgAccess($user, $targetUser['org_id'])) {
        errorResponse('Akses ditolak', 403);
    }
    
    successResponse($targetUser);
}

function createUser($user) {
    $input = getJsonInput();
    $errors = validateRequired($input, ['username', 'password', 'name', 'role', 'org_id']);
    
    if (!empty($errors)) {
        errorResponse('Validasi gagal', 422, $errors);
    }
    
    // Check org access
    $targetOrgId = $input['org_id'];
    if (!hasOrgAccess($user, $targetOrgId) && $user['org_id'] != $targetOrgId) {
        errorResponse('Anda tidak memiliki akses ke organisasi ini', 403);
    }
    
    // Check duplicate username
    $db = getDB();
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$input['username']]);
    if ($stmt->fetch()) {
        errorResponse('Username sudah digunakan', 400);
    }
    
    // Validate password
    if (strlen($input['password']) < 6) {
        errorResponse('Password minimal 6 karakter', 400);
    }
    
    // Validate role
    if (!in_array($input['role'], ['admin', 'staff'])) {
        errorResponse('Role harus admin atau staff', 400);
    }
    
    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
    
    $stmt = $db->prepare("
        INSERT INTO users (org_id, username, password, name, role, email, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $input['org_id'],
        $input['username'],
        $hashedPassword,
        $input['name'],
        $input['role'],
        $input['email'] ?? null,
        $input['phone'] ?? null,
    ]);
    
    successResponse(['id' => $db->lastInsertId()], 'User berhasil dibuat', 201);
}

function updateUser($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $targetUser = $stmt->fetch();
    
    if (!$targetUser) {
        errorResponse('User tidak ditemukan', 404);
    }
    
    if (!hasOrgAccess($user, $targetUser['org_id'])) {
        errorResponse('Akses ditolak', 403);
    }
    
    $input = getJsonInput();
    $fields = [];
    $values = [];
    
    foreach (['name', 'email', 'phone', 'role', 'is_active'] as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $values[] = $input[$field];
        }
    }
    
    if (isset($input['password']) && !empty($input['password'])) {
        if (strlen($input['password']) < 6) {
            errorResponse('Password minimal 6 karakter', 400);
        }
        $fields[] = "password = ?";
        $values[] = password_hash($input['password'], PASSWORD_DEFAULT);
    }
    
    if (empty($fields)) {
        errorResponse('Tidak ada data yang diubah', 400);
    }
    
    $values[] = $id;
    $stmt = $db->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($values);
    
    successResponse(null, 'User berhasil diperbarui');
}

function deleteUser($user, $id) {
    if ($user['id'] == $id) {
        errorResponse('Tidak dapat menghapus akun sendiri', 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $targetUser = $stmt->fetch();
    
    if (!$targetUser) {
        errorResponse('User tidak ditemukan', 404);
    }
    
    if (!hasOrgAccess($user, $targetUser['org_id'])) {
        errorResponse('Akses ditolak', 403);
    }
    
    // Soft delete
    $stmt = $db->prepare("UPDATE users SET is_active = 0 WHERE id = ?");
    $stmt->execute([$id]);
    
    successResponse(null, 'User berhasil dihapus');
}
