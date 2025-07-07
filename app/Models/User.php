<?php
// app/models/User.php

// Asumsi: Anda memiliki base Model class yang menyediakan fungsionalitas dasar
// untuk berinteraksi dengan database (misalnya, dari framework seperti Laravel,
// atau implementasi ORM/Query Builder kustom Anda sendiri).
// Jika Anda tidak menggunakan framework, Anda perlu mengimplementasikan
// metode-metode database (seperti find, create, update) secara manual di sini
// atau melalui kelas Database yang lebih rendah.

// use App\Models\KaderProfile; // Import model KaderProfile jika sudah dibuat
// use App\Models\Rayon;       // Import model Rayon jika sudah dibuat

class User // Jika menggunakan framework, ini mungkin extends suatu Base Model (mis. extends Illuminate\Database\Eloquent\Model)
{
    // Nama tabel database yang terkait dengan model ini
    protected $table = 'users';

    // Kolom-kolom yang dapat diisi secara massal (mass-assignable)
    // Pastikan semua kolom yang akan diisi melalui form atau API ada di sini
    protected $fillable = [
        'id',
        'name',
        'nim_username',
        'email',
        'password',
        'role',
        'jabatan',
        'rayon_id',
        'klasifikasi',
        'status_akun',
        'last_login',
        'profile_visibility',
        'notification_emails',
        'created_at'
    ];

    // Kolom-kolom yang harus disembunyikan saat model diubah menjadi array/JSON
    // Penting untuk keamanan agar password hash tidak dikirim ke frontend
    protected $hidden = [
        'password',
    ];

    // Tipe data untuk atribut tertentu (opsional, tergantung framework)
    // protected $casts = [
    //     'profile_visibility' => 'boolean',
    //     'notification_emails' => 'boolean',
    //     'last_login' => 'datetime',
    //     'created_at' => 'datetime',
    // ];

    // Menonaktifkan timestamps otomatis jika framework Anda mengaktifkannya secara default
    // public $timestamps = false; // Jika Anda mengelola created_at dan updated_at secara manual

    /**
     * Definisi relasi: Seorang User memiliki satu KaderProfile.
     * Digunakan jika role user adalah 'kader'.
     *
     * @return object Relasi HasOne (contoh untuk Eloquent ORM)
     */
    public function kaderProfile()
    {
        // Asumsi KaderProfile adalah model yang ada di App\Models\KaderProfile
        // return $this->hasOne(KaderProfile::class, 'user_id', 'id');
        // Jika tidak menggunakan ORM, relasi ini akan dihandle di controller
        // dengan melakukan query terpisah.
    }

    /**
     * Definisi relasi: Seorang User (dengan role 'kader' atau 'rayon')
     * termasuk dalam satu Rayon.
     *
     * @return object Relasi BelongsTo (contoh untuk Eloquent ORM)
     */
    public function rayon()
    {
        // Asumsi Rayon adalah model yang ada di App\Models\Rayon
        // return $this->belongsTo(Rayon::class, 'rayon_id', 'id');
        // Jika tidak menggunakan ORM, relasi ini akan dihandle di controller
        // dengan melakukan query terpisah.
    }

    // --- Metode-metode lain yang mungkin Anda butuhkan ---

    /**
     * Metode statis untuk mencari pengguna berdasarkan email.
     * (Contoh implementasi dasar tanpa ORM penuh, menggunakan kelas Database kustom)
     *
     * @param string $email Email pengguna
     * @return array|false Data pengguna atau false jika tidak ditemukan
     */
    public static function findByEmail($email)
    {
        // Asumsi kelas Database sudah diinisialisasi dan bisa diakses secara global
        // atau diinjeksi. Dalam framework, ini otomatis.
        // Untuk contoh ini, kita akan membuat instance Database secara lokal.
        $db = new Database(); // Pastikan kelas Database tersedia

        $sql = "SELECT id, name, nim_username, email, password, role, rayon_id, klasifikasi FROM users WHERE email = :email";
        return $db->fetch($sql, ['email' => $email]);
    }

    /**
     * Metode statis untuk membuat pengguna baru.
     * (Contoh implementasi dasar tanpa ORM penuh)
     *
     * @param array $data Data pengguna yang akan disimpan
     * @return string|false ID pengguna baru atau false jika gagal
     */
    public static function create($data)
    {
        $db = new Database(); // Pastikan kelas Database tersedia

        $sql = "INSERT INTO users (id, name, nim_username, email, password, role, jabatan, rayon_id, klasifikasi, status_akun, created_at)
                VALUES (:id, :name, :nim_username, :email, :password, :role, :jabatan, :rayon_id, :klasifikasi, :status_akun, NOW())";
        
        // Pastikan semua field yang diisi ada di $data, gunakan nilai default jika tidak ada
        $params = [
            'id' => $data['id'] ?? uniqid('user_'), // Generate ID jika belum ada
            'name' => $data['name'],
            'nim_username' => $data['nim_username'] ?? null,
            'email' => $data['email'],
            'password' => $data['password'], // Asumsi password sudah di-hash di controller
            'role' => $data['role'],
            'jabatan' => $data['jabatan'] ?? null,
            'rayon_id' => $data['rayon_id'] ?? null,
            'klasifikasi' => $data['klasifikasi'] ?? null,
            'status_akun' => $data['status_akun'] ?? 'aktif',
        ];

        try {
            $db->query($sql, $params);
            return $params['id']; // Mengembalikan ID pengguna yang baru dibuat
        } catch (PDOException $e) {
            error_log("Error creating user: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Metode statis untuk memperbarui kolom last_login.
     *
     * @param string $userId ID pengguna
     * @return bool True jika berhasil, false jika gagal
     */
    public static function updateLastLogin($userId)
    {
        $db = new Database();
        try {
            $db->query("UPDATE users SET last_login = NOW() WHERE id = :id", ['id' => $userId]);
            return true;
        } catch (PDOException $e) {
            error_log("Error updating last_login for user {$userId}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Metode statis untuk memperbarui password pengguna.
     *
     * @param string $email Email pengguna
     * @param string $hashedPassword Password baru yang sudah di-hash
     * @return bool True jika berhasil, false jika gagal
     */
    public static function updatePasswordByEmail($email, $hashedPassword)
    {
        $db = new Database();
        try {
            $db->query("UPDATE users SET password = :password WHERE email = :email", [
                'password' => $hashedPassword,
                'email' => $email
            ]);
            return true;
        } catch (PDOException $e) {
            error_log("Error updating password for email {$email}: " . $e->getMessage());
            return false;
        }
    }
}
