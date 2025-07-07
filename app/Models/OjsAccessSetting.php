<?php
// app/models/OjsAccessSetting.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda

class OjsAccessSetting // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'ojs_access_settings';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key adalah auto-incrementing
    public $incrementing = true;

    // Tipe data primary key
    protected $keyType = 'int';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'ojs_base_url',
        'api_key',
        'admin_username',
        'admin_password', // Ini harus di-hash atau dienkripsi
        'last_synced_at',
        'active',
        'last_updated'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [
        'api_key',      // Mungkin tidak perlu diekspos
        'admin_password', // Pasti tidak boleh diekspos
    ];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'last_synced_at' => 'datetime',
    //     'active' => 'boolean',
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'last_updated' secara manual/default di DB

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua pengaturan akses OJS.
     *
     * @return array|false Daftar pengaturan OJS atau false jika gagal
     */
    public static function all()
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM ojs_access_settings";
        return $db->fetchAll($sql);
    }

    /**
     * Mencari pengaturan akses OJS berdasarkan ID.
     *
     * @param int $id ID pengaturan OJS
     * @return array|false Data pengaturan OJS atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM ojs_access_settings WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat pengaturan akses OJS baru.
     *
     * @param array $data Data pengaturan yang akan disimpan
     * @return int|false ID pengaturan baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'ojs_base_url' => $data['ojs_base_url'],
            'api_key' => $data['api_key'] ?? null,
            'admin_username' => $data['admin_username'] ?? null,
            'admin_password' => $data['admin_password'] ?? null, // Asumsi sudah di-hash/enkripsi
            'last_synced_at' => $data['last_synced_at'] ?? null,
            'active' => $data['active'] ?? true,
            'last_updated' => date('Y-m-d H:i:s')
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO ojs_access_settings ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $db->lastInsertId(); // Mengembalikan ID yang baru dibuat
        } catch (PDOException $e) {
            error_log("Error creating OJS access setting: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui pengaturan akses OJS yang sudah ada.
     *
     * @param int $id ID pengaturan OJS
     * @param array $data Data yang akan diperbarui
     * @return bool True jika berhasil, false jika gagal
     */
    public static function update($id, $data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $setParts = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, (new self())->fillable) && $key !== 'id') {
                $setParts[] = "`{$key}` = :{$key}";
                $params[$key] = $value;
            }
        }

        if (empty($setParts)) {
            return false; // Tidak ada data untuk diperbarui
        }

        $sql = "UPDATE ojs_access_settings SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating OJS access setting {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus pengaturan akses OJS berdasarkan ID.
     *
     * @param int $id ID pengaturan OJS
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM ojs_access_settings WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting OJS access setting {$id}: " . $e->getMessage());
            return false;
        }
    }
}
