<?php

class Database {
    private static $instance = null;
    private $host = 'localhost';
    private $db_name = 'quanlytrungtamgiasu';
    private $user = 'root';
    private $pass = '';
    private $conn;

    public function __construct() {
        $this->connect();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance->conn;
    }

    // Kết nối database
    private function connect() {
        $this->conn = null;

        try {
            $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->db_name . ';charset=utf8mb4';
            
            $this->conn = new PDO(
                $dsn,
                $this->user,
                $this->pass,
                [
                    PDO::ATTR_PERSISTENT => false,
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );

            return $this->conn;
        } catch (PDOException $e) {
            die("Kết nối database thất bại: " . $e->getMessage());
        }
    }

    // Lấy kết nối
    public function getConnection() {
        return $this->conn;
    }

    // Thực thi query
    public function query($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            die("Lỗi Query: " . $e->getMessage());
        }
    }

    // Lấy tất cả kết quả
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    // Lấy 1 kết quả
    public function fetch($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    // Insert và trả về ID
    public function insert($table, $data) {
        $columns = implode(',', array_keys($data));
        $placeholders = implode(',', array_fill(0, count($data), '?'));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $this->query($sql, array_values($data));
        
        return $this->conn->lastInsertId();
    }

    // Update
    public function update($table, $data, $where = '', $whereParams = []) {
        $set = implode(',', array_map(fn($k) => "{$k}=?", array_keys($data)));
        $sql = "UPDATE {$table} SET {$set}";
        
        if ($where) {
            $sql .= " WHERE {$where}";
        }
        
        $params = array_merge(array_values($data), $whereParams);
        return $this->query($sql, $params);
    }

    // Delete
    public function delete($table, $where = '', $whereParams = []) {
        $sql = "DELETE FROM {$table}";
        
        if ($where) {
            $sql .= " WHERE {$where}";
        }
        
        return $this->query($sql, $whereParams);
    }

    // Count
    public function count($table, $where = '', $whereParams = []) {
        $sql = "SELECT COUNT(*) as total FROM {$table}";
        
        if ($where) {
            $sql .= " WHERE {$where}";
        }
        
        $stmt = $this->query($sql, $whereParams);
        $result = $stmt->fetch();
        return intval($result['total']);
    }

    
}
?>
