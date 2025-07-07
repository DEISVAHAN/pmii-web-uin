<?php
// app/models/GalleryItem.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\User;     // Import model User jika sudah dibuat
// use App\Models\Rayon;    // Import model Rayon jika sudah dibuat
// use App\Models\Activity; // Import model Activity jika sudah dibuat

class GalleryItem // Jika menggunakan framework, ini mungkin extends suatu Base Model
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'gallery_items';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key adalah auto-incrementing
    public $incrementing = true;

    // Tipe data primary key
    protected $keyType = 'int';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    protected $fillable = [
        'id',
        'caption',
        'image_url',
        'upload_date',
        'related_activity_id',
        'submitted_by_user_id',
        'submitted_by_rayon_id',
        'status',
        'last_updated'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'upload_date' => 'date',
    //     'last_updated' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'last_updated' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah item galeri diajukan oleh satu User.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function submittedBy()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->belongsTo(User::class, 'submitted_by_user_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah item galeri dapat terkait dengan satu Rayon.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function submittedByRayon()
    {
        // Asumsi Rayon adalah model yang ada di App\Models\Rayon
        // return $this->belongsTo(Rayon::class, 'submitted_by_rayon_id', 'id');
    }

    /**
     * Definisi relasi: Sebuah item galeri dapat terkait dengan satu Kegiatan.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function relatedActivity()
    {
        // Asumsi Activity adalah model yang ada di App\Models\Activity
        // return $this->belongsTo(Activity::class, 'related_activity_id', 'id');
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua item galeri.
     *
     * @param string|null $status Filter berdasarkan status (mis. 'approved', 'pending')
     * @return array|false Daftar item galeri atau false jika gagal
     */
    public static function all($status = null)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM gallery_items";
        $params = [];

        if ($status) {
            $sql .= " WHERE status = :status";
            $params['status'] = $status;
        }
        $sql .= " ORDER BY upload_date DESC, id DESC"; // Urutkan terbaru dulu

        return $db->fetchAll($sql, $params);
    }

    /**
     * Mencari item galeri berdasarkan ID.
     *
     * @param int $id ID item galeri
     * @return array|false Data item galeri atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM gallery_items WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat item galeri baru.
     *
     * @param array $data Data item galeri yang akan disimpan
     * @return int|false ID item galeri baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $params = [
            'caption' => $data['caption'] ?? null,
            'image_url' => $data['image_url'],
            'upload_date' => $data['upload_date'] ?? date('Y-m-d'),
            'related_activity_id' => $data['related_activity_id'] ?? null,
            'submitted_by_user_id' => $data['submitted_by_user_id'] ?? null,
            'submitted_by_rayon_id' => $data['submitted_by_rayon_id'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'last_updated' => date('Y-m-d H:i:s')
        ];

        $columns = implode(', ', array_keys($params));
        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($params)));

        $sql = "INSERT INTO gallery_items ({$columns}) VALUES ({$placeholders})";
        
        try {
            $db->query($sql, $params);
            return $db->lastInsertId(); // Mengembalikan ID yang baru dibuat
        } catch (PDOException $e) {
            error_log("Error creating gallery item: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui item galeri yang sudah ada.
     *
     * @param int $id ID item galeri
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

        $sql = "UPDATE gallery_items SET " . implode(', ', $setParts) . ", last_updated = NOW() WHERE id = :id";
        
        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating gallery item {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus item galeri berdasarkan ID.
     *
     * @param int $id ID item galeri
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM gallery_items WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting gallery item {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui status item galeri.
     *
     * @param int $id ID item galeri
     * @param string $newStatus Status baru (approved, rejected, pending)
     * @return bool True jika berhasil, false jika gagal
     */
    public static function updateStatus($id, $newStatus)
    {
        $db = new Database();
        $sql = "UPDATE gallery_items SET status = :status, last_updated = NOW() WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['status' => $newStatus, 'id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating status for gallery item {$id}: " . $e->getMessage());
            return false;
        }
    }
}
