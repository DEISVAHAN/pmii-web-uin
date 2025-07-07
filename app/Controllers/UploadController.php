<?php
// app/controllers/UploadController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas

class UploadController
{
    private $request;
    private $response;
    private $db; // Instance Database, jika perlu mencatat unggahan ke DB
    private $uploadDir; // Direktori tempat file akan disimpan

    public function __construct()
    {
        $this->request = new Request();
        $this->response = new Response();
        $this->db = new \App\Core\Database(); // Inisialisasi koneksi database
        
        // Tentukan direktori unggahan. Idealnya, ini harus di luar public_html
        // dan diakses melalui symlink atau rute backend.
        // Contoh: pmii-web-uin/storage/app/public/uploads
        $this->uploadDir = dirname(__DIR__, 3) . '/storage/app/public/uploads/'; // 3 level ke atas dari app/controllers

        // Pastikan direktori unggahan ada
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0775, true); // Buat direktori jika tidak ada
        }
    }

    /**
     * Mengelola unggahan satu atau beberapa file.
     * Endpoint: POST /api/upload/file
     * Memerlukan autentikasi (sesuai kebutuhan modul yang mengunggah).
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function uploadFile()
    {
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // $_FILES adalah array global PHP untuk file yang diunggah
        $filesData = $_FILES;

        if (empty($filesData['file'])) {
            return $this->response->json(['message' => 'No file uploaded or invalid file input name.'], 400);
        }

        $uploadedFilesInfo = [];
        $errors = [];

        // Tangani unggahan multiple files jika input name diakhiri dengan []
        $filesToProcess = [];
        if (is_array($filesData['file']['name'])) {
            // Ini adalah unggahan multiple files
            foreach ($filesData['file']['name'] as $key => $name) {
                $filesToProcess[] = [
                    'name' => $name,
                    'type' => $filesData['file']['type'][$key],
                    'tmp_name' => $filesData['file']['tmp_name'][$key],
                    'error' => $filesData['file']['error'][$key],
                    'size' => $filesData['file']['size'][$key],
                ];
            }
        } else {
            // Ini adalah unggahan single file
            $filesToProcess[] = $filesData['file'];
        }

        foreach ($filesToProcess as $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) {
                $errors[] = "File '{$file['name']}' upload error: " . $this->getUploadErrorMessage($file['error']);
                continue;
            }

            // Validasi tipe file (contoh: hanya gambar dan dokumen)
            $allowedMimeTypes = [
                'image/jpeg', 'image/png', 'image/gif',
                'application/pdf',
                'application/msword', // .doc
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
                'application/vnd.ms-excel', // .xls
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            ];
            if (!in_array($file['type'], $allowedMimeTypes)) {
                $errors[] = "File '{$file['name']}' has an unsupported file type: {$file['type']}.";
                continue;
            }

            // Validasi ukuran file (contoh: maks 5MB)
            $maxFileSize = 5 * 1024 * 1024; // 5 MB
            if ($file['size'] > $maxFileSize) {
                $errors[] = "File '{$file['name']}' exceeds the maximum allowed size of " . ($maxFileSize / 1024 / 1024) . " MB.";
                continue;
            }

            // Generate nama file unik
            $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $uniqueFileName = uniqid() . '_' . time() . '.' . $fileExtension;
            $destinationPath = $this->uploadDir . $uniqueFileName;

            // Pindahkan file yang diunggah dari direktori sementara ke lokasi permanen
            if (move_uploaded_file($file['tmp_name'], $destinationPath)) {
                // URL yang dapat diakses publik untuk file yang diunggah
                // Asumsi: Anda telah membuat symlink dari public/storage ke storage/app/public
                $publicUrl = env('APP_URL') . '/storage/uploads/' . $uniqueFileName;
                
                $uploadedFilesInfo[] = [
                    'original_name' => $file['name'],
                    'new_name' => $uniqueFileName,
                    'file_url' => $publicUrl,
                    'mime_type' => $file['type'],
                    'size' => $file['size']
                ];

                // Catat aktivitas unggah
                // \App\Models\SystemActivityLog::create([
                //     'activity_type' => 'File Upload',
                //     'description' => 'File "' . $file['name'] . '" uploaded. URL: ' . $publicUrl,
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

            } else {
                $errors[] = "Failed to move uploaded file '{$file['name']}'.";
            }
        }

        if (!empty($uploadedFilesInfo)) {
            return $this->response->json([
                'message' => 'File(s) uploaded successfully.',
                'uploaded_files' => $uploadedFilesInfo,
                'errors' => $errors // Sertakan error jika ada sebagian yang gagal
            ], 200);
        } else {
            return $this->response->json([
                'message' => 'No files were uploaded or all uploads failed.',
                'errors' => $errors
            ], 400);
        }
    }

    /**
     * Mengembalikan pesan error unggahan file yang lebih deskriptif.
     *
     * @param int $errorCode Kode error unggahan PHP.
     * @return string Pesan error.
     */
    private function getUploadErrorMessage($errorCode)
    {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
                return "The uploaded file exceeds the upload_max_filesize directive in php.ini.";
            case UPLOAD_ERR_FORM_SIZE:
                return "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.";
            case UPLOAD_ERR_PARTIAL:
                return "The uploaded file was only partially uploaded.";
            case UPLOAD_ERR_NO_FILE:
                return "No file was uploaded.";
            case UPLOAD_ERR_NO_TMP_DIR:
                return "Missing a temporary folder.";
            case UPLOAD_ERR_CANT_WRITE:
                return "Failed to write file to disk.";
            case UPLOAD_ERR_EXTENSION:
                return "A PHP extension stopped the file upload.";
            default:
                return "Unknown upload error.";
        }
    }
}
