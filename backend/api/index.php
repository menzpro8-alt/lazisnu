<?php
/**
 * API Router
 * LAZISNU Financial Application
 * 
 * Routes all API requests to appropriate handlers
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/controller.php';

// Get route and method
$route = isset($_GET['route']) ? trim($_GET['route'], '/') : '';
$method = $_SERVER['REQUEST_METHOD'];
$segments = explode('/', $route);
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;
$action = $segments[2] ?? null;

// Route to appropriate handler
switch ($resource) {
    case 'auth':
        require_once __DIR__ . '/auth.php';
        handleAuth($method, $id);
        break;
        
    case 'organizations':
        require_once __DIR__ . '/organizations.php';
        handleOrganizations($method, $id, $action);
        break;
    
    case 'users':
        require_once __DIR__ . '/users.php';
        handleUsers($method, $id);
        break;
    
    case 'donors':
        require_once __DIR__ . '/donors.php';
        handleDonors($method, $id);
        break;
    
    case 'beneficiaries':
        require_once __DIR__ . '/beneficiaries.php';
        handleBeneficiaries($method, $id);
        break;
    
    case 'income-categories':
        require_once __DIR__ . '/income-categories.php';
        handleIncomeCategories($method, $id);
        break;
    
    case 'expense-categories':
        require_once __DIR__ . '/expense-categories.php';
        handleExpenseCategories($method, $id);
        break;
    
    case 'incomes':
        require_once __DIR__ . '/incomes.php';
        handleIncomes($method, $id);
        break;
    
    case 'expenses':
        require_once __DIR__ . '/expenses.php';
        handleExpenses($method, $id);
        break;
    
    case 'reports':
        require_once __DIR__ . '/reports.php';
        handleReports($method, $id);
        break;
    
    case 'dashboard':
        require_once __DIR__ . '/dashboard.php';
        handleDashboard($method);
        break;
    
    case 'ai':
        require_once __DIR__ . '/ai.php';
        handleAI($method);
        break;
    
    default:
        errorResponse('Endpoint tidak ditemukan', 404);
}
