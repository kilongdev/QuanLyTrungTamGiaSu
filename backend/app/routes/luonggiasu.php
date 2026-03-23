<?php
/**
 * Lương Gia Sư Routes
 * Quản lý lương gia sư
 */

Router::get('/luonggiasu', ['LuongGiaSuController', 'getAll']);
Router::get('/luonggiasu/chitiet/{id}', ['LuongGiaSuController', 'getDetail']);
Router::get('/luonggiasu/group/{gia_su_id}/{thang}/{nam}', ['LuongGiaSuController', 'getDetailByGroup']);
Router::get('/luonggiasu/giasu/{id}', ['LuongGiaSuController', 'getByGiaSu']);
Router::post('/luonggiasu/create', ['LuongGiaSuController', 'create']);
Router::put('/luonggiasu/update/{id}', ['LuongGiaSuController', 'update']);
Router::delete('/luonggiasu/delete/{id}', ['LuongGiaSuController', 'delete']);
