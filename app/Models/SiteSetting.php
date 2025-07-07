<?php
// app/models/SiteSetting.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda

class SiteSetting // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'site_settings';

    // Nama kolom primary key
    protected $primaryKey = 'setting_key';

    // Menunjukkan bahwa primary key bukan auto-incrementing
    public $incrementing = false; // Karena primary key adalah string (setting_key)

    // Tipe data primary key
    protected $keyType = 'string';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'setting_key',
        'setting_value',
        'last_updated'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'last_updated' secara manual/default di DB

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua pengaturan situs.
     *
     * @return array|false Daftar pengaturan situs atau false jika gagal
     */
    public static function all()
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM site_settings";
        return $db->fetchAll($sql);
    }

    /**
     * Mencari pengaturan situs berdasarkan kunci (setting_key).
     *
     * @param string $key Kunci pengaturan (mis. 'site_title')
     * @return array|false Data pengaturan atau false jika tidak ditemukan
     */
    public static function find($key)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM site_settings WHERE setting_key = :setting_key";
        return $db->fetch($sql, ['setting_key' => $key]);
    }

    /**
     * Membuat pengaturan situs baru.
     *
     * @param array $data Data pengaturan yang akan disimpan (setting_key, setting_value)
     * @return string|false Kunci pengaturan baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'setting_key' => $data['setting_key'],
            'setting_value' => $data['setting_value'] ?? null,
            'last_updated' => date('Y-m-d H:i:s')
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO site_settings ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $params['setting_key'];
        } catch (PDOException $e) {
            error_log("Error creating site setting: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui pengaturan situs yang sudah ada.
     * Atau membuat baru jika tidak ada (upsert).
     *
     * @param string $key Kunci pengaturan
     * @param array $data Data yang akan diperbarui (setting_value)
     * @return bool True jika berhasil, false jika gagal
     */
    public static function update($key, $data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $setParts = [];
        $params = ['setting_key' => $key];

        foreach ($data as $k => $value) {
            if (in_array($k, (new self())->fillable) && $k !== 'setting_key') {
                $setParts[] = "`{$k}` = :{$k}";
                $params[$k] = $value;
            }
        }

        if (empty($setParts)) {
            return false; // Tidak ada data untuk diperbarui
        }

        $sql = "UPDATE site_settings SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE setting_key = :setting_key";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating site setting {$key}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus pengaturan situs berdasarkan kunci.
     *
     * @param string $key Kunci pengaturan
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($key)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM site_settings WHERE setting_key = :setting_key";
        try {
            $stmt = $db->query($sql, ['setting_key' => $key]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting site setting {$key}: " . $e->getMessage());
            return false;
        }
    }
}
