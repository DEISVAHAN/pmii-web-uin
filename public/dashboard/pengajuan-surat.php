<?php
// public/dashboard/pengajuan-surat.php

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
    <title>Pengajuan Surat - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/pengajuan-surat.css"> </head>
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
            <section id="pengajuan-surat-content" class="py-6">
                <div class="text-left mb-8">
                    <a href="admin-dashboard-komisariat.php" id="back-to-dashboard-link" class="btn-modern btn-outline-modern text-sm">
                       <i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard
                    </a>
                </div>
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-2xl md:text-3xl lg:text-4xl page-title">Pengajuan Surat Resmi</h1>
                    <p class="text-md text-text-muted mt-2" id="user-role-placeholder">Admin Rayon <strong id="rayon-name-surat-placeholder-content" class="text-pmii-yellow font-semibold">[Nama Rayon]</strong>, ajukan surat Anda di sini.</p>
                </div>

                <div class="grid lg:grid-cols-5 gap-8 lg:gap-12">
                    <div id="form-section-wrapper" class="lg:col-span-3">
                        <div class="content-card">
                            <div class="text-center mb-8">
                                <i class="fas fa-file-signature text-5xl text-pmii-yellow mb-3"></i>
                                <h2 class="text-xl font-semibold">Formulir Pengajuan</h2>
                            </div>
                            <form id="formPengajuanSuratInternal" class="space-y-5">
                                <div id="nomor_surat_pengajuan_container" class="hidden">
                                    <label for="nomor_surat_pengajuan" class="text-sm font-medium text-white mb-1 block">Nomor Surat</label>
                                    <input type="text" id="nomor_surat_pengajuan" name="nomor_surat" class="form-input" placeholder="Contoh: 123.PR-XXII.V-02.02.118.A-I.06.2025">
                                </div>
                                <div class="grid sm:grid-cols-2 gap-5">
                                    <div class="sm:col-span-2">
                                        <label for="jenis_surat_rayon" class="text-sm font-medium text-white mb-1 block">Jenis Surat</label>
                                        <select id="jenis_surat_rayon" name="jenis" class="form-input" required>
                                            <option value="" disabled selected>Pilih jenis...</option>
                                            <option value="Surat Permohonan" class="general-only">Surat Permohonan</option>
                                            <option value="Surat Keterangan" class="general-only">Surat Keterangan</option>
                                            <option value="Surat Undangan" class="general-only">Surat Undangan</option>
                                            <option value="Surat Mandat/Tugas" class="general-only">Surat Mandat/Tugas</option>
                                            <option value="Surat Peminjaman" class="general-only">Surat Peminjaman</option>

                                            <option value="Surat Rekomendasi Pelantikan" class="rayon-only">Surat Rekomendasi Pelantikan</option>
                                            <option value="Surat Rekomendasi RTAR" class="rayon-only">Surat Rekomendasi RTAR</option>

                                            <option value="Surat Rekomendasi PKD" class="kader-only">Surat Rekomendasi PKD</option>
                                            <option value="Surat Keterangan PKD" class="kader-only">Surat Keterangan PKD</option>
                                            <option value="Piagam Kader Mujahid" class="kader-only">Piagam Kader Mujahid</option>
                                            <option value="Piagam Kader Mutaqid" class="kader-only">Piagam Kader Mu'taqid</option>
                                            <option value="Lainnya" class="general-only">Lainnya</option>
                                        </select>
                                    </div>
                                    <div id="jenis_surat_lainnya_container" class="sm:col-span-2 hidden">
                                        <label for="jenis_surat_lainnya" class="text-sm font-medium text-white mb-1 block">Sebutkan Jenis Lainnya</label>
                                        <input type="text" id="jenis_surat_lainnya" name="jenis_lainnya" class="form-input">
                                    </div>
                                </div>

                                <div id="tujuan_pengajuan_container" class="space-y-5 hidden">
                                    <div>
                                        <label for="tujuan_pengajuan" class="text-sm font-medium text-white mb-1 block">Tujuan Pengajuan Surat</label>
                                        <select id="tujuan_pengajuan" name="tujuan_pengajuan" class="form-input" required>
                                            <option value="" disabled selected>Pilih tujuan...</option>
                                            <option value="Komisariat">Komisariat</option>
                                            </select>
                                    </div>
                                </div>
                                <div id="form_rekomendasi_pelantikan" class="space-y-5 hidden highlight-form p-4 border rounded-md">
                                    <h3 class="text-lg font-semibold text-pmii-yellow border-b border-white pb-2 mb-3">Lampiran untuk Surat Rekomendasi Pelantikan</h3>
                                    <div>
                                        <label for="file_database_pelantikan" class="text-sm font-medium text-white mb-1 block">Database (PDF/DOCX, Maks. 2MB)</label>
                                        <input type="file" id="file_database_pelantikan" name="file_database_pelantikan" class="form-input-file">
                                    </div>
                                    <div>
                                        <label for="file_permohonan_rekomendasi_pelantikan" class="text-sm font-medium text-white mb-1 block">Surat Permohonan Rekomendasi (PDF/DOCX, Maks. 2MB)</label>
                                        <input type="file" id="file_permohonan_rekomendasi_pelantikan" name="file_permohonan_rekomendasi_pelantikan" class="form-input-file">
                                    </div>
                                    <div>
                                        <label for="file_lpj_kepengurusan" class="text-sm font-medium text-white mb-1 block">LPJ Kepengurusan (PDF/DOCX, Maks. 2MB)</label>
                                        <input type="file" id="file_lpj_kepengurusan" name="file_lpj_kepengurusan" class="form-input-file">
                                    </div>
                                    <div>
                                        <label for="file_berita_acara_rtar" class="text-sm font-medium text-white mb-1 block">Berita Acara RTAR (PDF/DOCX, Maks. 2MB)</label>
                                        <input type="file" id="file_berita_acara_rtar" name="file_berita_acara_rtar" class="form-input-file">
                                    </div>
                                    <div>
                                        <label for="file_berita_acara_tim_formatur" class="text-sm font-medium text-white mb-1 block">Berita Acara TIM Formatur (PDF/DOCX, Maks. 2MB)</label>
                                        <input type="file" id="file_berita_acara_tim_formatur" name="file_berita_acara_tim_formatur" class="form-input-file">
                                    </div>
                                    <div>
                                        <label for="file_struktur_kepengurusan" class="text-sm font-medium text-white mb-1 block">Struktur Kepengurusan (PDF/DOCX, Maks. 2MB)</label>
                                        <input type="file" id="file_struktur_kepengurusan" name="file_struktur_kepengurusan" class="form-input-file">
                                    </div>
                                </div>

                                <div id="form_rekomendasi_rtar" class="space-y-5 hidden highlight-form p-4 border rounded-md">
                                    <h3 class="text-lg font-semibold text-pmii-yellow border-b border-white pb-2 mb-3">Lampiran untuk Surat Rekomendasi RTAR</h3>
                                    <div>
                                        <label for="file_database_rtar" class="text-sm font-medium text-white mb-1 block">Database (PDF/DOCX, Maks. 2MB)</label>
                                        <input type="file" id="file_database_rtar" name="file_database_rtar" class="form-input-file">
                                    </div>
                                    <div>
                                        <label for="file_permohonan_rekomendasi_rtar" class="text-sm font-medium text-white mb-1 block">Surat Permohonan Rekomendasi RTAR (PDF/DOCX, Maks. 2MB)</label>
                                        <input type="file" id="file_permohonan_rekomendasi_rtar" name="file_permohonan_rekomendasi_rtar" class="form-input-file">
                                    </div>
                                </div>

                                <div id="form_rekomendasi_pkd" class="space-y-5 hidden highlight-form p-4 border rounded-md">
                                    <h3 class="text-lg font-semibold text-pmii-yellow border-b border-white pb-2 mb-3">Lampiran untuk Surat Rekomendasi PKD</h3>
                                    <div>
                                        <label for="file_suket_mapaba" class="text-sm font-medium text-white mb-1 block">Sertifikat / Suket MAPABA (PDF/JPG, Maks. 2MB)</label>
                                        <input type="file" id="file_suket_mapaba" name="file_suket_mapaba" class="form-input-file" required>
                                    </div>
                                    <div>
                                        <label for="file_hasil_screening_pkd" class="text-sm font-medium text-white mb-1 block">Hasil Screening (paraf Tim Screener) (PDF/JPG, Maks. 2MB)</label>
                                        <input type="file" id="file_hasil_screening_pkd" name="file_hasil_screening_pkd" class="form-input-file" required>
                                    </div>
                                    <div>
                                        <label for="file_rekomendasi_pkd_rayon" class="text-sm font-medium text-white mb-1 block">Surat Rekomendasi PKD Rayon (PDF/DOCX, Maks. 2MB)</label>
                                        <input type="file" id="file_rekomendasi_pkd_rayon" name="file_rekomendasi_pkd_rayon" class="form-input-file" required>
                                    </div>
                                    <div class="text-center text-sm text-text-muted italic">
                                        <p>Belum punya lembar screening?</p>
                                        <div class="flex flex-col items-center mt-2">
                                            <a id="screening_sheet_download_html_link" href="#" download="Lembar_Screening_PKD.html" class="text-pmii-yellow font-semibold hover:underline mb-2">Download Lembar Screening (HTML) <i class="fas fa-download ml-1"></i></a>
                                            <a id="screening_sheet_download_word_link" href="#" download="Lembar_Screening_PKD.docx" class="text-pmii-yellow font-semibold hover:underline mb-2">Download Lembar Screening (DOCX) <i class="fas fa-file-word ml-1"></i></a>
                                            <a id="screening_sheet_download_pdf_link" href="#" download="Lembar_Screening_PKD.pdf" class="text-pmii-yellow font-semibold hover:underline">Download Lembar Screening (PDF) <i class="fas fa-file-pdf ml-1"></i></a>
                                            <p class="text-xs text-text-muted mt-2">Catatan: Untuk file DOCX dan PDF, ini adalah tautan placeholder. Anda perlu membuat dan mengunggah file yang sebenarnya ke server Anda dan memperbarui URL ini.</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="general_text_fields_group">
                                    <div>
                                        <label for="judul_surat_rayon" class="text-sm font-medium text-white mb-1 block">Judul/Perihal Surat</label>
                                        <input type="text" id="judul_surat_rayon" name="judul" class="form-input" required>
                                    </div>
                                    <div>
                                        <label for="isi_surat_rayon" class="text-sm font-medium text-white mb-1 block">Isi Ringkas/Keperluan Surat</label>
                                        <textarea id="isi_surat_rayon" name="isi" class="form-input" rows="4"></textarea>
                                    </div>
                                    <div>
                                        <label for="rayon_pengirim_surat" class="text-sm font-medium text-white mb-1 block">Rayon Pengirim</label>
                                        <input type="text" id="rayon_pengirim_surat" name="rayon" class="form-input" readonly disabled>
                                    </div>
                                </div>

                                <div id="file_upload_draft_group">
                                    <div>
                                        <label for="file_surat_rayon" class="text-sm font-medium text-white mb-1 block">Upload Draft Surat (PDF/DOCX, Maks. 2MB)</label>
                                        <input type="file" id="file_surat_rayon" name="file" class="form-input-file" required>
                                    </div>
                                </div>

                                <div class="pt-3">
                                    <button type="submit" class="btn-modern btn-primary-modern w-full text-base py-3">
                                       <i class="fas fa-paper-plane mr-2"></i> Kirim Pengajuan Surat
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div id="riwayat-section-wrapper" class="lg:col-span-2">
                        <div class="content-card">
                            <h2 class="text-xl font-semibold mb-6 text-center">Riwayat Pengajuan Terakhir</h2>
                            <div id="riwayat-pengajuan-list" class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                </div>
                            <p class="text-xs text-text-muted mt-4 text-center italic">Catatan: Riwayat pengajuan ini adalah simulasi dan akan diisi dengan data riil dari database.</p>
                        </div>
                    </div>
                </div>

                <div id="admin-documents-section" class="py-6 hidden">
                    <div class="content-card">
                        <h2 class="text-xl font-semibold mb-6 text-center" id="admin-document-section-title">Dokumen Disediakan Admin</h2>
                        <p class="text-sm text-text-muted text-center mb-4" id="admin-document-section-description">Berikut adalah dokumen-dokumen yang dapat Anda unduh.</p>
                        <div id="admin-document-list" class="space-y-4">
                            <p class="text-xs text-text-muted mt-4 text-center italic">Memuat dokumen...</p>
                        </div>
                    </div>
                </div>

                <div id="all-accounts-document-history-section" class="py-6 hidden">
                    <div class="content-card">
                        <h2 class="text-xl font-semibold mb-6 text-center">Riwayat Pengiriman Dokumen Seluruh Akun</h2>
                        <p class="text-sm text-text-muted text-center mb-4">Berikut adalah riwayat dokumen yang dikirim oleh Admin Rayon ke setiap kader.</p>
                        <div id="all-accounts-document-history-list" class="space-y-4">
                            <p class="text-xs text-text-muted mt-4 text-center italic">Memuat riwayat pengiriman dokumen...</p>
                        </div>
                    </div>
                </div>
                
                <div id="surat-keluar-section" class="py-6 hidden">
                    <div class="content-card">
                        <h2 class="text-xl font-semibold mb-6 text-center">Daftar Surat Keluar</h2>
                        <p class="text-sm text-text-muted text-center mb-4">Berikut adalah surat-surat yang telah dikirim oleh akun Anda atau seluruh akun admin.</p>
                        <div id="surat-keluar-list" class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            <p class="text-xs text-text-muted mt-4 text-center italic">Memuat daftar surat keluar...</p>
                        </div>
                    </div>
                </div>
                <div id="file-submission-section" class="py-6 hidden">
                    <div class="content-card">
                        <h2 class="text-xl font-semibold mb-6 text-center">Pengiriman Dokumen ke Rayon/Kader</h2>
                        <form id="formFileSubmission" class="space-y-5">
                            <div>
                                <label for="document_title" class="block text-sm font-medium text-white mb-1">Judul Dokumen</label>
                                <input type="text" id="document_title" name="document_title" class="form-input" required>
                            </div>
                            <div>
                                <label for="submission_target" class="block text-sm font-medium text-white mb-1">Tujuan Pengiriman</label>
                                <select id="submission_target" name="submission_target" class="form-input" required>
                                    <option value="" disabled selected>Pilih Tujuan...</option>
                                    </select>
                            </div>
                            <div>
                                <label for="document_file" class="block text-sm font-medium text-white mb-1">Upload Dokumen (PDF/DOCX, Maks. 5MB)</label>
                                <input type="file" id="document_file" name="document_file" class="form-input-file" accept=".pdf,.docx,.doc" required>
                            </div>
                            <div class="pt-3">
                                <button type="submit" class="btn-modern btn-primary-modern w-full text-base py-3">
                                   <i class="fas fa-upload mr-2"></i> Kirim Dokumen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </section>
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

<script type="module">
    // Injeksi data PHP ke JavaScript
    window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
</script>
<script type="module" src="../js/pengajuan-surat.js"></script>
</body>
</html>