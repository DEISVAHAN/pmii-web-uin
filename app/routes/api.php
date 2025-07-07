<?php
// app/routes/api.php

// File ini mendefinisikan semua rute (endpoint) API untuk aplikasi Anda.
// Setiap rute akan mengarahkan permintaan HTTP ke metode tertentu di dalam Controller.

// Asumsi: Anda memiliki mekanisme untuk memuat Controller dan Middleware.
// Dalam framework nyata (seperti Laravel, Lumen, Slim), ini akan diatur
// oleh penyedia layanan atau file bootstrap framework.

// Contoh fungsi pembantu untuk mendefinisikan rute (ini bukan kode framework, hanya ilustrasi)
// Pastikan file app/core/Router.php Anda memiliki implementasi untuk fungsi-fungsi ini.
function get($route, $action) { /* ... */ }
function post($route, $action) { /* ... */ }
function put($route, $action) { /* ... */ }
function delete($route, $action) { /* ... */ }
function group($middleware, $callback) { /* ... */ } // Untuk mengelompokkan rute dengan middleware

// ===================================================================
// RUTE PUBLIK (TIDAK MEMERLUKAN LOGIN)
// ===================================================================

// --- Rute Data Publik ---
get('/api/homepage-sections', 'HomepageSectionController@index'); // DIPINDAHKAN: Ini harus publik
get('/api/announcements', 'AnnouncementController@index'); // DIPINDAHKAN: Ini harus publik
get('/api/social-media', 'SocialMediaLinkController@index'); // DIPINDAHKAN: Ini harus publik
get('/api/settings', 'SiteSettingsController@index'); // DIPINDAHKAN: Pengaturan situs publik (kontak, dll)
get('/api/rayons', 'RayonController@index'); // Mendapatkan daftar semua rayon
get('/api/rayons/{id}', 'RayonController@show'); // Mendapatkan detail rayon
get('/api/news', 'NewsArticleController@index'); // Mendapatkan daftar berita/artikel yang disetujui
get('/api/news/{id}', 'NewsArticleController@show'); // Mendapatkan detail berita/artikel
get('/api/activities', 'ActivityController@index'); // Mendapatkan daftar kegiatan yang disetujui
get('/api/activities/{id}', 'ActivityController@show'); // Mendapatkan detail kegiatan
get('/api/gallery', 'GalleryController@index'); // Mendapatkan daftar item galeri yang disetujui
get('/api/gallery/{id}', 'GalleryController@show'); // Mendapatkan detail item galeri
get('/api/digilib/categories', 'DigilibCategoryController@index'); // Mendapatkan semua kategori digilib
get('/api/digilib/items', 'DigilibItemController@index'); // Mendapatkan semua item digilib
get('/api/digilib/items/{id}', 'DigilibItemController@show'); // Mendapatkan detail item digilib
get('/api/digital-signatures/verify/{id}', 'DigitalSignatureController@verifyPublic'); // Memverifikasi TTD secara publik

// --- Rute Autentikasi (Publik) ---
post('/api/auth/login', 'AuthController@login');
post('/api/auth/register', 'AuthController@register');
post('/api/auth/forgot-password', 'AuthController@forgotPassword');
post('/api/auth/reset-password', 'AuthController@resetPassword');


// ===================================================================
// RUTE YANG DILINDUNGI (MEMERLUKAN LOGIN / PERAN TERTENTU)
// ===================================================================

// --- Rute Pengguna (Users) - Memerlukan peran komisariat ---
group(['middleware' => ['auth', 'role:komisariat']], function () {
    get('/api/users', 'UserController@index');
    post('/api/users', 'UserController@store');
    get('/api/users/{id}', 'UserController@show');
    put('/api/users/{id}', 'UserController@update');
    delete('/api/users/{id}', 'UserController@destroy');
    post('/api/users/{id}/reset-password', 'UserController@resetPassword');
});

