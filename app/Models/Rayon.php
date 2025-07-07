<?php
// app/models/Rayon.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// Sertakan kelas Database Anda
require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\User; // Import model User jika sudah dibuat

class Rayon // Jika menggunakan framework, ini mungkin extends suatu Base Model (mis. extends Illuminate\Database\Eloquent\Model)
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'rayons';

    // Nama kolom primary key
    protected $primaryKey = 'id';

    // Menunjukkan bahwa primary key bukan auto-incrementing
    public $incrementing = false;

    // Tipe data primary key
    protected $keyType = 'string';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    // Pastikan semua kolom yang akan diisi melalui form atau API ada di sini
    protected $fillable = [
        'id',
        'name',
        'chairman',
        'chairman_photo_url',
        'description',
        'contact_phone',
        'email',
        'address',
        'instagram_url',
        'facebook_url',
        'twitter_url',
        'youtube_url',
        'logo_url',
        'cadre_count',
        'established_date',
        'vision',
        'mission',
        'updated_at'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    protected $hidden = [];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'established_date' => 'date',
    //     'updated_at' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Karena kita mengelola 'updated_at' secara manual/default di DB

    /**
     * Definisi relasi: Sebuah Rayon dapat memiliki banyak User (kader atau admin rayon).
     *
     * @return object Relasi HasMany (contoh untuk Eloquent ORM)
     */
    public function users()
    {
        // Asumsi User adalah model yang ada di App\Models\User
        // return $this->hasMany(User::class, 'rayon_id', 'id');
        // Jika tidak menggunakan ORM, relasi ini akan dihandle di controller
        // dengan melakukan query terpisah.
    }

    // --- Metode-metode statis untuk interaksi database (tanpa ORM penuh) ---

    /**
     * Mengambil semua data rayon.
     *
     * @return array|false Daftar rayon atau false jika gagal
     */
    public static function all()
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM rayons";
        return $db->fetchAll($sql);
    }

    /**
     * Mencari rayon berdasarkan ID.
     *
     * @param string $id ID rayon
     * @return array|false Data rayon atau false jika tidak ditemukan
     */
    public static function find($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "SELECT * FROM rayons WHERE id = :id";
        return $db->fetch($sql, ['id' => $id]);
    }

    /**
     * Membuat rayon baru.
     *
     * @param array $data Data rayon yang akan disimpan
     * @return string|false ID rayon baru jika berhasil, false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        // Pastikan semua field yang diisi ada di $data, gunakan nilai default jika tidak ada
        $params = [
            'id' => $data['id'],
            'name' => $data['name'],
            'chairman' => $data['chairman'] ?? null,
            'chairman_photo_url' => $data['chairman_photo_url'] ?? null,
            'description' => $data['description'] ?? null,
            'contact_phone' => $data['contact_phone'] ?? null,
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
            'instagram_url' => $data['instagram_url'] ?? null,
            'facebook_url' => $data['facebook_url'] ?? null,
            'twitter_url' => $data['twitter_url'] ?? null,
            'youtube_url' => $data['youtube_url'] ?? null,
            'logo_url' => $data['logo_url'] ?? null,
            'cadre_count' => $data['cadre_count'] ?? 0,
            'established_date' => $data['established_date'] ?? null,
            'vision' => $data['vision'] ?? null,
            'mission' => $data['mission'] ?? null,
            'updated_at' => date('Y-m-d H:i:s')
        ];

        $sql = "INSERT INTO rayons (id, name, chairman, chairman_photo_url, description, contact_phone, email, address, instagram_url, facebook_url, twitter_url, youtube_url, logo_url, cadre_count, established_date, vision, mission, updated_at)
                VALUES (:id, :name, :chairman, :chairman_photo_url, :description, :contact_phone, :email, :address, :instagram_url, :facebook_url, :twitter_url, :youtube_url, :logo_url, :cadre_count, :established_date, :vision, :mission, :updated_at)";
        
        try {
            $db->query($sql, $params);
            return $params['id'];
        } catch (PDOException $e) {
            error_log("Error creating rayon: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Memperbarui profil rayon yang sudah ada.
     *
     * @param string $id ID rayon
     * @param array $data Data rayon yang akan diperbarui
     * @return bool True jika berhasil, false jika gagal
     */
    public static function update($id, $data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        // Bangun bagian SET dari query secara dinamis
        $setParts = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            // Hanya perbarui kolom yang ada di fillable dan bukan primary key
            if (in_array($key, (new self())->fillable) && $key !== 'id') {
                $setParts[] = "`{$key}` = :{$key}";
                $params[$key] = $value;
            }
        }

        if (empty($setParts)) {
            return false; // Tidak ada data untuk diperbarui
        }

        $sql = "UPDATE rayons SET " . implode(', ', $setParts) . ", updated_at = NOW() WHERE id = :id";

        try {
            $stmt = $db->query($sql, $params);
            return $stmt->rowCount() > 0; // Mengembalikan true jika ada baris yang terpengaruh
        } catch (PDOException $e) {
            error_log("Error updating rayon {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Menghapus rayon berdasarkan ID.
     *
     * @param string $id ID rayon
     * @return bool True jika berhasil, false jika gagal
     */
    public static function delete($id)
    {
        $db = new Database(); // Pastikan kelas Database tersedia
        $sql = "DELETE FROM rayons WHERE id = :id";
        try {
            $stmt = $db->query($sql, ['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting rayon {$id}: " . $e->getMessage());
            return false;
        }
    }
}
