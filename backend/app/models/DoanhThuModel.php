<?php
require_once __DIR__ . '/base.php';

class DoanhThuModel extends BaseModel {
    protected $table = 'doanh_thu_thang';
    protected $primaryKey = 'doanh_thu_id';

    public function getBaoCaoNam($nam) {
        $sql = "SELECT * FROM {$this->table} WHERE nam = ? ORDER BY thang ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$nam]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function taoBaoCaoThang($data) {
        $sql = "INSERT INTO {$this->table} (thang, nam, tong_thu_hoc_phi, tong_tra_gia_su, loi_nhuan, so_luong_lop, so_luong_hoc_sinh, ngay_cap_nhat) 
                VALUES (:thang, :nam, :thu, :chi, :loi_nhuan, :so_lop, :so_hs, NOW())";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':thang' => $data['thang'],
            ':nam' => $data['nam'],
            ':thu' => $data['tong_thu_hoc_phi'],
            ':chi' => $data['tong_tra_gia_su'],
            ':loi_nhuan' => $data['loi_nhuan'],
            ':so_lop' => $data['so_luong_lop'],
            ':so_hs' => $data['so_luong_hoc_sinh']
        ]);
        return $this->conn->lastInsertId();
    }

    public function themChiTietLop($data) {
        $sql = "INSERT INTO chi_tiet_doanh_thu_lop (lop_hoc_id, doanh_thu_id, thang, nam, so_hoc_sinh, so_buoi_hoc, tong_thu, tien_tra_gia_su, loi_nhuan_lop, ngay_tao) 
                VALUES (:lop_id, :dt_id, :thang, :nam, :so_hs, :so_buoi, :thu, :chi, :loi_nhuan, NOW())";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':lop_id' => $data['lop_hoc_id'],
            ':dt_id' => $data['doanh_thu_id'],
            ':thang' => $data['thang'],
            ':nam' => $data['nam'],
            ':so_hs' => $data['so_hoc_sinh'],
            ':so_buoi' => $data['so_buoi_hoc'],
            ':thu' => $data['tong_thu'],
            ':chi' => $data['tien_tra_gia_su'],
            ':loi_nhuan' => $data['loi_nhuan_lop']
        ]);
    }

    public function getChiTietByDoanhThuId($doanhThuId) {
        $sql = "SELECT ct.*, lh.ten_lop, mh.ten_mon_hoc
                FROM chi_tiet_doanh_thu_lop ct
                LEFT JOIN lop_hoc lh ON ct.lop_hoc_id = lh.lop_hoc_id
                LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                WHERE ct.doanh_thu_id = ?
                ORDER BY ct.loi_nhuan_lop DESC, ct.tong_thu DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$doanhThuId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getLatestYearWithData() {
        $sql = "SELECT MAX(nam) AS nam FROM {$this->table}";
        $stmt = $this->conn->query($sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return !empty($row['nam']) ? (int)$row['nam'] : null;
    }

    private function buildFilterWhere(array $filter, array &$params, $alias = '') {
        $prefix = $alias !== '' ? $alias . '.' : '';
        $mode = $filter['mode'] ?? 'year';
        $conditions = [];

        if ($mode === 'month') {
            $conditions[] = "{$prefix}nam = ?";
            $conditions[] = "{$prefix}thang = ?";
            $params[] = (int)($filter['year'] ?? date('Y'));
            $params[] = (int)($filter['month'] ?? date('n'));
        } elseif ($mode === 'range') {
            $conditions[] = "({$prefix}nam * 100 + {$prefix}thang) >= ?";
            $conditions[] = "({$prefix}nam * 100 + {$prefix}thang) <= ?";
            $params[] = (int)($filter['fromYm'] ?? 0);
            $params[] = (int)($filter['toYm'] ?? 0);
        } else {
            $conditions[] = "{$prefix}nam = ?";
            $params[] = (int)($filter['year'] ?? date('Y'));
        }

        return 'WHERE ' . implode(' AND ', $conditions);
    }

    private function monthLabel($thang, $nam, $mode) {
        if ($mode === 'year') {
            return 'T' . (int)$thang;
        }
        return 'T' . (int)$thang . '/' . (int)$nam;
    }

    public function getMonthlyTrendByFilter(array $filter) {
        $params = [];
        $mode = $filter['mode'] ?? 'year';
        $whereSql = $this->buildFilterWhere($filter, $params);

        $sql = "SELECT thang, nam, tong_thu_hoc_phi, tong_tra_gia_su, loi_nhuan, so_luong_lop, so_luong_hoc_sinh
                FROM {$this->table}
                {$whereSql}
                ORDER BY nam ASC, thang ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($mode !== 'year') {
            $result = [];
            foreach ($rows as $row) {
                $result[] = [
                    'month' => $this->monthLabel($row['thang'], $row['nam'], $mode),
                    'monthNumber' => (int)$row['thang'],
                    'year' => (int)$row['nam'],
                    'revenue' => (float)($row['tong_thu_hoc_phi'] ?? 0),
                    'expense' => (float)($row['tong_tra_gia_su'] ?? 0),
                    'profit' => (float)($row['loi_nhuan'] ?? 0),
                    'students' => (int)($row['so_luong_hoc_sinh'] ?? 0),
                    'classes' => (int)($row['so_luong_lop'] ?? 0)
                ];
            }
            return $result;
        }

        $indexed = [];
        foreach ($rows as $row) {
            $indexed[(int)$row['thang']] = $row;
        }

        $result = [];
        for ($m = 1; $m <= 12; $m++) {
            $item = $indexed[$m] ?? null;
            $result[] = [
                'month' => 'T' . $m,
                'monthNumber' => $m,
                'year' => (int)($filter['year'] ?? date('Y')),
                'revenue' => (float)($item['tong_thu_hoc_phi'] ?? 0),
                'expense' => (float)($item['tong_tra_gia_su'] ?? 0),
                'profit' => (float)($item['loi_nhuan'] ?? 0),
                'students' => (int)($item['so_luong_hoc_sinh'] ?? 0),
                'classes' => (int)($item['so_luong_lop'] ?? 0)
            ];
        }

        return $result;
    }

    public function getSummaryByFilter(array $filter) {
        $params = [];
        $whereSql = $this->buildFilterWhere($filter, $params);

        $sql = "SELECT 
                    COALESCE(SUM(tong_thu_hoc_phi), 0) AS tong_thu_hoc_phi,
                    COALESCE(SUM(tong_tra_gia_su), 0) AS tong_tra_gia_su,
                    COALESCE(SUM(loi_nhuan), 0) AS loi_nhuan,
                    COALESCE(SUM(so_luong_lop), 0) AS tong_luot_lop,
                    COALESCE(SUM(so_luong_hoc_sinh), 0) AS tong_luot_hoc_sinh,
                    COUNT(*) AS so_thang_co_du_lieu
                FROM {$this->table}
                {$whereSql}";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function getClassRevenueDetailsByFilter(array $filter, $limit = 8) {
        $params = [];
        $whereSql = $this->buildFilterWhere($filter, $params, 'ct');

        $sql = "SELECT 
                    ct.lop_hoc_id,
                    COALESCE(lh.ten_lop, CONCAT('Lớp #', ct.lop_hoc_id)) AS ten_lop,
                    mh.ten_mon_hoc,
                    SUM(ct.so_hoc_sinh) AS so_hoc_sinh,
                    SUM(ct.so_buoi_hoc) AS so_buoi_hoc,
                    SUM(ct.tong_thu) AS tong_thu,
                    SUM(ct.tien_tra_gia_su) AS tong_chi,
                    SUM(ct.loi_nhuan_lop) AS loi_nhuan
                FROM chi_tiet_doanh_thu_lop ct
                LEFT JOIN lop_hoc lh ON ct.lop_hoc_id = lh.lop_hoc_id
                LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                {$whereSql}
                GROUP BY ct.lop_hoc_id, lh.ten_lop, mh.ten_mon_hoc
                ORDER BY loi_nhuan DESC, tong_thu DESC
                LIMIT ?";
        $stmt = $this->conn->prepare($sql);
        $paramIndex = 1;
        foreach ($params as $param) {
            $stmt->bindValue($paramIndex, (int)$param, PDO::PARAM_INT);
            $paramIndex++;
        }
        $stmt->bindValue($paramIndex, (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSubjectRevenueDistributionByFilter(array $filter) {
        $params = [];
        $whereSql = $this->buildFilterWhere($filter, $params, 'ct');

        $sql = "SELECT 
                    COALESCE(mh.ten_mon_hoc, 'Khác') AS subject,
                    SUM(ct.tong_thu) AS revenue,
                    SUM(ct.loi_nhuan_lop) AS profit
                FROM chi_tiet_doanh_thu_lop ct
                LEFT JOIN lop_hoc lh ON ct.lop_hoc_id = lh.lop_hoc_id
                LEFT JOIN mon_hoc mh ON lh.mon_hoc_id = mh.mon_hoc_id
                {$whereSql}
                GROUP BY COALESCE(mh.ten_mon_hoc, 'Khác')
                ORDER BY revenue DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute(array_map('intval', $params));
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getOrCreateMonthlyRevenueId($thang, $nam) {
        $thang = (int)$thang;
        $nam = (int)$nam;

        $existing = $this->conn->prepare("SELECT doanh_thu_id FROM {$this->table} WHERE thang = ? AND nam = ? LIMIT 1");
        $existing->execute([$thang, $nam]);
        $row = $existing->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            return (int)$row['doanh_thu_id'];
        }

        $insert = $this->conn->prepare(
            "INSERT INTO {$this->table}
             (thang, nam, tong_thu_hoc_phi, tong_tra_gia_su, loi_nhuan, so_luong_lop, so_luong_hoc_sinh, ngay_cap_nhat)
             VALUES (?, ?, 0, 0, 0, 0, 0, NOW())"
        );
        $insert->execute([$thang, $nam]);

        return (int)$this->conn->lastInsertId();
    }

    public function refreshMonthlyRevenueSummaryFromClassDetails($thang, $nam) {
        $thang = (int)$thang;
        $nam = (int)$nam;

        $doanhThuId = $this->getOrCreateMonthlyRevenueId($thang, $nam);

        $summaryStmt = $this->conn->prepare(
            "SELECT
                COALESCE(SUM(tong_thu), 0) AS tong_thu,
                COALESCE(SUM(tien_tra_gia_su), 0) AS tong_chi,
                COALESCE(SUM(loi_nhuan_lop), 0) AS loi_nhuan,
                COUNT(*) AS so_lop,
                COALESCE(SUM(so_hoc_sinh), 0) AS tong_hoc_sinh
             FROM chi_tiet_doanh_thu_lop
             WHERE thang = ? AND nam = ?"
        );
        $summaryStmt->execute([$thang, $nam]);
        $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $update = $this->conn->prepare(
            "UPDATE {$this->table}
             SET tong_thu_hoc_phi = ?, tong_tra_gia_su = ?, loi_nhuan = ?,
                 so_luong_lop = ?, so_luong_hoc_sinh = ?, ngay_cap_nhat = NOW()
             WHERE doanh_thu_id = ?"
        );
        $update->execute([
            (float)($summary['tong_thu'] ?? 0),
            (float)($summary['tong_chi'] ?? 0),
            (float)($summary['loi_nhuan'] ?? 0),
            (int)($summary['so_lop'] ?? 0),
            (int)($summary['tong_hoc_sinh'] ?? 0),
            $doanhThuId
        ]);

        return [
            'doanh_thu_id' => $doanhThuId,
            'thang' => $thang,
            'nam' => $nam,
            'tong_thu_hoc_phi' => (float)($summary['tong_thu'] ?? 0),
            'tong_tra_gia_su' => (float)($summary['tong_chi'] ?? 0),
            'loi_nhuan' => (float)($summary['loi_nhuan'] ?? 0),
            'so_luong_lop' => (int)($summary['so_lop'] ?? 0),
            'so_luong_hoc_sinh' => (int)($summary['tong_hoc_sinh'] ?? 0),
        ];
    }

    public function syncClassRevenueFromAttendance($lopHocId, $thang, $nam, $refreshMonthly = true) {
        $lopHocId = (int)$lopHocId;
        $thang = (int)$thang;
        $nam = (int)$nam;

        $lopHoc = $this->conn->prepare(
            "SELECT lop_hoc_id, gia_su_id, gia_moi_buoi, so_buoi_hoc, loai_chi_tra, gia_tri_chi_tra
             FROM lop_hoc
             WHERE lop_hoc_id = ?
             LIMIT 1"
        );
        $lopHoc->execute([$lopHocId]);
        $lopInfo = $lopHoc->fetch(PDO::FETCH_ASSOC);
        if (!$lopInfo) {
            return null;
        }

        $soHocSinhStmt = $this->conn->prepare(
            "SELECT COUNT(DISTINCT hoc_sinh_id) AS so_hoc_sinh
             FROM dang_ky_lop
             WHERE lop_hoc_id = ? AND trang_thai = 'da_duyet'"
        );
        $soHocSinhStmt->execute([$lopHocId]);
        $soHocSinh = (int)(($soHocSinhStmt->fetch(PDO::FETCH_ASSOC) ?: [])['so_hoc_sinh'] ?? 0);

        $soBuoiHocStmt = $this->conn->prepare(
            "SELECT COUNT(DISTINCT lich_hoc_id) AS so_buoi_hoc
             FROM lich_hoc
             WHERE lop_hoc_id = ?
               AND MONTH(ngay_hoc) = ?
               AND YEAR(ngay_hoc) = ?
               AND trang_thai = 'da_hoc'"
        );
        $soBuoiHocStmt->execute([$lopHocId, $thang, $nam]);
        $soBuoiHocThucTe = (int)(($soBuoiHocStmt->fetch(PDO::FETCH_ASSOC) ?: [])['so_buoi_hoc'] ?? 0);

        $coMatStmt = $this->conn->prepare(
            "SELECT COUNT(*) AS so_luot_co_mat
             FROM diem_danh dd
             JOIN lich_hoc lh ON lh.lich_hoc_id = dd.lich_hoc_id
             WHERE lh.lop_hoc_id = ?
               AND MONTH(lh.ngay_hoc) = ?
               AND YEAR(lh.ngay_hoc) = ?
               AND dd.tinh_trang = 'co_mat'"
        );
        $coMatStmt->execute([$lopHocId, $thang, $nam]);
        $soLuotCoMat = (int)(($coMatStmt->fetch(PDO::FETCH_ASSOC) ?: [])['so_luot_co_mat'] ?? 0);

        $giaMoiBuoi = (float)($lopInfo['gia_moi_buoi'] ?? 0);
        $soBuoiHocCauHinh = (int)($lopInfo['so_buoi_hoc'] ?? 0);
        $loaiChiTra = $lopInfo['loai_chi_tra'] ?? 'tien_cu_the';
        $giaTriChiTra = (float)($lopInfo['gia_tri_chi_tra'] ?? 0);

        // Don gia tra gia su tren moi hoc sinh/co mat mot buoi.
        if ($loaiChiTra === 'phan_tram') {
            $donGiaGiaSuMoiBuoi = $giaMoiBuoi * ($giaTriChiTra / 100);
        } else {
            $mauSo = $soBuoiHocCauHinh > 0 ? $soBuoiHocCauHinh : 1;
            $donGiaGiaSuMoiBuoi = $giaTriChiTra / $mauSo;
        }

        $tongThu = $soLuotCoMat * $giaMoiBuoi;
        $tongChi = $soLuotCoMat * $donGiaGiaSuMoiBuoi;
        $loiNhuan = $tongThu - $tongChi;

        $doanhThuId = $this->getOrCreateMonthlyRevenueId($thang, $nam);

        $ctExistsStmt = $this->conn->prepare(
            "SELECT chi_tiet_id
             FROM chi_tiet_doanh_thu_lop
             WHERE lop_hoc_id = ? AND thang = ? AND nam = ?
             LIMIT 1"
        );
        $ctExistsStmt->execute([$lopHocId, $thang, $nam]);
        $ctExists = $ctExistsStmt->fetch(PDO::FETCH_ASSOC);

        if ($ctExists) {
            $updateCt = $this->conn->prepare(
                "UPDATE chi_tiet_doanh_thu_lop
                 SET doanh_thu_id = ?, so_hoc_sinh = ?, so_buoi_hoc = ?,
                     tong_thu = ?, tien_tra_gia_su = ?, loi_nhuan_lop = ?
                 WHERE chi_tiet_id = ?"
            );
            $updateCt->execute([
                $doanhThuId,
                $soHocSinh,
                $soBuoiHocThucTe,
                $tongThu,
                $tongChi,
                $loiNhuan,
                (int)$ctExists['chi_tiet_id']
            ]);
        } else {
            $insertCt = $this->conn->prepare(
                "INSERT INTO chi_tiet_doanh_thu_lop
                 (lop_hoc_id, doanh_thu_id, thang, nam, so_hoc_sinh, so_buoi_hoc, tong_thu, tien_tra_gia_su, loi_nhuan_lop, ngay_tao)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())"
            );
            $insertCt->execute([
                $lopHocId,
                $doanhThuId,
                $thang,
                $nam,
                $soHocSinh,
                $soBuoiHocThucTe,
                $tongThu,
                $tongChi,
                $loiNhuan
            ]);
        }

        if (!empty($lopInfo['gia_su_id'])) {
            $luongExistsStmt = $this->conn->prepare(
                "SELECT luong_id
                 FROM luong_gia_su
                 WHERE lop_hoc_id = ? AND thang = ? AND nam = ?
                 LIMIT 1"
            );
            $luongExistsStmt->execute([$lopHocId, $thang, $nam]);
            $luongExists = $luongExistsStmt->fetch(PDO::FETCH_ASSOC);

            if ($luongExists) {
                $updateLuong = $this->conn->prepare(
                    "UPDATE luong_gia_su
                     SET so_buoi_day = ?, tong_tien_thu = ?, tien_tra_gia_su = ?,
                         loai_chi_tra = ?, gia_tri_ap_dung = ?
                     WHERE luong_id = ?"
                );
                $updateLuong->execute([
                    $soLuotCoMat,
                    $tongThu,
                    $tongChi,
                    $loaiChiTra,
                    $giaTriChiTra,
                    (int)$luongExists['luong_id']
                ]);
            } else {
                $insertLuong = $this->conn->prepare(
                    "INSERT INTO luong_gia_su
                     (gia_su_id, lop_hoc_id, thang, nam, so_buoi_day, tong_tien_thu, tien_tra_gia_su, loai_chi_tra, gia_tri_ap_dung, trang_thai_thanh_toan, ngay_tao)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'chua_thanh_toan', NOW())"
                );
                $insertLuong->execute([
                    (int)$lopInfo['gia_su_id'],
                    $lopHocId,
                    $thang,
                    $nam,
                    $soLuotCoMat,
                    $tongThu,
                    $tongChi,
                    $loaiChiTra,
                    $giaTriChiTra
                ]);
            }
        }

        if ($refreshMonthly) {
            $this->refreshMonthlyRevenueSummaryFromClassDetails($thang, $nam);
        }

        return [
            'lop_hoc_id' => $lopHocId,
            'thang' => $thang,
            'nam' => $nam,
            'so_hoc_sinh' => $soHocSinh,
            'so_buoi_hoc' => $soBuoiHocThucTe,
            'so_luot_co_mat' => $soLuotCoMat,
            'tong_thu' => $tongThu,
            'tien_tra_gia_su' => $tongChi,
            'loi_nhuan_lop' => $loiNhuan
        ];
    }

    public function processMonthlyRevenue($thang, $nam) {
        $thang = (int)$thang;
        $nam = (int)$nam;

        $classStmt = $this->conn->prepare(
            "SELECT DISTINCT lop_hoc_id
             FROM lich_hoc
             WHERE MONTH(ngay_hoc) = ? AND YEAR(ngay_hoc) = ?"
        );
        $classStmt->execute([$thang, $nam]);
        $classRows = $classStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($classRows as $classRow) {
            $this->syncClassRevenueFromAttendance((int)$classRow['lop_hoc_id'], $thang, $nam, false);
        }

        return $this->refreshMonthlyRevenueSummaryFromClassDetails($thang, $nam);
    }
}
?>
