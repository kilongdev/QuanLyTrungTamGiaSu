<?php

declare(strict_types=1);

abstract class BaseController
{
    protected function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    protected function inputJson(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            return [];
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    protected function requireFields(array $data, array $fields): ?string
    {
        $missing = [];
        foreach ($fields as $f) {
            if (!array_key_exists($f, $data) || $data[$f] === null || $data[$f] === '') {
                $missing[] = $f;
            }
        }

        if (count($missing) === 0) {
            return null;
        }

        return 'Missing fields: ' . implode(', ', $missing);
    }

    protected function badRequest(string $message): void
    {
        $this->json(['success' => false, 'message' => $message], 400);
    }

    protected function notFound(string $message = 'Not found'): void
    {
        $this->json(['success' => false, 'message' => $message], 404);
    }

    protected function serverError(string $message): void
    {
        $this->json(['success' => false, 'message' => $message], 500);
    }
}
