<?php
// app/controllers/HomepageSectionController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\HomepageSection; // Sertakan model HomepageSection
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas

class HomepageSectionController
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
     * Mengambil semua bagian beranda.
     * Endpoint: GET /api/homepage-sections
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        try {
            $sections = HomepageSection::all();
            if ($sections === false) {
                return $this->response->json(['message' => 'Gagal mengambil data bagian beranda.'], 500);
            }

            // Dekode JSON content_json untuk setiap bagian
            foreach ($sections as &$section) {
                if (isset($section['content_json'])) {
                    $section['content_json'] = json_decode($section['content_json'], true);
                }
            }
            unset($section); // Putuskan referensi terakhir

            return $this->response->json($sections, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in HomepageSectionController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat mengambil bagian beranda.'], 500);
        }
    }

    /**
     * Memperbarui bagian beranda yang sudah ada.
     * Endpoint: PUT /api/homepage-sections/{section_name}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (nama bagian)
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $sectionName = $params['section_name'] ?? null;
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$sectionName) {
            return $this->response->json(['message' => 'Nama bagian beranda tidak ditemukan.'], 400);
        }

        // Validasi input
        if (!isset($requestData['content_json'])) {
            return $this->response->json(['message' => 'Konten JSON wajib diisi.'], 400);
        }

        try {
            $section = HomepageSection::find($sectionName);
            $dataToUpdate = [
                'content_json' => $requestData['content_json'],
            ];

            if (!$section) {
                // Jika bagian tidak ada, buat baru
                $dataToCreate = array_merge(['section_name' => $sectionName], $dataToUpdate);
                $newSectionId = HomepageSection::create($dataToCreate);
                if ($newSectionId) {
                     // Catat aktivitas
                    // SystemActivityLog::create([
                    //     'activity_type' => 'Create Homepage Section',
                    //     'description' => 'Bagian beranda baru "' . $sectionName . '" dibuat.',
                    //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                    //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                    //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                    //     'target_id' => $sectionName,
                    //     'timestamp' => date('Y-m-d H:i:s')
                    // ]);
                    return $this->response->json(['message' => 'Bagian beranda berhasil dibuat dan diperbarui.'], 201);
                } else {
                    return $this->response->json(['message' => 'Gagal membuat atau memperbarui bagian beranda.'], 500);
                }
            }

            $updated = HomepageSection::update($sectionName, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Update Homepage Section',
                //     'description' => 'Konten bagian beranda "' . $sectionName . '" diperbarui.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $sectionName,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Bagian beranda berhasil diperbarui.'], 200);
            } else {
                return $this->response->json(['message' => 'Tidak ada perubahan data atau gagal memperbarui bagian beranda.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in HomepageSectionController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Terjadi kesalahan server saat memperbarui bagian beranda.'], 500);
        }
    }
}
