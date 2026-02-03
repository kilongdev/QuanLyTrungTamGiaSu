<?php

declare(strict_types=1);

abstract class Model
{
    protected \PDO $db;

    public function __construct()
    {
        $this->db = Database::pdo();
    }

    abstract protected function table(): string;

    abstract protected function primaryKey(): string;

    abstract protected function fillable(): array;

    public function all(): array
    {
        $sql = 'SELECT * FROM `' . $this->table() . '` ORDER BY `' . $this->primaryKey() . '` DESC';
        return $this->db->query($sql)->fetchAll();
    }

    public function find(int $id): ?array
    {
        $sql = 'SELECT * FROM `' . $this->table() . '` WHERE `' . $this->primaryKey() . '` = :id LIMIT 1';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public function create(array $data): int
    {
        $filtered = $this->onlyFillable($data);
        $pk = $this->primaryKey();
        if (array_key_exists($pk, $data) && $data[$pk] !== null && $data[$pk] !== '') {
            if (!is_numeric($data[$pk])) {
                throw new \InvalidArgumentException('Invalid primary key');
            }
            $filtered[$pk] = (int)$data[$pk];
        }

        if (count($filtered) === 0) {
            throw new \InvalidArgumentException('No valid fields');
        }

        $columns = array_keys($filtered);
        $placeholders = array_map(fn($c) => ':' . $c, $columns);

        $sql = 'INSERT INTO `' . $this->table() . '` ('
            . implode(', ', array_map(fn($c) => '`' . $c . '`', $columns))
            . ') VALUES ('
            . implode(', ', $placeholders)
            . ')';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($filtered);

        if (isset($filtered[$pk])) {
            return (int)$filtered[$pk];
        }

        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $filtered = $this->onlyFillable($data);
        if (count($filtered) === 0) {
            throw new \InvalidArgumentException('No valid fields');
        }

        $sets = [];
        foreach (array_keys($filtered) as $col) {
            $sets[] = '`' . $col . '` = :' . $col;
        }

        $sql = 'UPDATE `' . $this->table() . '` SET ' . implode(', ', $sets)
            . ' WHERE `' . $this->primaryKey() . '` = :id';

        $filtered['id'] = $id;
        $stmt = $this->db->prepare($sql);
        $stmt->execute($filtered);

        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        $sql = 'DELETE FROM `' . $this->table() . '` WHERE `' . $this->primaryKey() . '` = :id';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }

    protected function onlyFillable(array $data): array
    {
        $allowed = array_flip($this->fillable());
        $filtered = [];
        foreach ($data as $k => $v) {
            if (isset($allowed[$k])) {
                $filtered[$k] = $v;
            }
        }
        return $filtered;
    }
}
