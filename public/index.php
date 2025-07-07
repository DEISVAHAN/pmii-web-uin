<?php
// public/index.php

// --- INISIALISASI BACKEND & AUTOLOADER ---
require_once __DIR__ . '/../vendor/autoload.php';

// Muat variabel lingkungan dari .env
// Pastikan file .env ada di direktori root proyek (sejajar dengan folder 'app' dan 'public')
try {
    \App\Core\DotenvLoader::load();
} catch (Exception $e) {
    // Tangani jika .env tidak ditemukan atau tidak bisa dibaca
    error_log($e->getMessage());
    // Anda bisa menampilkan halaman error yang lebih baik di sini
    die("Error: Tidak dapat memuat konfigurasi lingkungan.");
}


// --- LOGIKA ROUTING API ---
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Menentukan path dasar proyek. Ini penting untuk routing yang benar di subdirektori.
$projectBasePath = '/pmii-web-uin/public'; 
$apiPath = $projectBasePath . '/api/';

// Cek apakah permintaan ini ditujukan untuk API
if (strpos($requestUri, $apiPath) === 0) {
    
    // Ini adalah permintaan API, jalankan router backend
    header('Content-Type: application/json');
    
    // Inisialisasi router dari core
    // Pastikan namespace dan path file sudah benar
    $router = new \App\Core\Router();
    
    // Muat semua definisi rute dari file app/routes/api.php
    require_once __DIR__ . '/../app/routes/api.php';
    
    // Ekstrak URI endpoint dari permintaan penuh
    // Contoh: dari /pmii-web-uin/public/api/homepage-sections menjadi /api/homepage-sections
    $endpointUri = '/' . substr($requestUri, strlen($projectBasePath) + 1);

    // Jalankan router untuk mencocokkan URI dengan controller yang sesuai
    $router->dispatch($endpointUri, $requestMethod);
    
    // Hentikan eksekusi agar tidak melanjutkan ke rendering HTML
    exit;
}


// --- RENDERING HALAMAN HTML (JIKA BUKAN PERMINTAAN API) ---
// Kode di bawah ini adalah kode asli dari index.php Anda untuk menampilkan halaman.
// Ini hanya akan berjalan jika URL yang diakses adalah halaman utama.

$loggedInUser = $_SERVER['user_data'] ?? null;
$loggedInUserJson = json_encode($loggedInUser);

$homepageContentInitial = [
    'heroMainTitle' => "Pengurus Komisariat<br>Pergerakan Mahasiswa Islam Indonesia<br>UIN Sunan Gunung Djati<br>Cabang Kota Bandung",
    'announcementText' => "Pengumuman penting tentang kegiatan terbaru kami dapat dilihat <a href=\"#kegiatan\">di sini</a>.",
    'aboutP1' => "Pergerakan Mahasiswa Islam Indonesia (PMII) Komisariat UIN Sunan Gunung Djati Bandung adalah organisasi kemahasiswaan Islam yang berlandaskan Ahlussunnah wal Jama'ah an-Nahdliyah. Kami berkomitmen untuk mencetak kader-kader Ulul Albab yang memiliki kedalaman spiritual, keluasan ilmu pengetahuan, dan kepedulian sosial yang tinggi.",
    'news' => [],
    'activities' => [],
    'gallery' => []
];
$homepageContentJson = json_encode($homepageContentInitial);

$siteSettingsInitial = [
    'contact_email' => 'pmiikomisariatuinbandungkota@gmail.com',
    'contact_phone' => '085320677948',
    'site_address' => 'Jl. AH. Nasution No.105, Cipadung Wetan, Kec. Cibiru, Kota Bandung, Jawa Barat 40614',
    'instagram_url' => 'https://instagram.com/pmii.uinsgd',
    'facebook_url' => '#',
    'twitter_url' => '#',
    'youtube_url' => '#'
];
$siteSettingsJson = json_encode($siteSettingsInitial);

$simulatedRayonsInitial = [];
$totalKaderInitial = 0;
$totalRayonInitial = 0;

$simulatedRayonsJson = json_encode($simulatedRayonsInitial);
$totalKaderInitialJson = json_encode($totalKaderInitial);
$totalRayonInitialJson = json_encode($totalRayonInitial);

