<?php
// app/routes/api.php

// File ini mendefinisikan semua rute (endpoint) API untuk aplikasi Anda.
// Objek $router disediakan dari Front Controller (public/index.php).

use App\Core\Router; // Pastikan namespace Router diimpor

/** @var Router $router */ // Ini adalah PHPDoc untuk membantu IDE mengenali tipe $router

// --- Rute Autentikasi (Auth) ---
// Rute ini tidak memerlukan autentikasi awal.
$router->post('/api/auth/login', 'AuthController@login'); // Untuk login pengguna
$router->post('/api/auth/register', 'AuthController@register'); // Untuk pendaftaran kader baru
$router->post('/api/auth/forgot-password', 'AuthController@forgotPassword'); // Untuk permintaan reset password
$router->post('/api/auth/reset-password', 'AuthController@resetPassword'); // Untuk proses reset password

// --- Rute Pengguna (Users) ---
// Rute ini dilindungi dan memerlukan peran 'komisariat'.
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/users', 'UserController@index', $middleware); // Mendapatkan semua daftar pengguna
    $router->post('/api/users', 'UserController@store', $middleware); // Menambahkan pengguna baru
    $router->get('/api/users/{id}', 'UserController@show', $middleware); // Mendapatkan detail pengguna berdasarkan ID
    $router->put('/api/users/{id}', 'UserController@update', $middleware); // Memperbarui informasi pengguna
    $router->delete('/api/users/{id}', 'UserController@destroy', $middleware); // Menghapus pengguna
    $router->post('/api/users/{id}/reset-password', 'UserController@resetPassword', $middleware); // Mereset password pengguna lain
});

// --- Rute Profil Kader (Kaders Profile) ---
// Kader dapat mengedit profilnya sendiri, admin komisariat/rayon dapat melihat/mengedit.
$router->group(['AuthMiddleware'], function (Router $router, array $middleware) { // Middleware AuthMiddleware saja
    $router->get('/api/kaders/profile/{user_id}', 'KaderProfileController@show', $middleware); // Melihat profil kader tertentu
    $router->put('/api/kaders/profile/{user_id}', 'KaderProfileController@update', $middleware); // Memperbarui profil kader
});

// --- Rute Rayon (Rayons) ---
// Profil rayon bisa diakses publik, tapi edit dilindungi.
$router->get('/api/rayons', 'RayonController@index'); // Mendapatkan daftar semua rayon
$router->get('/api/rayons/{id}', 'RayonController@show'); // Mendapatkan detail rayon
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat,rayon'], function (Router $router, array $middleware) {
    $router->put('/api/rayons/{id}', 'RayonController@update', $middleware); // Memperbarui profil rayon
});

// --- Rute Pengajuan Surat (Surat Submissions) ---
// Pengajuan oleh kader/rayon, verifikasi oleh komisariat.
$router->group(['AuthMiddleware'], function (Router $router, array $middleware) {
    $router->post('/api/surat/submit', 'SuratSubmissionController@store', $middleware); // Mengajukan surat baru
    $router->get('/api/surat/my-submissions', 'SuratSubmissionController@mySubmissions', $middleware); // Melihat pengajuan surat sendiri
});
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/surat/all-submissions', 'SuratSubmissionController@index', $middleware); // Melihat semua pengajuan surat
    $router->put('/api/surat/{id}/verify', 'SuratSubmissionController@verify', $middleware); // Memverifikasi status surat
});

