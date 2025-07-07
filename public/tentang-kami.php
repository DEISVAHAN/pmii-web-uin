<?php
// public/tentang-kami.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
require_once __DIR__ . '/../vendor/autoload.php';

// Muat variabel lingkungan dari .env
\App\Core\DotenvLoader::load();

// Asumsi: Data pengguna yang login akan tersedia di $_SERVER['user_data']
// setelah AuthMiddleware memverifikasi token.
$loggedInUser = $_SERVER['user_data'] ?? null;

// Injeksi data pengguna yang login ke JavaScript
$loggedInUserJson = json_encode($loggedInUser);

// --- Mengambil data "Tentang Kami" dari API Backend menggunakan PHP (untuk initial render) ---
$aboutUsData = [];
try {
    require_once __DIR__ . '/../app/core/Database.php';
    require_once __DIR__ . '/../app/models/HomepageSection.php'; // Mengambil dari model HomepageSection
    $aboutSection = \App\Models\HomepageSection::find('about');
    if ($aboutSection && isset($aboutSection['content_json'])) {
        $decodedContent = json_decode($aboutSection['content_json'], true);
        $aboutUsData['p1'] = $decodedContent['p1'] ?? '';
    }
} catch (Exception $e) {
    error_log("Error fetching 'About Us' data for initial render: " . $e->getMessage());
    $aboutUsData = ['p1' => 'Pergerakan Mahasiswa Islam Indonesia (PMII) adalah organisasi kemahasiswaan Islam yang berlandaskan Ahlussunnah wal Jama\'ah an-Nahdliyah. Kami berkomitmen untuk mencetak kader-kader Ulul Albab yang memiliki kedalaman spiritual, keluasan ilmu pengetahuan, dan kepedulian sosial yang tinggi.']; // Fallback
}

$aboutUsDataJson = json_encode($aboutUsData);

?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tentang Kami - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css"/>

    <!-- Memuat CSS eksternal -->
    <link rel="stylesheet" href="css/style.css">
    <!-- Memuat CSS spesifik halaman ini -->
    <link rel="stylesheet" href="css/tentang-kami.css">
</head>
<body>
    <!-- Custom Message Box & Confirm Modal -->
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
                <a href="index.php#beranda" class="nav-link text-sm">Beranda</a>
                <a href="index.php#tentang" class="nav-link text-sm active-nav-link">Tentang Kami</a>
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
            <!-- Tombol Kembali -->
            <div class="mb-6">
                <a href="index.php" class="btn-primary-pmii btn inline-flex items-center">
                    <i class="fas fa-arrow-left mr-2"></i> Kembali ke Beranda
                </a>
            </div>

            <section id="tentang-kami-page-content">
                <div class="page-header-section">
                    <h1>Tentang Kami</h1>
                    <p>Mengenal lebih jauh tentang Pergerakan Mahasiswa Islam Indonesia Komisariat UIN Sunan Gunung Djati Bandung.</p>
                </div>

                <div class="page-content-card">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div>
                            <img src="https://placehold.co/700x450/005c97/FFFFFF?text=PMII+Activity" alt="Gambar Kegiatan PMII" class="rounded-xl shadow-lg w-full mb-6 md:mb-0">
                        </div>
                        <div class="space-y-6 text-text-secondary leading-relaxed">
                            <p id="about-us-content-p1">
                                <!-- Konten ini akan diisi dari API -->
                            </p>
                            <p class="text-text-secondary">
                                PMII Komisariat UIN Sunan Gunung Djati Bandung telah menjadi wadah bagi ribuan mahasiswa untuk mengembangkan diri, berorganisasi, dan berkontribusi pada masyarakat. Dengan semangat keislaman dan keindonesiaan, kami terus berupaya mencetak kader-kader yang berintegritas dan siap menghadapi tantangan zaman.
                            </p>
                            <p class="text-text-secondary">
                                Kami menyelenggarakan berbagai program mulai dari diskusi intelektual, kegiatan sosial, hingga pengembangan potensi diri untuk menciptakan lulusan yang tidak hanya cerdas secara akademik, tetapi juga berakhlak mulia dan memiliki jiwa kepemimpinan.
                            </p>
                        </div>
                    </div>

                    <div class="mt-12 text-center">
                        <h2 class="text-2xl font-bold text-pmii-darkblue border-b-2 border-pmii-yellow pb-2 mb-8 inline-block section-title">Visi dan Misi Kami</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            <div class="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 class="text-xl font-semibold text-pmii-blue mb-3"><i class="fas fa-eye mr-2 text-pmii-yellow"></i> Visi</h3>
                                <p id="visi-content" class="text-text-secondary">
                                    Sesuai dengan Anggaran Dasar Anggaran Rumah Tangga Bab IV Pasal 4 <br><br>
                                    Terbentuknya pribadi muslim Indonesia yang bertakwa kepada Allah SWT, berbudi luhur, berilmu, cakap dan
                                    bertanggung jawab dalam mengamalkan ilmunya serta komitmen memperjuangkan cita-cita kemerdekaan
                                    Indonesia.
                                </p>
                            </div>
                            <div class="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 class="text-xl font-semibold text-pmii-blue mb-3"><i class="fas fa-bullseye mr-2 text-pmii-yellow"></i> Misi</h3>
                                <ul id="misi-content" class="list-disc pl-5 text-text-secondary space-y-2">
                                    <li>Sesuai dengan Anggaran Dasar Anggaran Rumah Tangga Bab IV Pasal 5</li>
                                    <li>Menghimpun dan membina mahasiswa Islam Indonesia sesuai dengan sifat dan tujuan PMII serta
                                    peraturan perundang-undangan dan NDP PMII yang berlaku;</li>
                                    <li>Melaksanakan kegiatan-kegiatan dalam berbagai bidang sesuai dengan asas, tujuan, dan paradigma PMII
                                    serta mewujudkan pribadi insan ulul albab.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- FOOTER START -->
    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-12 mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>
    
    <button id="scrollToTopBtn" title="Kembali ke atas" class="hidden">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>
    
    <script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js"></script>
    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
        window.phpAboutUsData = <?php echo $aboutUsDataJson; ?>; // Data tentang kami dari PHP

        // Memuat JavaScript utama untuk halaman ini
        import './js/tentang-kami.js';
    </script>
</body>
</html>
