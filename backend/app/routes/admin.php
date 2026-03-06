<?php
require_once __DIR__ . '/../controllers/AdminController.php';

$router->post('/api/admin/login', function() {
    $controller = new AdminController();
    $controller->login();
});

$router->get('/api/admin', function() {
    $controller = new AdminController();
    $controller->getAll();
});

$router->get('/api/admin/{id}', function($id) {
    $controller = new AdminController();
    $controller->getById($id);
});

$router->post('/api/admin', function() {
    $controller = new AdminController();
    $controller->create();
});

$router->put('/api/admin/{id}', function($id) {
    $controller = new AdminController();
    $controller->update($id);
});

$router->delete('/api/admin/{id}', function($id) {
    $controller = new AdminController();
    $controller->delete($id);
});
?>
