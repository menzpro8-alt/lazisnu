<?php
/**
 * Authentication Middleware
 * Validates JWT token and sets current user context
 */

require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/database.php';

/**
 * Authenticate request - returns user data or sends 401
 */
function authenticate() {
    $token = getBearerToken();
    
    if (!$token) {
        errorResponse('Token tidak ditemukan. Silakan login terlebih dahulu.', 401);
    }
    
    $payload = verifyToken($token);
    
    if (!$payload) {
        errorResponse('Token tidak valid atau sudah kadaluarsa.', 401);
    }
    
    // Fetch fresh user data from DB
    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.id, u.org_id, u.username, u.name, u.role, u.email, u.phone,
               o.name as org_name, o.level as org_level
        FROM users u
        JOIN organizations o ON u.org_id = o.id
        WHERE u.id = ? AND u.is_active = 1
    ");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        errorResponse('User tidak ditemukan atau tidak aktif.', 401);
    }
    
    return $user;
}

/**
 * Require admin role
 */
function requireAdmin($user) {
    if ($user['role'] !== 'admin') {
        errorResponse('Akses ditolak. Hanya admin yang dapat mengakses fitur ini.', 403);
    }
}

/**
 * Check if user has access to organization (same org or child orgs for admin)
 */
function hasOrgAccess($user, $targetOrgId) {
    // Same org - always allowed
    if ($user['org_id'] == $targetOrgId) {
        return true;
    }
    
    // Staff can only access their own org
    if ($user['role'] !== 'admin') {
        return false;
    }
    
    // Admin can access child organizations
    return isChildOrg($user['org_id'], $targetOrgId);
}

/**
 * Check if targetOrgId is a child (any level) of parentOrgId
 */
function isChildOrg($parentOrgId, $targetOrgId) {
    $db = getDB();
    
    // Traverse up from target to see if we reach parent
    $currentId = $targetOrgId;
    $maxDepth = 10; // Prevent infinite loop
    
    while ($currentId && $maxDepth > 0) {
        $stmt = $db->prepare("SELECT parent_id FROM organizations WHERE id = ?");
        $stmt->execute([$currentId]);
        $org = $stmt->fetch();
        
        if (!$org || !$org['parent_id']) {
            return false;
        }
        
        if ($org['parent_id'] == $parentOrgId) {
            return true;
        }
        
        $currentId = $org['parent_id'];
        $maxDepth--;
    }
    
    return false;
}

/**
 * Get all child organization IDs (recursive)
 */
function getChildOrgIds($orgId) {
    $db = getDB();
    $ids = [];
    
    $stmt = $db->prepare("SELECT id FROM organizations WHERE parent_id = ? AND is_active = 1");
    $stmt->execute([$orgId]);
    $children = $stmt->fetchAll();
    
    foreach ($children as $child) {
        $ids[] = $child['id'];
        $ids = array_merge($ids, getChildOrgIds($child['id']));
    }
    
    return $ids;
}

/**
 * Get accessible org IDs for a user
 * Staff: only their own org
 * Admin: their org + all child orgs
 */
function getAccessibleOrgIds($user) {
    $orgIds = [$user['org_id']];
    
    if ($user['role'] === 'admin') {
        $childIds = getChildOrgIds($user['org_id']);
        $orgIds = array_merge($orgIds, $childIds);
    }
    
    return $orgIds;
}
