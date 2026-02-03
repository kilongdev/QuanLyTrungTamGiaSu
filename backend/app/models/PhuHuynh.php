<?php

declare(strict_types=1);

final class PhuHuynh extends Model
{
    protected function table(): string
    {
        return 'phu_huynh';
    }

    protected function primaryKey(): string
    {
        return 'phu_huynh_id';
    }

    protected function fillable(): array
    {
        return [
            'ho_ten',
            'so_dien_thoai',
            'email',
            'mat_khau',
            'dia_chi',
            'trang_thai',
        ];
    }
}
