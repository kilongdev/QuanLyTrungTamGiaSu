<?php
require_once __DIR__ . '/base.php';

class ThongBaoModel extends BaseModel {
    protected $table = 'thong_bao';
    protected $primaryKey = 'thong_bao_id';

    private static function normalizeLoaiNguoiGui($loaiNguoiGui) {
        $allowed = ['admin', 'gia_su', 'phu_huynh'];
        return in_array($loaiNguoiGui, $allowed, true) ? $loaiNguoiGui : null;
    }

    private static function normalizeLoaiThongBao($loaiThongBao) {
        $allowed = ['he_thong', 'lop_hoc', 'thanh_toan', 'hoc_phi', 'yeu_cau', 'danh_gia', 'khac'];

        if (in_array($loaiThongBao, $allowed, true)) {
            return $loaiThongBao;
        }

        $map = [
            'lich_hoc' => 'lop_hoc',
            'tin_nhan' => 'he_thong'
        ];

        return $map[$loaiThongBao] ?? 'khac';
    }

    /**
     * Gửi thông báo - helper method static để gọi từ controller khác
     */
    public static function guiThongBao($nguoiNhanId, $loaiNguoiNhan, $tieuDe, $noiDung, $loaiThongBao = 'he_thong', $nguoiGuiId = 0, $loaiNguoiGui = 'system') {
        $model = new self();
        return $model->create([
            'nguoi_gui_id' => $nguoiGuiId > 0 ? $nguoiGuiId : null,
            'loai_nguoi_gui' => self::normalizeLoaiNguoiGui($loaiNguoiGui),
            'nguoi_nhan_id' => $nguoiNhanId,
            'loai_nguoi_nhan' => $loaiNguoiNhan,
            'loai_thong_bao' => self::normalizeLoaiThongBao($loaiThongBao),
            'tieu_de' => $tieuDe,
            'noi_dung' => $noiDung
        ]);
    }

    public function create($data) {
        $sql = "INSERT INTO {$this->table} (nguoi_gui_id, loai_nguoi_gui, nguoi_nhan_id, loai_nguoi_nhan, loai_thong_bao, tieu_de, noi_dung, da_doc, ngay_tao) 
                VALUES (:gui_id, :loai_gui, :nhan_id, :loai_nhan, :loai_tb, :tieu_de, :noi_dung, 0, NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':gui_id' => $data['nguoi_gui_id'] ?? null,
            ':loai_gui' => self::normalizeLoaiNguoiGui($data['loai_nguoi_gui'] ?? null),
            ':nhan_id' => $data['nguoi_nhan_id'],
            ':loai_nhan' => $data['loai_nguoi_nhan'],
            ':loai_tb' => self::normalizeLoaiThongBao($data['loai_thong_bao'] ?? 'he_thong'),
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

    public function markAllAsRead($userId, $userType) {
        $sql = "UPDATE {$this->table} SET da_doc = 1 WHERE nguoi_nhan_id = ? AND loai_nguoi_nhan = ? AND da_doc = 0";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$userId, $userType]);
    }
}
?>