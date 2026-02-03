<?php

declare(strict_types=1);

final class Admin extends Model
{
    protected function table(): string
    {
        return 'admin';
    }

    protected function primaryKey(): string
    {
        return 'admin_id';
    }

    protected function fillable(): array
    {
        return [
            'ho_ten',
            'email',
            'mat_khau',
            'so_dien_thoai',
        ];
    }
}
