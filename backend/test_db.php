<?php
/**
 * Test Database Connection
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/app/core/Database.php';

$response = [
    'success' => false,
    'message' => '',
    'data' => []
];

try {
    $conn = Database::getInstance();
    
    if ($conn) {
        $response['success'] = true;
        $response['message'] = '✅ Kết nối Database thành công từ thư mục app/core!';
        
        // Test query
        $stmt = $conn->query("SELECT 1 as test");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $response['data']['test_query'] = $result;
        
        // Check admin table
        $stmt = $conn->query("SHOW TABLES LIKE 'admin'");
        $tableExists = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($tableExists) {
            $response['data']['admin_table'] = 'Exists';
            
            // Count rows
            $stmt = $conn->query("SELECT COUNT(*) as total FROM admin");
            $count = $stmt->fetch(PDO::FETCH_ASSOC);
            $response['data']['admin_count'] = $count['total'];
        } else {
            $response['data']['admin_table'] = 'Not Found';
        }
    }
} catch (Exception $e) {
    $response['message'] = "❌ Lỗi: " . $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
