<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleReports($method, $action) {
    if ($method !== 'GET') errorResponse('Method not allowed', 405);
    $user = authenticate();
    
    switch ($action) {
        case 'income': reportIncome($user); break;
        case 'expense': reportExpense($user); break;
        case 'beneficiaries': reportBeneficiaries($user); break;
        case 'summary': reportSummary($user); break;
        default: errorResponse('Report tidak ditemukan', 404);
    }
}

function reportIncome($user) {
    $db = getDB();
    $orgIds = ($user['role'] === 'admin') ? getAccessibleOrgIds($user) : [$user['org_id']];
    $ph = implode(',', array_fill(0, count($orgIds), '?'));
    $dateFrom = $_GET['date_from'] ?? date('Y-m-01');
    $dateTo = $_GET['date_to'] ?? date('Y-m-d');
    $params = array_merge($orgIds, [$dateFrom, $dateTo]);
    
    // Per category
    $stmt = $db->prepare("
        SELECT ic.name as category, o.name as org_name, SUM(i.amount) as total, COUNT(i.id) as count
        FROM incomes i
        JOIN income_categories ic ON i.category_id = ic.id
        JOIN organizations o ON i.org_id = o.id
        WHERE i.org_id IN ($ph) AND i.date BETWEEN ? AND ?
        GROUP BY ic.id, o.id ORDER BY o.name, ic.name
    ");
    $stmt->execute($params);
    $byCategory = $stmt->fetchAll();
    
    // Monthly trend
    $stmt = $db->prepare("
        SELECT DATE_FORMAT(i.date, '%Y-%m') as month, SUM(i.amount) as total
        FROM incomes i WHERE i.org_id IN ($ph) AND i.date BETWEEN ? AND ?
        GROUP BY month ORDER BY month
    ");
    $stmt->execute($params);
    $monthly = $stmt->fetchAll();
    
    // Grand total
    $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) as grand_total FROM incomes WHERE org_id IN ($ph) AND date BETWEEN ? AND ?");
    $stmt->execute($params);
    $grandTotal = $stmt->fetchColumn();
    
    successResponse(['by_category' => $byCategory, 'monthly' => $monthly, 'grand_total' => $grandTotal, 'period' => ['from' => $dateFrom, 'to' => $dateTo]]);
}

function reportExpense($user) {
    $db = getDB();
    $orgIds = ($user['role'] === 'admin') ? getAccessibleOrgIds($user) : [$user['org_id']];
    $ph = implode(',', array_fill(0, count($orgIds), '?'));
    $dateFrom = $_GET['date_from'] ?? date('Y-m-01');
    $dateTo = $_GET['date_to'] ?? date('Y-m-d');
    $params = array_merge($orgIds, [$dateFrom, $dateTo]);
    
    $stmt = $db->prepare("
        SELECT ec.name as category, o.name as org_name, SUM(e.amount) as total, COUNT(e.id) as count
        FROM expenses e
        JOIN expense_categories ec ON e.category_id = ec.id
        JOIN organizations o ON e.org_id = o.id
        WHERE e.org_id IN ($ph) AND e.date BETWEEN ? AND ?
        GROUP BY ec.id, o.id ORDER BY o.name, ec.name
    ");
    $stmt->execute($params);
    $byCategory = $stmt->fetchAll();
    
    $stmt = $db->prepare("
        SELECT DATE_FORMAT(e.date, '%Y-%m') as month, SUM(e.amount) as total
        FROM expenses e WHERE e.org_id IN ($ph) AND e.date BETWEEN ? AND ?
        GROUP BY month ORDER BY month
    ");
    $stmt->execute($params);
    $monthly = $stmt->fetchAll();
    
    $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM expenses WHERE org_id IN ($ph) AND date BETWEEN ? AND ?");
    $stmt->execute($params);
    $grandTotal = $stmt->fetchColumn();
    
    successResponse(['by_category' => $byCategory, 'monthly' => $monthly, 'grand_total' => $grandTotal, 'period' => ['from' => $dateFrom, 'to' => $dateTo]]);
}

function reportBeneficiaries($user) {
    $db = getDB();
    $orgIds = ($user['role'] === 'admin') ? getAccessibleOrgIds($user) : [$user['org_id']];
    $ph = implode(',', array_fill(0, count($orgIds), '?'));
    
    $stmt = $db->prepare("
        SELECT b.category, o.name as org_name, COUNT(b.id) as total_beneficiaries,
            COALESCE(SUM(sub.total_received),0) as total_distributed
        FROM beneficiaries b
        JOIN organizations o ON b.org_id = o.id
        LEFT JOIN (SELECT beneficiary_id, SUM(amount) as total_received FROM expenses GROUP BY beneficiary_id) sub ON sub.beneficiary_id = b.id
        WHERE b.org_id IN ($ph) AND b.is_active = 1
        GROUP BY b.category, o.id ORDER BY o.name
    ");
    $stmt->execute($orgIds);
    successResponse($stmt->fetchAll());
}

function reportSummary($user) {
    $db = getDB();
    $orgIds = ($user['role'] === 'admin') ? getAccessibleOrgIds($user) : [$user['org_id']];
    $ph = implode(',', array_fill(0, count($orgIds), '?'));
    $year = $_GET['year'] ?? date('Y');
    
    $params1 = array_merge($orgIds, ["$year-01-01", "$year-12-31"]);
    $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM incomes WHERE org_id IN ($ph) AND date BETWEEN ? AND ?");
    $stmt->execute($params1);
    $totalIncome = $stmt->fetchColumn();
    
    $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM expenses WHERE org_id IN ($ph) AND date BETWEEN ? AND ?");
    $stmt->execute($params1);
    $totalExpense = $stmt->fetchColumn();
    
    // Per org breakdown for admin
    $orgBreakdown = [];
    if ($user['role'] === 'admin' && count($orgIds) > 1) {
        foreach ($orgIds as $oid) {
            $stmt = $db->prepare("SELECT name FROM organizations WHERE id=?");
            $stmt->execute([$oid]);
            $orgName = $stmt->fetchColumn();
            $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM incomes WHERE org_id=? AND date BETWEEN ? AND ?");
            $stmt->execute([$oid, "$year-01-01", "$year-12-31"]);
            $inc = $stmt->fetchColumn();
            $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM expenses WHERE org_id=? AND date BETWEEN ? AND ?");
            $stmt->execute([$oid, "$year-01-01", "$year-12-31"]);
            $exp = $stmt->fetchColumn();
            if ($inc > 0 || $exp > 0) {
                $orgBreakdown[] = ['org_name' => $orgName, 'income' => $inc, 'expense' => $exp, 'balance' => $inc - $exp];
            }
        }
    }
    
    successResponse(['total_income' => $totalIncome, 'total_expense' => $totalExpense, 'balance' => $totalIncome - $totalExpense, 'year' => $year, 'org_breakdown' => $orgBreakdown]);
}