// --- Rute Berita & Artikel (News Articles) ---
// Bisa diakses publik, tapi pengajuan dan verifikasi dilindungi.
$router->get('/api/news', 'NewsArticleController@index'); // Mendapatkan daftar berita/artikel yang disetujui (publik)
$router->get('/api/news/{id}', 'NewsArticleController@show'); // Mendapatkan detail berita/artikel
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat,rayon'], function (Router $router, array $middleware) {
    $router->post('/api/news', 'NewsArticleController@store', $middleware); // Mengajukan berita/artikel baru
    $router->put('/api/news/{id}', 'NewsArticleController@update', $middleware); // Memperbarui berita/artikel
    $router->delete('/api/news/{id}', 'NewsArticleController@destroy', $middleware); // Menghapus berita/artikel
});
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/news/pending', 'NewsArticleController@pending', $middleware); // Melihat berita/artikel pending untuk verifikasi
    $router->put('/api/news/{id}/approve', 'NewsArticleController@approve', $middleware); // Menyetujui berita/artikel
    $router->put('/api/news/{id}/reject', 'NewsArticleController@reject', $middleware); // Menolak berita/artikel
});

// --- Rute Agenda Kegiatan (Activities) ---
// Bisa diakses publik, tapi pengajuan dan verifikasi dilindungi.
$router->get('/api/activities', 'ActivityController@index'); // Mendapatkan daftar kegiatan yang disetujui (publik)
$router->get('/api/activities/{id}', 'ActivityController@show'); // Mendapatkan detail kegiatan
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat,rayon'], function (Router $router, array $middleware) {
    $router->post('/api/activities', 'ActivityController@store', $middleware); // Mengajukan kegiatan baru
    $router->put('/api/activities/{id}', 'ActivityController@update', $middleware); // Memperbarui kegiatan
    $router->delete('/api/activities/{id}', 'ActivityController@destroy', $middleware); // Menghapus kegiatan
});
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/activities/pending', 'ActivityController@pending', $middleware); // Melihat kegiatan pending untuk verifikasi
    $router->put('/api/activities/{id}/approve', 'ActivityController@approve', $middleware); // Menyetujui kegiatan
    $router->put('/api/activities/{id}/reject', 'ActivityController@reject', $middleware); // Menolak kegiatan
});

// --- Rute Pendaftaran Kegiatan (Activity Registrations) ---
$router->group(['AuthMiddleware'], function (Router $router, array $middleware) {
    $router->post('/api/activities/{activity_id}/register', 'ActivityRegistrationController@store', $middleware); // Mendaftar kegiatan
    $router->get('/api/activities/{activity_id}/registrants', 'ActivityRegistrationController@index', $middleware); // Melihat pendaftar kegiatan (jika diizinkan)
    $router->delete('/api/activities/registrations/{id}', 'ActivityRegistrationController@destroy', $middleware); // Menghapus pendaftaran
});

// --- Rute Galeri (Gallery Items) ---
// Bisa diakses publik, tapi pengajuan dan verifikasi dilindungi.
$router->get('/api/gallery', 'GalleryController@index'); // Mendapatkan daftar item galeri yang disetujui (publik)
$router->get('/api/gallery/{id}', 'GalleryController@show'); // Mendapatkan detail item galeri
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat,rayon'], function (Router $router, array $middleware) {
    $router->post('/api/gallery', 'GalleryController@store', $middleware); // Mengajukan item galeri baru
    $router->put('/api/gallery/{id}', 'GalleryController@update', $middleware); // Memperbarui item galeri
    $router->delete('/api/gallery/{id}', 'GalleryController@destroy', $middleware); // Menghapus item galeri
});
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/gallery/pending', 'GalleryController@pending', $middleware); // Melihat item galeri pending untuk verifikasi
    $router->put('/api/gallery/{id}/approve', 'GalleryController@approve', $middleware); // Menyetujui item galeri
    $router->put('/api/gallery/{id}/reject', 'GalleryController@reject', $middleware); // Menolak item galeri
});

// --- Rute Pengaturan Situs (Site Settings) ---
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/settings', 'SiteSettingsController@index', $middleware); // Mendapatkan semua pengaturan situs
    $router->put('/api/settings', 'SiteSettingsController@update', $middleware); // Memperbarui pengaturan situs
});

// --- Rute Bagian Beranda (Homepage Sections) ---
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/homepage-sections', 'HomepageSectionController@index', $middleware); // Mendapatkan semua bagian beranda
    $router->put('/api/homepage-sections/{section_name}', 'HomepageSectionController@update', $middleware); // Memperbarui bagian beranda
});

