<?php
/**
 * Tin Nhắn Routes
 * Quản lý tin nhắn
 */

require_once __DIR__ . '/../controllers/TinNhanController.php';

Router::get('/tinnhan', ['TinNhanController', 'getConversation']);
Router::get('/tinnhan/den', ['TinNhanController', 'getIncoming']);
Router::post('/tinnhan/create', ['TinNhanController', 'send']);
Router::put('/tinnhan/read/{id}', ['TinNhanController', 'markRead']);
Router::delete('/tinnhan/delete/{id}', ['TinNhanController', 'delete']);
