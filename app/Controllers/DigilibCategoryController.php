<?php
// app/controllers/DigilibCategoryController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\DigilibCategory; // Sertakan model DigilibCategory
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Models\DigilibItem; // Jika perlu memeriksa item terkait

class DigilibCategoryController
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
     * Mengambil daftar semua kategori digilib.
     * Endpoint: GET /api/digilib/categories
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function index()
    {
        $queryParams = $this->request->getQueryParams();
        try {
            $onlyActive = isset($queryParams['active']) && filter_var($queryParams['active'], FILTER_VALIDATE_BOOLEAN);

            $categories = DigilibCategory::all($onlyActive);
            if ($categories === false) {
                return $this->response->json(['message' => 'Failed to retrieve digilib categories.'], 500);
            }
            return $this->response->json($categories, 200);
        } catch (\PDOException $e) {
            error_log("Database Error in DigilibCategoryController@index: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving digilib categories.'], 500);
        }
    }

    /**
     * Mengambil detail kategori digilib berdasarkan ID.
     * Endpoint: GET /api/digilib/categories/{id}
     *
     * @param array $params Parameter dari URL (mis. ['id' => 'makalah_kader'])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Category ID not found.'], 400);
        }

        try {
            $category = DigilibCategory::find($id);

            if ($category) {
                return $this->response->json($category, 200);
            } else {
                return $this->response->json(['message' => 'Digilib category not found.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in DigilibCategoryController@show: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while retrieving category details.'], 500);
        }
    }

    /**
     * Membuat kategori digilib baru.
     * Endpoint: POST /api/digilib/categories
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function store()
    {
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        // Validasi input
        $requiredFields = ['id', 'name'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->response->json(['message' => "Field '{$field}' is required."], 400);
            }
        }

        try {
            // Cek duplikasi ID
            $existingCategory = DigilibCategory::find($requestData['id']);
            if ($existingCategory) {
                return $this->response->json(['message' => 'Category ID already exists.'], 409);
            }

            $dataToCreate = [
                'id' => $requestData['id'],
                'name' => $requestData['name'],
                'description' => $requestData['description'] ?? null,
                'icon_class' => $requestData['icon_class'] ?? null,
                'target_page_url' => $requestData['target_page_url'] ?? null,
                'is_external_link' => $requestData['is_external_link'] ?? false,
                'is_active' => $requestData['is_active'] ?? true,
            ];

            $newCategoryId = DigilibCategory::create($dataToCreate);

            if ($newCategoryId) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Create Digilib Category',
                //     'description' => 'New digilib category "' . $requestData['name'] . '" (ID: ' . $newCategoryId . ') created.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $newCategoryId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Digilib category successfully created!', 'id' => $newCategoryId], 201);
            } else {
                return $this->response->json(['message' => 'Failed to create digilib category.'], 500);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in DigilibCategoryController@store: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while creating digilib category.'], 500);
        }
    }

    /**
     * Memperbarui kategori digilib yang sudah ada.
     * Endpoint: PUT /api/digilib/categories/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID kategori)
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params)
    {
        $id = $params['id'] ?? null;
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Category ID not found.'], 400);
        }

        // Validasi input (minimal)
        if (empty($requestData['name'])) {
            return $this->response->json(['message' => 'Category name is required.'], 400);
        }

        try {
            $category = DigilibCategory::find($id);
            if (!$category) {
                return $this->response->json(['message' => 'Digilib category not found.'], 404);
            }

            $dataToUpdate = [
                'name' => $requestData['name'],
                'description' => $requestData['description'] ?? $category['description'],
                'icon_class' => $requestData['icon_class'] ?? $category['icon_class'],
                'target_page_url' => $requestData['target_page_url'] ?? $category['target_page_url'],
                'is_external_link' => $requestData['is_external_link'] ?? $category['is_external_link'],
                'is_active' => $requestData['is_active'] ?? $category['is_active'],
            ];

            $updated = DigilibCategory::update($id, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Update Digilib Category',
                //     'description' => 'Digilib category "' . $requestData['name'] . '" (ID: ' . $id . ') updated.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Digilib category successfully updated.'], 200);
            } else {
                return $this->response->json(['message' => 'No data changes or failed to update digilib category.'], 400);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in DigilibCategoryController@update: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while updating digilib category.'], 500);
        }
    }

    /**
     * Menghapus kategori digilib.
     * Endpoint: DELETE /api/digilib/categories/{id}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID kategori)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$id) {
            return $this->response->json(['message' => 'Category ID not found.'], 400);
        }

        try {
            // Periksa apakah ada item digilib yang masih terkait dengan kategori ini
            // Jika skema database menggunakan ON DELETE RESTRICT, operasi ini akan gagal secara otomatis
            // $relatedItems = \App\Models\DigilibItem::all(['category_id' => $id]);
            // if (!empty($relatedItems)) {
            //     return $this->response->json(['message' => 'Cannot delete category with associated digilib items. Please reassign or delete items first.'], 409);
            // }

            $deleted = DigilibCategory::delete($id);

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete Digilib Category',
                //     'description' => 'Digilib category (ID: ' . $id . ') deleted.',
                //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
                //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
                //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->response->json(['message' => 'Digilib category successfully deleted.'], 200);
            } else {
                return $this->response->json(['message' => 'Digilib category not found or failed to delete.'], 404);
            }
        } catch (\PDOException $e) {
            error_log("Database Error in DigilibCategoryController@destroy: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while deleting digilib category.'], 500);
        }
    }
}
