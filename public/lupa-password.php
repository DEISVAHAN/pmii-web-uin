<?php
// public/lupa-password.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
require_once __DIR__ . '/../vendor/autoload.php';
\App\Core\DotenvLoader::load();

// Asumsi: Data pengguna yang login akan tersedia di $_SERVER['user_data']
$loggedInUser = $_SERVER['user_data'] ?? null;

// Injeksi data pengguna yang login ke JavaScript
$loggedInUserJson = json_encode($loggedInUser);

// Inisialisasi BASE_PATH untuk digunakan di frontend JavaScript
$basePath = '/'; // Sesuaikan jika aplikasi Anda berada di subdirektori
$basePathJson = json_encode($basePath);

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lupa Password - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/32x32/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Memuat CSS eksternal -->
    <link rel="stylesheet" href="css/login.css"> <!-- Menggunakan CSS login.css yang sudah ada -->
    <link rel="stylesheet" href="css/lupa-password.css"> <!-- CSS spesifik untuk halaman ini -->
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
        <h1 class="form-title">Lupa Password</h1>
        <p class="form-subtitle" id="lupa-password-subtitle">Masukkan email atau NIM Anda untuk mereset password.</p>
        
        <form id="lupa-password-form">
            <div id="lupa-password-message" class="form-message">
                <i class="fas fa-info-circle"></i>
                <span id="lupa-password-message-text"></span>
            </div>
            <div class="input-group">
                <i class="fas fa-envelope input-icon"></i>
                <input type="text" id="reset-identifier" name="identifier" class="input-field" required>
                <label for="reset-identifier" class="input-label" id="identifier-label">Email atau NIM</label>
            </div>
            <button type="submit" class="form-button mt-4" id="reset-submit-button">
                <i class="fas fa-paper-plane mr-2"></i> Kirim Instruksi Reset
            </button>
        </form>
        <div class="text-center mt-6">
            <p class="text-sm text-text-muted">Ingat password Anda? 
                <a href="login.php" class="font-semibold text-pmii-blue hover:text-pmii-darkblue hover:underline">Login di sini</a>
            </p>
        </div>
    </div>

    <!-- Custom Message Box -->
    <div id="customMessageBox" class="fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0">
        Pesan kustom di sini!
    </div>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
        window.BASE_PATH = <?php echo $basePathJson; ?>; // Injeksi base path

        // Memuat JavaScript utama untuk halaman ini
        import './js/lupa-password.js';
    </script>
</body>
</html>
