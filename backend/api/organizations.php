<?php
/**
 * Organizations API Handler
 */

require_once __DIR__ . '/../middleware/auth.php';

function handleOrganizations($method, $id, $action) {
    $user = authenticate();
    
    if ($action === 'children') {
        getChildren($user, $id);
        return;
    }
    
    switch ($method) {
        case 'GET':
            if ($id) {
                getOrganization($user, $id);
            } else {
                getOrganizations($user);
            }
            break;
        case 'POST':
            requireAdmin($user);
            createOrganization($user);
            break;
        case 'PUT':
            requireAdmin($user);
            updateOrganization($user, $id);
            break;
        case 'DELETE':
            requireAdmin($user);
            deleteOrganization($user, $id);
            break;
        default:
            errorResponse('Method not allowed', 405);
    }
}

function getOrganizations($user) {
    $db = getDB();
    $orgIds = getAccessibleOrgIds($user);
    $placeholders = implode(',', array_fill(0, count($orgIds), '?'));
    
    $stmt = $db->prepare("
        SELECT o.*, p.name as parent_name 
        FROM organizations o 
        LEFT JOIN organizations p ON o.parent_id = p.id 
        WHERE o.id IN ($placeholders) AND o.is_active = 1
        ORDER BY o.level, o.name
    ");
    $stmt->execute($orgIds);
    $orgs = $stmt->fetchAll();
    
    successResponse($orgs);
}

function getOrganization($user, $id) {
    if (!hasOrgAccess($user, $id)) {
        errorResponse('Akses ditolak', 403);
    }
    
    $db = getDB();
    $stmt = $db->prepare("
        SELECT o.*, p.name as parent_name 
        FROM organizations o 
        LEFT JOIN organizations p ON o.parent_id = p.id 
        WHERE o.id = ?
    ");
    $stmt->execute([$id]);
    $org = $stmt->fetch();
    
    if (!$org) {
        errorResponse('Organisasi tidak ditemukan', 404);
    }
    
    successResponse($org);
}

function getChildren($user, $parentId) {
    if (!hasOrgAccess($user, $parentId)) {
        errorResponse('Akses ditolak', 403);
    }
    
    $db = getDB();
    $stmt = $db->prepare("
        SELECT * FROM organizations 
        WHERE parent_id = ? AND is_active = 1
        ORDER BY name
    ");
    $stmt->execute([$parentId]);
    $children = $stmt->fetchAll();
    
    successResponse($children);
}

function createOrganization($user) {
    $input = getJsonInput();
    $errors = validateRequired($input, ['name', 'level', 'parent_id']);
    
    if (!empty($errors)) {
        errorResponse('Validasi gagal', 422, $errors);
    }
    
    // Validate that admin can create org under their hierarchy
    if (!hasOrgAccess($user, $input['parent_id']) && $user['org_id'] != $input['parent_id']) {
        errorResponse('Anda tidak memiliki akses untuk membuat organisasi di bawah ini', 403);
    }
    
    // Validate level hierarchy
    $levelOrder = ['PP' => 1, 'PW' => 2, 'PC' => 3, 'MWC' => 4, 'PR' => 5];
    $db = getDB();
    $stmt = $db->prepare("SELECT level FROM organizations WHERE id = ?");
    $stmt->execute([$input['parent_id']]);
    $parent = $stmt->fetch();
    
    if ($parent && isset($levelOrder[$parent['level']]) && isset($levelOrder[$input['level']])) {
        if ($levelOrder[$input['level']] <= $levelOrder[$parent['level']]) {
            errorResponse('Level organisasi harus di bawah induk', 400);
        }
    }
    
    $stmt = $db->prepare("
        INSERT INTO organizations (name, level, parent_id, address, phone, email)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $input['name'],
        $input['level'],
        $input['parent_id'],
        $input['address'] ?? null,
        $input['phone'] ?? null,
        $input['email'] ?? null,
    ]);
    
    $id = $db->lastInsertId();
    
    // Create default income categories for new org
    $defaultIncomeCategories = ['Zakat Mal', 'Zakat Fitrah', 'Infaq', 'Sedekah', 'Donasi'];
    foreach ($defaultIncomeCategories as $cat) {
        $stmt = $db->prepare("INSERT INTO income_categories (org_id, name) VALUES (?, ?)");
        $stmt->execute([$id, $cat]);
    }
    
    // Create default expense categories for new org
    $defaultExpenseCategories = ['Fakir', 'Miskin', 'Amil', 'Muallaf', 'Gharimin', 'Fisabilillah', 'Ibnu Sabil', 'Operasional'];
    foreach ($defaultExpenseCategories as $cat) {
        $stmt = $db->prepare("INSERT INTO expense_categories (org_id, name) VALUES (?, ?)");
        $stmt->execute([$id, $cat]);
    }
    
    successResponse(['id' => $id], 'Organisasi berhasil dibuat', 201);
}

function updateOrganization($user, $id) {
    if (!hasOrgAccess($user, $id)) {
        errorResponse('Akses ditolak', 403);
    }
    
    $input = getJsonInput();
    $db = getDB();
    
    $fields = [];
    $values = [];
    
    foreach (['name', 'address', 'phone', 'email'] as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $values[] = $input[$field];
        }
    }
    
    if (empty($fields)) {
        errorResponse('Tidak ada data yang diubah', 400);
    }
    
    $values[] = $id;
    $stmt = $db->prepare("UPDATE organizations SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($values);
    
    successResponse(null, 'Organisasi berhasil diperbarui');
}

function deleteOrganization($user, $id) {
    if (!$id) {
        errorResponse('ID organisasi diperlukan', 400);
    }

    if (!hasOrgAccess($user, $id)) {
        errorResponse('Akses ditolak', 403);
    }

    $db = getDB();

    // Cek apakah masih punya anak organisasi aktif
    $stmt = $db->prepare("SELECT COUNT(*) FROM organizations WHERE parent_id = ? AND is_active = 1");
    $stmt->execute([$id]);
    $childCount = $stmt->fetchColumn();
    if ($childCount > 0) {
        errorResponse('Tidak dapat menghapus organisasi yang masih memiliki unit bawahan aktif (' . $childCount . ' unit)', 400);
    }

    // Cek apakah masih punya user aktif
    $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE org_id = ? AND is_active = 1");
    $stmt->execute([$id]);
    $userCount = $stmt->fetchColumn();
    if ($userCount > 0) {
        errorResponse('Tidak dapat menghapus organisasi yang masih memiliki akun pengguna aktif (' . $userCount . ' akun). Hapus atau nonaktifkan akun pengguna terlebih dahulu.', 400);
    }

    // Pastikan tidak menghapus organisasi milik user sendiri
    if ($user['org_id'] == $id) {
        errorResponse('Tidak dapat menghapus organisasi Anda sendiri', 400);
    }

    // Soft delete
    $stmt = $db->prepare("UPDATE organizations SET is_active = 0 WHERE id = ?");
    $stmt->execute([$id]);

    successResponse(null, 'Organisasi berhasil dihapus');
}
