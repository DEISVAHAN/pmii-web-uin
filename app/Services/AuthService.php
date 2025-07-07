<?php
// app/services/AuthService.php

// Layanan ini mengelola logika bisnis yang lebih kompleks terkait autentikasi,
// seperti hashing password, manajemen token, dan interaksi dengan model User.

require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
require_once __DIR__ . '/../models/User.php';   // Sertakan model User
require_once __DIR__ . '/../models/KaderProfile.php'; // Sertakan model KaderProfile
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas
// use App\Services\NotificationService; // Jika ada service notifikasi

class AuthService
{
    private $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    /**
     * Mendaftarkan pengguna baru (khususnya kader).
     *
     * @param array $userData Data pengguna untuk tabel `users`
     * @param array $kaderProfileData Data profil kader untuk tabel `kaders_profile` (opsional)
     * @return array|false Data pengguna yang terdaftar atau false jika gagal
     */
    public function registerUser(array $userData, array $kaderProfileData = [])
    {
        // Validasi dasar (bisa lebih ekstensif di controller atau di sini)
        if (empty($userData['email']) || empty($userData['password'])) {
            throw new Exception("Email and password are required.");
        }

        try {
            $this->db->beginTransaction(); // Mulai transaksi database

            // Periksa apakah email atau NIM/username sudah ada
            $existingUser = $this->db->fetch(
                "SELECT id FROM users WHERE email = :email OR nim_username = :nim_username",
                [
                    'email' => $userData['email'],
                    'nim_username' => $userData['nim_username'] ?? null
                ]
            );
            if ($existingUser) {
                throw new Exception("Email or NIM/Username is already registered.", 409); // Kode 409 Conflict
            }

            // Hash password
            $userData['password'] = password_hash($userData['password'], PASSWORD_DEFAULT);
            $userId = 'user-' . uniqid(); // Generate ID unik untuk user

            // Data untuk tabel `users`
            $userToCreate = [
                'id' => $userId,
                'name' => $userData['name'],
                'nim_username' => $userData['nim_username'] ?? null,
                'email' => $userData['email'],
                'password' => $userData['password'],
                'role' => $userData['role'] ?? 'kader', // Default ke kader
                'jabatan' => $userData['jabatan'] ?? null,
                'rayon_id' => $userData['rayon_id'] ?? null,
                'klasifikasi' => $userData['klasifikasi'] ?? null,
                'status_akun' => $userData['status_akun'] ?? 'aktif',
                'created_at' => date('Y-m-d H:i:s')
            ];

            $newUserId = User::create($userToCreate);

            if (!$newUserId) {
                throw new Exception("Failed to create user account.");
            }

            // Jika role adalah kader, buat juga entri di kaders_profile
            if ($userToCreate['role'] === 'kader') {
                $profileToCreate = array_merge(['user_id' => $newUserId], $kaderProfileData);
                $newKaderProfileId = KaderProfile::create($profileToCreate);
                if (!$newKaderProfileId) {
                    throw new Exception("Failed to create kader profile.");
                }
            }

            $this->db->commit(); // Commit transaksi

            // Catat aktivitas
            // SystemActivityLog::create([
            //     'activity_type' => 'User Registration',
            //     'description' => 'New user ' . $userToCreate['name'] . ' (Role: ' . $userToCreate['role'] . ') registered.',
            //     'user_id' => $newUserId,
            //     'user_name' => $userToCreate['name'],
            //     'user_role' => $userToCreate['role'],
            //     'timestamp' => date('Y-m-d H:i:s')
            // ]);

            // Kirim notifikasi (opsional)
            // NotificationService::sendEmail($userToCreate['email'], 'Registration Successful', 'Welcome to SINTAKSIS PMII!');

            // Ambil data user yang baru dibuat (tanpa password hash) untuk dikembalikan
            $registeredUser = User::find($newUserId);
            unset($registeredUser['password']);
            return $registeredUser;

        } catch (Exception $e) {
            $this->db->rollBack(); // Rollback transaksi jika ada error
            error_log("AuthService Error in registerUser: " . $e->getMessage());
            // Lemparkan kembali exception agar controller bisa menangani respons JSON
            throw $e;
        }
    }