// --- Rute Pengumuman (Announcements) ---
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/announcements', 'AnnouncementController@index', $middleware); // Mendapatkan daftar pengumuman
    $router->post('/api/announcements', 'AnnouncementController@store', $middleware); // Menambahkan pengumuman baru
    $router->put('/api/announcements/{id}', 'AnnouncementController@update', $middleware); // Memperbarui pengumuman
    $router->delete('/api/announcements/{id}', 'AnnouncementController@destroy', $middleware); // Menghapus pengumuman
    $router->put('/api/announcements/{id}/activate', 'AnnouncementController@activate', $middleware); // Mengaktifkan pengumuman
    $router->put('/api/announcements/{id}/deactivate', 'AnnouncementController@deactivate', $middleware); // Menonaktifkan pengumuman
});

// --- Rute Tautan Media Sosial (Social Media Links) ---
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/social-media', 'SocialMediaLinkController@index', $middleware); // Mendapatkan daftar tautan media sosial
    $router->put('/api/social-media/{platform}', 'SocialMediaLinkController@update', $middleware); // Memperbarui tautan media sosial
    $router->post('/api/social-media', 'SocialMediaLinkController@store', $middleware); // Menambahkan tautan media sosial baru
    $router->delete('/api/social-media/{platform}', 'SocialMediaLinkController@destroy', $middleware); // Menghapus tautan media sosial
});

// --- Rute Notifikasi (Notifications) ---
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat,rayon'], function (Router $router, array $middleware) {
    $router->get('/api/notifications/sent', 'NotificationController@sentNotifications', $middleware); // Melihat notifikasi yang dikirim oleh admin
    $router->post('/api/notifications/send', 'NotificationController@sendManualNotification', $middleware); // Mengirim notifikasi manual
    $router->delete('/api/notifications/{id}', 'NotificationController@destroy', $middleware); // Menghapus notifikasi
    $router->post('/api/notifications/trigger-auto', 'NotificationController@triggerAutomaticNotifications', $middleware); // Memicu notifikasi otomatis
});
$router->group(['AuthMiddleware'], function (Router $router, array $middleware) {
    $router->get('/api/notifications/my', 'NotificationController@myNotifications', $middleware); // Melihat notifikasi yang diterima pengguna
    $router->put('/api/notifications/{id}/read', 'NotificationController@markAsRead', $middleware); // Menandai notifikasi sebagai sudah dibaca
});

// --- Rute Log Aktivitas Sistem (System Activity Logs) ---
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/logs/activities', 'LogController@index', $middleware); // Mendapatkan semua log aktivitas
    $router->get('/api/logs/activities/{user_id}', 'LogController@userLogs', $middleware); // Melihat log aktivitas per pengguna
    $router->delete('/api/logs/activities/{id}', 'LogController@destroy', $middleware); // Menghapus log
});

// --- Rute TTD Digital (Digital Signatures) ---
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat,rayon'], function (Router $router, array $middleware) {
    $router->post('/api/digital-signatures/generate', 'DigitalSignatureController@generate', $middleware); // Menghasilkan QR TTD/Link
    $router->get('/api/digital-signatures/{id}', 'DigitalSignatureController@show', $middleware); // Melihat detail TTD/Link
});
// Rute publik untuk verifikasi TTD (tidak perlu autentikasi)
$router->get('/api/digital-signatures/verify/{id}', 'DigitalSignatureController@verifyPublic'); // Memverifikasi TTD secara publik

// --- Rute Arsiparis Kepengurusan (Kepengurusan Archives) ---
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat,rayon'], function (Router $router, array $middleware) {
    $router->get('/api/archives/kepengurusan', 'KepengurusanArchiveController@index', $middleware); // Melihat daftar arsip
    $router->post('/api/archives/kepengurusan', 'KepengurusanArchiveController@store', $middleware); // Mengunggah arsip baru
    $router->put('/api/archives/kepengurusan/{id}', 'KepengurusanArchiveController@update', $middleware); // Memperbarui arsip
    $router->delete('/api/archives/kepengurusan/{id}', 'KepengurusanArchiveController@destroy', $middleware); // Menghapus arsip
});

