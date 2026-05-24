<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleDashboard($method) {
    if ($method !== 'GET') errorResponse('Method not allowed', 405);
    $user = authenticate();
    $db = getDB();
    
    $orgIds = ($user['role'] === 'admin') ? getAccessibleOrgIds($user) : [$user['org_id']];
    $ph = implode(',', array_fill(0, count($orgIds), '?'));
    
    $month = $_GET['month'] ?? date('Y-m');
    $dateFrom = "$month-01";
    $dateTo = date('Y-m-t', strtotime($dateFrom));
    $year = substr($month, 0, 4);
    
    // This month income
    $p = array_merge($orgIds, [$dateFrom, $dateTo]);
    $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM incomes WHERE org_id IN ($ph) AND date BETWEEN ? AND ?");
    $stmt->execute($p);
    $monthIncome = $stmt->fetchColumn();
    
    // This month expense
    $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM expenses WHERE org_id IN ($ph) AND date BETWEEN ? AND ?");
    $stmt->execute($p);
    $monthExpense = $stmt->fetchColumn();
    
    // Year total
    $py = array_merge($orgIds, ["$year-01-01", "$year-12-31"]);
    $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM incomes WHERE org_id IN ($ph) AND date BETWEEN ? AND ?");
    $stmt->execute($py);
    $yearIncome = $stmt->fetchColumn();
    $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM expenses WHERE org_id IN ($ph) AND date BETWEEN ? AND ?");
    $stmt->execute($py);
    $yearExpense = $stmt->fetchColumn();
    
    // Counts
    $stmt = $db->prepare("SELECT COUNT(*) FROM donors WHERE org_id IN ($ph) AND is_active=1");
    $stmt->execute($orgIds);
    $totalDonors = $stmt->fetchColumn();
    
    $stmt = $db->prepare("SELECT COUNT(*) FROM beneficiaries WHERE org_id IN ($ph) AND is_active=1");
    $stmt->execute($orgIds);
    $totalBeneficiaries = $stmt->fetchColumn();
    
    // Recent transactions (last 10)
    $stmt = $db->prepare("
        (SELECT 'income' as type, i.amount, i.date, i.description, ic.name as category, i.created_at 
         FROM incomes i JOIN income_categories ic ON i.category_id=ic.id WHERE i.org_id IN ($ph) ORDER BY i.created_at DESC LIMIT 5)
        UNION ALL
        (SELECT 'expense' as type, e.amount, e.date, e.description, ec.name as category, e.created_at
         FROM expenses e JOIN expense_categories ec ON e.category_id=ec.id WHERE e.org_id IN ($ph) ORDER BY e.created_at DESC LIMIT 5)
        ORDER BY created_at DESC LIMIT 10
    ");
    $stmt->execute(array_merge($orgIds, $orgIds));
    $recentTx = $stmt->fetchAll();
    
    // Monthly chart (last 6 months)
    $chart = [];
    for ($i = 5; $i >= 0; $i--) {
        $m = date('Y-m', strtotime("-$i months"));
        $mFrom = "$m-01";
        $mTo = date('Y-m-t', strtotime($mFrom));
        $mp = array_merge($orgIds, [$mFrom, $mTo]);
        
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM incomes WHERE org_id IN ($ph) AND date BETWEEN ? AND ?");
        $stmt->execute($mp);
        $mInc = $stmt->fetchColumn();
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM expenses WHERE org_id IN ($ph) AND date BETWEEN ? AND ?");
        $stmt->execute($mp);
        $mExp = $stmt->fetchColumn();
        
        $chart[] = ['month' => $m, 'income' => (float)$mInc, 'expense' => (float)$mExp];
    }
    
    // Child orgs count for admin
    $childOrgsCount = ($user['role'] === 'admin') ? count($orgIds) - 1 : 0;
    
    successResponse([
        'month_income' => (float)$monthIncome,
        'month_expense' => (float)$monthExpense,
        'month_balance' => (float)($monthIncome - $monthExpense),
        'year_income' => (float)$yearIncome,
        'year_expense' => (float)$yearExpense,
        'year_balance' => (float)($yearIncome - $yearExpense),
        'total_donors' => (int)$totalDonors,
        'total_beneficiaries' => (int)$totalBeneficiaries,
        'child_orgs_count' => $childOrgsCount,
        'recent_transactions' => $recentTx,
        'chart' => $chart,
        'current_month' => $month,
    ]);
}
