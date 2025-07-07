<?php
// app/models/Notification.php

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

class Notification // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'notifications';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key adalah auto-incrementing
    public $incrementing = true;

    // Tipe data primary key
    protected $keyType = 'int';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'type',
        'title',
        'content',
        'target_role',
        'target_user_id',
        'target_rayon_id',
        'sender_user_id',
        'sender_role',
        'timestamp'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'timestamp' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'timestamp' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah notifikasi dikirim oleh satu User.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function sender()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'sender_user_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah notifikasi dapat ditujukan ke satu User spesifik.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function targetUser()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'target_user_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah notifikasi dapat ditujukan ke satu Rayon spesifik.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function targetRayon()
    {
        // Asumsi Rayon adalah model yang ada di App\Models\Rayon
        // return $this->belongsTo(Rayon::class, 'target_rayon_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua notifikasi, dengan opsi filter.
     *
     * @param array $filters Array filter (mis. ['target_user_id' => 'user_id_x', 'sender_role' => 'komisariat'])
     * @return array|false Daftar notifikasi atau false jika gagal
     */
    public static function all($filters = [])
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM notifications";
        $params = [];
        $whereClauses = [];

        if (isset($filters['type'])) {
            $whereClauses[] = "type = :type";
            $params['type'] = $filters['type'];
        }
        if (isset($filters['target_role'])) {
            $whereClauses[] = "target_role = :target_role";
            $params['target_role'] = $filters['target_role'];
        }
        if (isset($filters['target_user_id'])) {
            $whereClauses[] = "target_user_id = :target_user_id";
            $params['target_user_id'] = $filters['target_user_id'];
        }
        if (isset($filters['target_rayon_id'])) {
            $whereClauses[] = "target_rayon_id = :target_rayon_id";
            $params['target_rayon_id'] = $filters['target_rayon_id'];
        }
        if (isset($filters['sender_user_id'])) {
            $whereClauses[] = "sender_user_id = :sender_user_id";
            $params['sender_user_id'] = $filters['sender_user_id'];
        }
        if (isset($filters['sender_role'])) {
            $whereClauses[] = "sender_role = :sender_role";
            $params['sender_role'] = $filters['sender_role'];
        }

        if (!empty($whereClauses)) {
            $sql .= " WHERE " . implode(' AND ', $whereClauses);
        }
        $sql .= " ORDER BY timestamp DESC, id DESC"; // Urutkan terbaru dulu

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari notifikasi berdasarkan ID.
     *
     * @param int $id ID notifikasi
     * @return array|false Data notifikasi atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM notifications WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat notifikasi baru.
     *
     * @param array $data Data notifikasi yang akan disimpan
     * @return int|false ID notifikasi baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'type' => $data['type'],
            'title' => $data['title'],
            'content' => $data['content'],
            'target_role' => $data['target_role'],
            'target_user_id' => $data['target_user_id'] ?? null,
            'target_rayon_id' => $data['target_rayon_id'] ?? null,
            'sender_user_id' => $data['sender_user_id'],
            'sender_role' => $data['sender_role'],
            'timestamp' => date('Y-m-d H:i:s')
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO notifications ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $db->lastInsertId(); // Mengembalikan ID yang baru dibuat
        } catch (PDOException $e) {
            error_log("Error creating notification: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui notifikasi yang sudah ada.
     * (Mungkin tidak umum untuk notifikasi, tapi disertakan untuk kelengkapan CRUD)
     *
     * @param int $id ID notifikasi
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

        $sql = "UPDATE notifications SET " . implode(', ', $setParts) . " WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating notification {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus notifikasi berdasarkan ID.
     *
     * @param int $id ID notifikasi
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM notifications WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting notification {$id}: " . $e->getMessage());
            return false;
        }
    }
}
