<?php
// public/login.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
require_once __DIR__ . '/../vendor/autoload.php';
\App\Core\DotenvLoader::load();

// Asumsi: Data pengguna yang login akan tersedia di $_SERVER['user_data']
$loggedInUser = $_SERVER['user_data'] ?? null;

// Injeksi data pengguna yang login ke JavaScript
$loggedInUserJson = json_encode($loggedInUser);

// Inisialisasi BASE_PATH untuk digunakan di frontend JavaScript
// Ini akan membantu dalam membangun URL yang benar untuk navigasi
$basePath = '/'; // Sesuaikan jika aplikasi Anda berada di subdirektori
$basePathJson = json_encode($basePath);

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/32x32/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="css/login.css">
</head>
<body>
    <div class="shape shape1"></div>
    <div class="shape shape2"></div>
    <div class="shape shape3"></div>
    <div class="shape shape4"></div>

    <div class="login-wrapper">
        <div class="logo-container">
            <img src="img/logo-pmii.png" alt="Logo PMII">
            <img src="img/logo-komisariat-uin.png" alt="Logo Komisariat UIN SGD" class="logo-uin-img">
        </div>

        <div class="tab-buttons">
            <button type="button" id="admin-tab-button" class="tab-button">Login Admin</button>
            <button type="button" id="kader-tab-button" class="tab-button">Login Kader</button>
        </div>

        <div id="admin-login-section" class="login-form-container hidden-form">
            <h1 class="login-title">Login Admin</h1>
            <p class="login-subtitle">Akses sistem internal sebagai admin.</p>
            <form id="admin-login-form">
                <div id="admin-login-error-msg" class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span id="admin-error-text">Username atau password tidak valid.</span>
                </div>
                <div class="input-group">
                    <i class="fas fa-user-shield input-icon"></i>
                    <input type="text" id="admin-username" name="admin-username" class="input-field" required>
                    <label for="admin-username" class="input-label">Username Admin</label>
                </div>
                <div class="input-group">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" id="admin-password" name="admin-password" class="input-field" required>
                    <label for="admin-password" class="input-label">Password</label>
                </div>
                <div class="form-links">
                    <a href="lupa-password.php?type=admin">Lupa Password?</a>
                </div>
                <button type="submit" class="login-button mt-4" id="admin-login-submit-button">
                    <span class="button-text">Login Admin <i class="fas fa-sign-in-alt ml-2"></i></span>
                    <div class="spinner"></div>
                </button>
            </form>
        </div>

        <div id="kader-login-section" class="login-form-container hidden-form">
            <h1 class="login-title">Login Kader</h1>
            <p class="login-subtitle">Masuk untuk mengakses fitur khusus kader.</p>
            <form id="kader-login-form">
                 <div id="kader-login-error-msg" class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span id="kader-error-text">NIM atau password tidak valid.</span>
                </div>
                <div class="input-group">
                    <i class="fas fa-id-card input-icon"></i>
                    <input type="text" id="kader-nim" name="kader-nim" class="input-field" required>
                    <label for="kader-nim" class="input-label">NIM (Nomor Induk Mahasiswa)</label>
                </div>
                <div class="input-group">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" id="kader-password" name="kader-password" class="input-field" required>
                    <label for="kader-password" class="input-label">Password</label>
                </div>
                 <div class="form-links">
                    <a href="lupa-password.php?type=kader">Lupa Password?</a>
                </div>
                <button type="submit" class="login-button mt-4" id="kader-login-submit-button">
                    <span class="button-text">Login Kader <i class="fas fa-sign-in-alt ml-2"></i></span>
                    <div class="spinner"></div>
                </button>
            </form>
            <div class="register-link-container text-center mt-6">
                <p class="text-sm text-text-muted">Belum punya akun kader?</p>
                <a href="register-kader.php" class="btn-modern btn-secondary-modern mt-2 text-sm w-full md:w-auto">
                    <i class="fas fa-user-plus mr-2"></i>Daftar Sebagai Kader
                </a>
            </div>
        </div>
         <a href="index.php" class="block text-center mt-8 text-xs text-pmii-darkblue hover:text-pmii-blue hover:underline">
            <i class="fas fa-arrow-left mr-1"></i> Kembali ke Halaman Utama
        </a>
    </div>

    <div id="customMessageBox" class="fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0">
        Pesan kustom di sini!
    </div>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
        window.BASE_PATH = <?php echo $basePathJson; ?>; // Injeksi base path

        // Memuat JavaScript utama untuk halaman ini
        import './js/login.js';
    </script>
</body>
</html>