// --- Rute Profil Kader (Kaders Profile) - Memerlukan login ---
group(['middleware' => ['auth']], function () {
    get('/api/kaders/profile/{user_id}', 'KaderProfileController@show');
    put('/api/kaders/profile/{user_id}', 'KaderProfileController@update');
});

// --- Rute Manajemen Rayon - Memerlukan peran komisariat atau rayon ---
group(['middleware' => ['auth', 'role:komisariat,rayon']], function () {
    put('/api/rayons/{id}', 'RayonController@update');
});

// --- Rute Pengajuan Surat (Surat Submissions) ---
group(['middleware' => ['auth']], function () {
    post('/api/surat/submit', 'SuratSubmissionController@store');
    get('/api/surat/my-submissions', 'SuratSubmissionController@mySubmissions');
});
group(['middleware' => ['auth', 'role:komisariat']], function () {
    get('/api/surat/all-submissions', 'SuratSubmissionController@index');
    put('/api/surat/{id}/verify', 'SuratSubmissionController@verify');
});

// --- Rute Manajemen Berita & Artikel ---
group(['middleware' => ['auth', 'role:komisariat,rayon']], function () {
    post('/api/news', 'NewsArticleController@store');
    put('/api/news/{id}', 'NewsArticleController@update');
    delete('/api/news/{id}', 'NewsArticleController@destroy');
});
group(['middleware' => ['auth', 'role:komisariat']], function () {
    get('/api/news/pending', 'NewsArticleController@pending');
    put('/api/news/{id}/approve', 'NewsArticleController@approve');
    put('/api/news/{id}/reject', 'NewsArticleController@reject');
});

// --- Rute Manajemen Agenda Kegiatan ---
group(['middleware' => ['auth', 'role:komisariat,rayon']], function () {
    post('/api/activities', 'ActivityController@store');
    put('/api/activities/{id}', 'ActivityController@update');
    delete('/api/activities/{id}', 'ActivityController@destroy');
});
group(['middleware' => ['auth', 'role:komisariat']], function () {
    get('/api/activities/pending', 'ActivityController@pending');
    put('/api/activities/{id}/approve', 'ActivityController@approve');
    put('/api/activities/{id}/reject', 'ActivityController@reject');
});

// --- Rute Pendaftaran Kegiatan (Activity Registrations) ---
group(['middleware' => ['auth']], function () {
    post('/api/activities/{activity_id}/register', 'ActivityRegistrationController@store');
    get('/api/activities/{activity_id}/registrants', 'ActivityRegistrationController@index');
});

// --- Rute Manajemen Galeri ---
group(['middleware' => ['auth', 'role:komisariat,rayon']], function () {
    post('/api/gallery', 'GalleryController@store');
    put('/api/gallery/{id}', 'GalleryController@update');
    delete('/api/gallery/{id}', 'GalleryController@destroy');
});
group(['middleware' => ['auth', 'role:komisariat']], function () {
    get('/api/gallery/pending', 'GalleryController@pending');
    put('/api/gallery/{id}/approve', 'GalleryController@approve');
    put('/api/gallery/{id}/reject', 'GalleryController@reject');
});

// --- Rute Manajemen Pengaturan, Beranda, dll. (Hanya Komisariat) ---
group(['middleware' => ['auth', 'role:komisariat']], function () {
    // Pengaturan Situs
    put('/api/settings', 'SiteSettingsController@update');
    // Bagian Beranda
    put('/api/homepage-sections/{section_name}', 'HomepageSectionController@update');
    // Pengumuman
    post('/api/announcements', 'AnnouncementController@store');
    put('/api/announcements/{id}', 'AnnouncementController@update');
    delete('/api/announcements/{id}', 'AnnouncementController@destroy');
    // Media Sosial
    put('/api/social-media/{platform}', 'SocialMediaLinkController@update');
});


