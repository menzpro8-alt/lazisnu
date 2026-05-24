<?php
require_once __DIR__ . '/../middleware/auth.php';

define('GROQ_API_KEY', getenv('GROQ_API_KEY') ?: '');
define('GEMINI_API_KEY', getenv('GEMINI_API_KEY') ?: '');
define('OPENROUTER_API_KEY', getenv('OPENROUTER_API_KEY') ?: '');

function handleAI($method) {
    if ($method !== 'POST') errorResponse('Method not allowed', 405);
    
    $user = authenticate();
    if ($user['role'] !== 'admin' || $user['org_level'] !== 'PP') {
        errorResponse('Unauthorized: AI features reserved for PP Admin', 403);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $userMessage = $input['message'] ?? '';
    $history = $input['history'] ?? [];
    $isTask = $input['isTask'] ?? false;

    if (empty($userMessage)) errorResponse('Message is required', 400);

    // 1. Fetch Context Data (Server-side fetching is more secure and efficient)
    $context = [];
    if ($isTask) {
        $context = fetchAIContext($user);
    }

    // 2. Determine which AI model to use
    // Professional approach: Backend controls the model logic with fallback
    try {
        if ($isTask) {
            // Try Gemini first for analytics, fall back to OpenRouter
            $reply = callGemini($userMessage, $history, $context);
            if (empty($reply) || strpos($reply, 'gangguan') !== false) {
                $reply = callOpenRouter($userMessage, $history, $context, 'gpt-4o-mini');
            }
        } else {
            // Try Groq first for chat, fall back to OpenRouter
            $reply = callGroq($userMessage, $history, $context);
            if (empty($reply) || strpos($reply, 'gangguan') !== false) {
                $reply = callOpenRouter($userMessage, $history, $context, 'claude-3.5-sonnet');
            }
        }
        
        successResponse(['reply' => $reply]);
    } catch (Exception $e) {
        errorResponse('AI Error: ' . $e->getMessage(), 500);
    }
}

function fetchAIContext($user) {
    $db = getDB();
    $orgIds = getAccessibleOrgIds($user);
    $ph = implode(',', array_fill(0, count($orgIds), '?'));
    
    // Summary Stats
    $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM incomes WHERE org_id IN ($ph)");
    $stmt->execute($orgIds);
    $totalIncome = $stmt->fetchColumn();
    
    $stmt = $db->prepare("SELECT COALESCE(SUM(amount),0) FROM expenses WHERE org_id IN ($ph)");
    $stmt->execute($orgIds);
    $totalExpense = $stmt->fetchColumn();
    
    // Recent Data
    $stmt = $db->prepare("SELECT type, amount, date, description FROM (
        (SELECT 'income' as type, amount, date, description, created_at FROM incomes WHERE org_id IN ($ph) ORDER BY created_at DESC LIMIT 5)
        UNION ALL
        (SELECT 'expense' as type, amount, date, description, created_at FROM expenses WHERE org_id IN ($ph) ORDER BY created_at DESC LIMIT 5)
    ) t ORDER BY created_at DESC LIMIT 10");
    $stmt->execute(array_merge($orgIds, $orgIds));
    $recent = $stmt->fetchAll();

    return [
        'stats' => [
            'total_income' => (float)$totalIncome,
            'total_expense' => (float)$totalExpense,
            'balance' => (float)($totalIncome - $totalExpense)
        ],
        'recent_transactions' => $recent,
        'user_info' => [
            'name' => $user['name'],
            'org' => $user['org_name'],
            'level' => $user['org_level']
        ]
    ];
}

function callGroq($message, $history, $context) {
    $systemPrompt = "Anda adalah Asisten AI LAZISNU yang cerdas dan profesional. ";
    if (!empty($context)) {
        $systemPrompt .= "KONTEKS DATA:\n" . json_encode($context);
    }

    $messages = [['role' => 'system', 'content' => $systemPrompt]];
    foreach ($history as $h) {
        $messages[] = ['role' => $h['role'], 'content' => $h['content']];
    }
    $messages[] = ['role' => 'user', 'content' => $message];

    $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => 'llama-3.3-70b-versatile',
        'messages' => $messages
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . GROQ_API_KEY
    ]);

    $response = curl_exec($ch);
    $data = json_decode($response, true);
    curl_close($ch);

    return $data['choices'][0]['message']['content'] ?? 'Maaf, Groq sedang gangguan.';
}

function callGemini($message, $history, $context) {
    $systemPrompt = "Anda adalah Ahli Analisis Data LAZISNU. Berikan analisis tajam dan ringkas. ";
    if (!empty($context)) {
        $systemPrompt .= "DATA REAL-TIME:\n" . json_encode($context);
    }

    $contents = [];
    foreach ($history as $h) {
        $contents[] = [
            'role' => $h['role'] === 'assistant' ? 'model' : 'user',
            'parts' => [['text' => $h['content']]]
        ];
    }
    $contents[] = ['role' => 'user', 'parts' => [['text' => $systemPrompt . "\n\nUser Question: " . $message]]];

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . GEMINI_API_KEY;
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['contents' => $contents]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    $data = json_decode($response, true);
    curl_close($ch);

    return $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Maaf, Gemini sedang gangguan.';
}

function callOpenRouter($message, $history, $context, $model = 'gpt-4o-mini') {
    $systemPrompt = "Anda adalah Asisten AI LAZISNU yang profesional dan membantu. ";
    if (!empty($context)) {
        $systemPrompt .= "KONTEKS DATA:\n" . json_encode($context);
    }

    $messages = [['role' => 'system', 'content' => $systemPrompt]];
    foreach ($history as $h) {
        $messages[] = ['role' => $h['role'], 'content' => $h['content']];
    }
    $messages[] = ['role' => 'user', 'content' => $message];

    $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => $model,
        'messages' => $messages,
        'temperature' => 0.7,
        'max_tokens' => 1500
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . OPENROUTER_API_KEY,
        'HTTP-Referer: https://lazisnu.local',
        'X-Title: LAZISNU'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        return 'Maaf, OpenRouter sedang gangguan.';
    }

    $data = json_decode($response, true);
    return $data['choices'][0]['message']['content'] ?? 'Maaf, OpenRouter sedang gangguan.';
}
