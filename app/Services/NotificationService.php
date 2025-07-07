<?php
// app/services/NotificationService.php

// Layanan ini bertanggung jawab untuk mengirim notifikasi melalui berbagai saluran,
// seperti email dan WhatsApp.

// Asumsi:
// 1. Ada kelas Database yang menangani koneksi (jika perlu mencatat notifikasi ke DB).
// 2. Ada kelas atau fungsi untuk mencatat log aktivitas (mis. SystemActivityLog).
// 3. Ada konfigurasi layanan di app/config/services.php.
// 4. Ada cara untuk memuat variabel lingkungan dari .env (misalnya, fungsi env()).

require_once __DIR__ . '/../core/Database.php'; // Sesuaikan path ke kelas Database Anda
// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas

class NotificationService
{
    private $db;
    private $mailConfig;
    private $whatsappConfig;

    public function __construct()
    {
        $this->db = new Database();
        
        // Muat konfigurasi layanan
        $servicesConfig = include __DIR__ . '/../config/services.php'; // Sesuaikan path
        $this->mailConfig = $servicesConfig['mail'] ?? [];
        $this->whatsappConfig = $servicesConfig['whatsapp'] ?? [];
    }

    /**
     * Mengirim notifikasi umum ke target tertentu.
     * Ini bisa menjadi metode wrapper untuk sendEmail dan sendWhatsApp.
     *
     * @param string $title Judul notifikasi
     * @param string $content Isi notifikasi
     * @param string $type Tipe notifikasi (info, success, warning, error)
     * @param string $targetType Tipe target (user, rayon, all, komisariat)
     * @param string|null $targetId ID target (user_id, rayon_id) jika spesifik
     * @return bool True jika setidaknya satu pengiriman berhasil, false jika tidak ada.
     */
    public function sendNotification(string $title, string $content, string $type, string $targetType, ?string $targetId = null)
    {
        $success = false;
        $usersToNotify = [];

        // --- Logika untuk mendapatkan daftar pengguna berdasarkan targetType dan targetId ---
        // Di aplikasi nyata, ini akan melibatkan query ke database.
        // Contoh sederhana (ganti dengan query DB nyata):
        if ($targetType === 'user' && $targetId) {
            // $user = User::find($targetId);
            // if ($user) $usersToNotify[] = $user;
            $usersToNotify[] = ['id' => $targetId, 'email' => 'dummy_user@example.com', 'no_hp' => '628123456789']; // Simulasi
        } elseif ($targetType === 'rayon' && $targetId) {
            // $rayonAdmin = User::where(['role' => 'rayon', 'rayon_id' => $targetId])->first();
            // if ($rayonAdmin) $usersToNotify[] = $rayonAdmin;
            $usersToNotify[] = ['id' => 'admin_ray_123', 'email' => 'dummy_rayon_admin@example.com', 'no_hp' => '628123456780']; // Simulasi
        } elseif ($targetType === 'komisariat') {
            // $komisariatAdmin = User::where('role', 'komisariat')->first();
            // if ($komisariatAdmin) $usersToNotify[] = $komisariatAdmin;
            $usersToNotify[] = ['id' => 'admin_kom_123', 'email' => 'dummy_kom_admin@example.com', 'no_hp' => '628123456781']; // Simulasi
        } elseif ($targetType === 'all') {
            // $allUsers = User::all(); // Ambil semua user dari database
            // $usersToNotify = $allUsers;
            $usersToNotify = [ // Simulasi semua user
                ['id' => 'user_1', 'email' => 'user1@example.com', 'no_hp' => '628111'],
                ['id' => 'user_2', 'email' => 'user2@example.com', 'no_hp' => '628222'],
            ];
        }

        foreach ($usersToNotify as $user) {
            // Kirim Email
            if (isset($user['email'])) {
                $emailSent = $this->sendEmail($user['email'], $title, $content);
                if ($emailSent) $success = true;
            }

            // Kirim WhatsApp (jika nomor HP tersedia dan layanan aktif)
            if (isset($user['no_hp']) && !empty($this->whatsappConfig['api_url'])) {
                $whatsappSent = $this->sendWhatsApp($user['no_hp'], $title . "\n" . $content);
                if ($whatsappSent) $success = true;
            }
        }

        // Catat aktivitas pengiriman notifikasi (opsional, bisa di sini atau di controller)
        // SystemActivityLog::create([
        //     'activity_type' => 'Notification Sent',
        //     'description' => 'Notification "' . $title . '" sent to ' . $targetType . ' (ID: ' . ($targetId ?? 'N/A') . ').',
        //     'user_id' => null, // Pengirim mungkin sistem
        //     'user_name' => 'System/Admin',
        //     'user_role' => 'system',
        //     'timestamp' => date('Y-m-d H:i:s')
        // ]);

        return $success;
    }