// --- Rute Notifikasi ---
group(['middleware' => ['auth', 'role:komisariat,rayon']], function () {
    get('/api/notifications/sent', 'NotificationController@sentNotifications');
    post('/api/notifications/send', 'NotificationController@sendManualNotification');
    delete('/api/notifications/{id}', 'NotificationController@destroy');
    post('/api/notifications/trigger-auto', 'NotificationController@triggerAutomaticNotifications');
});
group(['middleware' => ['auth']], function () {
    get('/api/notifications/my', 'NotificationController@myNotifications');
    put('/api/notifications/{id}/read', 'NotificationController@markAsRead');
});

// --- Rute Log Aktivitas Sistem ---
group(['middleware' => ['auth', 'role:komisariat']], function () {
    get('/api/logs/activities', 'SystemActivityLogController@index');
    get('/api/logs/activities/{user_id}', 'SystemActivityLogController@userLogs');
});

// --- Rute TTD Digital ---
group(['middleware' => ['auth', 'role:komisariat,rayon']], function () {
    post('/api/digital-signatures/generate', 'DigitalSignatureController@generate');
    get('/api/digital-signatures/{id}', 'DigitalSignatureController@show');
});

// --- Rute Arsiparis Kepengurusan ---
group(['middleware' => ['auth', 'role:komisariat,rayon']], function () {
    get('/api/archives/kepengurusan', 'KepengurusanArchiveController@index');
    post('/api/archives/kepengurusan', 'KepengurusanArchiveController@store');
    put('/api/archives/kepengurusan/{id}', 'KepengurusanArchiveController@update');
    delete('/api/archives/kepengurusan/{id}', 'KepengurusanArchiveController@destroy');
});

// --- Rute Manajemen Kategori Digilib ---
group(['middleware' => ['auth', 'role:komisariat']], function () {
    post('/api/digilib/categories', 'DigilibCategoryController@store');
    put('/api/digilib/categories/{id}', 'DigilibCategoryController@update');
    delete('/api/digilib/categories/{id}', 'DigilibCategoryController@destroy');
});

// --- Rute Manajemen Item Digilib ---
group(['middleware' => ['auth', 'role:komisariat,rayon']], function () {
    post('/api/digilib/items', 'DigilibItemController@store');
    put('/api/digilib/items/{id}', 'DigilibItemController@update');
    delete('/api/digilib/items/{id}', 'DigilibItemController@destroy');
});
group(['middleware' => ['auth', 'role:komisariat']], function () {
    put('/api/digilib/items/{id}/approve', 'DigilibItemController@approve');
    put('/api/digilib/items/{id}/reject', 'DigilibItemController@reject');
});

// --- Rute Manajemen Karya Ilmiah ---
group(['middleware' => ['auth', 'role:komisariat,rayon']], function () {
    post('/api/scientific-works', 'ScientificWorkController@store');
    get('/api/scientific-works/my', 'ScientificWorkController@myWorks');
    put('/api/scientific-works/{id}', 'ScientificWorkController@update');
    delete('/api/scientific-works/{id}', 'ScientificWorkController@destroy');
});
group(['middleware' => ['auth', 'role:komisariat']], function () {
    get('/api/scientific-works/all', 'ScientificWorkController@index');
    put('/api/scientific-works/{id}/approve', 'ScientificWorkController@approve');
    put('/api/scientific-works/{id}/reject', 'ScientificWorkController@reject');
});

// --- Rute Manajemen Pengaturan Akses OJS ---
group(['middleware' => ['auth', 'role:komisariat']], function () {
    put('/api/ojs-settings/{id}', 'OjsAccessSettingController@update');
    post('/api/ojs-settings/sync', 'OjsAccessSettingController@sync');
});

// --- Rute Laporan & Analisis ---
group(['middleware' => ['auth', 'role:komisariat']], function () {
    post('/api/reports/generate', 'ReportController@generate');
    get('/api/reports/export/{type}', 'ReportController@export');
});

// --- Rute Unggah File Umum ---
// Biasanya dilindungi oleh autentikasi
group(['middleware' => ['auth']], function () {
    post('/api/upload/file', 'UploadController@uploadFile');
});

