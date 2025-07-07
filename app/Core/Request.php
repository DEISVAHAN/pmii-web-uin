<?php
// app/core/Request.php

// Kelas ini membungkus data permintaan HTTP untuk akses yang lebih terstruktur.

namespace App\Core;

class Request
{
    private $method;
    private $uri;
    private $headers;
    private $body;
    private $queryParams;
    private $routeParams; // Parameter dari URI rute (misal {id})

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $this->uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $this->headers = getallheaders();
        $this->queryParams = $_GET;
        $this->body = $this->parseBody();
        $this->routeParams = []; // Akan diisi oleh Router
    }

    /**
     * Mem-parsing body permintaan (khususnya untuk JSON).
     *
     * @return array|null
     */
    private function parseBody(): ?array
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

    /**
     * Mengambil metode HTTP.
     *
     * @return string
     */
    public function getMethod(): string
    {
        return $this->method;
    }

    /**
     * Mengambil URI permintaan.
     *
     * @return string
     */
    public function getUri(): string
    {
        return $this->uri;
    }

    /**
     * Mengambil semua header permintaan.
     *
     * @return array
     */
    public function getHeaders(): array
    {
        return $this->headers;
    }

    /**
     * Mengambil body permintaan (JSON yang sudah di-decode).
     *
     * @return array|null
     */
    public function getBody(): ?array
    {
        return $this->body;
    }

    /**
     * Mengambil parameter query (dari URL).
     *
     * @return array
     */
    public function getQueryParams(): array
    {
        return $this->queryParams;
    }

    /**
     * Mengambil parameter rute (dari URI yang cocok, misal {id}).
     *
     * @return array
     */
    public function getRouteParams(): array
    {
        return $this->routeParams;
    }

    /**
     * Menetapkan parameter rute (digunakan oleh Router).
     *
     * @param array $params
     * @return void
     */
    public function setRouteParams(array $params): void
    {
        $this->routeParams = $params;
    }

    /**
     * Mengambil nilai input tertentu dari body atau query params.
     *
     * @param string $key Kunci input.
     * @param mixed $default Nilai default jika kunci tidak ditemukan.
     * @return mixed
     */
    public function input(string $key, $default = null)
    {
        if (isset($this->body[$key])) {
            return $this->body[$key];
        }
        if (isset($this->queryParams[$key])) {
            return $this->queryParams[$key];
        }
        return $default;
    }

    /**
     * Mengambil header tertentu.
     *
     * @param string $key Kunci header.
     * @param mixed $default Nilai default.
     * @return string|null
     */
    public function header(string $key, $default = null): ?string
    {
        // Headers bisa case-insensitive, jadi normalisasi kunci
        $key = str_replace('-', '_', strtoupper($key));
        foreach ($this->headers as $name => $value) {
            if (str_replace('-', '_', strtoupper($name)) === $key) {
                return $value;
            }
        }
        return $default;
    }
}
