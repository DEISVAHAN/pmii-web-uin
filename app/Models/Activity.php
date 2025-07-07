<?php
// app/models/Activity.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\User; // Import model User jika sudah dibuat
// use App\Models\Rayon; // Import model Rayon jika sudah dibuat
// use App\Models\ActivityRegistration; // Import model ActivityRegistration jika sudah dibuat

class Activity // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'activities';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key adalah auto-incrementing
    public $incrementing = true;

    // Tipe data primary key
    protected $keyType = 'int';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'title',
        'activity_date',
        'activity_time',
        'location',
        'description',
        'image_url',
        'registration_enabled',
        'submitted_by_user_id',
        'submitted_by_rayon_id',
        'status',
        'external_link',
        'last_updated'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'activity_date' => 'date',
    //     'registration_enabled' => 'boolean',
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'last_updated' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah kegiatan diajukan oleh satu User.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function submittedBy()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'submitted_by_user_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah kegiatan dapat terkait dengan satu Rayon.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function submittedByRayon()
    {
        // Asumsi Rayon adalah model yang ada di App\Models\Rayon
        // return $this->belongsTo(Rayon::class, 'submitted_by_rayon_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah kegiatan dapat memiliki banyak pendaftar.
     *
     * @return object Relasi HasMany (contoh untuk Eloquent ORM)
     */
    public function registrations()
    {
        // Asumsi ActivityRegistration adalah model yang ada di App\Models\ActivityRegistration
        // return $this->hasMany(ActivityRegistration::class, 'activity_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua kegiatan.
     *
     * @param string|null $status Filter berdasarkan status (mis. 'approved', 'pending', 'terlaksana')
     * @return array|false Daftar kegiatan atau false jika gagal
     */
    public static function all($status = null)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM activities";
        $params = [];

        if ($status) {
            $sql .= " WHERE status = :status";
            $params['status'] = $status;
        }
        $sql .= " ORDER BY activity_date DESC, id DESC"; // Urutkan terbaru dulu

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari kegiatan berdasarkan ID.
     *
     * @param int $id ID kegiatan
     * @return array|false Data kegiatan atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM activities WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat kegiatan baru.
     *
     * @param array $data Data kegiatan yang akan disimpan
     * @return int|false ID kegiatan baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'title' => $data['title'],
            'activity_date' => $data['activity_date'],
            'activity_time' => $data['activity_time'] ?? null,
            'location' => $data['location'],
            'description' => $data['description'] ?? null,
            'image_url' => $data['image_url'] ?? null,
            'registration_enabled' => $data['registration_enabled'] ?? false,
            'submitted_by_user_id' => $data['submitted_by_user_id'] ?? null,
            'submitted_by_rayon_id' => $data['submitted_by_rayon_id'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'external_link' => $data['external_link'] ?? null,
            'last_updated' => date('Y-m-d H:i:s')
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO activities ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $db->lastInsertId(); // Mengembalikan ID yang baru dibuat
        } catch (PDOException $e) {
            error_log("Error creating activity: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui kegiatan yang sudah ada.
     *
     * @param int $id ID kegiatan
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

        $sql = "UPDATE activities SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating activity {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus kegiatan berdasarkan ID.
     *
     * @param int $id ID kegiatan
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM activities WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting activity {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui status kegiatan.
     *
     * @param int $id ID kegiatan
     * @param string $newStatus Status baru (pending, approved, rejected, terlaksana, mendatang, dibatalkan)
     * @return bool True jika berhasil, false jika gagal
     */
    public static function updateStatus($id, $newStatus)
    {
        $db = new Database();
        $sql = "UPDATE activities SET status = :status, last_updated = NOW() WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['status' => $newStatus, 'id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating status for activity {$id}: " . $e->getMessage());
            return false;
        }
    }
}
