<?php
require_once __DIR__ . '/base.php';

class ThongBaoModel extends BaseModel {
    protected $table = 'thong_bao';
    protected $primaryKey = 'thong_bao_id';

    public function create($data) {
        $sql = "INSERT INTO {$this->table} (nguoi_gui_id, loai_nguoi_gui, nguoi_nhan_id, loai_nguoi_nhan, loai_thong_bao, tieu_de, noi_dung, da_doc, ngay_tao) 
                VALUES (:gui_id, :loai_gui, :nhan_id, :loai_nhan, :loai_tb, :tieu_de, :noi_dung, 0, NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':gui_id' => $data['nguoi_gui_id'],
            ':loai_gui' => $data['loai_nguoi_gui'],
            ':nhan_id' => $data['nguoi_nhan_id'],
            ':loai_nhan' => $data['loai_nguoi_nhan'],
            ':loai_tb' => $data['loai_thong_bao'] ?? 'he_thong',
            ':tieu_de' => $data['tieu_de'],
            ':noi_dung' => $data['noi_dung']
        ]);
        return $this->conn->lastInsertId();
    }

    public function getByReceiver($userId, $userType) {
        $sql = "SELECT * FROM {$this->table} WHERE nguoi_nhan_id = ? AND loai_nguoi_nhan = ? ORDER BY ngay_tao DESC";
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