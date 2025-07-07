<?php
// public/dashboard/repository-ilmiah.php

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
    <title>Repository Ilmiah - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/repository-ilmiah.css"> </head>
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

    <header class="internal-header py-3 sticky top-0 z-50">
        <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
            <a href="../index.php" class="flex items-center space-x-2.5">
                <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9 w-9 rounded-full">
                <span class="text-sm md:text-base font-semibold logo-text">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung - Sistem Internal</span>
            </a>
            <div class="flex items-center space-x-3 md:space-x-4">
                <span id="user-info" class="text-xs sm:text-sm font-medium hidden"></span>
                <a href="#" id="auth-info-header" class="text-xs sm:text-sm">Login</a>
            </div>
        </div>
    </header>

    <div class="main-content-wrapper">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <div class="mb-6">
                <a href="admin-dashboard-komisariat.php" id="back-to-dashboard-link" class="btn-modern btn-outline-modern">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Kembali ke Dashboard
                </a>
            </div>

            <section id="repository-ilmiah-content">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title">Repository Ilmiah</h1>
                    <p class="text-md text-text-muted mt-2" id="subtitle-text">Kelola semua makalah dan karya ilmiah dari kader PMII.</p>
                </div>
                
                <div id="upload-form-section" class="content-section mb-8 max-w-2xl mx-auto hidden">
                    <h3 class="text-lg font-semibold mb-6">Unggah Karya Ilmiah Baru</h3>
                    <div id="form-response" class="hidden form-message mb-5"></div>
                    <form id="formUploadKarya" class="space-y-6">
                        <input type="hidden" id="karyaId" name="id"> <div>
                            <div class="input-group-modern">
                                <input type="text" id="judul_karya" name="judul" class="form-input-modern" required placeholder=" ">
                                <label for="judul_karya" class="form-label-modern">Judul Karya Ilmiah</label>
                            </div>
                        </div>
                        <div>
                            <div class="input-group-modern">
                                <input type="text" id="penulis_karya" name="penulis" class="form-input-modern" required placeholder=" ">
                                <label for="penulis_karya" class="form-label-modern">Nama Penulis Kader</label>
                            </div>
                        </div>
                        <div>
                            <div class="input-group-modern">
                                <select id="tipe_karya" name="tipe" class="form-input-modern" required>
                                    <option value=""></option>
                                    <option value="Jurnal">Jurnal</option>
                                    <option value="Skripsi">Skripsi</option>
                                    <option value="Tesis">Tesis</option>
                                    <option value="Disertasi">Disertasi</option>
                                    <option value="Artikel">Artikel</option>
                                    <option value="Makalah">Makalah</option>
                                    <option value="Buku">Buku</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                                <label for="tipe_karya" class="form-label-modern">Tipe Karya</label>
                            </div>
                        </div>
                        <div>
                            <div class="input-group-modern">
                                <textarea id="abstrak_karya" name="abstrak" class="form-input-modern" rows="5" placeholder=" "></textarea>
                                <label for="abstrak_karya" class="form-label-modern">Abstrak/Ringkasan Karya</label>
                            </div>
                        </div>
                        <div>
                            <label for="file_karya" class="block text-sm font-medium text-gray-700 mb-1">Unggah File Karya (PDF, DOCX, Maks. 10MB)</label>
                            <input type="file" id="file_karya" name="file_karya" class="form-input-file" accept=".pdf,.docx,.doc" required>
                            <p id="fileNamePreview" class="text-xs text-text-muted mt-1">Tidak ada file dipilih.</p>
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="reset" class="btn-modern btn-outline-modern">Reset Form</button>
                            <button type="submit" class="btn-modern btn-primary-modern">
                                <i class="fas fa-upload mr-2"></i> Unggah Karya
                            </button>
                        </div>
                    </form>
                </div>

                <div class="content-section">
                    <h3 class="text-lg font-semibold mb-6">Daftar Karya Ilmiah</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="md:col-span-2 input-group-modern">
                             <input type="text" id="searchKaryaIlmiah" placeholder=" " class="form-input-modern">
                             <label for="searchKaryaIlmiah" class="form-label-modern">Cari Judul atau Penulis...</label>
                        </div>
                        <div class="input-group-modern">
                            <select id="filterStatusKarya" class="form-input-modern">
                                <option value="all">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Disetujui</option>
                                <option value="rejected">Ditolak</option>
                                <option value="revision">Revisi</option>
                            </select>
                            <label for="filterStatusKarya" class="form-label-modern">Filter Status</label>
                        </div>
                    </div>
                    <div class="table-modern-wrapper">
                        <table class="table-modern">
                            <thead>
                                <tr>
                                    <th>Judul</th>
                                    <th>Penulis</th>
                                    <th>Tipe</th>
                                    <th>Tanggal Unggah</th>
                                    <th>Status</th>
                                    <th>Rayon Pengaju</th>
                                    <th class="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="tabelKaryaIlmiahBody">
                                <tr><td colspan="7" class="text-center p-8 text-text-muted">Memuat data karya ilmiah...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p class="text-xs text-text-muted mt-4 text-center">Data ini hanya menampilkan karya ilmiah yang relevan dengan peran Anda.</p>
                </div>
            </section>
        </main>
    </div>

    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-auto mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/100x100/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer-repo"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>
    
    <button id="scrollToTopBtnRepo" title="Kembali ke atas" class="hidden">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
    </script>
    <script type="module" src="../js/repository-ilmiah.js"></script>
</body>
</html>