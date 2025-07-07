<?php
// app/controllers/DigitalSignatureController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\DigitalSignature; // Sertakan model DigitalSignature
// use App\Models\User;           // Jika perlu berinteraksi dengan model User
// use App\Models\SuratSubmission; // Jika perlu berinteraksi dengan model SuratSubmission
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi
// use Endroid\QrCode\QrCode; // Contoh jika menggunakan library QR Code
// use Endroid\QrCode\Writer\PngWriter; // Contoh jika menggunakan library QR Code

class DigitalSignatureController
{
    private $request;
    private $response;
    private $db;

    public function __construct()
    {
        $this->request = new Request();
        $this->response = new Response();
        $this->db = new \App\Core\Database(); // Inisialisasi koneksi database
    }

    /**
     * Menghasilkan QR Code untuk TTD Digital atau Access Link.
     * Endpoint: POST /api/digital-signatures/generate
     * Memerlukan autentikasi (komisariat atau rayon).
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function generate()
    {
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        $qrType = $requestData['qr_type'] ?? null;
        $qrCodeValue = null;
        $dataToStore = ['qr_type' => $qrType];

        if (!$qrType || !in_array($qrType, ['ttdDigital', 'accessLink'])) {
            return $this->response->json(['message' => 'Tipe QR tidak valid.'], 400);
        }

        if ($qrType === 'ttdDigital') {
            $requiredFields = ['nomor_surat', 'signed_by_name', 'signed_by_position', 'signed_date', 'perihal_surat'];
            foreach ($requiredFields as $field) {
                if (empty($requestData[$field])) {
                    return $this->response->json(['message' => "Field '{$field}' wajib diisi untuk TTD Digital."], 400);
                }
            }
            // Data yang akan dienkode dalam QR untuk TTD Digital
            $qrCodeValue = json_encode([
                'type' => 'ttdDigital',
                'nomor_surat' => $requestData['nomor_surat'],
                'signed_by_name' => $requestData['signed_by_name'],
                'signed_by_position' => $requestData['signed_by_position'],
                'signed_date' => $requestData['signed_date'],
                'perihal_surat' => $requestData['perihal_surat'],
                'generated_at' => date('Y-m-d H:i:s'),
                'generated_by_user_id' => $loggedInUser['user_id'] ?? null,
                'is_valid' => true // Default valid saat dibuat
            ]);

            $dataToStore = array_merge($dataToStore, [
                'id' => $requestData['nomor_surat'], // Gunakan nomor surat sebagai ID
                'nomor_surat' => $requestData['nomor_surat'],
                'signed_by_name' => $requestData['signed_by_name'],
                'signed_by_position' => $requestData['signed_by_position'],
                'signed_date' => $requestData['signed_date'],
                'perihal_surat' => $requestData['perihal_surat'],
                'document_ref_id' => $requestData['document_ref_id'] ?? null, // Opsional, jika terkait surat_submissions
                'logo_url_in_qr' => $requestData['logo_url_in_qr'] ?? null,
            ]);

        } elseif ($qrType === 'accessLink') {
            $requiredFields = ['link_url', 'link_title'];
            foreach ($requiredFields as $field) {
                if (empty($requestData[$field])) {
                    return $this->response->json(['message' => "Field '{$field}' wajib diisi untuk Access Link."], 400);
                }
            }
            // Data yang akan dienkode dalam QR untuk Access Link
            $qrCodeValue = json_encode([
                'type' => 'accessLink',
                'url' => $requestData['link_url'],
                'title' => $requestData['link_title'],
                'description' => $requestData['link_description'] ?? null,
                'creator' => $requestData['link_creator'] ?? ($loggedInUser['user_name'] ?? 'Unknown'),
                'generated_at' => date('Y-m-d H:i:s'),
            ]);

            $dataToStore = array_merge($dataToStore, [
                'id' => uniqid('link_qr_'), // Generate ID unik untuk QR link
                'link_url' => $requestData['link_url'],
                'link_title' => $requestData['link_title'],
                'link_description' => $requestData['link_description'] ?? null,
                'link_creator' => $requestData['link_creator'] ?? ($loggedInUser['user_name'] ?? 'Unknown'),
                'logo_url_in_qr' => $requestData['logo_url_in_qr'] ?? null,
            ]);
        }

        $dataToStore['qr_code_value'] = $qrCodeValue;
        $dataToStore['generated_by_user_id'] = $loggedInUser['user_id'] ?? null;
        $dataToStore['is_valid'] = true; // Default valid saat dibuat

        try {
            // Cek duplikasi ID jika ID sudah ditentukan (misal nomor surat)
            if (isset($dataToStore['id'])) {
                $existingQr = DigitalSignature::find($dataToStore['id']);
                if ($existingQr) {
                    return $this->response->json(['message' => 'ID/Nomor surat ini sudah memiliki QR Code.'], 409);
                }
            }

            $newQrId = DigitalSignature::create($dataToStore);

            if ($newQrId) {
                // --- Logika Generate Gambar QR Code ---
                // Di sini Anda akan menggunakan library QR Code untuk menghasilkan gambar.
                // Contoh dengan Endroid/QrCode (jika terinstal via Composer):
                // $qrCode = QrCode::create($qrCodeValue);
                // $qrCode->setSize(300);
                // $qrCode->setMargin(10);
                // $qrCode->setForegroundColor(['r' => 0, 'g' => 92, 'b' => 151, 'a' => 0]); // PMII Blue
                // $qrCode->setBackgroundColor(['r' => 255, 'g' => 255, 'b' => 255, 'a' => 0]); // White
                // $qrCode->setRoundBlockSize(true);
                // $qrCode->setValidateResult(false);
                // $writer = new PngWriter();
                // $result = $writer->write($qrCode);
                // $qrCodeBase64 = $result->getDataUri(); // Dapatkan data URI (Base64)

                // Untuk demo, kita akan mengembalikan nilai QR Code saja
                $generatedQrImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAABFklEQVR42u3dQQrCQBCF0W1S/v/L"; // Dummy Base64

                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Generate QR Code',
                //     'description' => 'QR Code tipe "' . $qrType . '" dengan ID ' . $newQrId . ' dihasilkan.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $newQrId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                return $this->response->json([
                    'message' => 'QR Code berhasil dihasilkan dan disimpan!',
                    'id' => $newQrId,
                    'qr_code_value' => $qrCodeValue, // Nilai yang dienkode
                    'qr_image_base64' => $generatedQrImageBase64 // Gambar QR dalam Base64
                ], 201);
            } else {
                return $this->response->json(['message' => 'Gagal menghasilkan QR Code.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in DigitalSignatureController@generate: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menghasilkan QR Code.'], 500);
        }
    }

    /**
     * Mengambil detail tanda tangan digital atau QR link berdasarkan ID.
     * Endpoint: GET /api/digital-signatures/{id}
     * Memerlukan autentikasi (komisariat atau rayon).
     *
     * @param array $params Parameter dari URL (ID QR)
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID QR Code tidak ditemukan.'], 400);
        }

        try {
            $digitalSignature = DigitalSignature::find($id);

            if ($digitalSignature) {
                return $this->response->json($digitalSignature, 200);
            } else {
                return $this->response->json(['message' => 'QR Code tidak ditemukan.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in DigitalSignatureController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil detail QR Code.'], 500);
        }
    }

    /**
     * Memverifikasi tanda tangan digital secara publik (tanpa autentikasi).
     * Endpoint: GET /api/digital-signatures/verify/{id}
     *
     * @param array $params Parameter dari URL (ID QR)
     * @return void Respons JSON akan dikirim langsung
     */
    public function verifyPublic($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID QR Code tidak ditemukan.'], 400);
        }

        try {
            $digitalSignature = DigitalSignature::find($id);

            if ($digitalSignature) {
                // Di sini Anda bisa menambahkan logika verifikasi yang lebih kompleks
                // Misalnya, membandingkan hash atau tanda tangan kriptografi jika ada.
                // Untuk saat ini, kita hanya mengembalikan status 'is_valid' dari DB.

                // Hapus data sensitif yang tidak perlu ditampilkan ke publik
                unset($digitalSignature['generated_by_user_id']);
                unset($digitalSignature['generated_at']);

                return $this->response->json([
                    'message' => 'Status verifikasi QR Code.',
                    'data' => $digitalSignature,
                    'is_valid_status' => (bool)$digitalSignature['is_valid'] // Pastikan boolean
                ], 200);
            } else {
                return $this->response->json(['message' => 'QR Code tidak ditemukan atau tidak valid.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in DigitalSignatureController@verifyPublic: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat verifikasi QR Code.'], 500);
        }
    }
}
