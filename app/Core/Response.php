<?php
// app/core/Response.php

// Kelas ini membantu dalam mengirim respons HTTP.

namespace App\Core;

class Response
{
    private $statusCode = 200;
    private $headers = [];
    private $content;

    /**
     * Menetapkan kode status HTTP.
     *
     * @param int $statusCode
     * @return self
     */
    public function status(int $statusCode): self
    {
        $this->statusCode = $statusCode;
        return $this;
    }

    /**
     * Menetapkan header HTTP.
     *
     * @param string $key
     * @param string $value
     * @return self
     */
    public function header(string $key, string $value): self
    {
        $this->headers[$key] = $value;
        return $this;
    }

    /**
     * Mengirim respons JSON.
     *
     * @param array $data Data untuk dienkode ke JSON.
     * @param int|null $statusCode Kode status HTTP (opsional, akan menggunakan yang sudah diatur).
     * @return void
     */
    public function json(array $data, ?int $statusCode = null): void
    {
        if ($statusCode !== null) {
            $this->status($statusCode);
        }
        $this->header('Content-Type', 'application/json');
        $this->content = json_encode($data);
        $this->send();
    }

    /**
     * Mengirim respons HTTP.
     *
     * @return void
     */
    public function send(): void
    {
        http_response_code($this->statusCode);
        foreach ($this->headers as $key => $value) {
            header("{$key}: {$value}");
        }
        echo $this->content;
        exit();
    }
}
