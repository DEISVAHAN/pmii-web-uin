<?php
// app/core/helpers.php

// File ini berisi fungsi-fungsi helper global yang dapat digunakan di seluruh aplikasi.

if (!function_exists('env')) {
    /**
     * Mengambil nilai variabel lingkungan.
     *
     * @param string $key Kunci variabel lingkungan.
     * @param mixed $default Nilai default jika variabel tidak ditemukan.
     * @return mixed Nilai variabel lingkungan atau nilai default.
     */
    function env(string $key, $default = null)
    {
        // Menggunakan $_ENV atau getenv() untuk mengambil variabel lingkungan.
        // $_ENV biasanya diisi oleh Dotenv library.
        if (isset($_ENV[$key])) {
            return $_ENV[$key];
        }

        // Fallback ke getenv()
        $value = getenv($key);

        if ($value === false) {
            return $default;
        }

        // Konversi string 'true', 'false', 'null' menjadi tipe data yang sesuai
        switch (strtolower($value)) {
            case 'true':
                return true;
            case 'false':
                return false;
            case 'null':
                return null;
            default:
                return $value;
        }
    }
}

if (!function_exists('request_method')) {
    /**
     * Mengambil metode HTTP dari permintaan.
     *
     * @return string Metode HTTP (GET, POST, PUT, DELETE, dll.).
     */
    function request_method(): string
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }
}

if (!function_exists('request_uri')) {
    /**
     * Mengambil URI dari permintaan.
     *
     * @return string URI permintaan.
     */
    function request_uri(): string
    {
        return parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    }
}

if (!function_exists('get_request_body')) {
    /**
     * Mengambil body permintaan HTTP (khususnya untuk JSON).
     *
     * @return array|null Body permintaan yang di-decode dari JSON, atau null jika tidak ada.
     */
    function get_request_body(): ?array
    {
        $input = file_get_contents('php://input');
        if ($input) {
            $data = json_decode($input, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $data;
            }
        }
        return null;
    }
}

if (!function_exists('json_response')) {
    /**
     * Mengirim respons JSON dan menghentikan eksekusi.
     *
     * @param array $data Data yang akan dienkode ke JSON.
     * @param int $statusCode Kode status HTTP.
     * @return void
     */
    function json_response(array $data, int $statusCode): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit();
    }
}
