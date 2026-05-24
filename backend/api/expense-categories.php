<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleExpenseCategories($method, $id) {
    $user = authenticate();
    switch ($method) {
        case 'GET': getExpenseCategories($user); break;
        case 'POST': createExpenseCategory($user); break;
        case 'PUT': updateExpenseCategory($user, $id); break;
        case 'DELETE': deleteExpenseCategory($user, $id); break;
        default: errorResponse('Method not allowed', 405);
    }
}

function getExpenseCategories($user) {
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
        SELECT ec.*,
            (SELECT COALESCE(SUM(e.amount), 0) FROM expenses e WHERE e.category_id = ec.id) as total_amount,
            (SELECT COUNT(*) FROM expenses e WHERE e.category_id = ec.id) as transaction_count
        FROM expense_categories ec
        WHERE ec.org_id IN ($placeholders) AND ec.is_active = 1
        ORDER BY ec.name
    ");
    $stmt->execute($orgIds);
    successResponse($stmt->fetchAll());
}

function createExpenseCategory($user) {
    $input = getJsonInput();
    $errors = validateRequired($input, ['name']);
    if (!empty($errors)) errorResponse('Validasi gagal', 422, $errors);

    $orgId = $input['org_id'] ?? $user['org_id'];
    if ($orgId != $user['org_id'] && !hasOrgAccess($user, $orgId)) errorResponse('Akses ditolak', 403);

    $db = getDB();
    $stmt = $db->prepare("INSERT INTO expense_categories (org_id, name, description) VALUES (?, ?, ?)");
    $stmt->execute([$orgId, $input['name'], $input['description'] ?? null]);
    successResponse(['id' => $db->lastInsertId()], 'Kategori pengeluaran berhasil ditambahkan', 201);
}

function updateExpenseCategory($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM expense_categories WHERE id=? AND is_active=1");
    $stmt->execute([$id]);
    $cat = $stmt->fetch();
    if (!$cat) errorResponse('Kategori tidak ditemukan', 404);
    if (!hasOrgAccess($user, $cat['org_id'])) errorResponse('Akses ditolak', 403);

    $input = getJsonInput();
    $f = []; $v = [];
    foreach (['name','description'] as $field) { if (isset($input[$field])) { $f[]="$field=?"; $v[]=$input[$field]; } }
    if (empty($f)) errorResponse('Tidak ada data yang diubah', 400);
    $v[] = $id;
    $db->prepare("UPDATE expense_categories SET ".implode(',',$f)." WHERE id=?")->execute($v);
    successResponse(null, 'Kategori berhasil diperbarui');
}

function deleteExpenseCategory($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM expense_categories WHERE id=?");
    $stmt->execute([$id]);
    $cat = $stmt->fetch();
    if (!$cat) errorResponse('Kategori tidak ditemukan', 404);
    if (!hasOrgAccess($user, $cat['org_id'])) errorResponse('Akses ditolak', 403);

    $stmt = $db->prepare("SELECT COUNT(*) FROM expenses WHERE category_id=?");
    $stmt->execute([$id]);
    if ($stmt->fetchColumn() > 0) errorResponse('Kategori sudah digunakan dalam transaksi', 400);

    $db->prepare("UPDATE expense_categories SET is_active=0 WHERE id=?")->execute([$id]);
    successResponse(null, 'Kategori berhasil dihapus');
}
