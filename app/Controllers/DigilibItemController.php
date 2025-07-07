<?php
// app/controllers/DigilibItemController.php

// Asumsi:
// 1. Ada kelas Database yang menangani koneksi dan eksekusi query.
// 2. Ada model DigilibItem yang bisa diakses.
// 3. Ada kelas atau fungsi untuk mencatat log aktivitas (mis. SystemActivityLog).
// 4. Ada kelas atau fungsi untuk mengirim notifikasi (mis. NotificationService).

require_once __DIR__ . '/../core/Database.php';      // Sesuaikan path ke kelas Database Anda
require_once __DIR__ . '/../models/DigilibItem.php'; // Sertakan model DigilibItem
// require_once __DIR__ . '/../models/User.             // Jika perlu berinteraksi dengan model User
// require_once __DIR__ . '/../models/Rayon.            // Jika perlu berinteraksi dengan model Rayon
// require_once __DIR__ . '/../models/DigilibCategory.   // Jika perlu berinteraksi dengan model DigilibCategory
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi

class DigilibItemController
{
    private $db;

    public function __construct()
    {
        $this->db = new Database(); // Inisialisasi koneksi database
    }

    /**
     * Mengambil daftar semua item digilib.
     * Endpoint: GET /api/digilib/items
     *
     * @param array $queryParams Query parameter untuk filter (category_id, status, rayon_id, search)
     * @return void Respons JSON akan dikirim langsung
     */
    public function index($queryParams = [])
    {
        try {
            $filters = [
                'category_id' => $queryParams['category_id'] ?? null,
                'status' => $queryParams['status'] ?? 'approved', // Default: hanya yang disetujui untuk publik
                'rayon_id' => $queryParams['rayon_id'] ?? null,
                'search' => $queryParams['search'] ?? null,
            ];

            $digilibItems = DigilibItem::all($filters);
            if ($digilibItems === false) {
                return $this->jsonResponse(['message' => 'Gagal mengambil data item digilib.'], 500);
            }

            // Opsional: Gabungkan dengan nama kategori atau rayon
            foreach ($digilibItems as &$item) {
                // if ($item['category_id']) {
                //     $category = DigilibCategory::find($item['category_id']);
                //     if ($category) $item['category_name'] = $category['name'];
                // }
                // if ($item['rayon_id']) {
                //     $rayon = Rayon::find($item['rayon_id']);
                //     if ($rayon) $item['rayon_name'] = $rayon['name'];
                // }
            }
            unset($item); // Putuskan referensi terakhir

            return $this->jsonResponse($digilibItems, 200);
        } catch (PDOException $e) {
            error_log("Database Error in DigilibItemController@index: " . $e->getMessage());
            return $this->jsonResponse(['message' => 'Terjadi kesalahan server saat mengambil item digilib.'], 500);
        }
    }

    /**
     * Mengambil detail item digilib berdasarkan ID.
     * Endpoint: GET /api/digilib/items/{id}
     *
     * @param array $params Parameter dari URL (mis. ['id' => 1])
     * @return void Respons JSON akan dikirim langsung
     */
    public function show($params)
    {
        $id = $params['id'] ?? null;

        if (!$id) {
            return $this->jsonResponse(['message' => 'ID item digilib tidak ditemukan.'], 400);
        }

        try {
            $digilibItem = DigilibItem::find($id);

            if ($digilibItem) {
                // Opsional: Gabungkan dengan nama kategori atau rayon
                // if ($digilibItem['category_id']) {
                //     $category = DigilibCategory::find($digilibItem['category_id']);
                //     if ($category) $digilibItem['category_name'] = $category['name'];
                // }
                // if ($digilibItem['rayon_id']) {
                //     $rayon = Rayon::find($digilibItem['rayon_id']);
                //     if ($rayon) $digilibItem['rayon_name'] = $rayon['name'];
                // }

                return $this->jsonResponse($digilibItem, 200);
            } else {
                return $this->jsonResponse(['message' => 'Item digilib tidak ditemukan.'], 404);
            }
        } catch (PDOException $e) {
            error_log("Database Error in DigilibItemController@show: " . $e->getMessage());
            return $this->jsonResponse(['message' => 'Terjadi kesalahan server saat mengambil detail item digilib.'], 500);
        }
    }

