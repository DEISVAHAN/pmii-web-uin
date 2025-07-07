<?php
// public/dashboard/pengaturan-akun-kader.php

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
    <title>Pengaturan Akun Kader - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/pengaturan-akun-kader.css"> </head>
<body>

    <header class="internal-header py-3 sticky top-0 z-50">
        <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
            <a href="../index.php" class="flex items-center space-x-2.5">
                <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9 w-9 rounded-full">
                <span class="text-sm md:text-base font-semibold logo-text">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung - Sistem Internal</span>
            </a>
            <div class="flex items-center space-x-3 md:space-x-4">
                <span id="kader-name-header" class="text-xs sm:text-sm font-medium hidden"></span>
                <a href="#" id="auth-info-header" class="text-xs sm:text-sm">Logout</a>
            </div>
        </div>
    </header>

    <div class="main-content-wrapper">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <div class="mb-6">
                <a href="../index.php" class="btn-modern btn-outline-modern">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Kembali ke Beranda
                </a>
            </div>

            <section id="pengaturan-akun-kader-content">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title">Pengaturan Akun</h1>
                    <p class="text-md text-text-muted mt-2">Kelola pengaturan login dan teknis akun Anda.</p>
                </div>

                <div class="content-section mb-8">
                    <h3 class="text-lg font-semibold mb-6">Data Login & Akun</h3>
                    <div id="account-settings-form-response" class="hidden form-message mb-5"></div>
                    <form id="accountSettingsForm" class="space-y-6">
                        <div class="input-group-modern">
                            <input type="email" id="kaderAccountEmail" name="email_akun" class="form-input-modern" required placeholder=" ">
                            <label for="kaderAccountEmail" class="form-label-modern">Email Akun (Login & Notifikasi)</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="text" id="kaderAccountNIM" name="nim_akun" class="form-input-modern" readonly placeholder=" ">
                            <label for="kaderAccountNIM" class="form-label-modern">NIM (Username)</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="text" id="kaderAccountRole" name="role_akun" class="form-input-modern" readonly placeholder=" ">
                            <label for="kaderAccountRole" class="form-label-modern">Peran Akun</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="text" id="kaderAccountRegDate" name="reg_date_akun" class="form-input-modern" readonly placeholder=" ">
                            <label for="kaderAccountRegDate" class="form-label-modern">Tanggal Pendaftaran</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="text" id="kaderAccountLastUpdate" name="last_update_akun" class="form-input-modern" readonly placeholder=" ">
                            <label for="kaderAccountLastUpdate" class="form-label-modern">Terakhir Diperbarui</label>
                        </div>
                        <button type="submit" class="btn-modern btn-primary-modern">
                            <i class="fas fa-save mr-2"></i>Simpan Perubahan Akun
                        </button>
                    </form>
                </div>

                <div class="content-section mb-8">
                    <h3 class="text-lg font-semibold mb-6">Ubah Password</h3>
                    <div id="change-password-form-response" class="hidden form-message mb-5"></div>
                    <form id="changePasswordForm" class="space-y-6">
                        <div>
                            <div class="input-group-modern">
                                <input type="password" id="currentPassword" name="currentPassword" class="form-input-modern" required placeholder=" ">
                                <label for="currentPassword" class="form-label-modern">Password Saat Ini</label>
                            </div>
                        </div>
                        <div>
                            <div class="input-group-modern">
                                <input type="password" id="newPassword" name="newPassword" class="form-input-modern" required placeholder=" ">
                                <label for="newPassword" class="form-label-modern">Password Baru</label>
                            </div>
                            <p class="text-xs text-text-muted mt-1">Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.</p>
                        </div>
                        <div>
                            <div class="input-group-modern">
                                <input type="password" id="confirmNewPassword" name="confirmNewPassword" class="form-input-modern" required placeholder=" ">
                                <label for="confirmNewPassword" class="form-label-modern">Konfirmasi Password Baru</label>
                            </div>
                        </div>
                        <button type="submit" class="btn-modern btn-primary-modern">
                            <i class="fas fa-key mr-2"></i>Ubah Password
                        </button>
                    </form>
                </div>
                
                <div class="content-section mb-8">
                    <h3 class="text-lg font-semibold mb-6">Pengaturan Privasi</h3>
                    <div id="privacy-settings-form-response" class="hidden form-message mb-5"></div>
                    <form id="privacySettingsForm" class="space-y-6">
                        <div>
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="profileVisibility" name="profileVisibility" class="sr-only peer">
                                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pmii-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pmii-blue"></div>
                                <span class="ml-3 text-sm font-medium text-text-primary">Profil dapat dilihat publik</span>
                            </label>
                            <p class="text-xs text-text-muted mt-1">Jika dinonaktifkan, profil Anda hanya dapat dilihat oleh admin dan sesama kader yang login.</p>
                        </div>
                        <div>
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="notificationEmails" name="notificationEmails" class="sr-only peer">
                                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pmii-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pmii-blue"></div>
                                <span class="ml-3 text-sm font-medium text-text-primary">Terima email notifikasi</span>
                            </label>
                            <p class="text-xs text-text-muted mt-1">Mengontrol apakah Anda menerima email untuk pengumuman atau pembaruan penting.</p>
                        </div>
                        <button type="submit" class="btn-modern btn-primary-modern">
                            <i class="fas fa-save mr-2"></i>Simpan Pengaturan Privasi
                        </button>
                    </form>
                </div>

                <div class="content-section">
                    <h3 class="text-lg font-semibold mb-6">Hapus Akun</h3>
                    <p class="text-sm text-text-secondary mb-4">
                        Menghapus akun Anda akan secara permanen menghapus semua data terkait. Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <button type="button" id="deleteAccountBtn" class="btn-modern btn-danger-modern">
                        <i class="fas fa-trash-alt mr-2"></i>Hapus Akun Saya
                    </button>
                </div>
            </section>
        </main>
    </div>

    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-12 mx-auto mb-2.5 rounded-full">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer-kader-settings"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>
    
    <button id="scrollToTopBtnKaderSettings" title="Kembali ke atas" class="hidden fixed bottom-6 right-6 z-50 items-center justify-center hover:bg-yellow-300 focus:outline-none">
        <i class="fas fa-arrow-up text-lg"></i>
    </button>

    <div id="confirm-modal" class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[99999] hidden transition-opacity duration-300">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-sm transform scale-95 transition-transform duration-300 overflow-hidden">
            <div class="flex justify-between items-center bg-red-600 text-white px-6 py-4 rounded-t-lg">
                <h3 class="text-xl font-bold">Konfirmasi Hapus Akun</h3>
                <button id="close-confirm-modal-btn" class="text-white hover:text-red-200 transition-colors"><i class="fas fa-times text-xl"></i></button>
            </div>
            <div class="p-6">
                <p id="confirm-modal-message" class="text-gray-700 text-center mb-6">Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan.</p>
                <div class="flex justify-center space-x-4">
                    <button type="button" id="confirm-modal-cancel-btn" class="btn-modern bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-none">Tidak</button>
                    <button type="button" id="confirm-modal-confirm-btn" class="btn-modern bg-red-500 text-white hover:bg-red-600">Ya, Hapus Akun</button>
                </div>
            </div>
        </div>
    </div>


<script type="module">
    // Injeksi data PHP ke JavaScript
    window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
</script>
<script type="module" src="../js/pengaturan-akun-kader.js"></script>
</body>
</html>