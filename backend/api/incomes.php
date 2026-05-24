<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleIncomes($method, $id) {
    $user = authenticate();
    switch ($method) {
        case 'GET': $id ? getIncome($user, $id) : getIncomes($user); break;
        case 'POST': createIncome($user); break;
        case 'PUT': updateIncome($user, $id); break;
        case 'DELETE': deleteIncome($user, $id); break;
        default: errorResponse('Method not allowed', 405);
    }
}

function getIncomes($user) {
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
    $where = "i.org_id IN ($placeholders)";
    $params = $orgIds;

    if (!empty($_GET['category_id'])) { $where .= " AND i.category_id = ?"; $params[] = $_GET['category_id']; }
    if (!empty($_GET['donor_id'])) { $where .= " AND i.donor_id = ?"; $params[] = $_GET['donor_id']; }
    if (!empty($_GET['date_from'])) { $where .= " AND i.date >= ?"; $params[] = $_GET['date_from']; }
    if (!empty($_GET['date_to'])) { $where .= " AND i.date <= ?"; $params[] = $_GET['date_to']; }
    if (!empty($_GET['search'])) { $where .= " AND (i.description LIKE ? OR i.receipt_number LIKE ?)"; $params[] = "%{$_GET['search']}%"; $params[] = "%{$_GET['search']}%"; }

    $stmt = $db->prepare("SELECT COUNT(*) FROM incomes i WHERE $where");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();

    $stmt = $db->prepare("
        SELECT i.*, ic.name as category_name, d.name as donor_name, u.name as created_by_name
        FROM incomes i
        JOIN income_categories ic ON i.category_id = ic.id
        LEFT JOIN donors d ON i.donor_id = d.id
        JOIN users u ON i.created_by = u.id
        WHERE $where ORDER BY i.date DESC, i.id DESC
        LIMIT $perPage OFFSET $offset
    ");
    $stmt->execute($params);
    paginatedResponse($stmt->fetchAll(), $total, $page, $perPage);
}

function getIncome($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT i.*, ic.name as category_name, d.name as donor_name FROM incomes i JOIN income_categories ic ON i.category_id=ic.id LEFT JOIN donors d ON i.donor_id=d.id WHERE i.id=?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    if (!$item) errorResponse('Data tidak ditemukan', 404);
    if (!hasOrgAccess($user, $item['org_id'])) errorResponse('Akses ditolak', 403);
    successResponse($item);
}

function createIncome($user) {
    $input = getJsonInput();
    $errors = validateRequired($input, ['category_id', 'amount', 'date']);
    if (!empty($errors)) errorResponse('Validasi gagal', 422, $errors);
    if ($input['amount'] <= 0) errorResponse('Jumlah harus lebih dari 0', 400);

    $orgId = $input['org_id'] ?? $user['org_id'];
    if ($orgId != $user['org_id'] && !hasOrgAccess($user, $orgId)) errorResponse('Akses ditolak', 403);

    $db = getDB();
    $stmt = $db->prepare("INSERT INTO incomes (org_id, category_id, donor_id, amount, date, description, receipt_number, created_by) VALUES (?,?,?,?,?,?,?,?)");
    $stmt->execute([$orgId, $input['category_id'], $input['donor_id'] ?? null, $input['amount'], $input['date'], $input['description'] ?? null, $input['receipt_number'] ?? null, $user['id']]);
    successResponse(['id' => $db->lastInsertId()], 'Pemasukan berhasil ditambahkan', 201);
}

function updateIncome($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM incomes WHERE id=?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    if (!$item) errorResponse('Data tidak ditemukan', 404);
    if (!hasOrgAccess($user, $item['org_id'])) errorResponse('Akses ditolak', 403);

    $input = getJsonInput();
    $f = []; $v = [];
    foreach (['category_id','donor_id','amount','date','description','receipt_number'] as $field) {
        if (isset($input[$field])) { $f[] = "$field=?"; $v[] = $input[$field]; }
    }
    if (empty($f)) errorResponse('Tidak ada data yang diubah', 400);
    $v[] = $id;
    $db->prepare("UPDATE incomes SET ".implode(',',$f)." WHERE id=?")->execute($v);
    successResponse(null, 'Pemasukan berhasil diperbarui');
}

function deleteIncome($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM incomes WHERE id=?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    if (!$item) errorResponse('Data tidak ditemukan', 404);
    if (!hasOrgAccess($user, $item['org_id'])) errorResponse('Akses ditolak', 403);
    $db->prepare("DELETE FROM incomes WHERE id=?")->execute([$id]);
    successResponse(null, 'Pemasukan berhasil dihapus');
}
