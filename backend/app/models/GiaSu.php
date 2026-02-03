<?php

declare(strict_types=1);

final class GiaSu extends Model
{
    protected function table(): string
    {
        return 'gia_su';
    }

    protected function primaryKey(): string
    {
        return 'gia_su_id';
    }

    protected function fillable(): array
    {
        return [
            'ho_ten',
            'ngay_sinh',
            'gioi_tinh',
            'so_dien_thoai',
            'email',
            'mat_khau',
            'dia_chi',
            'anh_dai_dien',
            'bang_cap',
            'chung_chi',
            'gioi_thieu',
            'kinh_nghiem',
            'so_tai_khoan_ngan_hang',
            'diem_danh_gia_trung_binh',
            'trang_thai',
        ];
    }
}
