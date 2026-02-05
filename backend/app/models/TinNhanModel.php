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
                WHERE (nguoi_gui_id = :u1_id AND loai_nguoi_gui = :u1_type AND nguoi_nhan_id = :u2_id AND loai_nguoi_nhan = :u2_type)
                   OR (nguoi_gui_id = :u2_id AND loai_nguoi_gui = :u2_type AND nguoi_nhan_id = :u1_id AND loai_nguoi_nhan = :u1_type)
                ORDER BY ngay_gui ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':u1_id' => $u1Id, ':u1_type' => $u1Type,
            ':u2_id' => $u2Id, ':u2_type' => $u2Type
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