?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css"/>
    <!-- Memuat CSS eksternal -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <!-- Kotak Pesan Kustom & Modal Konfirmasi -->
    <div id="customMessageBox" class="fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0">
        Pesan kustom di sini!
    </div>

    <div id="customConfirmModal" class="custom-confirm-modal-overlay">
        <div class="custom-confirm-modal-content">
            <h3 id="confirmModalTitle">Konfirmasi Aksi</h3>
            <p id="confirmModalMessage">Apakah Anda yakin ingin melanjutkan?</p>
            <div class="modal-actions">
                <button id="confirmCancelBtn" class="btn btn-secondary-pmii">Tidak</button>
                <button id="confirmYesBtn" class="btn btn-primary-pmii">Ya</button>
            </div>
        </div>
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
                <a href="#beranda" class="nav-link text-sm">Beranda</a>
                <a href="tentang-kami.php" class="nav-link text-sm">Tentang Kami</a>
                <a href="berita-artikel.php" class="nav-link text-sm">Berita</a>
                <a href="digilib.php" class="nav-link text-sm" target="_self">📚 Digilib</a>
                <a href="agenda-kegiatan.php" class="nav-link text-sm">Kegiatan</a>
                <a href="galeri-foto.php" class="nav-link text-sm">Galeri</a>
                <div id="desktop-kader-menu-container" class="relative dropdown hidden">
                    <button class="dropdown-toggle nav-link focus:outline-none text-sm">
                        Profil Kader <i class="fas fa-chevron-down text-xs ml-1"></i>
                    </button>
                    <div class="dropdown-menu mt-3.5">
                        <a href="dashboard/edit-profil-kader.php" id="edit-profil-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-user-edit"></i> Edit Profil</a>
                        <a href="dashboard/pengaturan-akun-kader.php" id="pengaturan-akun-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-cog"></i> Pengaturan Akun</a>
                        <a href="akses-ojs.php" id="jurnal-alharokah-link-desktop-kader" class="dropdown-item" target="_self"><i class="fas fa-book-reader"></i> Jurnal Al Harokah</a>
                        <a href="dashboard/pengajuan-surat.php" id="pengajuan-surat-link-desktop-kader" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i> Pengajuan Surat</a>
                    </div>
                </div>
                <div id="desktop-admin-menu-container" class="relative dropdown hidden">
                    <button class="dropdown-toggle nav-link focus:outline-none text-sm">
                        Sistem Internal <i class="fas fa-chevron-down text-xs ml-1"></i>
                    </button>
                    <div class="dropdown-menu mt-3.5">
                        <a href="dashboard/manajemen-akun.php" id="manajemen-akun-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-user-shield"></i>Manajemen Akun</a>
                        <a href="dashboard/manajemen-kader.php" id="manajemen-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-users-cog"></i>Manajemen Kader</a>
                        <a href="dashboard/repository-ilmiah.php" id="repository-ilmiah-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-book-open"></i>Jurnal & Karya Ilmiah</a>
                        <a href="dashboard/pengajuan-surat.php" id="pengajuan-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i>Pengajuan Surat</a>
                        <a href="dashboard/verifikasi-surat.php" id="verifikasi-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-check-circle"></i>Verifikasi Surat</a>
                        <a href="dashboard/admin-dashboard-rayon.php" id="dashboard-rayon-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Rayon</a>
                        <a href="dashboard/admin-dashboard-komisariat.php" id="admin-dashboard-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Kom.</a>
                        <a href="dashboard/edit-beranda.php" id="edit-beranda-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-edit"></i>Edit Beranda</a>
                        <a href="akses-ojs.php" id="jurnal-alharokah-link-desktop-admin" class="dropdown-item" target="_self"><i class="fas fa-book-reader"></i>Jurnal Al Harokah</a>
                        <hr class="border-gray-200 my-1">
                        <a href="dashboard/verifikasi-konten-rayon.php" id="verifikasi-konten-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-check-double"></i>Verifikasi Konten Rayon</a>
                        <a href="dashboard/rayon-tambah-berita.php" id="tambah-berita-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-newspaper"></i>Tambah Berita & Artikel</a>
                        <a href="dashboard/rayon-tambah-kegiatan.php" id="tambah-kegiatan-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-calendar-plus"></i>Tambah Kegiatan</a>
                        <a href="dashboard/rayon-tambah-galeri.php" id="tambah-galeri-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-images"></i>Tambah Galeri Kegiatan</a>
                        <a href="dashboard/edit-profil-rayon.php" id="edit-profil-rayon-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-building"></i>Edit Profil Rayon</a>
                        <!-- New Admin Links -->
                        <a href="dashboard/pengaturan-situs.php" id="pengaturan-situs-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-cogs"></i>Pengaturan Situs</a>
                        <a href="dashboard/dashboard-statistik.php" id="dashboard-statistik-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-chart-bar"></i>Dashboard Statistik</a>
                        <a href="dashboard/kelola-notifikasi.php" id="kelola-notifikasi-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-bell"></i>Kelola Notifikasi</a>
                        <a href="dashboard/laporan-analisis.php" id="laporan-analisis-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-invoice"></i>Laporan & Analisis</a>
                        <a href="generate-qr.php" id="ttd-digital-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-qrcode"></i>TTD Digital</a>
                        <!-- New: Arsiparis Kepengurusan link -->
                        <a href="dashboard/arsiparis.php" id="arsiparis-kepengurusan-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-archive"></i>Arsiparis Kepengurusan</a>
                    </div>
                </div>
                <!-- New: Notification button for logged-in users -->
                <button id="notification-button-desktop" class="notification-button hidden">
                    <i class="fas fa-bell"></i>
                    <span id="notification-badge-desktop" class="notification-badge hidden">0</span>
                </button>
                <a href="#kontak" class="nav-link text-sm">Kontak</a>
                <a href="login.php" id="auth-link-main" class="btn logged-out-styles text-sm" data-action="login">
                    Login
                </a>
            </div>
            <div class="lg:hidden flex items-center space-x-4">
                <!-- New: Notification button for mobile logged-in users -->
                <button id="notification-button-mobile" class="notification-button hidden">
                    <i class="fas fa-bell"></i>
                    <span id="notification-badge-mobile" class="notification-badge hidden">0</span>
                </button>
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
            <!-- Mobile navigation links will be populated here by JavaScript -->
            <a href="#" id="mobile-logout-link" class="mobile-nav-link mt-4 bg-red-500 hover:bg-red-600 justify-center"></a>
        </nav>
    </div>
    <div id="mobile-menu-overlay" class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"></div>
    <!-- HEADER END -->

    <div class="main-content-wrapper">
        <section id="beranda" class="hero-bg-enhanced text-white">
            <!-- Gambar Latar Belakang Kiri -->
            <img src="img/background-web-2.png" alt="Gambar Latar Belakang Hero Kiri" class="hero-left-image" onerror="this.onerror=null;this.src='https://placehold.co/800x1200/004a7c/FFFFFF?text=Background+Image+Left';">
            <!-- Gambar Latar Belakang Kanan -->
            <img src="img/background-web.png" alt="Gambar Latar Belakang Hero Kanan" class="hero-right-image" onerror="this.onerror=null;this.src='https://placehold.co/800x1200/004a7c/FFFFFF?text=Background+Image+Right';">
            
            <!-- Konten Hero (kotak teks) di sisi kiri -->
            <div class="hero-content-container">
                <div class="hero-text-box">
                    <div class="inline-block px-4 py-2 mb-4 rounded-lg bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm text-white text-sm font-semibold tracking-wide border border-white border-opacity-30">
                        WEBSITE RESMI
                    </div>
                    <h1 id="hero-main-title" class="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-extrabold mb-4 leading-tight" style="text-shadow: 2px 2px 8px rgba(0,0,0,0.5);">
                        <!-- Judul ini akan diisi secara dinamis oleh JavaScript dari PHP -->
                    </h1>
                    <a href="#tentang" class="btn btn-secondary-pmii text-lg">
                        Jelajahi Lebih Lanjut <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1.5 transition-transform duration-300"></i>
                    </a>
                </div>
            </div>
        </section>

        <section id="announcement-section" class="py-16 bg-pmii-yellow text-pmii-blue animated-section animate-fade-in-up hidden">
            <div class="container mx-auto px-4 text-center">
                <div class="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                    <i class="fas fa-bullhorn text-5xl md:text-6xl animate-pulseSubtle"></i>
                    <div class="md:text-left">
                        <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5">Pengumuman Penting</h2>
                        <p id="announcement-text" class="text-md md:text-lg lg:text-xl"></p>
                    </div>
                </div>
            </div>
        </section>

        <section id="tentang" class="py-20 lg:py-28 section-pmii-bg-pattern animated-section animate-fade-in-up">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl lg:text-4xl font-bold text-center text-pmii-yellow mb-16 section-title">Tentang PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</h2>
                <div class="flex flex-col lg:flex-row items-center justify-content-center lg:justify-start gap-6">
                    <div class="pmii-logo-about-us-container animated-section" style="--stagger-delay: 0.1s;">
                        <img src="img/logo-pmii.png" alt="Logo PMII" class="pmii-logo-about-us">
                    </div>
                    <div class="text-md text-white space-y-6 leading-relaxed flex-grow animated-section animate-slide-in-right-perspective" style="--stagger-delay: 0.2s;">
                        <p id="about-us-p1" class="text-white">
                            <!-- Konten ini akan diisi secara dinamis oleh JavaScript dari PHP -->
                        </p>
                        <a href="tentang-kami.php" class="btn btn-primary-pmii text-base mt-5 inline-block group mr-4" target="_self">
                            Baca Selengkapnya <i class="fas fa-angle-double-right ml-1.5 group-hover:translate-x-1 transition-transform duration-300"></i>
                        </a>
                        <a href="all-rayons.php" class="btn btn-secondary-pmii text-base mt-5 inline-block group" target="_self">
                            Daftar Rayon <i class="fas fa-building ml-1.5 group-hover:translate-x-0.5 transition-transform duration-300"></i>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <section id="statistik" class="py-20 lg:py-28 section-pmii-bg-pattern animated-section animate-fade-in-up">
            <div class="container mx-auto px-4 text-center">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <a href="all-rayons.php" class="statistic-card bg-pmii-blue p-8 rounded-xl shadow-lg flex flex-col items-center justify-center animate-card-entry stagger-1" target="_self">
                        <i class="fas fa-building text-4xl mb-4 text-pmii-yellow"></i>
                        <h3 class="animated-number text-5xl font-extrabold" data-target="0">0</h3>
                        <p class="text-lg opacity-80 mt-2">Rayon</p>
                        <p class="text-sm opacity-60 mt-1">Klik untuk lihat profil & kontak setiap rayon</p>
                    </a>

                    <div class="statistic-card bg-pmii-blue p-8 rounded-xl shadow-lg flex flex-col items-center justify-center animate-card-entry stagger-2">
                        <i class="fas fa-users text-4xl mb-4 text-pmii-yellow"></i>
                        <h3 class="animated-number text-5xl font-extrabold" data-target="0" data-append-text="+">0</h3>
                        <p class="text-lg opacity-80 mt-2">Kader Lingkup Komisariat</p>
                        <p class="text-sm opacity-60 mt-1">UIN Sunan Gunung Djati Cabang Kota Bandung</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="berita" class="py-20 lg:py-28 section-pmii-bg-pattern animated-section animate-fade-in-up">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl lg:text-4xl font-bold text-center text-pmii-yellow mb-14 section-title">Berita & Artikel Terbaru</h2>
                <div id="news-container" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Berita akan dimuat di sini oleh JavaScript -->
                </div>
                <div class="text-center mt-12">
                    <a href="berita-artikel.php" class="btn btn-primary-pmii text-base" target="_self">Lihat Semua Berita & Artikel</a>
                </div>
            </div>
        </section>

        <section id="kegiatan" class="py-20 lg:py-28 section-pmii-bg-pattern animated-section animate-fade-in-up">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl lg:text-4xl font-bold text-center text-pmii-yellow mb-14 section-title">Agenda Kegiatan</h2>
                <div id="edit-activities-button-container" class="text-center mb-10 hidden">
                    <a href="dashboard/edit-beranda.php#activities-edit-section" id="edit-activities-btn" class="btn btn-primary-pmii text-base" target="_self">
                        <i class="fas fa-pencil-alt mr-2"></i> Edit Agenda Kegiatan
                    </a>
                </div>
                <div id="activities-container" class="space-y-8">
                    <!-- Kegiatan akan dimuat di sini oleh JavaScript -->
                </div>
                <div class="text-center mt-12">
                    <a href="agenda-kegiatan.php" class="btn btn-primary-pmii text-base" target="_self">Lihat Semua Agenda Kegiatan</a>
                </div>
            </div>
        </section>

        <section id="galeri" class="py-20 lg:py-28 section-pmii-bg-pattern animated-section animate-fade-in-up">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl lg:text-4xl font-bold text-center text-pmii-yellow mb-14 section-title">Galeri Kegiatan PMII</h2>
                <div id="gallery-container" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    <!-- Galeri akan dimuat di sini oleh JavaScript -->
                </div>
                <div class="text-center mt-12">
                    <a href="galeri-foto.php" class="btn btn-primary-pmii text-base" target="_self">Lihat Semua Galeri Foto</a>
                </div>
            </div>
        </section>

        <section id="kontak" class="py-20 lg:py-28 text-white animated-section animate-fade-in-up">
            <div class="container mx-auto px-4">
                <h2 class="text-3xl lg:text-4xl font-bold text-center mb-14 section-title text-white">Hubungi Kami</h2>
                <div class="contact-content-wrapper p-6 md:p-10 rounded-xl shadow-2xl max-w-3xl mx-auto border border-white/10">
                    <div id="contact-form-response-message" class="hidden form-message-container"></div>
                    <div class="grid md:grid-cols-2 gap-8 md:gap-12">
                        <div>
                            <h3 class="text-2xl font-semibold mb-5 text-pmii-yellow">Informasi Kontak</h3>
                            <div class="space-y-3.5 text-sm">
                                <p class="flex items-start"><i class="fas fa-map-marker-alt mr-3 mt-0.5 w-4 text-center text-pmii-yellow"></i> <span id="contact-address"></span></p>
                                <p class="flex items-start"><i class="fas fa-envelope mr-3 mt-0.5 w-4 text-center text-pmii-yellow"></i> <a href="#" id="contact-email" class="hover:text-pmii-yellow transition-colors"></a></p>
                                <p class="flex items-start"><i class="fas fa-phone mr-3 mt-0.5 w-4 text-center text-pmii-yellow"></i> <span id="contact-phone"></span></p>
                            </div>
                            <h4 class="text-xl font-semibold mt-8 mb-3 text-pmii-yellow">Media Sosial</h4>
                            <div id="social-media-links-container" class="flex space-x-4">
                                <!-- Tautan media sosial akan dimuat di sini oleh JavaScript -->
                            </div>
                        </div>
                        <div>
                            <h3 class="text-2xl font-semibold mb-5 text-pmii-yellow">Kirim Pesan Langsung</h3>
                            <form id="formKontakPesan">
                                <div>
                                    <label for="nama_kontak" class="form-label">Nama Lengkap</label>
                                    <input type="text" id="nama_kontak" name="nama_kontak" required class="form-input text-sm">
                                </div>
                                <div>
                                    <label for="email_kontak" class="form-label">Alamat Email</label>
                                    <input type="email" id="email_kontak" name="email_kontak" required class="form-input text-sm">
                                </div>
                                <div>
                                    <label for="pesan_kontak" class="form-label">Pesan Anda</label>
                                    <textarea id="pesan_kontak" name="pesan_kontak" rows="4" required class="form-input text-sm"></textarea>
                                </div>
                                <button type="submit" class="w-full btn btn-secondary-pmii text-sm mt-1.5">Kirim Pesan Anda</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
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

    <script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js"></script>
    <script type="module">
        // Injeksi data PHP ke JavaScript (ini hanya akan berfungsi jika diakses melalui PHP server)
        // Untuk akses langsung index.html, variabel ini akan undefined.
        window.phpHomepageContent = <?php echo $homepageContentJson; ?>;
        window.phpSiteSettings = <?php echo $siteSettingsJson; ?>;
        window.phpSimulatedRayons = <?php echo $simulatedRayonsJson; ?>;
        window.phpTotalKaderSimulated = <?php echo $totalKaderInitialJson; ?>;
        window.phpTotalRayonSimulated = <?php echo $totalRayonInitialJson; ?>;
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;

        // Memuat JavaScript utama untuk halaman ini
        import './js/main.js';
        // Memuat utilitas global
        import { showCustomMessage, showCustomConfirm } from './js/utils.js';
        window.showCustomMessage = showCustomMessage;
        window.showCustomConfirm = showCustomConfirm;
    </script>

</body>
</html>
