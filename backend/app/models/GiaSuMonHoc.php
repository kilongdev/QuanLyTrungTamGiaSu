<?php

declare(strict_types=1);

final class GiaSuMonHoc extends Model
{
    protected function table(): string
    {
        return 'gia_su_mon_hoc';
    }

    protected function primaryKey(): string
    {
        return 'gia_su_mon_hoc_id';
    }

    protected function fillable(): array
    {
        return [
            'gia_su_id',
            'mon_hoc_id',
            'trinh_do',
            'kinh_nghiem_nam',
            'ghi_chu',
        ];
    }
}
