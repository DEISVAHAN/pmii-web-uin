<?php
// public/rayon-profile.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
require_once __DIR__ . '/../vendor/autoload.php';

// Muat variabel lingkungan dari .env
\App\Core\DotenvLoader::load();

// Asumsi: Data pengguna yang login akan tersedia di $_SERVER['user_data']
// setelah AuthMiddleware memverifikasi token.
$loggedInUser = $_SERVER['user_data'] ?? null;

// Injeksi data pengguna yang login ke JavaScript
$loggedInUserJson = json_encode($loggedInUser);

// --- Mengambil data Rayon dari Backend menggunakan PHP (untuk initial render) ---
$rayonData = null;
$rayonId = $_GET['id'] ?? null; // Dapatkan ID rayon dari parameter URL

if ($rayonId) {
    try {
        require_once __DIR__ . '/../app/core/Database.php';
        require_once __DIR__ . '/../app/models/Rayon.php';
        // Asumsi ada metode find() di model Rayon yang mengambil data berdasarkan ID
        $rayon = \App\Models\Rayon::find($rayonId);
        if ($rayon) {
            $rayonData = $rayon;
        }
    } catch (Exception $e) {
        error_log("Error fetching rayon data for ID {$rayonId}: " . $e->getMessage());
        // Fallback ke null jika ada error
        $rayonData = null;
    }
}

$rayonDataJson = json_encode($rayonData);

?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil Rayon - Sistem Internal PMII</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Google Fonts: Poppins & Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Memuat CSS eksternal -->
    <link rel="stylesheet" href="css/style.css">
    <!-- Memuat CSS spesifik halaman ini -->
    <link rel="stylesheet" href="css/rayon-profile.css">