// --- Rute Kategori Digilib (Digilib Categories) ---
$router->get('/api/digilib/categories', 'DigilibCategoryController@index'); // Mendapatkan semua kategori digilib (publik)
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->post('/api/digilib/categories', 'DigilibCategoryController@store', $middleware); // Menambah kategori baru
    $router->put('/api/digilib/categories/{id}', 'DigilibCategoryController@update', $middleware); // Memperbarui kategori
    $router->delete('/api/digilib/categories/{id}', 'DigilibCategoryController@destroy', $middleware); // Menghapus kategori
});

// --- Rute Item Digilib (Digilib Items) ---
$router->get('/api/digilib/items', 'DigilibItemController@index'); // Mendapatkan semua item digilib (publik)
$router->get('/api/digilib/items/{id}', 'DigilibItemController@show'); // Mendapatkan detail item digilib
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat,rayon'], function (Router $router, array $middleware) { // Rayon bisa upload makalah
    $router->post('/api/digilib/items', 'DigilibItemController@store', $middleware); // Mengunggah item digilib baru
    $router->put('/api/digilib/items/{id}', 'DigilibItemController@update', $middleware); // Memperbarui item digilib
    $router->delete('/api/digilib/items/{id}', 'DigilibItemController@destroy', $middleware); // Menghapus item digilib
});
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) { // Komisariat verifikasi
    $router->put('/api/digilib/items/{id}/approve', 'DigilibItemController@approve', $middleware); // Menyetujui item digilib
    $router->put('/api/digilib/items/{id}/reject', 'DigilibItemController@reject', $middleware); // Menolak item digilib
});

// --- Rute Karya Ilmiah (Scientific Works) ---
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat,rayon'], function (Router $router, array $middleware) {
    $router->post('/api/scientific-works', 'ScientificWorkController@store', $middleware); // Mengunggah karya ilmiah baru
    $router->get('/api/scientific-works/my', 'ScientificWorkController@myWorks', $middleware); // Melihat karya ilmiah yang diunggah sendiri
    $router->put('/api/scientific-works/{id}', 'ScientificWorkController@update', $middleware); // Memperbarui karya ilmiah
    $router->delete('/api/scientific-works/{id}', 'ScientificWorkController@destroy', $middleware); // Menghapus karya ilmiah
});
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/scientific-works/all', 'ScientificWorkController@index', $middleware); // Melihat semua karya ilmiah
    $router->put('/api/scientific-works/{id}/approve', 'ScientificWorkController@approve', $middleware); // Menyetujui karya ilmiah
    $router->put('/api/scientific-works/{id}/reject', 'ScientificWorkController@reject', $middleware); // Menolak karya ilmiah
});

// --- Rute Pengaturan Akses OJS (OJS Access Settings) ---
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->get('/api/ojs-settings', 'OjsAccessSettingController@index', $middleware); // Mendapatkan pengaturan OJS
    $router->put('/api/ojs-settings/{id}', 'OjsAccessSettingController@update', $middleware); // Memperbarui pengaturan OJS
    $router->post('/api/ojs-settings/sync', 'OjsAccessSettingController@sync', $middleware); // Memicu sinkronisasi OJS
});

// --- Rute Laporan & Analisis (Reports & Analytics) ---
$router->group(['AuthMiddleware', 'RoleMiddleware:komisariat'], function (Router $router, array $middleware) {
    $router->post('/api/reports/generate', 'ReportController@generate', $middleware); // Menghasilkan laporan
    $router->get('/api/reports/export/{reportType}', 'ReportController@export', $middleware); // Mengekspor laporan
});

// --- Rute Unggah File Umum ---
$router->group(['AuthMiddleware'], function (Router $router, array $middleware) {
    $router->post('/api/upload/file', 'UploadController@uploadFile', $middleware); // Mengelola unggahan file
});