    /**
     * Mengunggah item digilib baru.
     * Endpoint: POST /api/digilib/items
     * Memerlukan autentikasi (komisariat atau rayon).
     *
     * @param array $requestData Data permintaan untuk item digilib baru
     * @return void Respons JSON akan dikirim langsung
     */
    public function store($requestData)
    {
        // Asumsi user yang login dapat diakses
        // $loggedInUser = Auth::user();

        // Validasi input
        $requiredFields = ['category_id', 'title', 'author', 'file_url'];
        foreach ($requiredFields as $field) {
            if (empty($requestData[$field])) {
                return $this->jsonResponse(['message' => "Field '{$field}' wajib diisi."], 400);
            }
        }

        try {
            // Cek apakah category_id valid
            // $category = DigilibCategory::find($requestData['category_id']);
            // if (!$category) {
            //     return $this->jsonResponse(['message' => 'Kategori digilib tidak valid.'], 400);
            // }

            $dataToCreate = [
                'category_id' => $requestData['category_id'],
                'title' => $requestData['title'],
                'author' => $requestData['author'],
                'abstract_description' => $requestData['abstract_description'] ?? null,
                'file_url' => $requestData['file_url'],
                'file_name' => $requestData['file_name'] ?? basename($requestData['file_url']),
                'publication_year' => $requestData['publication_year'] ?? null,
                'publisher' => $requestData['publisher'] ?? null,
                'isbn' => $requestData['isbn'] ?? null,
                'rayon_id' => ($loggedInUser->role === 'rayon') ? ($loggedInUser->rayon_id ?? null) : ($requestData['rayon_id'] ?? null),
                'period' => $requestData['period'] ?? null,
                'status' => 'pending', // Default status saat diunggah
                'uploaded_by_user_id' => $loggedInUser->id ?? null,
            ];

            $newItemId = DigilibItem::create($dataToCreate);

            if ($newItemId) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Upload Digilib Item',
                //     'description' => 'Item digilib baru "' . $requestData['title'] . '" (Kategori: ' . $requestData['category_id'] . ') diunggah.',
                //     'user_id' => $loggedInUser->id ?? 'unknown',
                //     'user_name' => $loggedInUser->name ?? 'unknown',
                //     'user_role' => $loggedInUser->role ?? 'unknown',
                //     'target_id' => $newItemId,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke admin komisariat
                // NotificationService::sendNotification('Unggahan Digilib Baru', 'Item digilib baru diunggah oleh ' . ($loggedInUser->name ?? 'Pengguna') . '.', 'info', 'komisariat');

                return $this->jsonResponse(['message' => 'Item digilib berhasil diunggah!', 'id' => $newItemId], 201);
            } else {
                return $this->jsonResponse(['message' => 'Gagal mengunggah item digilib.'], 500);
            }
        } catch (PDOException $e) {
            error_log("Database Error in DigilibItemController@store: " . $e->getMessage());
            return $this->jsonResponse(['message' => 'Terjadi kesalahan server saat mengunggah item digilib.'], 500);
        }
    }

    /**
     * Memperbarui item digilib yang sudah ada.
     * Endpoint: PUT /api/digilib/items/{id}
     * Memerlukan autentikasi (komisariat atau rayon yang mengajukan).
     *
     * @param array $params Parameter dari URL (ID item digilib)
     * @param array $requestData Data permintaan untuk pembaruan
     * @return void Respons JSON akan dikirim langsung
     */
    public function update($params, $requestData)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = Auth::user();

        if (!$id) {
            return $this->jsonResponse(['message' => 'ID item digilib tidak ditemukan.'], 400);
        }

        // Validasi input
        if (empty($requestData['title']) || empty($requestData['author']) || empty($requestData['file_url'])) {
            return $this->jsonResponse(['message' => 'Judul, penulis, dan URL file wajib diisi.'], 400);
        }

        try {
            $digilibItem = DigilibItem::find($id);
            if (!$digilibItem) {
                return $this->jsonResponse(['message' => 'Item digilib tidak ditemukan.'], 404);
            }

            // Otorisasi: Hanya admin komisariat atau rayon yang mengajukan yang bisa mengedit
            // if ($loggedInUser->role === 'rayon' && $digilibItem['uploaded_by_user_id'] !== $loggedInUser->id) {
            //     return $this->jsonResponse(['message' => 'Anda tidak diizinkan mengedit item digilib ini.'], 403);
            // }

            $dataToUpdate = [
                'category_id' => $requestData['category_id'] ?? $digilibItem['category_id'],
                'title' => $requestData['title'],
                'author' => $requestData['author'],
                'abstract_description' => $requestData['abstract_description'] ?? $digilibItem['abstract_description'],
                'file_url' => $requestData['file_url'],
                'file_name' => $requestData['file_name'] ?? $digilibItem['file_name'],
                'publication_year' => $requestData['publication_year'] ?? $digilibItem['publication_year'],
                'publisher' => $requestData['publisher'] ?? $digilibItem['publisher'],
                'isbn' => $requestData['isbn'] ?? $digilibItem['isbn'],
                'rayon_id' => $requestData['rayon_id'] ?? $digilibItem['rayon_id'],
                'period' => $requestData['period'] ?? $digilibItem['period'],
                'status' => $requestData['status'] ?? $digilibItem['status'], // Status juga bisa diupdate
            ];

            $updated = DigilibItem::update($id, $dataToUpdate);

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Update Digilib Item',
                //     'description' => 'Item digilib "' . $requestData['title'] . '" (ID: ' . $id . ') diperbarui.',
                //     'user_id' => $loggedInUser->id ?? 'unknown',
                //     'user_name' => $loggedInUser->name ?? 'unknown',
                //     'user_role' => $loggedInUser->role ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->jsonResponse(['message' => 'Item digilib berhasil diperbarui.'], 200);
            } else {
                return $this->jsonResponse(['message' => 'Tidak ada perubahan data atau gagal memperbarui item digilib.'], 400);
            }
        } catch (PDOException $e) {
            error_log("Database Error in DigilibItemController@update: " . $e->getMessage());
            return $this->jsonResponse(['message' => 'Terjadi kesalahan server saat memperbarui item digilib.'], 500);
        }
    }

    /**
     * Menghapus item digilib.
     * Endpoint: DELETE /api/digilib/items/{id}
     * Memerlukan autentikasi (komisariat atau rayon yang mengajukan).
     *
     * @param array $params Parameter dari URL (ID item digilib)
     * @return void Respons JSON akan dikirim langsung
     */
    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = Auth::user();

        if (!$id) {
            return $this->jsonResponse(['message' => 'ID item digilib tidak ditemukan.'], 400);
        }

        try {
            $digilibItem = DigilibItem::find($id);
            if (!$digilibItem) {
                return $this->jsonResponse(['message' => 'Item digilib tidak ditemukan.'], 404);
            }

            // Otorisasi: Hanya admin komisariat atau rayon yang mengajukan yang bisa menghapus
            // if ($loggedInUser->role === 'rayon' && $digilibItem['uploaded_by_user_id'] !== $loggedInUser->id) {
            //     return $this->jsonResponse(['message' => 'Anda tidak diizinkan menghapus item digilib ini.'], 403);
            // }

            $deleted = DigilibItem::delete($id);

            if ($deleted) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => 'Delete Digilib Item',
                //     'description' => 'Item digilib dengan ID ' . $id . ' dihapus.',
                //     'user_id' => $loggedInUser->id ?? 'unknown',
                //     'user_name' => $loggedInUser->name ?? 'unknown',
                //     'user_role' => $loggedInUser->role ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return $this->jsonResponse(['message' => 'Item digilib berhasil dihapus.'], 200);
            } else {
                return $this->jsonResponse(['message' => 'Gagal menghapus item digilib.'], 500);
            }
        } catch (PDOException $e) {
            error_log("Database Error in DigilibItemController@destroy: " . $e->getMessage());
            return $this->jsonResponse(['message' => 'Terjadi kesalahan server saat menghapus item digilib.'], 500);
        }
    }

    /**
     * Memperbarui status item digilib (menyetujui/menolak).
     * Endpoint: PUT /api/digilib/items/{id}/approve atau /reject
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (ID item digilib)
     * @param string $action 'approve' atau 'reject'
     * @return void Respons JSON akan dikirim langsung
     */
    public function updateStatus($params, $action)
    {
        $id = $params['id'] ?? null;
        // $loggedInUser = Auth::user();

        if (!$id) {
            return $this->jsonResponse(['message' => 'ID item digilib tidak ditemukan.'], 400);
        }

        $newStatus = ($action === 'approve') ? 'approved' : 'rejected';

        try {
            $updated = DigilibItem::updateStatus($id, $newStatus);

            if ($updated) {
                // Catat aktivitas
                // SystemActivityLog::create([
                //     'activity_type' => ucfirst($action) . ' Digilib Item',
                //     'description' => 'Item digilib dengan ID ' . $id . ' ' . $newStatus . '.',
                //     'user_id' => $loggedInUser->id ?? 'unknown',
                //     'user_name' => $loggedInUser->name ?? 'unknown',
                //     'user_role' => $loggedInUser->role ?? 'unknown',
                //     'target_id' => $id,
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                // Kirim notifikasi ke pengunggah (jika ada)
                // $item = DigilibItem::find($id);
                // if ($item && $item['uploaded_by_user_id']) {
                //     $notifTitle = "Item Digilib Anda " . ucfirst($newStatus);
                //     $notifContent = "Item digilib Anda \"" . $item['title'] . "\" telah " . $newStatus . ".";
                //     NotificationService::sendNotification($notifTitle, $notifContent, $newStatus === 'approved' ? 'success' : 'error', 'user', $item['uploaded_by_user_id']);
                // }

                return $this->jsonResponse(['message' => 'Item digilib berhasil di' . $newStatus . '.'], 200);
            } else {
                return $this->jsonResponse(['message' => 'Gagal memperbarui status item digilib atau tidak ada perubahan.'], 500);
            }
        } catch (PDOException $e) {
            error_log("Database Error in DigilibItemController@updateStatus ({$action}): " . $e->getMessage());
            return $this->jsonResponse(['message' => 'Terjadi kesalahan server saat memperbarui status item digilib.'], 500);
        }
    }


    /**
     * Fungsi pembantu untuk mengirim respons JSON dan menghentikan eksekusi.
     *
     * @param array $data Data yang akan dienkode ke JSON
     * @param int $statusCode Kode status HTTP
     * @return void
     */
    private function jsonResponse($data, $statusCode)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit();
    }
}
