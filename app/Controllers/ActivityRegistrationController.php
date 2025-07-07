<?php
// app/controllers/ActivityRegistrationController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\ActivityRegistration; // Sertakan model ActivityRegistration
// use App\Models\User;             // Jika perlu berinteraksi dengan model User
// use App\Models\Activity;         // Jika perlu berinteraksi dengan model Activity
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi

class ActivityRegistrationController
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
     * Menambahkan pendaftaran kegiatan baru.
     * Endpoint: POST /api/activities/{activity_id}/register
     * Memerlukan autentikasi (kader atau umum).
     *
     * @param array $params Parameter dari URL (ID kegiatan)
     * @return void Respons JSON akan dikirim langsung
     */
    public function store($params)
    {
        $activityId = $params['activity_id'] ?? null;
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$activityId) {
            return $this->response->json(['message' => 'ID kegiatan tidak ditemukan.'], 400);
        }

        // Validasi input
        $requiredFields = ['registrant_name', 'registrant_type'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' wajib diisi."], 400);
            }
        }
        if (!empty($requestData['registrant_email']) && !filter_var($requestData['registrant_email'], FILTER_VALIDATE_EMAIL)) {
            return $this->response->json(['message' => 'Format email pendaftar tidak valid.'], 400);
        }

        try {
            // Cek apakah kegiatan ada dan pendaftaran diaktifkan
            // $activity = \App\Models\Activity::find($activityId);
            // if (!$activity || !$activity['registration_enabled']) {
            //     return $this->response->json(['message' => 'Pendaftaran untuk kegiatan ini tidak tersedia atau kegiatan tidak ditemukan.'], 404);
            // }

            // Cek apakah pendaftar (jika kader) sudah terdaftar untuk kegiatan ini
            // if ($loggedInUser && $loggedInUser['user_role'] === 'kader') {
            //     $existingRegistration = $this->db->fetch(
            //         "SELECT id FROM activity_registrations WHERE activity_id = :activity_id AND registrant_user_id = :user_id",
            //         ['activity_id' => $activityId, 'user_id' => $loggedInUser['user_id']]
            //     );
            //     if ($existingRegistration) {
            //         return $this->response->json(['message' => 'Anda sudah terdaftar untuk kegiatan ini.'], 409);
            //     }
            // }

            $dataToCreate = [
                'activity_id' => $activityId,
                'registrant_name' => $requestData['registrant_name'],
                'registrant_email' => $requestData['registrant_email'] ?? null,
                'registrant_phone' => $requestData['registrant_phone'] ?? null,
                'registrant_type' => $requestData['registrant_type'],
                'registrant_user_id' => ($requestData['registrant_type'] === 'Kader' && $loggedInUser && $loggedInUser['user_role'] === 'kader') ? $loggedInUser['user_id'] : null,
            ];

            $newRegistrationId = ActivityRegistration::create($dataToCreate);

            if ($newRegistrationId) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Activity Registration',
                //     'description' => 'Pendaftar baru "' . $requestData['registrant_name'] . '" untuk kegiatan ID ' . $activityId . '.',
                //     'user_id' => $loggedInUser['user_id'] ?? null,
                //     'user_name' => $loggedInUser['user_name'] ?? $requestData['registrant_name'],
                //     'user_role' => $loggedInUser['user_role'] ?? $requestData['registrant_type'],
                //     'target_id' => $activityId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke admin kegiatan atau pendaftar
                // \App\Services\NotificationService::sendNotification('Pendaftaran Kegiatan Baru', 'Ada pendaftar baru untuk kegiatan ID ' . $activityId . '.', 'info', 'komisariat');

                return $this->response->json(['message' => 'Pendaftaran kegiatan berhasil!', 'id' => $newRegistrationId], 201);
            } else {
                return $this->response->json(['message' => 'Gagal mendaftar kegiatan.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ActivityRegistrationController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mendaftar kegiatan.'], 500);
        }
    }

    /**
     * Mengambil daftar pendaftar untuk kegiatan tertentu.
     * Endpoint: GET /api/activities/{activity_id}/registrants
     * Memerlukan autentikasi (komisariat atau rayon yang mengajukan kegiatan).
     *
     * @param array $params Parameter dari URL (ID kegiatan)
     * @return void Respons JSON akan dikirim langsung
     */
    public function index($params)
    {
        $activityId = $params['activity_id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$activityId) {
            return $this->response->json(['message' => 'ID kegiatan tidak ditemukan.'], 400);
        }

        try {
            // Otorisasi: Hanya admin komisariat atau rayon yang mengajukan kegiatan yang bisa melihat daftar pendaftar
            // $activity = \App\Models\Activity::find($activityId);
            // if (!$activity || ($loggedInUser['user_role'] === 'rayon' && $activity['submitted_by_rayon_id'] !== $loggedInUser['rayon_id'])) {
            //     return $this->response->json(['message' => 'Anda tidak diizinkan melihat pendaftar kegiatan ini.'], 403);
            // }

            $registrations = ActivityRegistration::all($activityId);
            if ($registrations === false) {
                return $this->response->json(['message' => 'Gagal mengambil data pendaftar.'], 500);
            }

            return $this->response->json($registrations, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in ActivityRegistrationController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil daftar pendaftar.'], 500);
        }
    }

    /**
     * Menghapus pendaftaran kegiatan.
     * Endpoint: DELETE /api/activities/registrations/{id}
     * Memerlukan autentikasi (komisariat atau rayon yang mengajukan kegiatan).
     *
     * @param array $params Parameter dari URL (ID pendaftaran)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'ID pendaftaran tidak ditemukan.'], 400);
        }

        try {
            $registration = ActivityRegistration::find($id);
            if (!$registration) {
                return $this->response->json(['message' => 'Pendaftaran tidak ditemukan.'], 404);
            }

            // Otorisasi: Hanya admin komisariat atau rayon yang mengajukan kegiatan yang bisa menghapus
            // $activity = \App\Models\Activity::find($registration['activity_id']);
            // if (!$activity || ($loggedInUser['user_role'] === 'rayon' && $activity['submitted_by_rayon_id'] !== $loggedInUser['rayon_id'])) {
            //     return $this->response->json(['message' => 'Anda tidak diizinkan menghapus pendaftaran ini.'], 403);
            // }

            $deleted = ActivityRegistration::delete($id);

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete Activity Registration',
                //     'description' => 'Pendaftaran ID ' . $id . ' untuk kegiatan ID ' . $registration['activity_id'] . ' dihapus.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $registration['activity_id'],
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Pendaftaran berhasil dihapus.'], 200);
            } else {
                return $this->response->json(['message' => 'Gagal menghapus pendaftaran.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in ActivityRegistrationController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat menghapus pendaftaran.'], 500);
        }
    }
}
