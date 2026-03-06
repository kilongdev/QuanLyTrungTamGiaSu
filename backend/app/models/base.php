<?php
require_once __DIR__ . '/../core/Database.php';

abstract class BaseModel {
    protected $conn;
    protected $table;
    protected $primaryKey = 'id';

    public function __construct() {
        $this->conn = Database::getInstance();
    }

    public function findAll() {
        $sql = "SELECT * FROM {$this->table}";
        return $this->conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function delete($id) {
        $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
}
