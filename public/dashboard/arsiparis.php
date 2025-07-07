<?php
// public/dashboard/arsiparis.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
// Muat autoloader Composer
require_once __DIR__ . '/../../vendor/autoload.php';

// Muat variabel lingkungan dari .env
\App\Core\DotenvLoader::load();

// Asumsi: Data pengguna yang login akan tersedia di $_SERVER['user_data']
// setelah AuthMiddleware memverifikasi token.
$loggedInUser = $_SERVER['user_data'] ?? null;

// Konversi data PHP ke JSON untuk dapat diakses oleh JavaScript
$loggedInUserJson = json_encode($loggedInUser);

?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arsiparis Kepengurusan - Sistem Internal PMII</title>
    <link rel="icon" href="../img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/arsiparis.css"> </head>
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
            <a href="../index.php" class="flex items-center space-x-2.5 transform hover:scale-105 transition-transform duration-300">
                <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9 w-auto shadow-md" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
                <span id="header-title-text" class="text-[0.65rem] lg:text-xs font-semibold logo-text tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung
                </span>
            </a>
            <div class="hidden lg:flex space-x-6 items-center">
                <a href="../index.php#beranda" class="nav-link text-sm">Beranda</a>
                <a href="../tentang-kami.php" class="nav-link text-sm">Tentang Kami</a>
                <a href="../berita-artikel.php" class="nav-link text-sm">Berita</a>
                <a href="../digilib.php" class="nav-link text-sm" target="_self">📚 Digilib</a>
                <a href="../agenda-kegiatan.php" class="nav-link text-sm">Kegiatan</a>
                <a href="../galeri-foto.php" class="nav-link text-sm">Galeri</a>
                
                <div id="desktop-kader-menu-container" class="relative dropdown hidden">
                    <button class="dropdown-toggle nav-link focus:outline-none text-sm">
                        Profil Kader <i class="fas fa-chevron-down text-xs ml-1"></i>
                    </button>
                    <div class="dropdown-menu mt-3.5">
                        <a href="edit-profil-kader.php" id="edit-profil-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-user-edit"></i> Edit Profil</a>
                        <a href="pengaturan-akun-kader.php" id="pengaturan-akun-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-cog"></i> Pengaturan Akun</a>
                        <a href="../akses-ojs.php" id="jurnal-alharokah-link-desktop-kader" class="dropdown-item" target="_self"><i class="fas fa-book-reader"></i> Jurnal Al Harokah</a>
                        <a href="pengajuan-surat.php" id="pengajuan-surat-link-desktop-kader" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i> Pengajuan Surat</a>
                    </div>
                </div>

                <div id="desktop-admin-menu-container" class="relative dropdown hidden">
                    <button class="dropdown-toggle nav-link focus:outline-none text-sm">
                        Sistem Internal <i class="fas fa-chevron-down text-xs ml-1"></i>
                    </button>
                    <div class="dropdown-menu mt-3.5">
                        <a href="manajemen-akun.php" id="manajemen-akun-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-user-shield"></i>Manajemen Akun</a>
                        <a href="manajemen-kader.php" id="manajemen-kader-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-users-cog"></i>Manajemen Kader</a>
                        <a href="repository-ilmiah.php" id="repository-ilmiah-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-book-open"></i>Jurnal & Karya Ilmiah</a>
                        <a href="pengajuan-surat.php" id="pengajuan-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i>Pengajuan Surat</a>
                        <a href="verifikasi-surat.php" id="verifikasi-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-check-circle"></i>Verifikasi Surat</a>
                        <a href="admin-dashboard-rayon.php" id="dashboard-rayon-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Rayon</a>
                        <a href="admin-dashboard-komisariat.php" id="admin-dashboard-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-tachometer-alt"></i>Dashboard Admin Kom.</a>
                        <a href="edit-beranda.php" id="edit-beranda-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-edit"></i>Edit Beranda</a>
                        <a href="../akses-ojs.php" id="jurnal-alharokah-link-desktop-admin" class="dropdown-item" target="_self"><i class="fas fa-book-reader"></i>Jurnal Al Harokah</a>
                        <hr class="border-gray-200 my-1">
                        <a href="verifikasi-konten-rayon.php" id="verifikasi-konten-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-check-double"></i>Verifikasi Konten Rayon</a>
                        <a href="rayon-tambah-berita.php" id="tambah-berita-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-newspaper"></i>Tambah Berita & Artikel</a>
                        <a href="rayon-tambah-kegiatan.php" id="tambah-kegiatan-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-calendar-plus"></i>Tambah Kegiatan</a>
                        <a href="rayon-tambah-galeri.php" id="tambah-galeri-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-images"></i>Tambah Galeri Kegiatan</a>
                        <a href="edit-profil-rayon.php" id="edit-profil-rayon-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-building"></i>Edit Profil Rayon</a>
                        <a href="pengaturan-situs.php" id="pengaturan-situs-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-cogs"></i>Pengaturan Situs</a>
                        <a href="dashboard-statistik.php" id="dashboard-statistik-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-chart-bar"></i>Dashboard Statistik</a>
                        <a href="kelola-notifikasi.php" id="kelola-notifikasi-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-bell"></i>Kelola Notifikasi</a>
                        <a href="laporan-analisis.php" id="laporan-analisis-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-invoice"></i>Laporan & Analisis</a>
                        <a href="../generate-qr.php" id="ttd-digital-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-qrcode"></i>TTD Digital</a>
                        <a href="arsiparis.php" id="arsiparis-kepengurusan-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-archive"></i>Arsiparis Kepengurusan</a>
                    </div>
                </div>
                <a href="../index.php#kontak" class="nav-link text-sm">Kontak</a>
                <a href="../login.php" id="auth-link-main" class="btn logged-out-styles text-sm" data-action="login">
                    Login
                </a>
            </div>
            <div class="lg:hidden">
                <button id="mobile-menu-button" class="menu-icon focus:outline-none p-2 -mr-2"><i class="fas fa-bars text-2xl"></i></button>
            </div>
        </div>
    </nav>

    <div id="mobile-menu-content" class="lg:hidden fixed top-0 right:0 h-full w-4/5 max-w-xs bg-gradient-to-b from-pmii-blue to-pmii-darkblue text-white p-6 shadow-2xl z-40">
        <div class="flex justify-between items-center mb-10">
            <a href="../index.php" class="flex items-center space-x-2">
                <img src="../img/logo-pmii.png" alt="Logo PMII Mobile" class="h-9 w-auto" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
                <span id="mobile-header-title-text" class="text-[0.6rem] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                    PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung
                </span>
            </a>
            <button id="close-mobile-menu-button" class="focus:outline-none p-2 -mr-2"><i class="fas fa-times text-2xl"></i></button>
        </div>
        <nav id="mobile-nav-links" class="flex flex-col space-y-3">
            <a href="#" id="mobile-logout-link" class="mobile-nav-link mt-4" data-action="login">
                <i class="fas fa-sign-in-alt"></i><span>Login</span>
            </a>
        </nav>
    </div>
    <div id="mobile-menu-overlay" class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"></div>
    <div class="main-content-wrapper">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <div class="mb-6">
                <a href="#" id="back-to-dashboard-link" class="btn-modern btn-outline-modern">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Kembali ke Dashboard
                </a>
            </div>

            <section id="arsip-kepengurusan-content">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title">Arsiparis Kepengurusan</h1>
                    <p class="text-md text-text-muted mt-2" id="arsip-subtitle">Lihat dan unggah arsip kepengurusan PMII Komisariat dan Rayon.</p>
                </div>

                <div class="content-section max-w-4xl mx-auto mb-8" id="upload-form-section">
                    <h3 class="text-lg font-semibold mb-6">Unggah Data Kepengurusan Baru</h3>
                    <div id="upload-form-response" class="hidden form-message mb-5"></div>
                    
                    <div class="flex justify-center items-center gap-4 mb-6 flex-wrap">
                        <label class="inline-flex items-center">
                            <input type="radio" name="uploadMode" value="new" class="form-radio text-pmii-blue h-5 w-5" checked>
                            <span class="ml-2 font-medium text-text-primary">Unggah Kepengurusan Baru</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" name="uploadMode" value="existing" class="form-radio text-pmii-blue h-5 w-5">
                            <span class="ml-2 font-medium text-text-primary">Tambah Berkas ke Kepengurusan yang Ada</span>
                        </label>
                    </div>

                    <form id="uploadKepengurusanForm" class="space-y-6">
                        <div id="existing-kepengurusan-selector" class="hidden">
                            <label for="existingKepengurusanSelect" class="form-label">Pilih Kepengurusan yang Sudah Ada</label>
                            <select id="existingKepengurusanSelect" class="form-input">
                                <option value="">Pilih Kepengurusan...</option>
                            </select>
                        </div>

                        <div id="new-kepengurusan-fields">
                            <div id="rayon-selector-container">
                                <label for="rayonSelectUpload" class="form-label">Pilih Rayon (untuk Admin Komisariat)</label>
                                <select id="rayonSelectUpload" class="form-input" required>
                                    <option value="">Pilih Rayon...</option>
                                    <option value="komisariat">Komisariat</option>
                                </select>
                            </div>

                            <div>
                                <label for="periode" class="form-label">Periode Kepengurusan (Contoh: 2024-2025)</label>
                                <input type="text" id="periode" class="form-input" required>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label for="ketua" class="form-label">Nama Ketua</label>
                                    <input type="text" id="ketua" class="form-input" required>
                                </div>
                                <div>
                                    <label for="sekretaris" class="form-label">Nama Sekretaris</label>
                                    <input type="text" id="sekretaris" class="form-input" required>
                                </div>
                                <div>
                                    <label for="bendahara" class="form-label">Nama Bendahara</label>
                                    <input type="text" id="bendahara" class="form-input" required>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="jumlahKader" class="form-label">Jumlah Kader</label>
                                    <input type="number" id="jumlahKader" class="form-input" min="0">
                                </div>
                                <div>
                                    <label for="tanggalBerdiri" class="form-label">Tanggal Berdiri/Berakhir Periode</label>
                                    <input type="date" id="tanggalBerdiri" class="form-input">
                                </div>
                            </div>
                        </div> <div>
                            <label for="fileSK" class="form-label">File SK (PDF/DOCX, Maks. 5MB)</label>
                            <input type="file" id="fileSK" class="file-upload-input" accept=".pdf,.docx,.doc">
                            <ul id="fileSK-preview" class="file-preview-list"></ul>
                        </div>
                        
                        <div>
                            <label for="otherFiles" class="form-label">Berkas Lainnya (Multiple, PDF/DOCX, Maks. 5MB per file)</label>
                            <input type="file" id="otherFiles" class="file-upload-input" accept=".pdf,.docx,.doc" multiple>
                            <ul id="otherFiles-preview" class="file-preview-list"></ul>
                        </div>
                        <button type="submit" class="btn btn-primary-pmii w-full">
                            <i class="fas fa-upload mr-2"></i> Unggah Arsip
                        </button>
                    </form>
                </div>

                <div class="content-section max-w-4xl mx-auto">
                    <h3 class="text-lg font-semibold mb-6">Daftar Arsip Kepengurusan</h3>
                    <div id="archive-list-container" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <p class="text-text-muted text-center col-span-full" id="no-archives-message">Belum ada data arsip kepengurusan.</p>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-auto mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
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
</script>
<script type="module" src="../js/arsiparis.js"></script>
</body>
</html>