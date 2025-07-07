<?php
// app/models/ActivityRegistration.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\User; // Import model User jika sudah dibuat
// use App\Models\Activity; // Import model Activity jika sudah dibuat

class ActivityRegistration // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'activity_registrations';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key adalah auto-incrementing
    public $incrementing = true;

    // Tipe data primary key
    protected $keyType = 'int';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'activity_id',
        'registrant_name',
        'registrant_email',
        'registrant_phone',
        'registrant_type',
        'registered_at',
        'registrant_user_id'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'registered_at' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'registered_at' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah pendaftaran dimiliki oleh satu Kegiatan.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function activity()
    {
        // Asumsi Activity adalah model yang ada di App\Models\Activity
        // return $this->belongsTo(Activity::class, 'activity_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah pendaftaran dapat terkait dengan satu User (jika pendaftar adalah kader).
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function registrantUser()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'registrant_user_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua pendaftaran kegiatan, atau filter berdasarkan activity_id.
     *
     * @param int|null $activityId ID kegiatan untuk memfilter pendaftaran
     * @return array|false Daftar pendaftaran atau false jika gagal
     */
    public static function all($activityId = null)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM activity_registrations";
        $params = [];

        if ($activityId) {
            $sql .= " WHERE activity_id = :activity_id";
            $params['activity_id'] = $activityId;
        }
        $sql .= " ORDER BY registered_at DESC"; // Urutkan terbaru dulu

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari pendaftaran berdasarkan ID.
     *
     * @param int $id ID pendaftaran
     * @return array|false Data pendaftaran atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM activity_registrations WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat pendaftaran baru.
     *
     * @param array $data Data pendaftaran yang akan disimpan
     * @return int|false ID pendaftaran baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'activity_id' => $data['activity_id'],
            'registrant_name' => $data['registrant_name'],
            'registrant_email' => $data['registrant_email'] ?? null,
            'registrant_phone' => $data['registrant_phone'] ?? null,
            'registrant_type' => $data['registrant_type'],
            'registered_at' => date('Y-m-d H:i:s'),
            'registrant_user_id' => $data['registrant_user_id'] ?? null,
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO activity_registrations ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $db->lastInsertId(); // Mengembalikan ID yang baru dibuat
        } catch (PDOException $e) {
            error_log("Error creating activity registration: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui pendaftaran yang sudah ada.
     * (Mungkin tidak umum untuk pendaftaran, tapi disertakan untuk kelengkapan CRUD)
     *
     * @param int $id ID pendaftaran
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

        $sql = "UPDATE activity_registrations SET " . implode(', ', $setParts) . " WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating activity registration {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus pendaftaran berdasarkan ID.
     *
     * @param int $id ID pendaftaran
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM activity_registrations WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting activity registration {$id}: " . $e->getMessage());
            return false;
        }
    }
}
