<?php
require_once __DIR__ . '/base.php';

class TinNhanModel extends BaseModel {
    protected $table = 'tin_nhan';
    protected $primaryKey = 'tin_nhan_id';

    public function create($data) {
        $sql = "INSERT INTO {$this->table} (nguoi_gui_id, loai_nguoi_gui, nguoi_nhan_id, loai_nguoi_nhan, noi_dung, da_doc, ngay_gui) 
                VALUES (:gui_id, :loai_gui, :nhan_id, :loai_nhan, :noi_dung, 0, NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':gui_id' => $data['nguoi_gui_id'],
            ':loai_gui' => $data['loai_nguoi_gui'],
            ':nhan_id' => $data['nguoi_nhan_id'],
            ':loai_nhan' => $data['loai_nguoi_nhan'],
            ':noi_dung' => $data['noi_dung']
        ]);
        return $this->conn->lastInsertId();
    }

    public function getConversation($u1Id, $u1Type, $u2Id, $u2Type) {
        // Lấy tin nhắn 2 chiều giữa User 1 và User 2
        $sql = "SELECT * FROM {$this->table} 
                WHERE (nguoi_gui_id = ? AND loai_nguoi_gui = ? AND nguoi_nhan_id = ? AND loai_nguoi_nhan = ?)
                   OR (nguoi_gui_id = ? AND loai_nguoi_gui = ? AND nguoi_nhan_id = ? AND loai_nguoi_nhan = ?)
                ORDER BY ngay_gui ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            $u1Id, $u1Type, $u2Id, $u2Type,
            $u2Id, $u2Type, $u1Id, $u1Type
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMessagesByReceiver($userId, $userType) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE nguoi_nhan_id = ? AND loai_nguoi_nhan = ? 
                ORDER BY ngay_gui DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId, $userType]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMessagesBySender($userId, $userType) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE nguoi_gui_id = ? AND loai_nguoi_gui = ? 
                ORDER BY ngay_gui DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId, $userType]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsRead($id) {
        $sql = "UPDATE {$this->table} SET da_doc = 1 WHERE {$this->primaryKey} = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
}
?>
