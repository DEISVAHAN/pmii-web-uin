<?php
// public/generate-qr.php

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
    <title>Generate QR TTD Digital - PK PMII UIN Sunan Gunung Djati</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>
    
    <!-- Memuat CSS eksternal -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/generate-qr.css">
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
                <a href="digilib.php" class="nav-link text-sm" target="_self">📚 Digilib</a>
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
                        <a href="generate-qr.php" id="ttd-digital-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-qrcode"></i>TTD Digital</a>
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
            <a href="#" id="mobile-logout-link" class="mobile-nav-link mt-4 justify-center logged-out-styles" data-action="login">
                <i class="fas fa-sign-in-alt"></i><span>Login</span>
            </a>
        </nav>
    </div>
    <div id="mobile-menu-overlay" class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"></div>

    <div class="main-content-wrapper">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <div class="text-center mb-10 md:mb-14">
                <h1 class="text-3xl lg:text-4xl page-title" id="mainPageTitle">Generate QR Code</h1>
                <p class="text-md text-text-muted mt-2" id="mainPageDescription">Buat dan kelola kode QR untuk berbagai keperluan.</p>
            </div>

            <section id="qr-type-selection" class="content-card max-w-2xl mx-auto py-6 px-6 lg:px-10 mb-8">
                <h2 class="text-xl font-bold text-pmii-yellow mb-4 text-center">Pilih Tipe QR Code</h2>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="qrType" value="ttdDigital" id="qrTypeTtdDigital" class="form-radio text-pmii-yellow h-5 w-5" checked>
                        <span class="text-white text-lg">QR Tanda Tangan Digital</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="qrType" value="accessLink" id="qrTypeAccessLink" class="form-radio text-pmii-yellow h-5 w-5">
                        <span class="text-white text-lg">QR Mengakses Link</span>
                    </label>
                </div>
            </section>

            <section id="qr-ttd-form-section" class="content-card max-w-2xl mx-auto py-8 px-6 lg:px-10">
                <h2 class="text-2xl font-bold text-pmii-yellow mb-6 text-center">Buat Kode QR TTD Digital</h2>
                <div id="qr-form-message" class="hidden form-message-container mb-4"></div>

                <form id="qrTtdForm" class="space-y-5">
                    <div>
                        <label for="nomorSurat" class="form-label">Nomor Surat</label>
                        <input type="text" id="nomorSurat" name="nomorSurat" class="form-input dark-mode" placeholder="Contoh: B-1234/Kom.V-03/PMII.01.02/VI/2024" required>
                    </div>
                    <div>
                        <label for="ditandatanganiOleh" class="form-label">Ditandatangani Oleh</label>
                        <input type="text" id="ditandatanganiOleh" name="ditandatanganiOleh" class="form-input dark-mode" placeholder="Nama Penanggung Jawab" required>
                    </div>
                    <div>
                        <label for="jabatan" class="form-label">Jabatan</label>
                        <input type="text" id="jabatan" name="jabatan" class="form-input dark-mode" placeholder="Contoh: Ketua Komisariat" required>
                    </div>
                    <div>
                        <label for="tanggalSurat" class="form-label">Tanggal Surat</label>
                        <input type="date" id="tanggalSurat" name="tanggalSurat" class="form-input dark-mode" required>
                    </div>
                    <div>
                        <label for="perihalSurat" class="form-label">Perihal Surat</label>
                        <input type="text" id="perihalSurat" name="perihalSurat" class="form-input dark-mode" placeholder="Contoh: Undangan Diskusi Akbar" required>
                    </div>

                    <div id="logoUploadContainer" class="hidden">
                        <label for="logoUploadInput" class="form-label">Unggah Logo Rayon (Opsional, untuk Admin Rayon)</label>
                        <input type="file" id="logoUploadInput" name="logoUploadInput" accept="image/*" class="form-input dark-mode p-2.5">
                        <p class="text-gray-400 text-xs mt-1">Ukuran logo ideal: persegi (mis. 100x100px). Akan diletakkan di tengah QR.</p>
                        <img id="logoPreview" src="#" alt="Pratinjau Logo" class="mt-2 hidden"/>
                    </div>

                    <div class="text-center mt-8">
                        <button type="submit" id="generateQrTtdBtn" class="btn btn-primary-pmii mb-4">
                            <i class="fas fa-qrcode mr-2"></i> Generate Kode QR TTD
                        </button>
                    </div>
                </form>
            </section>

            <section id="qr-link-form-section" class="content-card max-w-2xl mx-auto py-8 px-6 lg:px-10 hidden">
                <h2 class="text-2xl font-bold text-pmii-yellow mb-6 text-center">Buat Kode QR Mengakses Link</h2>
                <div id="qr-link-form-message" class="hidden form-message-container mb-4"></div>

                <form id="qrLinkForm" class="space-y-5">
                    <div>
                        <label for="linkUrl" class="form-label">URL Link <span class="text-red-400">*</span></label>
                        <input type="url" id="linkUrl" name="linkUrl" class="form-input dark-mode" placeholder="Contoh: https://pmii-bandung.or.id/agenda" required>
                    </div>
                    <div>
                        <label for="linkTitle" class="form-label">Judul Link (Opsional)</label>
                        <input type="text" id="linkTitle" name="linkTitle" class="form-input dark-mode" placeholder="Contoh: Agenda Terkini PK PMII">
                    </div>
                    <div>
                        <label for="linkDescription" class="form-label">Deskripsi Link (Opsional)</label>
                        <textarea id="linkDescription" name="linkDescription" rows="3" class="form-input dark-mode" placeholder="Deskripsi singkat tentang link ini..."></textarea>
                    </div>
                    <div>
                        <label for="linkCreator" class="form-label">Dibuat Oleh (Opsional)</label>
                        <input type="text" id="linkCreator" name="linkCreator" class="form-input dark-mode" placeholder="Nama Pembuat QR">
                    </div>

                    <div class="text-center mt-8">
                        <button type="submit" id="generateQrLinkBtn" class="btn btn-primary-pmii mb-4">
                            <i class="fas fa-link mr-2"></i> Generate Kode QR Link
                        </button>
                    </div>
                </form>
            </section>

            <div id="qrCodeOutputContainer" class="hidden flex flex-col items-center justify-center content-card max-w-2xl mx-auto py-8 px-6 lg:px-10 mt-8">
                <h2 class="text-2xl font-bold text-pmii-yellow mb-6 text-center" id="qrOutputTitle">QR Code Anda</h2>
                <canvas id="qrcodeCanvas" class="w-72 h-72 border-4 border-white rounded-lg shadow-lg bg-white" style="width: 288px; height: 288px;"></canvas>
                <p class="text-center text-sm text-gray-300 mt-2">Pindai kode QR di atas untuk melihat detail.</p>
                <button type="button" id="downloadQrBtn" class="btn btn-primary-pmii mt-4">
                    <i class="fas fa-download mr-2"></i> Unduh QR Code
                </button>
            </div>

            <section id="letter-status-section" class="content-card max-w-2xl mx-auto py-8 px-6 lg:px-10 hidden">
                <h2 class="text-2xl font-bold text-pmii-yellow mb-6 text-center">Status Verifikasi TTD Digital</h2>
                <div id="komisariatLogoDisplay" class="hidden">
                    <img src="img/logo-komisariat-uin.png" alt="Logo Komisariat" class="komisariat-logo-display" onerror="this.onerror=null;this.src='https://placehold.co/120x120/005c97/FFFFFF?text=Logo';">
                </div>
                <div class="space-y-4 text-white">
                    <p><strong>Nomor Surat:</strong> <span id="displayNomorSurat"></span></p>
                    <p><strong>Ditandatangani Oleh:</strong> <span id="displayDitandatanganiOleh"></span></p>
                    <p><strong>Jabatan:</strong> <span id="displayJabatan"></span></p>
                    <p><strong>Tanggal Surat:</strong> <span id="displayTanggalSurat"></span></p>
                    <p><strong>Perihal:</strong> <span id="displayPerihalSurat"></span></p>
                    <p class="text-success-500 font-semibold text-lg flex items-center justify-center pt-4">
                        <i class="fas fa-check-circle mr-2 text-green-400"></i> <span class="text-green-400">Tanda Tangan Digital SAH</span>
                    </p>
                </div>
                <div class="text-center mt-8">
                    <a href="generate-qr.php" class="btn btn-secondary-pmii">
                        <i class="fas fa-qrcode mr-2"></i> Buat QR Baru
                    </a>
                </div>
            </section>

            <section id="link-status-section" class="content-card max-w-2xl mx-auto py-8 px-6 lg:px-10 hidden">
                <h2 class="text-2xl font-bold text-pmii-yellow mb-6 text-center">Detail Link yang Diakses</h2>
                <div class="space-y-4 text-white">
                    <p><strong>URL:</strong> <a id="displayLinkUrl" class="text-pmii-yellow hover:underline" target="_blank" rel="noopener noreferrer"></a></p>
                    <p><strong>Judul:</strong> <span id="displayLinkTitle"></span></p>
                    <p><strong>Deskripsi:</strong> <span id="displayLinkDescription"></span></p>
                    <p><strong>Dibuat Oleh:</strong> <span id="displayLinkCreator"></span></p>
                    <p class="text-info-500 font-semibold text-lg flex items-center justify-center pt-4">
                        <i class="fas fa-info-circle mr-2 text-blue-400"></i> <span class="text-blue-400">Informasi Link</span>
                    </p>
                </div>
                <div class="text-center mt-8">
                    <a href="generate-qr.php" class="btn btn-secondary-pmii">
                        <i class="fas fa-qrcode mr-2"></i> Buat QR Baru
                    </a>
                </div>
            </section>
        </main>
    </div>

    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-auto mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer-dashboard"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>

    <button id="scrollToTopBtnDashboard" title="Kembali ke atas" class="hidden">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;

        // Memuat JavaScript utama untuk halaman ini
        import './js/generate-qr.js';
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