    /**
     * Mengirim email notifikasi.
     *
     * @param string $to Email penerima
     * @param string $subject Subjek email
     * @param string $body Isi email
     * @return bool True jika pengiriman berhasil (simulasi), false jika gagal
     */
    public function sendEmail(string $to, string $subject, string $body): bool
    {
        if (empty($this->mailConfig['host']) || empty($this->mailConfig['username'])) {
            error_log("Email service not configured.");
            return false; // Layanan email tidak dikonfigurasi
        }

        // --- SIMULASI PENGIRIMAN EMAIL ---
        // Di aplikasi nyata, Anda akan menggunakan library PHPMailer atau SwiftMailer
        // atau klien SMTP framework Anda.
        try {
            // Contoh dengan PHP mail() (tidak direkomendasikan untuk produksi)
            // $headers = 'From: ' . $this->mailConfig['from']['name'] . ' <' . $this->mailConfig['from']['address'] . '>' . "\r\n" .
            //            'Reply-To: ' . $this->mailConfig['from']['address'] . "\r\n" .
            //            'X-Mailer: PHP/' . phpversion();
            // mail($to, $subject, $body, $headers);

            // Log simulasi
            error_log("SIMULASI EMAIL DIKIRIM KE: {$to}, Subjek: {$subject}, Isi: {$body}");
            return true;
        } catch (Exception $e) {
            error_log("Gagal mengirim email ke {$to}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Mengirim pesan WhatsApp.
     *
     * @param string $to Nomor telepon penerima (dengan kode negara, mis. 628123456789)
     * @param string $message Isi pesan
     * @return bool True jika pengiriman berhasil (simulasi), false jika gagal
     */
    public function sendWhatsApp(string $to, string $message): bool
    {
        if (empty($this->whatsappConfig['api_url']) || empty($this->whatsappConfig['api_key'])) {
            error_log("WhatsApp service not configured.");
            return false; // Layanan WhatsApp tidak dikonfigurasi
        }

        // --- SIMULASI PENGIRIMAN WHATSAPP VIA API EKSTERNAL ---
        // Di aplikasi nyata, Anda akan melakukan panggilan HTTP POST ke API WhatsApp
        // (misalnya, Twilio, MessageBird, atau penyedia API WhatsApp lainnya).
        try {
            $apiUrl = $this->whatsappConfig['api_url'];
            $apiKey = $this->whatsappConfig['api_key'];
            $senderId = $this->whatsappConfig['sender_id'] ?? null;

            $postData = [
                'to' => $to,
                'message' => $message,
                'api_key' => $apiKey, // Tergantung API WhatsApp yang digunakan
                'sender_id' => $senderId, // Tergantung API WhatsApp yang digunakan
            ];

            // Contoh menggunakan cURL (untuk panggilan HTTP nyata)
            // $ch = curl_init($apiUrl);
            // curl_setopt($ch, CURLOPT_POST, 1);
            // curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
            // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            // $response = curl_exec($ch);
            // curl_close($ch);
            // $result = json_decode($response, true);

            // Log simulasi
            error_log("SIMULASI WHATSAPP DIKIRIM KE: {$to}, Pesan: {$message}");
            // return isset($result['status']) && $result['status'] === 'success'; // Periksa respons API nyata
            return true; // Selalu sukses untuk simulasi
        } catch (Exception $e) {
            error_log("Gagal mengirim WhatsApp ke {$to}: " . $e->getMessage());
            return false;
        }
    }
}