</head>
<body>
    <!-- Custom Message Box -->
    <div id="customMessageBox" class="fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0">
        Pesan kustom di sini!
    </div>

    <!-- HEADER START -->
    <nav id="navbar" class="text-white py-3.5 navbar-sticky">
        <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
            <a href="index.php" class="flex items-center space-x-2.5 transform hover:scale-105 transition-transform duration-300">
                <img src="img/logo-pmii.png" alt="Logo PMII" class="h-9" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
                <span id="header-title-text" class="text-[0.65rem] lg:text-xs font-semibold logo-text tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung
                </span>
            </a>
            <div class="hidden lg:flex space-x-6 items-center">
                <a href="index.php#beranda" class="nav-link text-sm">Beranda</a>
                <a href="tentang-kami.php" class="nav-link text-sm">Tentang Kami</a>
                <a href="berita-artikel.php" class="nav-link text-sm">Berita</a>
                <a href="digilib.html" class="nav-link text-sm" target="_self">📚 Digilib</a>
                <a href="agenda-kegiatan.php" class="nav-link text-sm">Kegiatan</a>
                <a href="galeri-foto.php" class="nav-link text-sm">Galeri</a>
                <div id="desktop-kader-menu-container" class="relative dropdown hidden">
                    <button class="dropdown-toggle nav-link focus:outline-none text-sm">
                        Profil Kader <i class="fas fa-chevron-down text-xs ml-1"></i>
                    </button>
                    <div class="dropdown-menu mt-3.5">
                        <a href="dashboard/edit-profil-kader.html" id="edit-profil-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-user-edit"></i> Edit Profil</a>
                        <a href="dashboard/pengaturan-akun-kader.html" id="pengaturan-akun-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-cog"></i> Pengaturan Akun</a>
                        <a href="akses-ojs.html" id="jurnal-alharokah-link-desktop-kader" class="dropdown-item" target="_self"><i class="fas fa-book-reader"></i> Jurnal Al Harokah</a>
                        <a href="dashboard/pengajuan-surat.html" id="pengajuan-surat-link-desktop-kader" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i> Pengajuan Surat</a>
                    </div>
                </div>
                <div id="desktop-admin-menu-container" class="relative dropdown hidden">
                    <button class="dropdown-toggle nav-link focus:outline-none text-sm">
                        Sistem Internal <i class="fas fa-chevron-down text-xs ml-1"></i>
                    </button>
                    <div class="dropdown-menu mt-3.5">
                        <a href="dashboard/manajemen-akun.html" id="manajemen-akun-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-user-shield"></i>Manajemen Akun</a>
                        <a href="dashboard/manajemen-kader.html" id="manajemen-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-users-cog"></i>Manajemen Kader</a>
                        <a href="dashboard/repository-ilmiah.html" id="repository-ilmiah-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-book-open"></i>Jurnal & Karya Ilmiah</a>
                        <a href="dashboard/pengajuan-surat.html" id="pengajuan-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i>Pengajuan Surat</a>
                        <a href="dashboard/verifikasi-surat.html" id="verifikasi-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-check-circle"></i>Verifikasi Surat</a>
                        <a href="dashboard/admin-dashboard-rayon.html" id="dashboard-rayon-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Rayon</a>
                        <a href="dashboard/admin-dashboard-komisariat.html" id="admin-dashboard-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Kom.</a>
                        <a href="dashboard/edit-beranda.html" id="edit-beranda-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-edit"></i>Edit Beranda</a>
                        <a href="akses-ojs.html" id="jurnal-alharokah-link-desktop-admin" class="dropdown-item" target="_self"><i class="fas fa-book-reader"></i>Jurnal Al Harokah</a>
                        <hr class="border-gray-200 my-1">
                        <a href="dashboard/verifikasi-konten-rayon.html" id="verifikasi-konten-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-check-double"></i>Verifikasi Konten Rayon</a>
                        <a href="dashboard/rayon-tambah-berita.html" id="tambah-berita-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-newspaper"></i>Tambah Berita & Artikel</a>
                        <a href="dashboard/rayon-tambah-kegiatan.html" id="tambah-kegiatan-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-calendar-plus"></i>Tambah Kegiatan</a>
                        <a href="dashboard/rayon-tambah-galeri.html" id="tambah-galeri-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-images"></i>Tambah Galeri Kegiatan</a>
                        <a href="dashboard/edit-profil-rayon.html" id="edit-profil-rayon-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-building"></i>Edit Profil Rayon</a>
                        <!-- New Admin Links -->
                        <a href="dashboard/pengaturan-situs.php" id="pengaturan-situs-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-cogs"></i>Pengaturan Situs</a>
                        <a href="dashboard/dashboard-statistik.html" id="dashboard-statistik-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-chart-bar"></i>Dashboard Statistik</a>
                        <a href="dashboard/kelola-notifikasi.html" id="kelola-notifikasi-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-bell"></i>Kelola Notifikasi</a>
                        <a href="dashboard/laporan-analisis.php" id="laporan-analisis-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-invoice"></i>Laporan & Analisis</a>
                        <a href="generate-qr.html" id="ttd-digital-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-qrcode"></i>TTD Digital</a>
                        <a href="dashboard/arsiparis.html" id="arsiparis-kepengurusan-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-archive"></i>Arsiparis Kepengurusan</a>
                    </div>
                </div>
                <a href="index.php#kontak" class="nav-link text-sm">Kontak</a>
                <a href="login.php" id="auth-link-main" class="btn logged-out-styles text-sm" data-action="login">
                    Login
                </a>
            </div>
            <div class="lg:hidden">
                <button id="mobile-menu-button" class="menu-icon focus:outline-none p-2 -mr-2"><i class="fas fa-bars text-2xl"></i></button>
            </div>
        </div>
    </nav>

    <div id="mobile-menu-content" class="lg:hidden fixed top-0 right-0 h-full w-4/5 max-w-xs bg-gradient-to-b from-pmii-blue to-pmii-darkblue text-white p-6 shadow-2xl z-40">
        <div class="flex justify-between items-center mb-10">
            <a href="index.php" class="flex items-center space-x-2">
                <img src="img/logo-pmii.png" alt="Logo PMII Mobile" class="h-9" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
                <span id="mobile-header-title-text" class="text-[0.6rem] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                    PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung
                </span>
            </a>
            <button id="close-mobile-menu-button" class="focus:outline-none p-2 -mr-2"><i class="fas fa-times text-2xl"></i></button>
        </div>
        <nav id="mobile-nav-links" class="flex flex-col space-y-3">
            <a href="#" id="mobile-logout-link" class="mobile-nav-link mt-4 bg-red-500 hover:bg-red-600 justify-center"></a>
        </nav>
    </div>
    <div id="mobile-menu-overlay" class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"></div>
    <!-- HEADER END -->

    <div class="main-content-wrapper">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <div class="max-w-5xl mx-auto">
                <section class="page-header-bg rounded-lg mb-8 animated-section relative overflow-hidden">
                    <div class="parallax-container">
                        <div class="parallax-item" data-parallax-speed="-0.1"></div>
                        <div class="parallax-item" data-parallax-speed="-0.2"></div>
                        <div class="parallax-item" data-parallax-speed="-0.15"></div>
                        <div class="parallax-item" data-parallax-speed="-0.25"></div>
                        <div class="parallax-item" data-parallax-speed="-0.18"></div>
                    </div>
                    <div class="container mx-auto px-4 text-center py-16 lg:py-24 relative z-10 text-white">
                        <h1 class="text-4xl lg:text-5xl font-extrabold mb-4 page-title" id="rayon-page-title">Profil Rayon</h1>
                        <p class="text-lg opacity-90 page-tagline" id="rayon-tagline">Memuat informasi rayon...</p>
                    </div>
                </section>

                <div id="rayon-profile-content" class="content-section-card animated-section">
                    <div class="flex flex-col items-center mb-8">
                        <img id="rayon-logo" src="https://placehold.co/150x150/005c97/FFFFFF?text=Logo" alt="Logo Rayon" class="profile-img-display animated-section stagger-1">
                        <h2 class="text-3xl font-bold text-pmii-darkblue mt-4 animated-section stagger-2" id="rayon-name">Nama Rayon</h2>
                    </div>
                    
                    <!-- Section Informasi Ketua -->
                    <div class="info-section-card animated-section stagger-3">
                        <h3 class="text-xl font-bold text-pmii-darkblue mb-3">Informasi Ketua</h3>
                        <div class="flex flex-col md:flex-row items-center md:items-center md:justify-start gap-6">
                            <img id="chairman-photo" src="https://placehold.co/160x160/e0e0e0/9e9e9e?text=Ketua" alt="Foto Ketua Rayon" class="profile-img-display" style="border: 4px solid var(--pmii-blue); margin-bottom: 0;">
                            <div class="flex-grow text-center md:text-left flex flex-col justify-center">
                                <p class="text-lg text-text-primary font-semibold">Nama Ketua: <span id="rayon-chairman"></span></p>
                                <p class="text-sm text-text-muted mt-1">Pemimpin yang berdedikasi untuk rayon ini.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Section Informasi Umum & Statistik -->
                    <div class="info-section-card animated-section stagger-4">
                        <h3 class="text-xl font-bold text-pmii-darkblue mb-3">Ringkasan Rayon</h3>
                        <p class="mb-6 text-text-secondary" id="rayon-description">Deskripsi lengkap atau sejarah singkat rayon akan ditampilkan di sini.</p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <div class="detail-item">
                                <i class="fas fa-users"></i> <span class="detail-text"><strong>Jumlah Kader:</strong> <span id="rayon-cadre-count"></span></span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-calendar-alt"></i> <span class="detail-text"><strong>Berdiri Sejak:</strong> <span id="rayon-established-date"></span></span>
                            </div>
                        </div>
                    </div>

                    <!-- Section Visi & Misi -->
                    <div class="info-section-card animated-section stagger-5">
                        <h3 class="text-xl font-bold text-pmii-darkblue mb-3">Visi & Misi</h3>
                        <div>
                            <h4 class="font-semibold text-pmii-blue mb-2">Visi Rayon:</h4>
                            <p id="rayon-vision" class="text-text-secondary mb-6">Memuat visi rayon...</p>
                        </div>
                        <div>
                            <h4 class="font-semibold text-pmii-blue mb-2">Misi Rayon:</h4>
                            <p id="rayon-mission" class="text-text-secondary whitespace-pre-wrap">Memuat misi rayon...</p>
                        </div>
                    </div>

                    <!-- Section Kontak & Alamat -->
                    <div class="info-section-card animated-section stagger-6">
                        <h3 class="text-xl font-bold text-pmii-darkblue mb-3">Kontak & Lokasi</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <div class="detail-item">
                                <i class="fas fa-phone-alt"></i> <span class="detail-text"><strong>Telepon/WA:</strong> <span id="rayon-contact"></span></span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-envelope"></i> <span class="detail-text"><strong>Email:</strong> <span id="rayon-email"></span></span>
                            </div>
                            <div class="detail-item sm:col-span-2">
                                <i class="fas fa-map-marker-alt"></i> <span class="detail-text"><strong>Alamat Sekretariat:</strong> <span id="rayon-address"></span></span>
                            </div>
                        </div>
                    </div>

                    <!-- Section Media Sosial -->
                    <div class="info-section-card animated-section stagger-7">
                        <h3 class="text-xl font-bold text-pmii-darkblue mb-3">Media Sosial</h3>
                        <div class="flex space-x-6 justify-center">
                            <a href="#" id="social-instagram-link" target="_blank" rel="noopener noreferrer" class="hover:text-pmii-yellow hidden"><i class="fab fa-instagram"></i></a>
                            <a href="#" id="social-facebook-link" target="_blank" rel="noopener noreferrer" class="hover:text-pmii-yellow hidden"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" id="social-twitter-link" target="_blank" rel="noopener noreferrer" class="hover:text-pmii-yellow hidden"><i class="fab fa-twitter"></i></a>
                            <a href="#" id="social-youtube-link" target="_blank" rel="noopener noreferrer" class="hover:text-pmii-yellow hidden"><i class="fab fa-youtube"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- FOOTER START -->
    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-auto mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer-kader"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>

    <button id="scrollToTopBtn" title="Kembali ke atas" class="hidden">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
        window.phpRayonData = <?php echo $rayonDataJson; ?>; // Data rayon dari PHP

        // Memuat JavaScript utama untuk halaman ini
        import './js/rayon-profile.js';
        import { updateAuthUI } from './js/auth.js'; // Impor updateAuthUI
        
        document.addEventListener('DOMContentLoaded', function() {
            // Kumpulkan elemen-elemen untuk updateAuthUI (dari index.php)
            const headerTitleText = document.getElementById('header-title-text');
            const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
            const authLinkMain = document.getElementById('auth-link-main');
            const authLinkMobile = document.getElementById('mobile-logout-link');
            const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
            const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');

            const authElements = {
                authLinkMain, authLinkMobile, desktopKaderMenuContainer,
                desktopAdminMenuContainer, headerTitleText, mobileHeaderTitleText
            };
            updateAuthUI(authElements); // Panggil untuk memperbarui UI navigasi
        });
    </script>
</body>
</html>
