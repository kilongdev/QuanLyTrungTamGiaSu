<?php
// Test kết nối database

require_once __DIR__ . '/app/core/Database.php';

echo "========================================\n";
echo "TEST KẾT NỐI DATABASE\n";
echo "========================================\n\n";

try {
    // Lấy kết nối qua Singleton
    $conn = Database::getInstance();
    
    if ($conn) {
        echo "✅ KẾT NỐI THÀNH CÔNG!\n\n";
        
        // Kiểm tra các bảng
        $stmt = $conn->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "📊 Các bảng trong database:\n";
        if (count($tables) > 0) {
            foreach ($tables as $table) {
                $tableName = reset($table);
                echo "  - " . $tableName . "\n";
            }
        } else {
            echo "  ⚠️  Chưa có bảng nào\n";
        }
        
        echo "\n✓ Database: " . getenv('DB_NAME') ?: 'quanlytrungtamgiasu' . "\n";
        echo "✓ Host: localhost\n";
        echo "✓ User: root\n";
        
    } else {
        echo "❌ KẾT NỐI THẤT BẠI!\n";
    }
    
} catch (Exception $e) {
    echo "❌ LỖI: " . $e->getMessage() . "\n";
}

echo "\n========================================\n";
?>
