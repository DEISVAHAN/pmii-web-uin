<?php
// app/models/SystemActivityLog.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\User; // Import model User jika sudah dibuat

class SystemActivityLog // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'system_activity_logs';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key adalah auto-incrementing
    public $incrementing = true;

    // Tipe data primary key
    protected $keyType = 'int';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'activity_type',
        'description',
        'user_id',
        'user_name',
        'user_role',
        'target_id',
        'timestamp',
        'ip_address',
        'details' // Kolom JSON
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'timestamp' => 'datetime',
    //     'details' => 'array', // Mengubah kolom JSON menjadi array/objek PHP
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'timestamp' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah log aktivitas dapat terkait dengan satu User.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function user()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua log aktivitas sistem, dengan opsi filter.
     *
     * @param array $filters Array filter (mis. ['user_id' => 'user_id_x', 'activity_type' => 'Login'])
     * @return array|false Daftar log aktivitas atau false jika gagal
     */
    public static function all($filters = [])
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM system_activity_logs";
        $params = [];
        $whereClauses = [];

        if (isset($filters['activity_type'])) {
            $whereClauses[] = "activity_type = :activity_type";
            $params['activity_type'] = $filters['activity_type'];
        }
        if (isset($filters['user_id'])) {
            $whereClauses[] = "user_id = :user_id";
            $params['user_id'] = $filters['user_id'];
        }
        if (isset($filters['user_role'])) {
            $whereClauses[] = "user_role = :user_role";
            $params['user_role'] = $filters['user_role'];
        }
        if (isset($filters['target_id'])) {
            $whereClauses[] = "target_id = :target_id";
            $params['target_id'] = $filters['target_id'];
        }
        // Filter berdasarkan rentang waktu (contoh: 'start_date', 'end_date')
        if (isset($filters['start_date'])) {
            $whereClauses[] = "timestamp >= :start_date";
            $params['start_date'] = $filters['start_date'];
        }
        if (isset($filters['end_date'])) {
            $whereClauses[] = "timestamp <= :end_date";
            $params['end_date'] = $filters['end_date'];
        }

        if (!empty($whereClauses)) {
            $sql .= " WHERE " . implode(' AND ', $whereClauses);
        }
        $sql .= " ORDER BY timestamp DESC, id DESC"; // Urutkan terbaru dulu

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari log aktivitas berdasarkan ID.
     *
     * @param int $id ID log aktivitas
     * @return array|false Data log aktivitas atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM system_activity_logs WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat log aktivitas baru.
     *
     * @param array $data Data log aktivitas yang akan disimpan
     * @return int|false ID log aktivitas baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'activity_type' => $data['activity_type'],
            'description' => $data['description'],
            'user_id' => $data['user_id'] ?? null,
            'user_name' => $data['user_name'] ?? null,
            'user_role' => $data['user_role'] ?? null,
            'target_id' => $data['target_id'] ?? null,
            'timestamp' => $data['timestamp'] ?? date('Y-m-d H:i:s'),
            'ip_address' => $data['ip_address'] ?? null,
            'details' => isset($data['details']) ? json_encode($data['details']) : null, // Encode JSON
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO system_activity_logs ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $db->lastInsertId(); // Mengembalikan ID yang baru dibuat
        } catch (PDOException $e) {
            error_log("Error creating system activity log: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui log aktivitas yang sudah ada.
     * (Mungkin jarang diperlukan untuk log, tapi disertakan untuk kelengkapan CRUD)
     *
     * @param int $id ID log aktivitas
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
                // Encode JSON kolom jika diperlukan
                $params[$key] = ($key === 'details') ? json_encode($value) : $value;
            }
        }

        if (empty($setParts)) {
            return false; // Tidak ada data untuk diperbarui
        }

        $sql = "UPDATE system_activity_logs SET " . implode(', ', $setParts) . " WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating system activity log {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus log aktivitas berdasarkan ID.
     *
     * @param int $id ID log aktivitas
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM system_activity_logs WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting system activity log {$id}: " . $e->getMessage());
            return false;
        }
    }
}
