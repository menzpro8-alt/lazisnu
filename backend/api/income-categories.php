<?php

require_once __DIR__ . '/../middleware/auth.php';

function handleIncomeCategories($method, $id) {
    $user = authenticate();
    switch ($method) {
        case 'GET': getIncomeCategories($user); break;
        case 'POST': createIncomeCategory($user); break;
        case 'PUT': updateIncomeCategory($user, $id); break;
        case 'DELETE': deleteIncomeCategory($user, $id); break;
        default: errorResponse('Method not allowed', 405);
    }
}

function getIncomeCategories($user) {
    $db = getDB();
    $orgId = $_GET['org_id'] ?? null;

    if ($orgId) {
        if (!hasOrgAccess($user, $orgId)) errorResponse('Akses ditolak', 403);
        $orgIds = [$orgId];
    } else {
        $orgIds = ($user['role'] === 'admin') ? getAccessibleOrgIds($user) : [$user['org_id']];
    }

    $placeholders = implode(',', array_fill(0, count($orgIds), '?'));
    $stmt = $db->prepare("
        SELECT ic.*,
            (SELECT COALESCE(SUM(i.amount), 0) FROM incomes i WHERE i.category_id = ic.id) as total_amount,
            (SELECT COUNT(*) FROM incomes i WHERE i.category_id = ic.id) as transaction_count
        FROM income_categories ic
        WHERE ic.org_id IN ($placeholders) AND ic.is_active = 1
        ORDER BY ic.name
    ");
    $stmt->execute($orgIds);
    successResponse($stmt->fetchAll());
}

function createIncomeCategory($user) {
    $input = getJsonInput();
    $errors = validateRequired($input, ['name']);
    if (!empty($errors)) errorResponse('Validasi gagal', 422, $errors);

    $orgId = $input['org_id'] ?? $user['org_id'];
    if ($orgId != $user['org_id'] && !hasOrgAccess($user, $orgId)) errorResponse('Akses ditolak', 403);

    $db = getDB();
    $stmt = $db->prepare("INSERT INTO income_categories (org_id, name, description) VALUES (?, ?, ?)");
    $stmt->execute([$orgId, $input['name'], $input['description'] ?? null]);
    successResponse(['id' => $db->lastInsertId()], 'Kategori pemasukan berhasil ditambahkan', 201);
}

function updateIncomeCategory($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM income_categories WHERE id = ? AND is_active = 1");
    $stmt->execute([$id]);
    $cat = $stmt->fetch();

    if (!$cat) errorResponse('Kategori tidak ditemukan', 404);
    if (!hasOrgAccess($user, $cat['org_id'])) errorResponse('Akses ditolak', 403);

    $input = getJsonInput();
    $fields = [];
    $values = [];

    foreach (['name', 'description'] as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $values[] = $input[$field];
        }
    }

    if (empty($fields)) errorResponse('Tidak ada data yang diubah', 400);

    $values[] = $id;
    $stmt = $db->prepare("UPDATE income_categories SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($values);

    successResponse(null, 'Kategori berhasil diperbarui');
}

function deleteIncomeCategory($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM income_categories WHERE id = ?");
    $stmt->execute([$id]);
    $cat = $stmt->fetch();

    if (!$cat) errorResponse('Kategori tidak ditemukan', 404);
    if (!hasOrgAccess($user, $cat['org_id'])) errorResponse('Akses ditolak', 403);

    $stmt = $db->prepare("SELECT COUNT(*) FROM incomes WHERE category_id = ?");
    $stmt->execute([$id]);
    if ($stmt->fetchColumn() > 0) errorResponse('Kategori tidak dapat dihapus karena sudah digunakan dalam transaksi', 400);

    $stmt = $db->prepare("UPDATE income_categories SET is_active = 0 WHERE id = ?");
    $stmt->execute([$id]);
    successResponse(null, 'Kategori berhasil dihapus');
}
