<?php
// app/config/services.php

// File ini berisi konfigurasi untuk berbagai layanan yang digunakan oleh aplikasi Anda,
// baik itu layanan pihak ketiga maupun layanan internal yang kompleks.

return [

    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Layanan Email
    |--------------------------------------------------------------------------
    |
    | Di sini Anda dapat mengkonfigurasi detail untuk pengiriman email.
    | Ini akan digunakan oleh NotificationService atau fungsi pengiriman email lainnya.
    |
    */
    'mail' => [
        'mailer' => env('MAIL_MAILER', 'smtp'),
        'host' => env('MAIL_HOST', 'smtp.mailgun.org'),
        'port' => env('MAIL_PORT', 587),
        'username' => env('MAIL_USERNAME'),
        'password' => env('MAIL_PASSWORD'),
        'encryption' => env('MAIL_ENCRYPTION', 'tls'),
        'from' => [
            'address' => env('MAIL_FROM_ADDRESS', 'noreply@pmii-sintaksis.com'),
            'name' => env('MAIL_FROM_NAME', 'SINTAKSIS PMII'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Layanan Penyimpanan File (Storage)
    |--------------------------------------------------------------------------
    |
    | Konfigurasi untuk driver penyimpanan file, seperti lokal, S3 (AWS),
    | Google Cloud Storage, dll. Ini penting untuk mengelola unggahan dokumen
    | dan gambar.
    |
    */
    'filesystems' => [
        'default' => env('FILESYSTEM_DRIVER', 'local'),

        'disks' => [
            'local' => [
                'driver' => 'local',
                'root' => storage_path('app'), // Lokasi penyimpanan lokal
            ],
            'public' => [
                'driver' => 'local',
                'root' => storage_path('app/public'), // Lokasi file yang bisa diakses publik
                'url' => env('APP_URL') . '/storage', // URL untuk mengakses file publik
                'visibility' => 'public',
            ],
            // Contoh konfigurasi S3 (jika menggunakan AWS S3)
            // 's3' => [
            //     'driver' => 's3',
            //     'key' => env('AWS_ACCESS_KEY_ID'),
            //     'secret' => env('AWS_SECRET_ACCESS_KEY'),
            //     'region' => env('AWS_DEFAULT_REGION'),
            //     'bucket' => env('AWS_BUCKET'),
            //     'url' => env('AWS_URL'),
            //     'endpoint' => env('AWS_ENDPOINT'),
            //     'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            // ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Layanan Autentikasi Pihak Ketiga (Opsional)
    |--------------------------------------------------------------------------
    |
    | Jika Anda menggunakan layanan autentikasi pihak ketiga seperti Google,
    | Facebook, dll., Anda dapat mengkonfigurasinya di sini.
    |
    */
    'oauth' => [
        'google' => [
            'client_id' => env('GOOGLE_CLIENT_ID'),
            'client_secret' => env('GOOGLE_CLIENT_SECRET'),
            'redirect' => env('GOOGLE_REDIRECT_URI'),
        ],
        // 'facebook' => [ ... ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Integrasi OJS (Open Journal Systems)
    |--------------------------------------------------------------------------
    |
    | Pengaturan untuk terhubung dengan API OJS, jika diperlukan untuk
    | manajemen jurnal dari backend.
    |
    */
    'ojs' => [
        'base_url' => env('OJS_BASE_URL'),
        'api_key' => env('OJS_API_KEY'),
        'admin_username' => env('OJS_ADMIN_USERNAME'),
        'admin_password' => env('OJS_ADMIN_PASSWORD'), // Pastikan ini dienkripsi di .env atau di-hash
    ],

    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Layanan WhatsApp API (Opsional)
    |--------------------------------------------------------------------------
    |
    | Jika Anda menggunakan layanan API WhatsApp untuk notifikasi.
    |
    */
    'whatsapp' => [
        'api_url' => env('WHATSAPP_API_URL'),
        'api_key' => env('WHATSAPP_API_KEY'),
        'sender_id' => env('WHATSAPP_SENDER_ID'),
    ],

];
