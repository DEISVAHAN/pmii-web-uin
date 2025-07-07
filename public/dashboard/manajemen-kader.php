<?php
// public/dashboard/manajemen-kader.php

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
    <title>Manajemen Kader - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-datalabels/2.0.0/chartjs-plugin-datalabels.min.js"></script>
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/manajemen-kader.css"> </head>
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
            <section id="data-kader-content" class="py-6 animated-section">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title">Manajemen Data Kader</h1>
                    <p class="text-md text-text-muted mt-2">Selamat datang, <strong id="admin-name-placeholder-content" class="text-pmii-yellow font-semibold">[Nama Admin]</strong>! Kelola data kader di sini.</p>
                </div>
                
                <div class="form-section-modern max-w-3xl mx-auto mb-12 animated-section">
                    <h2 class="text-xl font-semibold mb-6 text-center">Formulir Input Data Kader Baru</h2>
                    <form id="formInputKader" class="space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                            <div class="input-group-modern">
                                <input type="text" id="nama_kader" name="nama" class="form-input-modern" required>
                                <label for="nama_kader" class="form-label-modern">Nama Lengkap</label>
                            </div>
                            <div class="input-group-modern">
                                <input type="text" id="nim_kader" name="nim" class="form-input-modern" required>
                                <label for="nim_kader" class="form-label-modern">NIM</label>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                             <div class="input-group-modern">
                                <input type="text" id="nik_kader" name="nik" class="form-input-modern">
                                <label for="nik_kader" class="form-label-modern">NIK</label>
                            </div>
                            <div class="input-group-modern">
                                <select id="jenis_kelamin_kader" name="jenis_kelamin" class="form-input-modern" required>
                                    <option value="" disabled selected></option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                                <label for="jenis_kelamin_kader" class="form-label-modern">Jenis Kelamin</label>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                            <div class="input-group-modern">
                                <input type="email" id="email_kader" name="email" class="form-input-modern">
                                <label for="email_kader" class="form-label-modern">Email</label>
                            </div>
                            <div class="input-group-modern">
                                <input type="tel" id="nomor_hp_whatsapp_kader" name="nomor_hp_whatsapp" class="form-input-modern">
                                <label for="nomor_hp_whatsapp_kader" class="form-label-modern">Nomor Handphone (Whatsapp)</label>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                            <div class="input-group-modern">
                                <select id="provinsi_kader" name="provinsi" class="form-input-modern">
                                    <option value="" disabled selected></option>
                                </select>
                                <label for="provinsi_kader" class="form-label-modern">Provinsi</label>
                            </div>
                            <div class="input-group-modern">
                                <input type="text" id="kota_kabupaten_kader" name="kota_kabupaten" class="form-input-modern" placeholder=" ">
                                <label for="kota_kabupaten_kader" class="form-label-modern">Kota/Kabupaten</label>
                                <p class="text-xs text-text-muted mt-1.5 absolute -bottom-4 left-0">Contoh: Kab. Bandung atau Kota Bandung</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                            <div class="input-group-modern">
                                <input type="text" id="kecamatan_kader" name="kecamatan" class="form-input-modern" placeholder=" ">
                                <label for="kecamatan_kader" class="form-label-modern">Kecamatan</label>
                            </div>
                            <div class="input-group-modern">
                                <input type="text" id="desa_kelurahan_kader" name="desa_kelurahan" class="form-input-modern" placeholder=" ">
                                <label for="desa_kelurahan_kader" class="form-label-modern">Desa/Kelurahan</label>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-x-5 gap-y-5">
                            <div class="input-group-modern md:col-span-2"> <input type="text" id="kampung_komplek_perumahan_kader" name="kampung_komplek_perumahan" class="form-input-modern">
                                <label for="kampung_komplek_perumahan_kader" class="form-label-modern">Kampung/Komplek/Perumahan</label>
                            </div>
                            <div class="input-group-modern"> <input type="text" id="rt_kader" name="rt" class="form-input-modern">
                                <label for="rt_kader" class="form-label-modern">RT</label>
                            </div>
                            <div class="input-group-modern"> <input type="text" id="rw_kader" name="rw" class="form-input-modern">
                                <label for="rw_kader" class="form-label-modern">RW</label>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5" id="fakultasJurusanInputWrapper">
                            <div class="input-group-modern">
                                <select id="fakultas_kader" name="fakultas" class="form-input-modern">
                                    <option value="" disabled selected></option>
                                    </select>
                                <label for="fakultas_kader" class="form-label-modern">Fakultas</label>
                            </div>
                            <div class="input-group-modern">
                                <select id="jurusan_kader" name="jurusan" class="form-input-modern">
                                    <option value="" disabled selected></option>
                                    </select>
                                <label for="jurusan_kader" class="form-label-modern">Jurusan</label>
                            </div>
                        </div>
                           <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                            <div class="input-group-modern">
                                <input type="text" id="ipk_kader" name="ipk" class="form-input-modern">
                                <label for="ipk_kader" class="form-label-modern">IPK</label>
                            </div>
                               <div class="input-group-modern">
                                <input type="text" id="minat_bakat_kader" name="minat_bakat" class="form-input-modern">
                                <label for="minat_bakat_kader" class="form-label-modern">Minat & Bakat</label>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                            <div class="input-group-modern">
                                <input type="text" id="angkatan_kader" name="angkatan" class="form-input-modern">
                                <label for="angkatan_kader" class="form-label-modern">Angkatan PMII</label>
                            </div>
                            <div class="input-group-modern">
                                <select id="rayon_kader" name="rayon" class="form-input-modern">
                                    <option value="" disabled selected></option>
                                    </select>
                                <label for="rayon_kader" class="form-label-modern">Asal Rayon</label>
                            </div>
                        </div>
                           <div class="input-group-modern">
                            <input type="text" id="komisariat_kader" name="komisariat" class="form-input-modern" value="PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung" readonly>
                            <label for="komisariat_kader" class="form-label-modern">Komisariat</label>
                        </div>
                        <div class="input-group-modern">
                            <select id="klasifikasi_kader" name="klasifikasi" class="form-input-modern" required>
                                <option value="" disabled selected class="text-gray-500"></option> 
                                <option value="Kader Mu'taqid">Kader Mu’taqid</option>
                                <option value="Kader Mujahid">Kader Mujahid</option>
                                <option value="Kader Mujtahid">Kader Mujtahid</option>
                                <option value="Kader Muharik">Kader Muharik</option>
                            </select>
                            <label for="klasifikasi_kader" class="form-label-modern">Klasifikasi Kader</label>
                        </div>
                        <div class="pt-3 text-right">
                            <button type="submit" class="btn-modern btn-primary-modern">
                                <i class="fas fa-save mr-2"></i>Simpan Data Kader
                            </button>
                        </div>
                    </form>
                </div>

                <div class="form-section-modern max-w-3xl mx-auto mb-12 animated-section">
                    <h2 class="text-xl font-semibold mb-6 text-center">Unggah Data Kader Massal</h2>
                    <p class="text-center text-sm text-text-muted mb-6">
                        Gunakan templat Excel untuk mengunggah data beberapa kader sekaligus. Pastikan format kolom sesuai dengan panduan.
                        <a href="#" id="downloadTemplateLink" class="text-pmii-yellow hover:underline font-semibold">Unduh Templat di sini</a>.
                    </p>
                    <form id="formUploadExcel" class="space-y-5">
                        <div class="input-group-modern">
                            <input type="file" id="file_excel_kader" name="fileExcel" class="form-input-modern" required accept=".xlsx, .xls, .csv" style="padding-top: 0.875rem;">
                            <label for="file_excel_kader" class="form-label-modern" style="top: -0.5rem; left: 0.75rem; font-size: 0.75rem; color: var(--pmii-yellow); background-color: var(--pmii-darkblue); padding: 0 0.25rem;">Pilih File Excel</label>
                        </div>
                        <div class="pt-3 text-right">
                            <button type="submit" class="btn-modern btn-primary-modern">
                                <i class="fas fa-upload mr-2"></i>Unggah File
                            </button>
                        </div>
                    </form>
                </div>
                
                <div class="form-section-modern mb-12 animated-section">
                    <h2 class="text-xl font-semibold mb-6 text-center">Daftar Kader (<span id="rayon-name-placeholder-table-content" class="text-pmii-yellow font-semibold">[Nama Rayon]</span>)</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="md:col-span-2 input-group-modern">
                             <input type="text" id="searchKaderRayon" placeholder=" " class="form-input-modern">
                             <label for="searchKaderRayon" class="form-label-modern">Cari Nama atau NIM...</label>
                        </div>
                        <div class="input-group-modern">
                            <select id="filterAngkatanRayon" class="form-input-modern appearance-none bg-no-repeat bg-right pr-8" style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E');">
                                <option value="" disabled selected></option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                                <option value="2022">2022</option>
                                <option value="2021">2021</option>
                            </select>
                            <label for="filterAngkatanRayon" class="form-label-modern">Filter Angkatan</label>
                        </div>
                    </div>
                    <div class="table-modern-wrapper">
                        <table class="table-modern">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>NIM</th>
                                    <th>Jenis Kelamin</th>
                                    <th>Email</th> <th>Nomor HP</th> <th>Rayon</th>
                                    <th>Klasifikasi</th>
                                    <th class="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="tabelDataKader">
                                <tr>
                                    <td colspan="8" class="py-8 text-center text-text-muted">Memuat data kader...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="statistik-kader-section" class="stats-section animated-section hidden">
                    <h2 class="text-xl font-semibold mb-6 text-center stats-title">Statistik Klasifikasi Kader</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-end">
                        <div class="input-group-modern">
                            <input type="month" id="filterWaktuStatistik" class="form-input-modern">
                            <label for="filterWaktuStatistik" class="form-label-modern has-value" style="top: -0.5rem; left: 0.75rem; font-size: 0.75rem; color: var(--pmii-yellow); background-color: var(--pmii-darkblue); padding: 0 0.25rem;">Filter Waktu (Bulan/Tahun)</label>
                        </div>
                        <p id="infoStatistik" class="text-sm text-text-muted md:text-right">Menampilkan statistik untuk <span id="scopeStatistik" class="font-semibold text-pmii-yellow"></span>.</p>
                    </div>

                    <div id="numerical-stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div class="numerical-stat-card">
                            <p class="stat-number stat-total" id="totalKaderCount">0</p>
                            <p class="stat-label">Total Kader</p>
                        </div>
                        <div class="numerical-stat-card">
                            <p class="stat-number stat-mutaqid" id="kaderMutaqidCount">0</p>
                            <p class="stat-label">Mu’taqid</p>
                        </div>
                        <div class="numerical-stat-card">
                            <p class="stat-number stat-mujahid" id="kaderMujahidCount">0</p>
                            <p class="stat-label">Mujahid</p>
                        </div>
                        <div class="numerical-stat-card">
                            <p class="stat-number stat-mujtahid" id="kaderMujtahidCount">0</p>
                            <p class="stat-label">Mujtahid</p>
                        </div>
                        <div class="numerical-stat-card">
                             <p class="stat-number stat-muharik" id="kaderMuharikCount">0</p>
                             <p class="stat-label">Muharik</p>
                        </div>
                    </div>

                    <div class="chart-container">
                        <canvas id="klasifikasiKaderChart"></canvas>
                    </div>
                </div>

                <div id="additional-stats-section" class="stats-section mt-8 animated-section hidden">
                    <h2 class="text-xl font-semibold mb-8 text-center stats-title">Statistik Demografi & Akademik</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                
                        <div class="flex flex-col items-center p-4 rounded-lg bg-white bg-opacity-10 shadow-md border border-white border-opacity-20 h-full">
                            <h3 class="font-semibold text-lg text-pmii-yellow mb-3">Persentase Jenis Kelamin</h3>
                            <div class="chart-container" style="height: 250px; width: 250px; position: relative;">
                                <canvas id="genderChart"></canvas>
                            </div>
                        </div>
                
                        <div class="flex flex-col items-center justify-center p-4 rounded-lg bg-white bg-opacity-10 shadow-md border border-white border-opacity-20 h-full">
                             <h3 class="font-semibold text-lg text-pmii-yellow mb-3">Rata-Rata IPK Kader</h3>
                             <div class="numerical-stat-card w-full mt-4">
                                 <p class="stat-number" style="color: #60a5fa;" id="averageIpkStat">0.00</p>
                                 <p class="stat-label">IPK Rata-Rata</p>
                             </div>
                        </div>
                
                        <div class="flex flex-col items-center p-4 rounded-lg bg-white bg-opacity-10 shadow-md border border-white border-opacity-20 h-full">
                            <h3 class="font-semibold text-lg text-pmii-yellow mb-3">Distribusi Alamat Teratas</h3>
                            <ul id="addressList" class="w-full bg-black bg-opacity-20 p-3 rounded-lg mt-4 space-y-2 text-white">
                                <li class="text-center text-text-muted">Memuat data...</li>
                            </ul>
                        </div>
                    </div>
                        <p class="text-xs text-center text-text-muted mt-6">Data statistik ini adalah simulasi dan akan diisi dengan data riil dari database.</p>
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
    <script type="module" src="../js/manajemen-kader.js"></script>
</body>
</html>