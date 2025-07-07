<?php
// public/dashboard/manajemen-naskah-sejarah.php

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
    <title>Manajemen Naskah Sejarah - Sistem Internal PMII</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/manajemen-naskah-sejarah.css"> </head>
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

    <header class="internal-header py-3 sticky top-0 z-40">
        <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
            <a href="../index.php" class="flex items-center space-x-2.5">
                <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9 w-9 rounded-full">
                <span class="text-sm md:text-base font-semibold logo-text">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung - Sistem Internal</span>
            </a>
            <div class="flex items-center space-x-3 md:space-x-4">
                <span id="user-info" class="text-xs sm:text-sm font-medium hidden"></span>
                <a href="#" id="auth-info-header" class="btn btn-primary text-xs sm:text-sm">Login</a>
            </div>
        </div>
    </header>

    <main class="container mx-auto px-4 py-8 lg:py-12">
        <div id="history-list-view">
            <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 class="text-3xl lg:text-4xl page-title">Manajemen Naskah Sejarah</h1>
                    <p class="text-md text-text-muted mt-2">Kelola arsip dan naskah terkait sejarah pergerakan.</p>
                </div>
                <button id="add-data-btn" class="btn btn-primary-modern admin-controls">
                    <i class="fas fa-plus mr-2"></i> Tambah Naskah
                </button>
            </div>

            <div class="mb-8 bg-white p-4 rounded-lg shadow-md">
                <div class="relative">
                    <input type="search" id="search-input" placeholder="Cari berdasarkan judul atau periode..." class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <div class="absolute top-1/2 left-3 -translate-y-1/2"><i class="fas fa-search text-gray-400"></i></div>
                </div>
            </div>

            <div id="history-list" class="space-y-4">
                </div>
            <p id="no-data-message" class="text-center py-16 text-text-muted hidden">Belum ada data naskah sejarah.</p>
        </div>
    </main>

    <div id="data-modal" class="modal-overlay hidden">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title" class="modal-title">Tambah Naskah Sejarah</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-xl" onclick="closeModal('data-modal')">&times;</button>
            </div>
            <form id="data-form" class="p-5 space-y-4">
                <input type="hidden" id="document-id">
                <div>
                    <label for="judul" class="block text-sm font-medium text-gray-700 mb-1">Judul Naskah</label>
                    <input type="text" id="judul" name="judul" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                </div>
                <div>
                    <label for="penulis" class="block text-sm font-medium text-gray-700 mb-1">Penulis</label>
                    <input type="text" id="penulis" name="penulis" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                </div>
                <div>
                    <label for="periode" class="block text-sm font-medium text-gray-700 mb-1">Periode/Tahun (Contoh: 1960-1965 atau 1980)</label>
                    <input type="text" id="periode" name="periode" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                </div>
                <div>
                    <label for="deskripsi" class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                    <textarea id="deskripsi" name="deskripsi" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Unggah File Naskah</label>
                    <div id="file-upload-area" class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div class="space-y-1 text-center">
                            <i class="fas fa-scroll fa-3x mx-auto text-gray-400"></i>
                            <div class="flex text-sm text-gray-600 justify-center">
                                <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"><span>Unggah file</span><input id="file-upload" name="file-upload" type="file" class="sr-only" accept=".pdf,.doc,.docx,.jpg,.png"></label>
                            </div>
                            <p id="file-name-preview" class="text-xs text-gray-500">PDF, DOCX, JPG, PNG hingga 10MB</p>
                            <img id="file-preview-image" src="" alt="Pratinjau File" class="hidden mt-2 max-w-full h-auto max-h-40 mx-auto border rounded">
                        </div>
                    </div>
                </div>
                <div class="flex justify-end pt-4">
                    <button type="button" id="cancel-btn" class="btn btn-outline-modern mr-3">Batal</button>
                    <button type="submit" id="submit-btn" class="btn btn-primary-modern">Simpan</button>
                </div>
            </form>
        </div>
    </div>

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
    
    <footer class="main-footer py-8 mt-16">
        <div class="container mx-auto px-4 text-center text-gray-300">
            <p class="text-sm">&copy; <span id="footer-year"></span> PK PMII UIN Sunan Gunung Djati. All Rights Reserved.</p>
        </div>
    </footer>

    <button id="scrollToTopBtn" title="Kembali ke atas" class="hidden">
        <i class="fas fa-arrow-up text-xl"></i>
    </button>

<script type="module">
    // Injeksi data PHP ke JavaScript
    window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
</script>
<script type="module" src="../js/manajemen-naskah-sejarah.js"></script>
</body>
</html>