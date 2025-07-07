<?php
// public/dashboard/verifikasi-surat.php

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
    <title>Dasbor Verifikasi Surat - PK PMII UIN Sunan Gunung Djati</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/verifikasi-surat.css"> </head>
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
                <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
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
                        <a href="pengajuan-surat.php" id="pengajuan-surat-link-desktop" class="dropdown-item" target="_self"><i class="fas fa-file-alt"></i> Pengajuan Surat</a>
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

    <div id="mobile-menu-content" class="lg:hidden fixed top-0 right-0 h-full w-4/5 max-w-xs bg-gradient-to-b from-pmii-blue to-pmii-darkblue text-white p-6 shadow-2xl z-40">
        <div class="flex justify-between items-center mb-10">
            <a href="../index.php" class="flex items-center space-x-2">
                <img src="../img/logo-pmii.png" alt="Logo PMII Mobile" class="h-9" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
                <span id="mobile-header-title-text" class="text-[0.6rem] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                    PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung
                </span>
            </a>
            <button id="close-mobile-menu-button" class="focus:outline-none p-2 -mr-2"><i class="fas fa-times text-2xl"></i></button>
        </div>
        <nav id="mobile-nav-links" class="flex flex-col space-y-3">
            </nav>
        <a href="#" id="mobile-logout-link" class="mobile-nav-link mt-4 justify-center logged-out-styles" data-action="login">
            <i class="fas fa-sign-in-alt"></i><span>Login</span>
        </a>
    </div>
    <div id="mobile-menu-overlay" class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"></div>
    
    <div class="main-content-wrapper flex-grow">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            
            <div class="mb-6 text-left">
                <a href="admin-dashboard-komisariat.php" id="back-to-dashboard-link" class="btn-modern btn-outline-modern text-sm">
                   <i class="fas fa-arrow-left mr-2"></i>
                   Kembali ke Dashboard
                </a>
            </div>

            <div class="text-center mb-10">
                <h1 class="text-3xl lg:text-4xl page-title text-pmii-blue-dark">Dasbor Verifikasi Surat</h1>
                <p class="text-md text-text-muted mt-2" id="user-role-placeholder">Verifikasi dan kelola semua pengajuan surat masuk.</p>
            </div>

            <div class="table-container">
                <div class="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 table-header-custom">
                    <h2 class="text-xl font-bold text-pmii-darkblue-for-title">Daftar Surat Masuk</h2>
                    <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div class="relative w-full sm:w-64">
                            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="text" id="searchInput" placeholder="Cari surat..." class="form-input-modern w-full pl-10 py-2 !rounded-full !bg-white text-gray-900">
                        </div>
                        <div class="relative w-full sm:w-40">
                            <select id="statusFilter" class="form-input-modern w-full py-2 !rounded-full !bg-white text-gray-900">
                                <option value="all">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved" selected>ACC</option> <option value="rejected">Ditolak</option>
                                <option value="revision">Revisi</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>Nomor Surat</th>
                                <th>Jenis Surat</th>
                                <th>Pengirim</th>
                                <th>Tujuan</th>
                                <th>Tanggal</th>
                                <th>Status</th>
                                <th class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="tabelSuratBody">
                            <tr><td colspan="7" class="text-center p-8 text-gray-500">Memuat data surat...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-auto mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer-surat"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>
    
    <button id="scrollToTopBtn" title="Kembali ke atas" class="hidden">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>

    <div id="verificationModal" class="modal-overlay custom-confirm-modal-overlay">
        <div class="modal-content custom-confirm-modal-content max-w-sm">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-pmii-darkblue">Formulir Verifikasi Surat</h2>
                <button id="closeModalBtn" type="button" class="text-gray-500 hover:text-gray-800 text-2xl font-bold" onclick="closeModal('verificationModal')">&times;</button>
            </div>
            <p class="text-sm text-gray-600 mb-6">Ubah status verifikasi untuk surat dengan nomor: <strong id="modalSuratId"></strong></p>
            <form id="formVerifikasiSurat" class="space-y-5">
                <input type="hidden" id="id_surat_verifikasi" name="id">
                <div>
                    <label for="status_surat_verifikasi" class="block text-sm font-medium text-gray-700 mb-1">Status Verifikasi</label>
                    <select id="status_surat_verifikasi" name="status" class="form-input-modern w-full text-gray-900" required>
                        <option value="pending">Pending</option>
                        <option value="approved">ACC (Disetujui)</option>
                        <option value="rejected">Ditolak</option>
                        <option value="revision">Revisi (Perlu Perbaikan)</option>
                    </select>
                </div>
                <div>
                    <label for="komentar_admin_verifikasi" class="block text-sm font-medium text-gray-700 mb-1">Komentar Admin (Opsional)</label>
                    <textarea id="komentar_admin_verifikasi" name="komentar" class="form-input-modern w-full text-gray-900" rows="3"></textarea>
                </div>
                <div class="pt-3 flex justify-end gap-3">
                    <button type="button" class="btn-modern btn-secondary-modern" onclick="closeModal('verificationModal')">Batal</button>
                    <button type="submit" class="btn-modern btn-primary-modern">
                       <i class="fas fa-save mr-2"></i> Simpan
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <div id="notificationModal" class="modal-overlay custom-confirm-modal-overlay">
        <div class="modal-content custom-confirm-modal-content text-center max-w-sm">
            <div id="notificationIcon" class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                 <i class="fas fa-check text-green-600 text-xl"></i>
            </div>
            <h3 id="notificationTitle" class="text-lg leading-6 font-medium text-gray-900">Berhasil!</h3>
            <div class="mt-2 px-4">
                <p id="notificationMessage" class="text-sm text-gray-500">Status surat berhasil diperbarui.</p>
            </div>
            <div class="mt-5">
                <button type="button" id="closeNotificationBtn" class="btn-modern btn-primary-modern w-full">Tutup</button>
            </div>
        </div>
    </div>


<script type="module">
    // Injeksi data PHP ke JavaScript
    window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
</script>
<script type="module" src="../js/verifikasi-surat.js"></script>
</body>
</html>