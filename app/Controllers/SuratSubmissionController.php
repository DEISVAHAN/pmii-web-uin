<?php
// app/controllers/SuratSubmissionController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\SuratSubmission; // Sertakan model SuratSubmission
// use App\Models\User;             // Jika perlu berinteraksi dengan model User
// use App\Models\Rayon;            // Jika perlu berinteraksi dengan model Rayon
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi

class SuratSubmissionController
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
     * Mengajukan surat baru.
     * Endpoint: POST /api/surat/submit
     * Memerlukan autentikasi (kader atau rayon).
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function store()
    {
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses dari middleware autentikasi
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // Validasi input
        $requiredFields = ['type', 'applicant_user_id', 'applicant_name', 'applicant_role', 'title'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' wajib diisi."], 400);
            }
        }

        // Validasi spesifik berdasarkan role pengaju
        if ($requestData['applicant_role'] === 'rayon' && empty($requestData['applicant_rayon_id'])) {
             return $this->response->json(['message' => 'ID Rayon pengaju wajib diisi untuk peran rayon.'], 400);
        }

        try {
            $submissionId = $requestData['id'] ?? uniqid('REQ-'); // Gunakan ID dari request jika ada (misal nomor surat), atau generate

            // Periksa duplikasi ID jika ID disediakan dari request (misal nomor surat)
            if (isset($requestData['id'])) {
                $existingSubmission = SuratSubmission::find($requestData['id']);
                if ($existingSubmission) {
                    return $this->response->json(['message' => 'Nomor surat/ID pengajuan sudah ada.'], 409);
                }
            }

            $dataToCreate = [
                'id' => $submissionId,
                'type' => $requestData['type'],
                'applicant_user_id' => $requestData['applicant_user_id'],
                'applicant_name' => $requestData['applicant_name'],
                'applicant_role' => $requestData['applicant_role'],
                'applicant_rayon_id' => $requestData['applicant_rayon_id'] ?? null,
                'submission_date' => date('Y-m-d'), // Tanggal pengajuan hari ini
                'status' => 'pending', // Status default saat diajukan
                'admin_comment' => null,
                'title' => $requestData['title'],
                'content' => $requestData['content'] ?? null,
                'target_destination' => $requestData['target_destination'] ?? 'Komisariat', // Default tujuan
                'file_url' => $requestData['file_url'] ?? null,
                // Sertakan semua URL file spesifik jika ada
                'file_database_pelantikan_url' => $requestData['file_database_pelantikan_url'] ?? null,
                'file_permohonan_rekomendasi_pelantikan_url' => $requestData['file_permohonan_rekomendasi_pelantikan_url'] ?? null,
                'file_lpj_kepengurusan_url' => $requestData['file_lpj_kepengurusan_url'] ?? null,
                'file_berita_acara_rtar_url' => $requestData['file_berita_acara_rtar_url'] ?? null,
                'file_berita_acara_tim_formatur_url' => $requestData['file_berita_acara_tim_formatur_url'] ?? null,
                'file_struktur_kepengurusan_url' => $requestData['file_struktur_kepengurusan_url'] ?? null,
                'file_database_rtar_url' => $requestData['file_database_rtar_url'] ?? null,
                'file_permohonan_rekomendasi_rtar_url' => $requestData['file_permohonan_rekomendasi_rtar_url'] ?? null,
                'file_suket_mapaba_url' => $requestData['file_suket_mapaba_url'] ?? null,
                'file_hasil_screening_pkd_url' => $requestData['file_hasil_screening_pkd_url'] ?? null,
                'file_rekomendasi_pkd_rayon_url' => $requestData['file_rekomendasi_pkd_rayon_url'] ?? null,
            ];

            $newSubmissionId = SuratSubmission::create($dataToCreate);

            if ($newSubmissionId) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Pengajuan Surat',
                //     'description' => 'Pengajuan surat jenis "' . $requestData['type'] . '" oleh ' . $requestData['applicant_name'] . ' (ID: ' . $newSubmissionId . ').',
                //     'user_id' => $loggedInUser['user_id'] ?? $requestData['applicant_user_id'],
                //     'user_name' => $loggedInUser['user_name'] ?? $requestData['applicant_name'],
                //     'user_role' => $loggedInUser['user_role'] ?? $requestData['applicant_role'],
                //     'target_id' => $newSubmissionId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke admin komisariat (jika ada)
                // NotificationService::sendNotification('Pengajuan Surat Baru', 'Ada pengajuan surat baru dari ' . $requestData['applicant_name'] . '.', 'info', 'komisariat');

                return $this->response->json(['message' => 'Pengajuan surat berhasil dikirim!', 'id' => $newSubmissionId], 201);
            } else {
                return $this->response->json(['message' => 'Gagal mengirim pengajuan surat.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in SuratSubmissionController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengajukan surat.'], 500);
        }
    }

    /**
     * Melihat pengajuan surat yang terkait dengan pengguna yang login.
     * Endpoint: GET /api/surat/my-submissions
     * Memerlukan autentikasi (kader atau rayon).
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function mySubmissions()
    {
        // Asumsi user yang login dapat diakses dari middleware autentikasi
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // if (!$loggedInUser) {
        //     return $this->response->json(['message' => 'Unauthorized.'], 401);
        // }

        try {
            $sql = "SELECT * FROM surat_submissions WHERE applicant_user_id = :user_id";
            $queryParams = ['user_id' => $loggedInUser['user_id']];

            // Jika role adalah rayon, mungkin juga ingin melihat pengajuan dari rayon itu sendiri
            if ($loggedInUser['user_role'] === 'rayon') {
                $sql .= " OR applicant_rayon_id = :rayon_id";
                $queryParams['rayon_id'] = $loggedInUser['rayon_id']; // Asumsi rayon_id ada di token
            }

            $submissions = $this->db->fetchAll($sql, $queryParams);

            // Opsional: Gabungkan dengan nama rayon pengaju
            foreach ($submissions as &$submission) {
                if ($submission['applicant_rayon_id']) {
                    $rayon = $this->db->fetch("SELECT name FROM rayons WHERE id = :id", ['id' => $submission['applicant_rayon_id']]);
                    if ($rayon) {
                        $submission['applicant_rayon_name'] = $rayon['name'];
                    }
                }
            }
            unset($submission);

            return $this->response->json($submissions, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in SuratSubmissionController@mySubmissions: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil pengajuan surat Anda.'], 500);
        }
    }

    /**
     * Melihat semua pengajuan surat (untuk admin komisariat).
     * Endpoint: GET /api/surat/all-submissions
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        try {
            $sql = "SELECT ss.*, u.name as verifier_name, r.name as rayon_name
                    FROM surat_submissions ss
                    LEFT JOIN users u ON ss.verified_by_user_id = u.id
                    LEFT JOIN rayons r ON ss.applicant_rayon_id = r.id";

            $submissions = $this->db->fetchAll($sql);

            return $this->response->json($submissions, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in SuratSubmissionController@index (all submissions): " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil semua pengajuan surat.'], 500);
        }
    }

    /**
     * Memverifikasi status surat.
     * Endpoint: PUT /api/surat/{id}/verify
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID surat)
     * @return void Respons JSON akan dikirim langsung
     */
    public function verify($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        $newStatus = $requestData['status'] ?? null;
        $adminComment = $requestData['admin_comment'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id || !in_array($newStatus, ['pending', 'acc', 'revisi', 'ditolak'])) {
            return $this->response->json(['message' => 'ID surat atau status tidak valid.'], 400);
        }

        try {
            $submission = SuratSubmission::find($id);
            if (!$submission) {
                return $this->response->json(['message' => 'Pengajuan surat tidak ditemukan.'], 404);
            }

            $dataToUpdate = [
                'status' => $newStatus,
                'admin_comment' => $adminComment,
                'verification_date' => date('Y-m-d H:i:s'),
                'verified_by_user_id' => $loggedInUser['user_id'] ?? 'admin_kom_default' // ID admin yang memverifikasi
            ];

            $updated = SuratSubmission::update($id, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Verifikasi Surat',
                //     'description' => 'Status surat "' . $submission['title'] . '" (ID: ' . $id . ') diubah menjadi "' . $newStatus . '".',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi kembali ke pengaju surat
                // $applicantEmail = \App\Models\User::find($submission['applicant_user_id'])->email; // Dapatkan email pengaju
                // $notificationTitle = "Status Surat Anda Diperbarui: " . ucfirst($newStatus);
                // $notificationContent = "Pengajuan surat Anda (" . $submission['title'] . ") telah diubah statusnya menjadi " . ucfirst($newStatus) . ". Komentar admin: " . ($adminComment ?: 'Tidak ada.');
                // \App\Services\NotificationService::sendNotification($notificationTitle, $notificationContent, $newStatus === 'acc' ? 'success' : 'info', 'user', $submission['applicant_user_id']);

                return $this->response->json(['message' => 'Status surat berhasil diperbarui.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal memperbarui status surat.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in SuratSubmissionController@verify: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat verifikasi surat.'], 500);
        }
    }
}
