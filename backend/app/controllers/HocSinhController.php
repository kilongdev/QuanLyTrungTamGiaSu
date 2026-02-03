<?php

declare(strict_types=1);

final class HocSinhController extends BaseController
{
    private HocSinh $model;

    public function __construct()
    {
        $this->model = new HocSinh();
    }

    public function index(): void
    {
        $this->json(['success' => true, 'data' => $this->model->all()]);
    }

    public function show(int $id): void
    {
        $row = $this->model->find($id);
        if ($row === null) {
            $this->notFound('Học sinh không tồn tại');
            return;
        }

        $this->json(['success' => true, 'data' => $row]);
    }

    public function store(): void
    {
        $data = $this->inputJson();
        $missing = $this->requireFields($data, ['phu_huynh_id', 'ho_ten']);
        if ($missing !== null) {
            $this->badRequest($missing);
            return;
        }

        try {
            $id = $this->model->create($data);
            $this->json(['success' => true, 'data' => $this->model->find($id)], 201);
        } catch (Throwable $e) {
            $this->serverError($e->getMessage());
        }
    }

    public function update(int $id): void
    {
        $data = $this->inputJson();
        if ($this->model->find($id) === null) {
            $this->notFound('Học sinh không tồn tại');
            return;
        }

        try {
            $this->model->update($id, $data);
            $this->json(['success' => true, 'data' => $this->model->find($id)]);
        } catch (Throwable $e) {
            $this->serverError($e->getMessage());
        }
    }

    public function destroy(int $id): void
    {
        if ($this->model->find($id) === null) {
            $this->notFound('Học sinh không tồn tại');
            return;
        }

        try {
            $this->model->delete($id);
            $this->json(['success' => true, 'message' => 'Đã xóa']);
        } catch (Throwable $e) {
            $this->serverError($e->getMessage());
        }
    }
}