    /**
     * Memverifikasi kredensial pengguna untuk login.
     *
     * @param string $email Email pengguna
     * @param string $password Password plain text pengguna
     * @return array|false Data pengguna yang terautentikasi (tanpa password hash) atau false jika gagal
     */
    public function verifyCredentials(string $email, string $password)
    {
        try {
            $user = User::findByEmail($email);

            if ($user && password_verify($password, $user['password'])) {
                // Perbarui last_login
                User::updateLastLogin($user['id']);

                // Catat aktivitas login
                // SystemActivityLog::create([
                //     'activity_type' => 'Login Success',
                //     'description' => 'User ' . $user['name'] . ' successfully logged in.',
                //     'user_id' => $user['id'],
                //     'user_name' => $user['name'],
                //     'user_role' => $user['role'],
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);

                unset($user['password']); // Hapus password hash sebelum dikembalikan
                return $user;
            } else {
                // Catat aktivitas login gagal (opsional)
                // SystemActivityLog::create([
                //     'activity_type' => 'Login Failed',
                //     'description' => 'Login attempt failed for email: ' . $email,
                //     'user_id' => null, // Tidak ada user ID yang diketahui
                //     'user_name' => $email,
                //     'user_role' => 'guest',
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return false;
            }
        } catch (PDOException $e) {
            error_log("AuthService Database Error in verifyCredentials: " . $e->getMessage());
            throw new Exception("Database error during login verification.");
        }
    }

    /**
     * Menghasilkan token autentikasi (misalnya JWT).
     *
     * @param array $user Data pengguna
     * @return string Token JWT
     */
    public function generateAuthToken(array $user)
    {
        // Ini adalah contoh sederhana. Untuk produksi, gunakan library JWT yang kuat
        // seperti firebase/php-jwt dan pastikan APP_KEY Anda aman.
        // require_once __DIR__ . '/../../vendor/autoload.php'; // Jika menggunakan Composer
        // use Firebase\JWT\JWT;

        $secretKey = env('APP_KEY'); // Ambil dari .env

        $payload = [
            'iss' => env('APP_URL'), // Issuer (penerbit token)
            'aud' => env('APP_URL'), // Audience (penerima token)
            'iat' => time(), // Issued At (waktu token dibuat)
            'exp' => time() + (60 * 60 * 24), // Expiration Time (token berlaku 24 jam)
            'user_id' => $user['id'],
            'user_role' => $user['role'],
            // Tambahkan data user lain yang tidak sensitif ke payload jika diperlukan
        ];

        // return JWT::encode($payload, $secretKey, 'HS256');
        return base64_encode(json_encode($payload)) . '.' . base64_encode($secretKey); // Dummy JWT-like token
    }

    /**
     * Memverifikasi token autentikasi.
     *
     * @param string $token Token JWT
     * @return array|false Payload token jika valid, false jika tidak valid
     */
    public function verifyAuthToken(string $token)
    {
        // Ini adalah contoh sederhana. Untuk produksi, gunakan library JWT yang kuat.
        // use Firebase\JWT\JWT;
        // use Firebase\JWT\Key;

        $secretKey = env('APP_KEY'); // Ambil dari .env

        try {
            // $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
            // return (array) $decoded;
            list($header, $payload, $signature) = explode('.', $token);
            $decodedPayload = json_decode(base64_decode($payload), true);
            if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
                throw new Exception("Token expired.");
            }
            return $decodedPayload;
        } catch (Exception $e) {
            error_log("Token verification failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Mengelola permintaan reset password.
     *
     * @param string $identifier Email atau NIM/Username
     * @param string $userType 'admin' atau 'kader'
     * @return bool True jika email reset dikirim (simulasi), false jika gagal
     */
    public function handleForgotPassword(string $identifier, string $userType = null)
    {
        try {
            $user = null;
            if ($userType === 'admin') {
                $user = $this->db->fetch("SELECT id, name, email FROM users WHERE (email = :identifier OR nim_username = :identifier) AND (role = 'komisariat' OR role = 'rayon')", ['identifier' => $identifier]);
            } elseif ($userType === 'kader') {
                $user = $this->db->fetch("SELECT id, name, email FROM users WHERE (email = :identifier OR nim_username = :identifier) AND role = 'kader'", ['identifier' => $identifier]);
            } else {
                $user = $this->db->fetch("SELECT id, name, email FROM users WHERE email = :identifier OR nim_username = :identifier", ['identifier' => $identifier]);
            }

            if ($user) {
                $resetToken = bin2hex(random_bytes(32));
                $this->db->query(
                    "INSERT INTO password_resets (email, token, created_at) VALUES (:email, :token, NOW())
                     ON DUPLICATE KEY UPDATE token = :token, created_at = NOW()",
                    ['email' => $user['email'], 'token' => $resetToken]
                );

                $resetLink = env('APP_URL') . '/lupa-password.html?token=' . $resetToken . '&email=' . urlencode($user['email']); // Sesuaikan URL
                // NotificationService::sendEmail($user['email'], 'Reset Password Anda', 'Klik tautan ini untuk mereset password Anda: ' . $resetLink);

                // SystemActivityLog::create([
                //     'activity_type' => 'Forgot Password Request',
                //     'description' => 'Password reset requested for ' . $user['email'],
                //     'user_id' => $user['id'],
                //     'user_name' => $user['name'],
                //     'user_role' => $user['role'],
                //     'timestamp' => date('Y-m-d H:i:s')
                // ]);
                return true;
            }
            return false; // Pesan generik akan diberikan oleh controller
        } catch (PDOException $e) {
            error_log("AuthService Database Error in handleForgotPassword: " . $e->getMessage());
            throw new Exception("Database error during forgot password process.");
        }
    }

    /**
     * Mengelola proses reset password dengan token.
     *
     * @param string $token Token reset password
     * @param string $email Email pengguna
     * @param string $newPassword Password baru (plain text)
     * @return bool True jika password berhasil direset, false jika gagal
     */
    public function resetPasswordWithToken(string $token, string $email, string $newPassword)
    {
        try {
            $resetEntry = $this->db->fetch("SELECT * FROM password_resets WHERE token = :token AND email = :email", [
                'token' => $token,
                'email' => $email
            ]);

            if (!$resetEntry) {
                throw new Exception("Invalid or mismatched reset token.", 400);
            }

            $tokenCreatedAt = strtotime($resetEntry['created_at']);
            $expirationTime = $tokenCreatedAt + (60 * 60); // Token berlaku 1 jam

            if (time() > $expirationTime) {
                $this->db->query("DELETE FROM password_resets WHERE token = :token", ['token' => $token]);
                throw new Exception("Reset token has expired.", 400);
            }

            $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            User::updatePasswordByEmail($email, $hashedNewPassword);

            $this->db->query("DELETE FROM password_resets WHERE token = :token", ['token' => $token]);

            // SystemActivityLog::create([
            //     'activity_type' => 'Password Reset Success',
            //     'description' => 'Password for email ' . $email . ' successfully reset.',
            //     'user_id' => null, // User ID mungkin tidak langsung diketahui dari token
            //     'user_name' => $email,
            //     'user_role' => 'unknown',
            //     'timestamp' => date('Y-m-d H:i:s')
            // ]);
            return true;
        } catch (PDOException $e) {
            error_log("AuthService Database Error in resetPasswordWithToken: " . $e->getMessage());
            throw new Exception("Database error during password reset.");
        } catch (Exception $e) {
            error_log("AuthService Error in resetPasswordWithToken: " . $e->getMessage());
            throw $e;
        }
    }
}
