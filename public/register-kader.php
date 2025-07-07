<?php
// public/register-kader.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
require_once __DIR__ . '/../vendor/autoload.php';

// Muat variabel lingkungan dari .env
\App\Core\DotenvLoader::load();

// Asumsi: Data pengguna yang login akan tersedia di $_SERVER['user_data']
// Jika pengguna sudah login, mereka mungkin tidak perlu mengakses halaman registrasi.
$loggedInUser = $_SERVER['user_data'] ?? null;

// Jika pengguna sudah login, arahkan mereka ke halaman utama atau dashboard
if ($loggedInUser) {
    header('Location: index.php'); // Atau ke dashboard yang sesuai
    exit();
}

// Injeksi data pengguna yang login ke JavaScript
$loggedInUserJson = json_encode($loggedInUser);

// --- Mengambil data Rayon dari API Backend menggunakan PHP (untuk dropdown) ---
$rayonsData = [];
try {
    require_once __DIR__ . '/../app/core/Database.php';
    require_once __DIR__ . '/../app/models/Rayon.php';
    $rayonsData = \App\Models\Rayon::all(); // Ambil semua data rayon dari database
} catch (Exception $e) {
    error_log("Error fetching rayons for registration page: " . $e->getMessage());
    $rayonsData = []; // Fallback ke array kosong
}

$rayonsDataJson = json_encode($rayonsData);

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Akun Kader - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/32x32/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Memuat CSS eksternal -->
    <link rel="stylesheet" href="css/register-kader.css">
</head>
<body>
    <div class="shape shape1"></div>
    <div class="shape shape2"></div>
    <div class="shape shape3"></div>
    <div class="shape shape4"></div>

    <div class="form-wrapper">
        <div class="logo-container">
            <img src="img/logo-pmii.png" alt="Logo PMII">
            <img src="img/logo-komisariat-uin.png" alt="Logo Komisariat UIN SGD">
        </div>
        <h1 class="form-title">Daftar Akun Kader</h1>
        <p class="form-subtitle">Bergabunglah dengan PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung.</p>
        
        <form id="register-kader-form">
            <div id="register-message" class="form-message">
                <i class="fas fa-info-circle"></i>
                <span id="register-message-text"></span>
            </div>
            <div class="input-group">
                <i class="fas fa-id-card input-icon"></i>
                <input type="text" id="register-nim" name="nim" class="input-field" required>
                <label for="register-nim" class="input-label">NIM (Nomor Induk Mahasiswa)</label>
            </div>
            <div class="input-group">
                <i class="fas fa-user input-icon"></i>
                <input type="text" id="register-nama" name="nama" class="input-field" required>
                <label for="register-nama" class="input-label">Nama Lengkap</label>
            </div>
            <div class="input-group">
                <i class="fas fa-envelope input-icon"></i>
                <input type="email" id="register-email" name="email" class="input-field" required>
                <label for="register-email" class="input-label">Alamat Email</label>
            </div>
             <div class="input-group">
                <i class="fas fa-users input-icon"></i>
                <select id="register-rayon" name="rayon" class="input-field" required>
                    <option value="" disabled selected>Pilih Asal Rayon</option>
                    <!-- Opsi Rayon akan diisi secara dinamis oleh JavaScript -->
                </select>
                <label for="register-rayon" class="input-label">Asal Rayon</label>
            </div>
            <div class="input-group">
                <i class="fas fa-lock input-icon"></i>
                <input type="password" id="register-password" name="password" class="input-field" required>
                <label for="register-password" class="input-label">Password</label>
            </div>
            <div class="input-group">
                <i class="fas fa-check-circle input-icon"></i>
                <input type="password" id="register-confirm-password" name="confirm_password" class="input-field" required>
                <label for="register-confirm-password" class="input-label">Konfirmasi Password</label>
            </div>
            <button type="submit" class="form-button mt-4" id="register-submit-button">
                <i class="fas fa-user-plus mr-2"></i> Daftar Sekarang
            </button>
        </form>
        <div class="text-center mt-6">
            <p class="text-sm text-text-muted">Sudah punya akun? 
                <a href="login.php" class="font-semibold text-pmii-blue hover:text-pmii-darkblue hover:underline">Login di sini</a>
            </p>
        </div>
        <a href="index.php" class="back-link block mt-4"><i class="fas fa-arrow-left mr-1"></i> Kembali ke Halaman Utama</a>
    </div>

    <!-- Custom Message Box -->
    <div id="customMessageBox" class="fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0">
        Pesan kustom di sini!
    </div>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
        window.phpRayonsData = <?php echo $rayonsDataJson; ?>; // Data rayon dari PHP

        // Memuat JavaScript utama untuk halaman ini
        import './js/register-kader.js';
    </script>
</body>
</html>
