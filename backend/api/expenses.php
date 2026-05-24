<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleExpenses($method, $id) {
    $user = authenticate();
    switch ($method) {
        case 'GET': $id ? getExpense($user, $id) : getExpenses($user); break;
        case 'POST': createExpense($user); break;
        case 'PUT': updateExpense($user, $id); break;
        case 'DELETE': deleteExpense($user, $id); break;
        default: errorResponse('Method not allowed', 405);
    }
}

function getExpenses($user) {
    $db = getDB();
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = min(100, max(1, (int)($_GET['per_page'] ?? 20)));
    $offset = ($page - 1) * $perPage;
    $orgId = $_GET['org_id'] ?? null;

    if ($orgId) {
        if (!hasOrgAccess($user, $orgId)) errorResponse('Akses ditolak', 403);
        $orgIds = [$orgId];
    } else {
        $orgIds = ($user['role'] === 'admin') ? getAccessibleOrgIds($user) : [$user['org_id']];
    }

    $placeholders = implode(',', array_fill(0, count($orgIds), '?'));
    $where = "e.org_id IN ($placeholders)";
    $params = $orgIds;

    if (!empty($_GET['category_id'])) { $where .= " AND e.category_id=?"; $params[] = $_GET['category_id']; }
    if (!empty($_GET['beneficiary_id'])) { $where .= " AND e.beneficiary_id=?"; $params[] = $_GET['beneficiary_id']; }
    if (!empty($_GET['date_from'])) { $where .= " AND e.date >= ?"; $params[] = $_GET['date_from']; }
    if (!empty($_GET['date_to'])) { $where .= " AND e.date <= ?"; $params[] = $_GET['date_to']; }
    if (!empty($_GET['search'])) { $where .= " AND (e.description LIKE ? OR e.receipt_number LIKE ?)"; $params[] = "%{$_GET['search']}%"; $params[] = "%{$_GET['search']}%"; }

    $stmt = $db->prepare("SELECT COUNT(*) FROM expenses e WHERE $where");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();

    $stmt = $db->prepare("
        SELECT e.*, ec.name as category_name, b.name as beneficiary_name, u.name as created_by_name
        FROM expenses e
        JOIN expense_categories ec ON e.category_id = ec.id
        LEFT JOIN beneficiaries b ON e.beneficiary_id = b.id
        JOIN users u ON e.created_by = u.id
        WHERE $where ORDER BY e.date DESC, e.id DESC
        LIMIT $perPage OFFSET $offset
    ");
    $stmt->execute($params);
    paginatedResponse($stmt->fetchAll(), $total, $page, $perPage);
}

function getExpense($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT e.*, ec.name as category_name, b.name as beneficiary_name FROM expenses e JOIN expense_categories ec ON e.category_id=ec.id LEFT JOIN beneficiaries b ON e.beneficiary_id=b.id WHERE e.id=?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    if (!$item) errorResponse('Data tidak ditemukan', 404);
    if (!hasOrgAccess($user, $item['org_id'])) errorResponse('Akses ditolak', 403);
    successResponse($item);
}

function createExpense($user) {
    $input = getJsonInput();
    $errors = validateRequired($input, ['category_id', 'amount', 'date']);
    if (!empty($errors)) errorResponse('Validasi gagal', 422, $errors);
    if ($input['amount'] <= 0) errorResponse('Jumlah harus lebih dari 0', 400);

    $orgId = $input['org_id'] ?? $user['org_id'];
    if ($orgId != $user['org_id'] && !hasOrgAccess($user, $orgId)) errorResponse('Akses ditolak', 403);

    $db = getDB();
    $stmt = $db->prepare("INSERT INTO expenses (org_id, category_id, beneficiary_id, amount, date, description, receipt_number, created_by) VALUES (?,?,?,?,?,?,?,?)");
    $stmt->execute([$orgId, $input['category_id'], $input['beneficiary_id'] ?? null, $input['amount'], $input['date'], $input['description'] ?? null, $input['receipt_number'] ?? null, $user['id']]);
    successResponse(['id' => $db->lastInsertId()], 'Pengeluaran berhasil ditambahkan', 201);
}

function updateExpense($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM expenses WHERE id=?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    if (!$item) errorResponse('Data tidak ditemukan', 404);
    if (!hasOrgAccess($user, $item['org_id'])) errorResponse('Akses ditolak', 403);

    $input = getJsonInput();
    $f = []; $v = [];
    foreach (['category_id','beneficiary_id','amount','date','description','receipt_number'] as $field) {
        if (isset($input[$field])) { $f[]="$field=?"; $v[]=$input[$field]; }
    }
    if (empty($f)) errorResponse('Tidak ada data yang diubah', 400);
    $v[] = $id;
    $db->prepare("UPDATE expenses SET ".implode(',',$f)." WHERE id=?")->execute($v);
    successResponse(null, 'Pengeluaran berhasil diperbarui');
}

function deleteExpense($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM expenses WHERE id=?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    if (!$item) errorResponse('Data tidak ditemukan', 404);
    if (!hasOrgAccess($user, $item['org_id'])) errorResponse('Akses ditolak', 403);
    $db->prepare("DELETE FROM expenses WHERE id=?")->execute([$id]);
    successResponse(null, 'Pengeluaran berhasil dihapus');
}
