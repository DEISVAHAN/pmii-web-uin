<?php
// app/controllers/OjsAccessSettingController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\OjsAccessSetting; // Sertakan model OjsAccessSetting
// use App\Models\User;                 // Jika perlu berinteraksi dengan model User
// use App\Models\SystemActivityLog;     // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi
// use App\Services\OjsApiService;       // Jika ada service untuk interaksi API OJS

class OjsAccessSettingController
{
    private $request;
    private $response;
    private $db;
    // protected $ojsApiService; // Jika menggunakan service OJS API

    public function __construct()
    {
        $this->request = new Request();
        $this->response = new Response();
        $this->db = new \App\Core\Database(); // Inisialisasi koneksi database
        // $this->ojsApiService = new \App\Services\OjsApiService(); // Inisialisasi service OJS API
    }

    /**
     * Mengambil semua pengaturan akses OJS.
     * Endpoint: GET /api/ojs-settings
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        try {
            $settings = OjsAccessSetting::all();
            if ($settings === false) {
                return $this->response->json(['message' => 'Failed to retrieve OJS access settings.'], 500);
            }
            return $this->response->json($settings, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in OjsAccessSettingController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving OJS access settings.'], 500);
        }
    }

    /**
     * Memperbarui pengaturan akses OJS yang sudah ada.
     * Endpoint: PUT /api/ojs-settings/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID pengaturan OJS)
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'OJS setting ID not found.'], 400);
        }

        // Validasi input
        if (empty($requestData['ojs_base_url'])) {
            return $this->response->json(['message' => 'Base URL OJS is required.'], 400);
        }
        if (!filter_var($requestData['ojs_base_url'], FILTER_VALIDATE_URL)) {
            return $this->response->json(['message' => 'Invalid OJS Base URL format.'], 400);
        }

        try {
            $setting = OjsAccessSetting::find($id);
            if (!$setting) {
                return $this->response->json(['message' => 'OJS setting not found.'], 404);
            }

            // Hash password admin OJS jika ada perubahan
            if (isset($requestData['admin_password']) && !empty($requestData['admin_password'])) {
                $requestData['admin_password'] = password_hash($requestData['admin_password'], PASSWORD_DEFAULT);
            } else {
                // Jika password tidak diisi, gunakan password lama dari DB
                unset($requestData['admin_password']);
            }

            $dataToUpdate = [
                'ojs_base_url' => $requestData['ojs_base_url'],
                'api_key' => $requestData['api_key'] ?? $setting['api_key'],
                'admin_username' => $requestData['admin_username'] ?? $setting['admin_username'],
                'admin_password' => $requestData['admin_password'] ?? $setting['admin_password'],
                'active' => $requestData['active'] ?? $setting['active'],
            ];

            $updated = OjsAccessSetting::update($id, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // \App\Models\SystemActivityLog::create([
                //     'activity_type' => 'Update OJS Settings',
                //     'description' => 'OJS access settings (ID: ' . $id . ') updated.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'OJS access settings successfully updated.'], 200);
            } else {
                return $this->response->json(['message' => 'No data changes or failed to update OJS access settings.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in OjsAccessSettingController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while updating OJS access settings.'], 500);
        }
    }

    /**
     * Memicu sinkronisasi data dengan sistem OJS eksternal.
     * Endpoint: POST /api/ojs-settings/sync
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function sync()
    {
        $requestData = $this->request->getBody(); // Ambil body jika ada filter sinkronisasi
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        try {
            // Ambil pengaturan OJS yang aktif
            $settings = OjsAccessSetting::all(['active' => true]);
            if (empty($settings)) {
                return $this->response->json(['message' => 'No active OJS settings found to synchronize.'], 404);
            }
            $ojsSetting = $settings[0]; // Asumsi hanya ada satu set pengaturan OJS utama

            // --- SIMULASI LOGIKA SINKRONISASI DENGAN OJS API ---
            // Di sini Anda akan memanggil service OJS API Anda
            // $syncResult = $this->ojsApiService->syncData($ojsSetting['ojs_base_url'], $ojsSetting['api_key'], $ojsSetting['admin_username'], $ojsSetting['admin_password']);

            // Contoh hasil simulasi
            $syncSuccess = true;
            $syncedRecordsCount = rand(10, 50);

            if ($syncSuccess) {
                // Perbarui timestamp last_synced_at di database
                OjsAccessSetting::update($ojsSetting['id'], ['last_synced_at' => date('Y-m-d H:i:s')]);

                // Catat aktivitas
                // \App\Models\SystemActivityLog::create([
                //     'activity_type' => 'OJS Sync',
                //     'description' => 'OJS sync successful. ' . $syncedRecordsCount . ' records synchronized.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $ojsSetting['id'],
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi sukses
                // \App\Services\NotificationService::sendNotification('OJS Sync Successful', 'OJS data synchronized. ' . $syncedRecordsCount . ' records updated.', 'success', 'komisariat');

                return $this->response->json(['message' => 'OJS synchronization successful!', 'synced_records' => $syncedRecordsCount], 200);
            } else {
                // Catat aktivitas error
                // \App\Models\SystemActivityLog::create([
                //     'activity_type' => 'OJS Sync Failed',
                //     'description' => 'Failed to synchronize OJS.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $ojsSetting['id'],
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi error
                // \App\Services\NotificationService::sendNotification('OJS Sync Failed', 'An error occurred during OJS synchronization. Please check logs.', 'error', 'komisariat');

                return $this->response->json(['message' => 'Failed to synchronize OJS. Please check configuration or server logs.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in OjsAccessSettingController@sync: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while triggering OJS synchronization.'], 500);
        } catch (\Exception $e) { // Tangani error dari OjsApiService jika ada
            error_log("OJS API Sync Error: " . $e->getMessage());
            return $this->response->json(['message' => 'An error occurred while communicating with OJS API: ' . $e->getMessage()], 500);
        }
    }
}
