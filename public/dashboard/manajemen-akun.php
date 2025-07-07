<?php
// public/dashboard/manajemen-akun.php

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
    <title>Manajemen Akun - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/manajemen-akun.css"> </head>
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

    <div id="accountModal" class="account-modal-overlay">
        <div class="account-modal-content">
            <div class="account-modal-header">
                <h3 class="account-modal-title" id="accountModalTitle">Tambah Akun Baru</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-xl" onclick="closeAccountModal()">&times;</button>
            </div>
            <div class="account-modal-body">
                <form id="accountForm" class="space-y-4">
                    <input type="hidden" id="accountId" name="id"> <div>
                        <label for="accountName" class="form-label">Nama:</label>
                        <input type="text" id="accountName" name="name" class="form-input" required>
                    </div>
                    <div>
                        <label for="accountNIMUsername" class="form-label">NIM/Username:</label>
                        <input type="text" id="accountNIMUsername" name="nimOrUsername" class="form-input">
                    </div>
                    <div>
                        <label for="accountEmail" class="form-label">Email:</label>
                        <input type="email" id="accountEmail" name="email" class="form-input" required>
                    </div>
                    <div>
                        <label for="accountRole" class="form-label">Peran:</label>
                        <select id="accountRole" name="role" class="form-input" required>
                            <option value="">Pilih Peran</option>
                            <option value="kader">Kader</option>
                            <option value="rayon">Rayon</option>
                            <option value="komisariat">Komisariat</option>
                        </select>
                    </div>
                    <div id="accountJabatanContainer" class="hidden">
                        <label for="accountJabatan" class="form-label">Jabatan (Jika Role Kader/Rayon):</label>
                        <select id="accountJabatan" name="jabatan" class="form-input">
                            <option value="">Pilih Jabatan</option>
                            </select>
                    </div>
                    <div id="accountRayonContainer" class="hidden">
                        <label for="accountRayon" class="form-label">Rayon (Jika Role Kader/Rayon):</label>
                        <select id="accountRayon" name="rayon" class="form-input">
                            <option value="">Pilih Rayon</option>
                            </select>
                    </div>
                     <div id="accountKlasifikasiContainer" class="hidden">
                        <label for="accountKlasifikasi" class="form-label">Klasifikasi (Jika Role Kader):</label>
                        <select id="accountKlasifikasi" name="klasifikasi" class="form-input">
                            <option value="">Pilih Klasifikasi</option>
                            </select>
                    </div>
                    <div id="accountPasswordContainer">
                        <label for="accountPassword" class="form-label">Password:</label>
                        <input type="password" id="accountPassword" name="password" class="form-input" required>
                    </div>
                    <div id="accountConfirmPasswordContainer">
                        <label for="accountConfirmPassword" class="form-label">Konfirmasi Password:</label>
                        <input type="password" id="accountConfirmPassword" name="confirmPassword" class="form-input" required>
                    </div>
                    <div class="account-modal-footer">
                        <button type="button" class="btn-secondary-pmii" onclick="closeAccountModal()">Batal</button>
                        <button type="submit" class="btn-primary-pmii" id="saveAccountBtn">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="resetPasswordModal" class="reset-password-modal-overlay">
        <div class="reset-password-modal-content">
            <div class="account-modal-header">
                <h3 class="account-modal-title">Reset Password</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-xl" onclick="closeResetPasswordModal()">&times;</button>
            </div>
            <div class="reset-password-modal-body text-left">
                <p class="mb-4">Mengatur ulang kata sandi untuk akun: <span id="resetPasswordUserName" class="font-semibold text-pmii-darkblue"></span></p>
                <form id="resetPasswordForm" class="space-y-4">
                    <input type="hidden" id="resetPasswordUserId">
                    <div>
                        <label for="newPassword" class="form-label">Kata Sandi Baru:</label>
                        <input type="password" id="newPassword" name="newPassword" class="form-input" required minlength="6">
                    </div>
                    <div class="reset-password-modal-footer">
                        <button type="button" class="btn-secondary-pmii" onclick="closeResetPasswordModal()">Batal</button>
                        <button type="submit" class="btn-primary-pmii">Reset</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="logAktivitasModal" class="log-aktivitas-modal-overlay">
        <div class="log-aktivitas-modal-content">
            <div class="account-modal-header">
                <h3 class="account-modal-title">Log Aktivitas Akun</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-xl" onclick="closeLogModal()">&times;</button>
            </div>
            <div class="log-aktivitas-modal-body text-left">
                <p class="mb-4">Detail log untuk akun: <span id="logUserName" class="font-semibold text-pmii-darkblue"></span></p>
                <div id="logAktivitasContent" class="text-sm">
                    </div>
            </div>
            <div class="log-aktivitas-modal-footer">
                <button type="button" class="btn-secondary-pmii" onclick="closeLogModal()">Tutup</button>
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

    <div class="main-content-wrapper section-pmii-bg-pattern">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <section id="manajemen-akun-content" class="py-6">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title">Manajemen Akun Pengguna</h1>
                    <p class="text-md page-subtitle mt-2">Kelola akun kader, rayon, dan komisariat.</p>
                </div>

                <div class="content-card">
                    <h2 class="text-xl font-semibold mb-6 text-center">Daftar Akun</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr>
                                    <th class="py-3 px-4">Nama</th>
                                    <th class="py-3 px-4">NIM/Username</th>
                                    <th class="py-3 px-4">Email</th>
                                    <th class="py-3 px-4">Peran</th>
                                    <th class="py-3 px-4">Jabatan</th>
                                    <th class="py-3 px-4">Rayon</th>
                                    <th class="py-3 px-4">Klasifikasi</th>
                                    <th class="py-3 px-4">Status</th>
                                    <th class="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="accountsTableBody">
                                </tbody>
                        </table>
                    </div>
                    <div class="text-center mt-6">
                        <button id="addAccountBtn" class="btn-primary-modern text-base py-2.5 px-5 rounded-md shadow-lg">
                            <i class="fas fa-user-plus mr-2"></i> Tambah Akun Baru
                        </button>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-auto mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer-manajemen-akun"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>

    <button id="scrollToTopBtnManajemenAkun" title="Kembali ke atas" class="hidden">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
    </script>
    <script type="module" src="../js/manajemen-akun.js"></script>
</body>
</html>