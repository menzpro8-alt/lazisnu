<?php

require_once __DIR__ . '/../middleware/auth.php';

function handleBeneficiaries($method, $id) {
    $user = authenticate();
    switch ($method) {
        case 'GET':
            if ($id) getBeneficiary($user, $id);
            else getBeneficiaries($user);
            break;
        case 'POST': createBeneficiary($user); break;
        case 'PUT': updateBeneficiary($user, $id); break;
        case 'DELETE': deleteBeneficiary($user, $id); break;
        default: errorResponse('Method not allowed', 405);
    }
}

function getBeneficiaries($user) {
    $db = getDB();
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? min(100, max(1, (int)$_GET['per_page'])) : 20;
    $offset = ($page - 1) * $perPage;
    $search = $_GET['search'] ?? '';
    $orgId = $_GET['org_id'] ?? null;
    $category = $_GET['category'] ?? '';

    if ($orgId) {
        if (!hasOrgAccess($user, $orgId)) errorResponse('Akses ditolak', 403);
        $orgIds = [$orgId];
    } else {
        $orgIds = ($user['role'] === 'admin') ? getAccessibleOrgIds($user) : [$user['org_id']];
    }

    $placeholders = implode(',', array_fill(0, count($orgIds), '?'));
    $where = "b.org_id IN ($placeholders) AND b.is_active = 1";
    $params = $orgIds;

    if ($search) {
        $where .= " AND (b.name LIKE ? OR b.phone LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    if ($category) {
        $where .= " AND b.category = ?";
        $params[] = $category;
    }

    $stmt = $db->prepare("SELECT COUNT(*) FROM beneficiaries b WHERE $where");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();

    $stmt = $db->prepare("
        SELECT b.*,
            (SELECT COALESCE(SUM(e.amount), 0) FROM expenses e WHERE e.beneficiary_id = b.id) as total_received
        FROM beneficiaries b
        WHERE $where
        ORDER BY b.name ASC
        LIMIT $perPage OFFSET $offset
    ");
    $stmt->execute($params);
    $data = $stmt->fetchAll();

    paginatedResponse($data, $total, $page, $perPage);
}

function getBeneficiary($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM beneficiaries WHERE id = ? AND is_active = 1");
    $stmt->execute([$id]);
    $item = $stmt->fetch();

    if (!$item) errorResponse('Penerima manfaat tidak ditemukan', 404);
    if (!hasOrgAccess($user, $item['org_id'])) errorResponse('Akses ditolak', 403);

    successResponse($item);
}

function createBeneficiary($user) {
    $input = getJsonInput();
    $errors = validateRequired($input, ['name']);
    if (!empty($errors)) errorResponse('Validasi gagal', 422, $errors);

    $orgId = $input['org_id'] ?? $user['org_id'];
    if ($orgId != $user['org_id'] && !hasOrgAccess($user, $orgId)) errorResponse('Akses ditolak', 403);

    $db = getDB();
    $stmt = $db->prepare("
        INSERT INTO beneficiaries (org_id, name, phone, address, nik, category, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $orgId,
        $input['name'],
        $input['phone'] ?? null,
        $input['address'] ?? null,
        $input['nik'] ?? null,
        $input['category'] ?? null,
        $input['notes'] ?? null,
    ]);

    successResponse(['id' => $db->lastInsertId()], 'Penerima manfaat berhasil ditambahkan', 201);
}

function updateBeneficiary($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM beneficiaries WHERE id = ? AND is_active = 1");
    $stmt->execute([$id]);
    $item = $stmt->fetch();

    if (!$item) errorResponse('Penerima manfaat tidak ditemukan', 404);
    if (!hasOrgAccess($user, $item['org_id'])) errorResponse('Akses ditolak', 403);

    $input = getJsonInput();
    $fields = [];
    $values = [];

    foreach (['name', 'phone', 'address', 'nik', 'category', 'notes'] as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $values[] = $input[$field];
        }
    }

    if (empty($fields)) errorResponse('Tidak ada data yang diubah', 400);

    $values[] = $id;
    $stmt = $db->prepare("UPDATE beneficiaries SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($values);

    successResponse(null, 'Penerima manfaat berhasil diperbarui');
}

function deleteBeneficiary($user, $id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM beneficiaries WHERE id = ?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();

    if (!$item) errorResponse('Penerima manfaat tidak ditemukan', 404);
    if (!hasOrgAccess($user, $item['org_id'])) errorResponse('Akses ditolak', 403);

    $stmt = $db->prepare("UPDATE beneficiaries SET is_active = 0 WHERE id = ?");
    $stmt->execute([$id]);

    successResponse(null, 'Penerima manfaat berhasil dihapus');
}
