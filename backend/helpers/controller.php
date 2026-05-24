<?php
/**
 * Base Controller Helper
 * Centralizes standard CRUD logic for professional backend structure
 */

function handleCrudRequest($resource, $user, $id, $options = []) {
    $method = $_SERVER['REQUEST_METHOD'];
    $db = getDB();

    switch ($method) {
        case 'GET':
            if ($id) {
                $stmt = $db->prepare("SELECT * FROM $resource WHERE id = ?");
                $stmt->execute([$id]);
                $item = $stmt->fetch();
                if (!$item) errorResponse('Data tidak ditemukan', 404);
                if (!hasOrgAccess($user, $item['org_id'])) errorResponse('Akses ditolak', 403);
                successResponse($item);
            } else {
                return executePaginatedList($resource, $user, $options);
            }
            break;

        case 'POST':
            $input = getJsonInput();
            $errors = validateRequired($input, $options['required'] ?? []);
            if (!empty($errors)) errorResponse('Validasi gagal', 422, $errors);
            
            $orgId = $input['org_id'] ?? $user['org_id'];
            if (!hasOrgAccess($user, $orgId)) errorResponse('Akses ditolak', 403);
            
            $fields = array_keys($input);
            $phs = array_fill(0, count($fields), '?');
            $sql = "INSERT INTO $resource (".implode(',', $fields).") VALUES (".implode(',', $phs).")";
            $db->prepare($sql)->execute(array_values($input));
            successResponse(['id' => $db->lastInsertId()], 'Data berhasil ditambahkan', 201);
            break;

        case 'DELETE':
            $stmt = $db->prepare("SELECT org_id FROM $resource WHERE id = ?");
            $stmt->execute([$id]);
            $orgId = $stmt->fetchColumn();
            if (!$orgId) errorResponse('Data tidak ditemukan', 404);
            if (!hasOrgAccess($user, $orgId)) errorResponse('Akses ditolak', 403);
            
            $db->prepare("DELETE FROM $resource WHERE id = ?")->execute([$id]);
            successResponse(null, 'Data berhasil dihapus');
            break;

        default:
            errorResponse('Method not allowed', 405);
    }
}

function executePaginatedList($resource, $user, $options) {
    $db = getDB();
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = min(100, max(1, (int)($_GET['per_page'] ?? 20)));
    $offset = ($page - 1) * $perPage;

    $orgIds = ($user['role'] === 'admin') ? getAccessibleOrgIds($user) : [$user['org_id']];
    $ph = implode(',', array_fill(0, count($orgIds), '?'));
    
    $where = "org_id IN ($ph)";
    $params = $orgIds;

    // Apply custom filters from options
    if (isset($options['filter_callback'])) {
        $options['filter_callback']($where, $params);
    }

    $stmt = $db->prepare("SELECT COUNT(*) FROM $resource WHERE $where");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();

    $sql = "SELECT * FROM $resource WHERE $where";
    if (isset($options['order_by'])) $sql .= " ORDER BY " . $options['order_by'];
    $sql .= " LIMIT $perPage OFFSET $offset";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    paginatedResponse($stmt->fetchAll(), $total, $page, $perPage);
}
