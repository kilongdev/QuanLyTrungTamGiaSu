<?php

declare(strict_types=1);

final class HocSinh extends Model
{
    protected function table(): string
    {
        return 'hoc_sinh';
    }

    protected function primaryKey(): string
    {
        return 'hoc_sinh_id';
    }

    protected function fillable(): array
    {
        return [
            'phu_huynh_id',
            'ho_ten',
            'ngay_sinh',
            'khoi_lop',
        ];
    }
}
