<?php
// app/config/auth.php

// File ini berisi konfigurasi untuk sistem autentikasi aplikasi Anda.
// Anda dapat menentukan "guards" dan "providers" yang berbeda untuk
// skenario autentikasi yang berbeda.

return [

    /*
    |--------------------------------------------------------------------------
    | Guard Autentikasi Default
    |--------------------------------------------------------------------------
    |
    | Opsi guard autentikasi default ini menentukan guard mana yang akan
    | digunakan saat melakukan operasi autentikasi. Anda dapat menggantinya
    | di runtime.
    |
    */
    'defaults' => [
        'guard' => 'web', // Guard default untuk sesi web
        'passwords' => 'users', // Provider password default
    ],

    /*
    |--------------------------------------------------------------------------
    | Guard Autentikasi
    |--------------------------------------------------------------------------
    |
    | Guard autentikasi mendefinisikan bagaimana pengguna diautentikasi untuk
    | setiap permintaan. Anda dapat menentukan guard yang berbeda untuk
    | sesi web, API, atau bahkan token JWT.
    |
    */
    'guards' => [
        'web' => [
            'driver' => 'session', // Menggunakan sesi PHP untuk autentikasi web
            'provider' => 'users',
        ],

        'api' => [
            'driver' => 'token', // Menggunakan token API (misalnya, Bearer Token)
            'provider' => 'users',
            'input_key' => 'api_token', // Nama header atau parameter untuk token
        ],

        // Contoh guard JWT (jika Anda menggunakan JWT untuk API)
        // 'jwt' => [
        //     'driver' => 'jwt',
        //     'provider' => 'users',
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Provider Pengguna
    |--------------------------------------------------------------------------
    |
    | Semua provider pengguna mendefinisikan bagaimana pengguna sebenarnya
    | diambil dari penyimpanan data Anda. Ini bisa berupa Eloquent ORM
    | atau builder kueri database.
    |
    */
    'providers' => [
        'users' => [
            'driver' => 'eloquent', // Menggunakan model Eloquent (jika pakai ORM)
            'model' => App\Models\User::class, // Mengacu ke model User Anda
        ],

        // Atau jika Anda menggunakan builder kueri database:
        // 'users' => [
        //     'driver' => 'database',
        //     'table' => 'users',
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Reset Password
    |--------------------------------------------------------------------------
    |
    | Anda dapat menentukan beberapa konfigurasi reset password jika Anda
    | memiliki tabel reset password yang berbeda atau bahkan provider pengguna
    | yang berbeda untuk proses reset password.
    |
    */
    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_resets', // Tabel untuk menyimpan token reset password
            'expire' => 60, // Token kedaluwarsa dalam 60 menit
            'throttle' => 60, // Batasan percobaan reset password
        ],
    ],

];
