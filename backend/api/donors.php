<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleDonors($method, $id) {
    $user = authenticate();
    
    if ($method === 'GET') {
        if ($id) {
            // Single donor
            $db = getDB();
            $stmt = $db->prepare("SELECT d.*, COALESCE(SUM(i.amount), 0) as total_donated FROM donors d LEFT JOIN incomes i ON d.id = i.donor_id WHERE d.id = ? GROUP BY d.id");
            $stmt->execute([$id]);
            $item = $stmt->fetch();
            if (!$item) errorResponse('Data tidak ditemukan', 404);
            if (!hasOrgAccess($user, $item['org_id'])) errorResponse('Akses ditolak', 403);
            successResponse($item);
        } else {
            // List donors with total donations
            return listDonorsWithTotals($user);
        }
    } elseif ($method === 'PUT') {
        return updateDonor($user, $id);
    } elseif ($method === 'DELETE') {
        return deleteDonor($user, $id);
    } elseif ($method === 'POST') {
        // Create donor
        $input = getJsonInput();
        if (empty($input['name'])) errorResponse('Nama donatur wajib diisi', 422);
        
        $db = getDB();
        $orgId = $input['org_id'] ?? $user['org_id'];
        if (!hasOrgAccess($user, $orgId)) errorResponse('Akses ditolak', 403);
        
        $fields = [];
        $values = [];
        foreach (['name', 'phone', 'email', 'address', 'nik', 'notes', 'org_id'] as $f) {
            if (isset($input[$f])) {
                $fields[] = $f;
                $values[] = $input[$f];
            }
        }
        
        $sql = "INSERT INTO donors (".implode(',', $fields).") VALUES (".implode(',', array_fill(0, count($values), '?')).")";
        $db->prepare($sql)->execute($values);
        successResponse(['id' => $db->lastInsertId()], 'Donatur berhasil ditambahkan', 201);
    } else {
        errorResponse('Method not allowed', 405);
    }
}

function listDonorsWithTotals($user) {
    $db = getDB();
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = min(100, max(1, (int)($_GET['per_page'] ?? 20)));
    $offset = ($page - 1) * $perPage;

    $orgIds = ($user['role'] === 'admin') ? getAccessibleOrgIds($user) : [$user['org_id']];
    $ph = implode(',', array_fill(0, count($orgIds), '?'));
    
    $where = "d.org_id IN ($ph) AND d.is_active = 1";
    $params = $orgIds;

    if (!empty($_GET['search'])) {
        $where .= " AND (d.name LIKE ? OR d.phone LIKE ?)";
        $params[] = "%{$_GET['search']}%";
        $params[] = "%{$_GET['search']}%";
    }

    // Count
    $stmt = $db->prepare("SELECT COUNT(DISTINCT d.id) FROM donors d WHERE $where");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();

    // List
    $sql = "SELECT d.*, COALESCE(SUM(i.amount), 0) as total_donated 
            FROM donors d 
            LEFT JOIN incomes i ON d.id = i.donor_id 
            WHERE $where 
            GROUP BY d.id 
            ORDER BY d.name ASC 
            LIMIT $perPage OFFSET $offset";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    paginatedResponse($stmt->fetchAll(), $total, $page, $perPage);
}

function updateDonor($user, $id) {
    $db = getDB();
    $input = getJsonInput();
    
    $fields = []; $values = [];
    foreach (['name', 'phone', 'email', 'address', 'nik', 'notes'] as $f) {
        if (isset($input[$f])) { $fields[] = "$f=?"; $values[] = $input[$f]; }
    }
    if (empty($fields)) errorResponse('Tidak ada data diubah', 400);
    
    $values[] = $id;
    $db->prepare("UPDATE donors SET ".implode(',',$fields)." WHERE id=?")->execute($values);
    successResponse(null, 'Donatur diperbarui');
}

function deleteDonor($user, $id) {
    $db = getDB();
    // Professional Soft Delete
    $db->prepare("UPDATE donors SET is_active = 0 WHERE id = ?")->execute([$id]);
    successResponse(null, 'Donatur berhasil dihapus');
}
