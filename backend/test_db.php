<?php
/**
 * Test Database Connection
 */

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/app/core/Database.php';

echo "Testing Database Connection...\n\n";

try {
    $conn = Database::getInstance();
    
    if ($conn) {
        echo "✅ Database connected!\n\n";
        
        // Test query
        $stmt = $conn->query("SELECT 1 as test");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "✅ Query works: " . json_encode($result) . "\n\n";
        
        // Check admin table
        $stmt = $conn->query("SHOW TABLES LIKE 'admin'");
        $tableExists = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($tableExists) {
            echo "✅ Table 'admin' exists!\n\n";
            
            // Count rows
            $stmt = $conn->query("SELECT COUNT(*) as total FROM admin");
            $count = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "📊 Total admin records: " . $count['total'] . "\n\n";
            
            // List admin columns
            $stmt = $conn->query("DESCRIBE admin");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "Columns in admin table:\n";
            foreach ($columns as $col) {
                echo "  - " . $col['Field'] . " (" . $col['Type'] . ")\n";
            }
        } else {
            echo "❌ Table 'admin' does NOT exist!\n";
            echo "Create it with:\n";
            echo "CREATE TABLE admin (\n";
            echo "  admin_id INT PRIMARY KEY AUTO_INCREMENT,\n";
            echo "  ho_ten VARCHAR(255),\n";
            echo "  email VARCHAR(255) UNIQUE NOT NULL,\n";
            echo "  mat_khau VARCHAR(255) NOT NULL,\n";
            echo "  so_dien_thoai VARCHAR(20),\n";
            echo "  ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP\n";
            echo ");\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
