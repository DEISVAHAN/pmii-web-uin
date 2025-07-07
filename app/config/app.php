<?php
// app/config/app.php

// File ini berisi pengaturan umum untuk aplikasi Anda.

return [
    /*
    |--------------------------------------------------------------------------
    | Nama Aplikasi
    |--------------------------------------------------------------------------
    |
    | Nama aplikasi ini akan digunakan di seluruh aplikasi Anda,
    | misalnya dalam notifikasi, judul halaman, atau pesan.
    |
    */
    'name' => env('APP_NAME', 'SINTAKSIS PMII UIN SGD Bandung'),

    /*
    |--------------------------------------------------------------------------
    | Lingkungan Aplikasi
    |--------------------------------------------------------------------------
    |
    | Lingkungan aplikasi menentukan bagaimana aplikasi harus berperilaku
    | dalam konteks yang berbeda (misalnya, pengembangan, produksi).
    | Nilai 'local' akan mengaktifkan mode debug.
    |
    */
    'env' => env('APP_ENV', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Mode Debug Aplikasi
    |--------------------------------------------------------------------------
    |
    | Ketika mode debug diaktifkan, pesan kesalahan yang detail akan ditampilkan
    | di browser. Ini sangat membantu selama pengembangan, tetapi harus
    | diatur ke 'false' di lingkungan produksi untuk keamanan.
    |
    */
    'debug' => (bool) env('APP_DEBUG', true),

    /*
    |--------------------------------------------------------------------------
    | URL Aplikasi
    |--------------------------------------------------------------------------
    |
    | URL ini digunakan oleh konsol untuk menghasilkan URL dengan benar
    | ketika menggunakan alat baris perintah Artisan. Ini harus menjadi
    | URL root ke aplikasi Anda tanpa garis miring di akhir.
    |
    */
    'url' => env('APP_URL', 'http://localhost'),

    /*
    |--------------------------------------------------------------------------
    | Zona Waktu Aplikasi
    |--------------------------------------------------------------------------
    |
    | Di sini Anda dapat menentukan zona waktu default untuk aplikasi Anda,
    | yang akan digunakan oleh fungsi tanggal dan waktu PHP.
    |
    */
    'timezone' => 'Asia/Jakarta', // Zona waktu Indonesia

    /*
    |--------------------------------------------------------------------------
    | Lokal Aplikasi
    |--------------------------------------------------------------------------
    |
    | Lokal aplikasi menentukan bahasa default yang akan digunakan oleh
    | penyedia layanan terjemahan. Anda dapat mengatur nilai ini ke
    | bahasa apa pun yang didukung oleh aplikasi Anda.
    |
    */
    'locale' => 'id', // Bahasa Indonesia

    /*
    |--------------------------------------------------------------------------
    | Kunci Enkripsi Aplikasi
    |--------------------------------------------------------------------------
    |
    | Kunci ini harus berupa string acak 32 karakter, jika tidak,
    | string yang dienkripsi ini tidak akan aman. Lakukan ini sebelum
    | menyebarkan aplikasi ke produksi.
    | Anda dapat menghasilkan ini dengan `php artisan key:generate` jika menggunakan Laravel.
    |
    */
    'key' => env('APP_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Penyedia Layanan Autoload
    |--------------------------------------------------------------------------
    |
    | Penyedia layanan yang tercantum di sini akan secara otomatis dimuat
    | pada permintaan ke aplikasi Anda. Ini adalah tempat yang bagus untuk
    | mendaftarkan layanan pihak ketiga yang diperlukan oleh aplikasi Anda.
    | (Ini lebih relevan untuk framework seperti Laravel, tapi konsepnya sama)
    |
    */
    'providers' => [
        // Contoh:
        // App\Providers\AppServiceProvider::class,
        // App\Providers\AuthServiceProvider::class,
        // App\Providers\RouteServiceProvider::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Alias Kelas
    |--------------------------------------------------------------------------
    |
    | Alias kelas ini dapat digunakan untuk membuat alias untuk kelas PHP.
    | Ini tidak akan memuat kelas secara "lambat" sehingga penggunaan
    | alias ini tidak akan meningkatkan kinerja.
    | (Ini lebih relevan untuk framework seperti Laravel)
    |
    */
    'aliases' => [
        // Contoh:
        // 'App' => Illuminate\Support\Facades\App::class,
        // 'Auth' => Illuminate\Support\Facades\Auth::class,
    ],

];
