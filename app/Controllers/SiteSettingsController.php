<?php
// app/controllers/SiteSettingsController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\SiteSetting; // Sertakan model SiteSetting
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas

class SiteSettingsController
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
     * Mengambil semua pengaturan situs.
     * Endpoint: GET /api/settings
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        try {
            $settings = SiteSetting::all();
            if ($settings === false) {
                return $this->response->json(['message' => 'Failed to retrieve site settings.'], 500);
            }

            // Format settings into a key-value pair object for easier frontend consumption
            $formattedSettings = [];
            foreach ($settings as $setting) {
                $formattedSettings[$setting['setting_key']] = $setting['setting_value'];
            }

            return $this->response->json($formattedSettings, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in SiteSettingsController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving site settings.'], 500);
        }
    }

    /**
     * Memperbarui pengaturan situs yang sudah ada.
     * Endpoint: PUT /api/settings
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function update()
    {
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (empty($requestData)) {
            return $this->response->json(['message' => 'No settings data provided for update.'], 400);
        }

        $updatedCount = 0;
        $errors = [];

        try {
            $this->db->beginTransaction(); // Mulai transaksi

            foreach ($requestData as $key => $value) {
                // Cek apakah pengaturan sudah ada
                $existingSetting = SiteSetting::find($key);

                $dataToSave = [
                    'setting_value' => $value,
                ];

                if ($existingSetting) {
                    // Perbarui pengaturan yang sudah ada
                    $updated = SiteSetting::update($key, $dataToSave);
                    if ($updated) {
                        $updatedCount++;
                    }
                } else {
                    // Buat pengaturan baru jika tidak ada (upsert logic)
                    $dataToSave['setting_key'] = $key;
                    $created = SiteSetting::create($dataToSave);
                    if ($created) {
                        $updatedCount++;
                    }
                }
            }

            $this->db->commit(); // Commit transaksi jika semua berhasil

            // Catat aktivitas
            // SystemActivityLog::create([
            //     'activity_type' => 'Update Site Settings',
            //     'description' => 'Site settings updated. ' . $updatedCount . ' settings modified.',
            //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
            //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
            //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
            //     'timestamp' => date('Y-m-d H:i:s')
            // ]);

            return $this->response->json(['message' => 'Site settings successfully updated.', 'updated_count' => $updatedCount], 200);

        } catch (\PDOException $e) {
            $this->db->rollback(); // Rollback transaksi jika ada error
            error_log("Database Error in SiteSettingsController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while updating site settings. Changes have been rolled back.'], 500);
        } catch (\Exception $e) {
            $this->db->rollback(); // Rollback transaksi untuk error non-PDO
            error_log("Error in SiteSettingsController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'An unexpected error occurred while updating site settings. Changes have been rolled back.'], 500);
        }
    }
}
