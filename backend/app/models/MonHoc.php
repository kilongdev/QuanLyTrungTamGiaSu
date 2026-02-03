<?php

declare(strict_types=1);

final class MonHoc extends Model
{
    protected function table(): string
    {
        return 'mon_hoc';
    }

    protected function primaryKey(): string
    {
        return 'mon_hoc_id';
    }

    protected function fillable(): array
    {
        return [
            'ten_mon_hoc',
            'mo_ta',
            'trang_thai',
        ];
    }
}
