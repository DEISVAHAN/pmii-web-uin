<?php
// public/digilib.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
require_once __DIR__ . '/../vendor/autoload.php';

// Muat variabel lingkungan dari .env
\App\Core\DotenvLoader::load();

// Asumsi: Data pengguna yang login akan tersedia di $_SERVER['user_data']
$loggedInUser = $_SERVER['user_data'] ?? null;

// Injeksi data pengguna yang login ke JavaScript
$loggedInUserJson = json_encode($loggedInUser);

?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perpustakaan Digital - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Memuat CSS eksternal -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/digilib.css">
</head>
<body>
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
                <a href="digilib.php" class="nav-link text-sm active-nav-link" target="_self">📚 Digilib</a>
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
            <!-- Mobile navigation links will be dynamically populated here by JavaScript -->
        </nav>
        <a href="#" id="mobile-logout-link" class="mobile-nav-link mt-4 justify-center logged-out-styles" data-action="login">
            <i class="fas fa-sign-in-alt"></i><span>Login</span>
        </a>
    </div>
    <div id="mobile-menu-overlay" class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"></div>

    <div class="main-content-wrapper section-pmii-bg-pattern">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <section id="digilib-content" class="py-6">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title">Perpustakaan Digital PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</h1>
                    <p class="text-md text-text-muted mt-2">Temukan sumber daya digital, makalah, jurnal, dan buku referensi.</p>
                </div>

                <div class="digilib-search-bar">
                    <input type="search" id="digilib-search-input-page" placeholder="Cari judul, penulis, kata kunci...">
                    <button type="button" id="digilib-search-button-page" aria-label="Cari di Digilib">
                        <i class="fas fa-search"></i>
                    </button>
                    <!-- Search Suggestions Container -->
                    <div id="search-suggestions" class="absolute bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-2 z-20 hidden">
                        <!-- Suggestions will be rendered here -->
                    </div>
                </div>

                <div id="category-cards-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                    <!-- Category cards will be dynamically loaded here by JavaScript -->
                </div>
                <!-- Pesan ini ditampilkan jika tidak ada kategori yang cocok dengan filter langsung -->
                <p id="no-search-results" class="no-results-message hidden">Tidak ada hasil yang ditemukan untuk pencarian Anda.</p>
                
                <div id="search-results-container" class="hidden">
                    <div class="search-results-header">
                        <h2 class="text-2xl font-semibold">Hasil Pencarian <span id="search-query-display" class="font-bold"></span></h2>
                        <button id="back-to-categories-btn" class="btn-modern btn-outline-modern">
                            <i class="fas fa-arrow-left mr-2"></i> Kembali ke Kategori
                        </button>
                    </div>
                    <div id="results-list" class="search-results-list">
                    </div>
                    <!-- Pesan ini ditampilkan jika pencarian penuh tidak menghasilkan dokumen -->
                    <p id="no-filtered-results" class="no-results-message hidden">Tidak ada dokumen yang cocok dengan filter Anda.</p>
                    
                    <!-- Pagination Controls -->
                    <div id="pagination-controls" class="pagination-controls">
                        <button id="prev-page-btn" disabled><i class="fas fa-chevron-left mr-1"></i> Sebelumnya</button>
                        <div id="page-numbers"></div>
                        <button id="next-page-btn">Selanjutnya <i class="fas fa-chevron-right ml-1"></i></button>
                    </div>
                </div>

                <!-- Recent Searches Section -->
                <div id="recent-searches-container" class="recent-section-container">
                    <h3>Pencarian Terakhir</h3>
                    <div id="recent-searches-list" class="recent-list">
                        <!-- Recent searches will be dynamically loaded here -->
                    </div>
                    <p id="no-recent-searches" class="text-sm text-text-muted mt-2 hidden">Belum ada pencarian terakhir.</p>
                </div>

                <!-- Recent Files Section -->
                <div id="recent-files-container" class="recent-section-container">
                    <h3>File Terbaru</h3>
                    <div id="recent-files-list" class="recent-list">
                        <!-- Recent files will be dynamically loaded here -->
                    </div>
                    <p id="no-recent-files" class="text-sm text-text-muted mt-2 hidden">Belum ada file terbaru yang dilihat.</p>
                </div>
                
            </section>
        </main>
    </div>

    <footer class="internal-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-auto mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer-digilib"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>
    
    <button id="scrollToTopBtnDigilib" title="Kembali ke atas" class="hidden fixed bottom-6 right-6 z-50 items-center justify-center hover:bg-yellow-300 focus:outline-none w-11 h-11 rounded-full bg-pmii-yellow text-pmii-darkblue shadow-lg">
        <i class="fas fa-arrow-up text-lg"></i>
    </button>
    <div id="detailSearchResultModal" class="modal-overlay hidden">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="detailSearchResultTitle">Detail Dokumen</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-xl" onclick="closeModal('detailSearchResultModal')">&times;</button>
            </div>
            <div class="modal-body text-sm text-text-secondary">
                <p><strong>Judul:</strong> <span id="detailResultJudul" class="font-medium"></span></p>
                <p><strong>Penulis:</strong> <span id="detailResultPenulis"></span></p>
                <p id="detailResultRayonContainer" class="hidden"><strong>Rayon:</strong> <span id="detailResultRayon"></span></p>
                <p id="detailResultTahunContainer" class="hidden"><strong>Tahun:</strong> <span id="detailResultTahun"></span></p>
                <p id="detailResultPenerbitContainer" class="hidden"><strong>Penerbit:</strong> <span id="detailResultPenerbit"></span></p>
                <p id="detailResultPeriodeContainer" class="hidden"><strong>Periode:</strong> <span id="detailResultPeriode"></span></p>
                <p id="detailResultTanggalUnggahContainer" class="hidden"><strong>Tanggal Unggah:</strong> <span id="detailResultTanggalUnggah"></span></p>
                <h4 class="font-semibold text-text-primary mt-4 mb-2">Abstrak/Deskripsi:</h4>
                <p id="detailResultAbstrak"></p>
                <div class="modal-footer justify-between">
                    <a href="#" id="detailResultDownloadLink" target="_blank" class="btn-modern btn-outline-modern">
                        <i class="fas fa-download mr-2"></i> Unduh File
                    </a>
                    <button type="button" class="btn-modern btn-outline-modern" onclick="closeModal('detailSearchResultModal')">Tutup</button>
                </div>
            </div>
        </div>
    </div>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;

        // Memuat JavaScript utama untuk halaman ini
        import './js/digilib.js';
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
