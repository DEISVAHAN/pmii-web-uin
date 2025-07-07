// public/js/generate-qr.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from './auth.js';
import { generateQrCode, getQrCodeDetails, verifyPublicQrCode } from './api.js'; // Asumsi ada fungsi API untuk QR

document.addEventListener('DOMContentLoaded', async function () {
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');
    const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
    const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');

    // Kumpulkan elemen-elemen untuk updateAuthUI (dari auth.js)
    const authElements = {
        authLinkMain, authLinkMobile, desktopKaderMenuContainer,
        desktopAdminMenuContainer, headerTitleText, mobileHeaderTitleText
    };

    let userRole = 'public'; // 'public', 'kader', 'rayon', 'komisariat'

    // Elemen DOM
    const qrTypeTtdDigital = document.getElementById('qrTypeTtdDigital');
    const qrTypeAccessLink = document.getElementById('qrTypeAccessLink');
    const qrTtdFormSection = document.getElementById('qr-ttd-form-section');
    const qrLinkFormSection = document.getElementById('qr-link-form-section');
    const qrTypeSelection = document.getElementById('qr-type-selection');

    const qrTtdForm = document.getElementById('qrTtdForm');
    const nomorSuratInput = document.getElementById('nomorSurat');
    const ditandatanganiOlehInput = document.getElementById('ditandatanganiOleh');
    const jabatanInput = document.getElementById('jabatan');
    const tanggalSuratInput = document.getElementById('tanggalSurat');
    const perihalSuratInput = document.getElementById('perihalSurat');
    const logoUploadContainer = document.getElementById('logoUploadContainer');
    const logoUploadInput = document.getElementById('logoUploadInput');
    const logoPreview = document.getElementById('logoPreview');
    const generateQrTtdBtn = document.getElementById('generateQrTtdBtn');

    const qrLinkForm = document.getElementById('qrLinkForm');
    const linkUrlInput = document.getElementById('linkUrl');
    const linkTitleInput = document.getElementById('linkTitle');
    const linkDescriptionInput = document.getElementById('linkDescription');
    const linkCreatorInput = document.getElementById('linkCreator');
    const generateQrLinkBtn = document.getElementById('generateQrLinkBtn');

    const qrcodeCanvas = document.getElementById('qrcodeCanvas');
    const qrCodeOutputContainer = document.getElementById('qrCodeOutputContainer');
    const downloadQrBtn = document.getElementById('downloadQrBtn');
    const qrOutputTitle = document.getElementById('qrOutputTitle');

    // Elemen tampilan untuk status TTD
    const letterStatusSection = document.getElementById('letter-status-section');
    const displayNomorSurat = document.getElementById('displayNomorSurat');
    const displayDitandatanganiOleh = document.getElementById('displayDitandatanganiOleh');
    const displayJabatan = document.getElementById('displayJabatan');
    const displayTanggalSuratSpan = document.getElementById('displayTanggalSurat');
    const displayPerihalSurat = document.getElementById('displayPerihalSurat');
    const komisariatLogoDisplay = document.getElementById('komisariatLogoDisplay');

    // Elemen tampilan untuk status link
    const linkStatusSection = document.getElementById('link-status-section');
    const displayLinkUrl = document.getElementById('displayLinkUrl');
    const displayLinkTitle = document.getElementById('displayLinkTitle');
    const displayLinkDescription = document.getElementById('displayLinkDescription');
    const displayLinkCreator = document.getElementById('displayLinkCreator');

    const mainPageTitle = document.getElementById('mainPageTitle');
    const mainPageDescription = document.getElementById('mainPageDescription');


    let qr = null; // Deklarasikan variabel qr agar dapat diakses secara global
    let uploadedLogoDataURL = null; // Menyimpan data URL untuk logo yang diunggah admin rayon

    /**
     * Menampilkan pesan kustom kepada pengguna.
     * @param {string} message - Pesan yang akan ditampilkan.
     * @param {string} type - Tipe pesan ('info', 'success', 'error').
     * @param {Function} [callback] - Fungsi callback opsional yang akan dieksekusi setelah pesan memudar.
     */
    function showCustomMessage(message, type = 'info', callback = null) {
        const messageBox = document.getElementById('customMessageBox');
        messageBox.textContent = message;
        messageBox.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0'; // Reset kelas

        // Terapkan gaya spesifik tipe
        if (type === 'success') {
            messageBox.classList.add('bg-green-500');
        } else if (type === 'error') {
            messageBox.classList.add('bg-red-500');
        } else { // Default ke info (biru)
            messageBox.classList.add('bg-blue-500');
        }

        // Tampilkan pesan
        messageBox.classList.remove('translate-x-full', 'opacity-0');
        messageBox.classList.add('translate-x-0', 'opacity-100');

        setTimeout(() => {
            messageBox.classList.remove('translate-x-0', 'opacity-100');
            messageBox.classList.add('translate-x-full', 'opacity-0');
            if (callback) {
                // Jalankan callback setelah transisi memudar selesai
                messageBox.addEventListener('transitionend', function handler() {
                    callback();
                    messageBox.removeEventListener('transitionend', handler);
                });
            }
        }, 3000);
    }

    /* Logika Modal Konfirmasi Kustom */
    const customConfirmModal = document.getElementById('customConfirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    let currentConfirmCallback = null; // Untuk menyimpan fungsi callback

    /**
     * Menampilkan modal konfirmasi kustom.
     * @param {string} title - Judul modal konfirmasi.
     * @param {string} message - Pesan yang akan ditampilkan di modal.
     * @param {Function} onConfirm - Fungsi callback yang akan dieksekusi jika 'Ya' diklik.
     * @param {Function} [onCancel] - Fungsi callback opsional yang akan dieksekusi jika 'Tidak' diklik.
     */
    function showCustomConfirm(title, message, onConfirm, onCancel = null) {
        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        customConfirmModal.classList.add('active'); // Tampilkan overlay modal
        currentConfirmCallback = onConfirm; // Simpan callback konfirmasi

        // Atur event listener untuk tombol modal
        confirmYesBtn.onclick = () => {
            if (currentConfirmCallback) {
                currentConfirmCallback(); // Jalankan callback konfirmasi
            }
            hideCustomConfirm(); // Sembunyikan modal
        };
        confirmCancelBtn.onclick = () => {
            if (onCancel) {
                onCancel(); // Jalankan callback batal jika disediakan
            }
            hideCustomConfirm(); // Sembunyikan modal
        };
    }

    /**
     * Menyembunyikan modal konfirmasi kustom.
     */
    function hideCustomConfirm() {
        customConfirmModal.classList.remove('active'); // Sembunyikan overlay modal
        currentConfirmCallback = null; // Hapus callback
    }

    // Tutup modal saat mengklik di luar konten
    customConfirmModal.addEventListener('click', function(event) {
        if (event.target === customConfirmModal) { // Periksa apakah klik terjadi pada overlay itu sendiri
            hideCustomConfirm();
        }
    });


    /**
     * Menangani klik autentikasi (login/logout).
     * @param {Event} e - Objek event klik.
     */
    function handleAuthClick(e) {
        e.preventDefault();
        // Tutup menu seluler jika terbuka
        const mobileMenuContent = document.getElementById('mobile-menu-content');
        if (mobileMenuContent.classList.contains('menu-active')) {
            toggleMobileMenu();
        }

        const action = e.target.dataset.action || (e.target.closest('a') ? e.target.closest('a').dataset.action : null);

        if (action === 'login') {
            // Arahkan ke login.php saat tombol login diklik
            window.location.href = 'login.php';
            
        } else if (action === 'logout') {
            // Tampilkan modal konfirmasi kustom untuk logout
            showCustomConfirm('Konfirmasi Logout', 'Apakah Anda yakin ingin logout?', () => {
                // Jika pengguna mengonfirmasi (klik Ya)
                document.body.classList.add('fade-out-page');
                setTimeout(() => {
                    handleLogout(); // Panggil fungsi logout dari auth.js
                    window.location.reload(); 
                }, 500); // Sesuaikan durasi fade-out CSS
            }, () => {
                // Jika pengguna membatalkan (klik Tidak), tidak lakukan apa-apa atau berikan pesan
                showCustomMessage('Logout dibatalkan.', 'info');
            });
        }
    }


    /**
     * Memperbarui UI spesifik halaman berdasarkan status autentikasi dan peran pengguna.
     * Ini termasuk menampilkan/menyembunyikan tautan navigasi dan bagian konten tertentu.
     */
    function updatePageSpecificUI() {
        // Panggil updateAuthUI dari modul auth.js untuk menginisialisasi status login di UI
        // Ini akan mengisi `userRole` secara internal di auth.js
        updateAuthUI(authElements);

        // Setelah `updateAuthUI` dijalankan, kita bisa mendapatkan peran terbaru
        const authData = getAuthData();
        userRole = authData.userData ? authData.userData.user_role : 'public';

        // Update common UI elements for logged-in users
        if (authLinkMain) {
            if (userRole !== 'public') {
                authLinkMain.innerHTML = `<i class="fas fa-sign-out-alt mr-2"></i> Logout`;
                authLinkMain.classList.add('logout-active');
                authLinkMain.dataset.action = "logout";
            } else {
                authLinkMain.innerHTML = `Login`;
                authLinkMain.classList.remove('logout-active');
                authLinkMain.classList.add('logged-out-styles');
                authLinkMain.dataset.action = "login";
            }
            authLinkMain.removeEventListener('click', handleAuthClick);
            authLinkMain.addEventListener('click', handleAuthClick);
        }

        // Juga perbarui tautan autentikasi seluler
        if (authLinkMobile) {
            if (userRole !== 'public') {
                authLinkMobile.innerHTML = `<i class="fas fa-sign-out-alt mr-2"></i> Logout`;
                authLinkMobile.classList.add('logout-active');
                authLinkMobile.dataset.action = "logout";
            } else {
                authLinkMobile.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Login</span>`;
                authLinkMobile.classList.remove('logout-active');
                authLinkMobile.classList.add('logged-out-styles');
                authLinkMobile.dataset.action = "login";
            }
            authLinkMobile.removeEventListener('click', handleAuthClick);
            authLinkMobile.addEventListener('click', handleAuthClick);
        }
        populateMobileMenu(); // Isi ulang menu seluler untuk memastikan selalu terkini

        // Handle logo upload/default visibility and source
        if (userRole === 'komisariat') { // Komisariat tidak perlu mengunggah logo rayon
            if (logoUploadContainer) logoUploadContainer.classList.add('hidden');
        } else if (userRole === 'rayon') { // Rayon bisa mengunggah logo rayon
            if (logoUploadContainer) logoUploadContainer.classList.remove('hidden');
            if (logoUploadInput) {
                logoUploadInput.onchange = (event) => {
                    const file = event.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            uploadedLogoDataURL = e.target.result; // Simpan data URL
                            if (logoPreview) {
                                logoPreview.src = uploadedLogoDataURL;
                                logoPreview.classList.remove('hidden'); // Tampilkan pratinjau
                                logoPreview.style.display = 'block'; // Pastikan display adalah block
                            }
                        };
                        reader.onerror = () => {
                            console.error("Gagal membaca file.");
                            showCustomMessage('Gagal membaca file gambar.', 'error');
                            uploadedLogoDataURL = null;
                            if (logoPreview) logoPreview.classList.add('hidden'); // Sembunyikan pratinjau saat error
                        };
                        reader.readAsDataURL(file);
                    } else {
                        uploadedLogoDataURL = null;
                        if (file) showCustomMessage('File yang diunggah harus berupa gambar.', 'error');
                        if (logoPreview) logoPreview.classList.add('hidden'); // Sembunyikan pratinjau jika bukan gambar
                    }
                    // Sembunyikan kontainer output QR code yang ada jika input logo berubah, paksa regenerasi
                    qrCodeOutputContainer.classList.add('hidden');
                };
            }
        } else { // Untuk publik atau kader biasa, sembunyikan
            if (logoUploadContainer) logoUploadContainer.classList.add('hidden');
            // Jika pengguna tidak memiliki peran yang sesuai, arahkan mereka
            const mainContentWrapper = document.querySelector('.main-content-wrapper');
            if (mainContentWrapper) {
                mainContentWrapper.innerHTML = `
                    <div class="container mx-auto px-4 py-8 lg:py-12 text-center text-white">
                        <i class="fas fa-exclamation-triangle text-6xl text-yellow-400 mb-4 animate-bounce"></i>
                        <h1 class="text-3xl lg:text-4xl font-bold mb-4">Akses Ditolak</h1>
                        <p class="text-lg mb-6">Anda harus login sebagai Admin Rayon atau Admin Komisariat untuk mengakses halaman ini.</p>
                        <a href="login.php" class="btn btn-primary-pmii inline-flex items-center px-6 py-3 text-lg rounded-lg shadow-md hover:shadow-lg transition-all">
                            <i class="fas fa-sign-in-alt mr-2"></i> Menuju Halaman Login
                        </a>
                    </div>
                `;
            }
            // Sembunyikan semua kontainer menu, karena kami telah mengganti konten utama
            if(document.getElementById('desktop-kader-menu-container')) document.getElementById('desktop-kader-menu-container').classList.add('hidden');
            if(document.getElementById('desktop-admin-menu-container')) document.getElementById('desktop-admin-menu-container').classList.add('hidden');
            return; // Hentikan eksekusi lebih lanjut
        }
    }

    /**
     * Mengisi menu seluler secara dinamis berdasarkan peran pengguna.
     */
    function populateMobileMenu() {
        const mobileNavLinksContainer = document.getElementById('mobile-nav-links');
        if (!mobileNavLinksContainer) return;

        mobileNavLinksContainer.innerHTML = ''; // Bersihkan konten sebelumnya

        // Tautan navigasi umum
        const commonLinks = [
            { text: 'Beranda', href: 'index.php#beranda', icon: 'fas fa-home' },
            { text: 'Tentang Kami', href: 'tentang-kami.php', icon: 'fas fa-info-circle' },
            { text: 'Berita', href: 'berita-artikel.php', icon: 'fas fa-newspaper' },
            { text: '📚 Digilib', href: 'digilib.php', icon: 'fas fa-book-reader' },
            { text: 'Kegiatan', href: 'agenda-kegiatan.php', icon: 'fas fa-calendar-alt' },
            { text: 'Galeri', href: 'galeri-foto.php', icon: 'fas fa-images' },
            { text: 'Kontak', href: 'index.php#kontak', icon: 'fas fa-envelope' },
        ];

        commonLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'mobile-nav-link';
            a.innerHTML = `<i class="${link.icon}"></i><span>${link.text}</span>`;
            mobileNavLinksContainer.appendChild(a);
        });

        // Tautan khusus berdasarkan peran
        if (userRole === 'kader') {
            appendMobileSubmenu(mobileNavLinksContainer, 'Profil Kader', [
                { text: 'Edit Profil', href: 'dashboard/edit-profil-kader.html', icon: 'fas fa-user-edit' },
                { text: 'Pengaturan Akun', href: 'dashboard/pengaturan-akun-kader.html', icon: 'fas fa-cog' },
                { text: 'Jurnal Al Harokah', href: 'akses-ojs.html', icon: 'fas fa-book-reader' },
                { text: 'Pengajuan Surat', href: 'dashboard/pengajuan-surat.html', icon: 'fas fa-file-alt' },
            ]);
        } else if (userRole === 'rayon' || userRole === 'komisariat') {
            appendMobileSubmenu(mobileNavLinksContainer, 'Sistem Internal', [
                // Tautan untuk semua admin (komisariat & rayon)
                { text: 'Manajemen Kader', href: 'dashboard/manajemen-kader.html', icon: 'fas fa-users-cog' },
                { text: 'Repository Ilmiah', href: 'dashboard/repository-ilmiah.html', icon: 'fas fa-book-open' },
                { text: 'Pengajuan Surat', href: 'dashboard/pengajuan-surat.html', icon: 'fas fa-file-alt' },
                { text: 'Jurnal Al Harokah', href: 'akses-ojs.html', icon: 'fas fa-book-reader' },
                { text: 'Verifikasi Konten Rayon', href: 'dashboard/verifikasi-konten-rayon.html', icon: 'fas fa-check-double' },
                { text: 'Tambah Berita & Artikel', href: 'dashboard/rayon-tambah-berita.html', icon: 'fas fa-newspaper' },
                { text: 'Tambah Kegiatan', href: 'dashboard/rayon-tambah-kegiatan.html', icon: 'fas fa-calendar-plus' },
                { text: 'Tambah Galeri Kegiatan', href: 'dashboard/rayon-tambah-galeri.html', icon: 'fas fa-images' },
                { text: 'Edit Profil Rayon', href: 'dashboard/edit-profil-rayon.html', icon: 'fas fa-building' },
            ]);

            if (userRole === 'komisariat') {
                appendMobileSubmenu(mobileNavLinksContainer, 'Admin Komisariat', [
                    { text: 'Manajemen Akun', href: 'dashboard/manajemen-akun.html', icon: 'fas fa-user-shield' },
                    { text: 'Verifikasi Surat', href: 'dashboard/verifikasi-surat.html', icon: 'fas fa-check-circle' },
                    { text: 'Dashboard Admin Kom.', href: 'dashboard/admin-dashboard-komisariat.html', icon: 'fas fa-tachometer-alt' },
                    { text: 'Edit Beranda', href: 'dashboard/edit-beranda.html', icon: 'fas fa-edit' },
                    { text: 'Pengaturan Situs', href: 'dashboard/pengaturan-situs.php', icon: 'fas fa-cogs' },
                    { text: 'Dashboard Statistik', href: 'dashboard/dashboard-statistik.html', icon: 'fas fa-chart-bar' },
                    { text: 'Kelola Notifikasi', href: 'dashboard/kelola-notifikasi.html', icon: 'fas fa-bell' },
                    { text: 'Laporan & Analisis', href: 'dashboard/laporan-analisis.php', icon: 'fas fa-file-invoice' },
                    { text: 'TTD Digital', href: 'generate-qr.php', icon: 'fas fa-qrcode' },
                    { text: 'Arsiparis Kepengurusan', href: 'dashboard/arsiparis.html', icon: 'fas fa-archive' },
                ]);
            }
        }
    }

    /**
     * Menambahkan grup submenu ke menu seluler.
     * @param {HTMLElement} parentElement - Elemen induk (misalnya, mobileNavLinksContainer).
     * @param {string} title - Judul submenu.
     * @param {Array<Object>} links - Array objek tautan { text, href, icon }.
     */
    function appendMobileSubmenu(parentElement, title, links) {
        const titleEl = document.createElement('div');
        titleEl.className = 'mobile-submenu-title';
        titleEl.textContent = title;
        parentElement.appendChild(titleEl);

        links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.href;
            a.className = 'mobile-submenu-item';
            a.innerHTML = `<i class="${link.icon}"></i><span>${link.text}</span>`;
            parentElement.appendChild(a);
        });
    }

    /**
     * Mengubah visibilitas menu seluler dan overlay-nya.
     */
    function toggleMobileMenu() {
        const mobileMenuContent = document.getElementById('mobile-menu-content');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

        const isOpen = mobileMenuContent.classList.contains('menu-active');
        if (!isOpen) {
            mobileMenuContent.classList.add('menu-active');
            mobileMenuOverlay.classList.add('menu-active');
            document.body.classList.add('overflow-hidden'); // Mencegah scrolling latar belakang
        } else {
            mobileMenuContent.classList.remove('menu-active');
            mobileMenuOverlay.classList.remove('menu-active');
            document.body.classList.remove('overflow-hidden'); // Mengizinkan scrolling latar belakang
        }
    }
    
    // Pastikan tombol menu dan overlay ditemukan sebelum melampirkan pendengar
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu-button');
    const mobileMenuOverlayElement = document.getElementById('mobile-menu-overlay');

    if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMobileMenu);
    if (closeMobileMenuButton) closeMobileMenuButton.addEventListener('click', toggleMobileMenu);
    if (mobileMenuOverlayElement) mobileMenuOverlayElement.addEventListener('click', toggleMobileMenu);


    /**
     * Mengurai parameter query URL.
     * @returns {Object} Sebuah objek yang berisi parameter query.
     */
    function getQueryParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const regex = /([^&=]+)=([^&]*)/g;
        let m;
        while ((m = regex.exec(queryString))) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        return params;
    }

    /**
     * Menginisialisasi atau memperbarui kode QR berdasarkan input formulir.
     * @async
     * @param {string} type - 'ttdDigital' atau 'accessLink'.
     */
    async function generateQRCode(type) {
        let qrData = '';
        let logoToDrawSrc = null;
        qrOutputTitle.textContent = 'QR Code Anda';

        // Sembunyikan pesan kesalahan sebelumnya
        const ttdMessageContainer = document.getElementById('qr-form-message');
        const linkMessageContainer = document.getElementById('qr-link-form-message');
        if (ttdMessageContainer) ttdMessageContainer.classList.remove('show', 'error', 'success', 'info');
        if (linkMessageContainer) linkMessageContainer.classList.remove('show', 'error', 'success', 'info');


        if (type === 'ttdDigital') {
            // Validasi formulir TTD Digital
            if (!nomorSuratInput.value.trim() || !ditandatanganiOlehInput.value.trim() ||
                !jabatanInput.value.trim() || !tanggalSuratInput.value.trim() ||
                !perihalSuratInput.value.trim()) {
                showCustomMessage('Harap isi semua kolom untuk membuat QR Code TTD Digital.', 'error');
                qrCodeOutputContainer.classList.add('hidden');
                return;
            }

            // Data untuk dikirim ke API generateQrCode
            const ttdData = {
                type: 'ttdDigital',
                nomor_surat: nomorSuratInput.value.trim(),
                ditandatangani_oleh: ditandatanganiOlehInput.value.trim(),
                jabatan: jabatanInput.value.trim(),
                tanggal_surat: tanggalSuratInput.value.trim(),
                perihal_surat: perihalSuratInput.value.trim(),
                user_role: userRole, // Kirim peran pengguna
                user_id: getAuthData().userData ? getAuthData().userData.user_id : null // Kirim ID pengguna jika ada
            };

            // Jika admin rayon mengunggah logo, sertakan data logo
            if (userRole === 'rayon' && uploadedLogoDataURL) {
                ttdData.logo_data_url = uploadedLogoDataURL;
            }

            try {
                const response = await generateQrCode(ttdData); // Panggil API
                if (response.success && response.qr_data_url) {
                    qrData = response.qr_data_url; // URL verifikasi dari backend
                    qrOutputTitle.textContent = 'QR Tanda Tangan Digital Anda';
                    showCustomMessage(response.message || 'QR Code TTD Digital berhasil dibuat!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal membuat QR Code TTD Digital.');
                }
            } catch (error) {
                console.error('Error saat membuat QR Code TTD Digital:', error);
                showCustomMessage(error.message || 'Terjadi kesalahan saat membuat QR Code TTD Digital.', 'error');
                qrCodeOutputContainer.classList.add('hidden');
                return;
            }

            // Set logo yang akan digambar DI KODE QR berdasarkan peran pengguna
            if (userRole === 'komisariat') {
                logoToDrawSrc = 'img/logo-komisariat-uin.png';
            } else if (userRole === 'rayon') {
                logoToDrawSrc = uploadedLogoDataURL; // Gunakan logo yang diunggah untuk rayon
            }

        } else if (type === 'accessLink') {
            // Validasi formulir Link Akses
            if (!linkUrlInput.value.trim() || !linkUrlInput.checkValidity()) {
                showCustomMessage('Harap masukkan URL yang valid.', 'error');
                qrCodeOutputContainer.classList.add('hidden');
                return;
            }

            // Data untuk dikirim ke API generateQrCode
            const linkData = {
                type: 'accessLink',
                url: linkUrlInput.value.trim(),
                title: linkTitleInput.value.trim(),
                description: linkDescriptionInput.value.trim(),
                creator: linkCreatorInput.value.trim(),
                user_role: userRole,
                user_id: getAuthData().userData ? getAuthData().userData.user_id : null
            };

            // Jika admin rayon mengunggah logo, sertakan data logo
            if (userRole === 'rayon' && uploadedLogoDataURL) {
                linkData.logo_data_url = uploadedLogoDataURL;
            }

            try {
                const response = await generateQrCode(linkData); // Panggil API
                if (response.success && response.qr_data_url) {
                    qrData = response.qr_data_url; // URL verifikasi dari backend
                    qrOutputTitle.textContent = 'QR Link Anda';
                    showCustomMessage(response.message || 'QR Code Link berhasil dibuat!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal membuat QR Code Link.');
                }
            } catch (error) {
                console.error('Error saat membuat QR Code Link:', error);
                showCustomMessage(error.message || 'Terjadi kesalahan saat membuat QR Code Link.', 'error');
                qrCodeOutputContainer.classList.add('hidden');
                return;
            }

            // Set logo yang akan digambar DI KODE QR berdasarkan peran pengguna
            if (userRole === 'komisariat') {
                logoToDrawSrc = 'img/logo-komisariat-uin.png';
            } else if (userRole === 'rayon') {
                logoToDrawSrc = uploadedLogoDataURL; // Gunakan logo yang diunggah untuk rayon
            }
        }

        // Atur dimensi kanvas secara eksplisit untuk menghindari masalah rendering dengan QRious
        const canvasSize = 288; // Ukuran tetap berdasarkan w-72 h-72 (18rem * 16px/rem = 288px)
        qrcodeCanvas.width = canvasSize;
        qrcodeCanvas.height = canvasSize;

        // Inisialisasi QRious
        qr = new QRious({
            element: qrcodeCanvas,
            value: qrData,
            size: canvasSize,
            padding: 5,
            level: 'H', // Tingkat koreksi kesalahan tinggi, bagus untuk logo
            foreground: '#004a7c', // Warna biru gelap PMII
            background: '#ffffff' // Latar belakang putih
        });

        if (logoToDrawSrc) {
            const ctx = qrcodeCanvas.getContext('2d');
            const img = new Image();
            img.src = logoToDrawSrc;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = (e) => { // Tambahkan parameter event ke onerror
                    console.error(`Gagal memuat logo dari: ${logoToDrawSrc}`, e); // Catat objek error
                    showCustomMessage('Gagal memuat logo. Pastikan URL/file dapat diakses.', 'error');
                    reject(e); // Tolak dengan event atau error
                };
            }).then(() => {
                const qrSize = qrcodeCanvas.width;
                const logoMaxRatio = 0.30; // Ukuran logo yang ditingkatkan untuk visibilitas yang lebih baik

                let drawWidth, drawHeight;
                const aspectRatio = img.width / img.height;

                if (aspectRatio > 1) { // Lanskap atau persegi
                    drawWidth = Math.round(qrSize * logoMaxRatio);
                    drawHeight = Math.round(drawWidth / aspectRatio);
                } else { // Potret
                    drawHeight = Math.round(qrSize * logoMaxRatio);
                    drawWidth = Math.round(drawHeight * aspectRatio);
                }

                const logoX = Math.round((qrSize - drawWidth) / 2);
                const logoY = Math.round((qrSize - drawHeight) / 2);

                // Bersihkan area yang lebih besar untuk memastikan logo terlihat
                const clearPadding = 10; // Padding ekstra di sekitar area logo
                ctx.clearRect(
                    logoX - clearPadding,
                    logoY - clearPadding,
                    drawWidth + (2 * clearPadding),
                    drawHeight + (2 * clearPadding)
                );

                ctx.drawImage(img, logoX, logoY, drawWidth, drawHeight);
            }).catch(error => {
                // Error sudah ditangani di img.onerror, catch ini mencegah penolakan promise yang tidak tertangani
                // dan mencatat masalah berikutnya dalam rantai promise
                console.error("Error pemrosesan gambar logo:", error);
            });
        }
        qrCodeOutputContainer.classList.remove('hidden'); // Tampilkan kontainer QR code
    }

    // Fungsi untuk menangani pemilihan tipe QR
    function handleQrTypeChange() {
        const selectedRadioButton = document.querySelector('input[name="qrType"]:checked');
        const selectedType = selectedRadioButton ? selectedRadioButton.value : 'ttdDigital';

        // Sembunyikan semua bagian konten utama pada awalnya saat mengubah tipe
        qrTtdFormSection.classList.add('hidden');
        qrLinkFormSection.classList.add('hidden');
        qrCodeOutputContainer.classList.add('hidden');
        letterStatusSection.classList.add('hidden');
        linkStatusSection.classList.add('hidden');
        qrTypeSelection.classList.remove('hidden'); // Pastikan pemilihan tipe terlihat

        mainPageTitle.textContent = "Generate QR Code";
        mainPageDescription.textContent = "Buat dan kelola kode QR untuk berbagai keperluan.";

        if (selectedType === 'ttdDigital') {
            qrTtdFormSection.classList.remove('hidden');
            // Pastikan unggahan logo terlihat jika pengguna adalah admin rayon DAN TTD Digital dipilih
            if (userRole === 'rayon') {
                logoUploadContainer.classList.remove('hidden');
            } else {
                logoUploadContainer.classList.add('hidden');
            }
        } else if (selectedType === 'accessLink') {
            qrLinkFormSection.classList.remove('hidden');
            // Untuk Link Akses, juga tampilkan unggahan logo untuk rayon, tetapi sembunyikan untuk komisariat.
            if (userRole === 'rayon') {
                logoUploadContainer.classList.remove('hidden');
            } else {
                logoUploadContainer.classList.add('hidden');
            }
        }
    }

    // Fungsi untuk menampilkan status TTD dari parameter URL
    async function displayTtdStatus(params) {
        qrTypeSelection.classList.add('hidden'); // Sembunyikan pemilihan tipe
        qrTtdFormSection.classList.add('hidden');
        qrLinkFormSection.classList.add('hidden');
        qrCodeOutputContainer.classList.add('hidden'); // Sembunyikan output QR
        letterStatusSection.classList.add('hidden'); // Sembunyikan bagian status TTD awal
        linkStatusSection.classList.add('hidden'); // Sembunyikan bagian status link

        mainPageTitle.textContent = "Status Verifikasi TTD Digital";
        mainPageDescription.textContent = "Memverifikasi keaslian Tanda Tangan Digital.";

        // Dapatkan ID QR dari parameter URL
        const qrId = params.id; // Asumsi 'id' adalah parameter untuk ID QR di backend

        if (!qrId) {
            showCustomMessage('ID QR Code tidak ditemukan di URL.', 'error');
            // Tampilkan kembali form generate QR jika ID tidak ada
            handleQrTypeChange();
            return;
        }

        try {
            const response = await getQrCodeDetails(qrId); // Panggil API untuk mendapatkan detail QR
            if (response.success && response.data && response.data.type === 'ttdDigital') {
                const qrDetails = response.data;
                displayNomorSurat.textContent = qrDetails.nomor_surat || 'Tidak Tersedia';
                displayDitandatanganiOleh.textContent = qrDetails.ditandatangani_oleh || 'Tidak Tersedia';
                displayJabatan.textContent = qrDetails.jabatan || 'Tidak Tersedia';
                displayTanggalSuratSpan.textContent = qrDetails.tanggal_surat || 'Tidak Tersedia';
                displayPerihalSurat.textContent = qrDetails.perihal_surat || 'Tidak Tersedia';

                // Tampilkan logo Komisariat jika qrDetails.user_role adalah 'komisariat'
                if (qrDetails.user_role === 'komisariat' && komisariatLogoDisplay) {
                    komisariatLogoDisplay.classList.remove('hidden');
                } else {
                    komisariatLogoDisplay.classList.add('hidden');
                }
                letterStatusSection.classList.remove('hidden'); // Tampilkan bagian status TTD
            } else {
                throw new Error(response.message || 'Data QR Code tidak ditemukan atau bukan TTD Digital.');
            }
        } catch (error) {
            console.error('Error saat mengambil detail QR Code TTD Digital:', error);
            showCustomMessage(error.message || 'Gagal memverifikasi QR Code TTD Digital.', 'error');
            // Tampilkan kembali form generate QR jika verifikasi gagal
            handleQrTypeChange();
        }
    }

    // Fungsi untuk menampilkan detail Link dari parameter URL
    async function displayLinkDetails(params) {
        qrTypeSelection.classList.add('hidden'); // Sembunyikan pemilihan tipe
        qrTtdFormSection.classList.add('hidden');
        qrLinkFormSection.classList.add('hidden');
        qrCodeOutputContainer.classList.add('hidden'); // Sembunyikan output QR
        letterStatusSection.classList.add('hidden'); // Sembunyikan bagian status TTD
        linkStatusSection.classList.add('hidden'); // Sembunyikan bagian status link awal

        mainPageTitle.textContent = "Detail Link QR Code";
        mainPageDescription.textContent = "Menampilkan informasi dari link yang terenkode dalam QR.";

        // Dapatkan ID QR dari parameter URL
        const qrId = params.id; // Asumsi 'id' adalah parameter untuk ID QR di backend

        if (!qrId) {
            showCustomMessage('ID QR Code tidak ditemukan di URL.', 'error');
            // Tampilkan kembali form generate QR jika ID tidak ada
            handleQrTypeChange();
            return;
        }

        try {
            const response = await getQrCodeDetails(qrId); // Panggil API untuk mendapatkan detail QR
            if (response.success && response.data && response.data.type === 'accessLink') {
                const qrDetails = response.data;
                displayLinkUrl.textContent = qrDetails.url || 'Tidak Tersedia';
                displayLinkUrl.href = qrDetails.url || '#'; // Set href untuk link
                displayLinkTitle.textContent = qrDetails.title || 'Tidak Tersedia';
                displayLinkDescription.textContent = qrDetails.description || 'Tidak Tersedia';
                displayLinkCreator.textContent = qrDetails.creator || 'Tidak Tersedia';
                linkStatusSection.classList.remove('hidden'); // Tampilkan bagian status link
            } else {
                throw new Error(response.message || 'Data QR Code tidak ditemukan atau bukan Link Akses.');
            }
        } catch (error) {
            console.error('Error saat mengambil detail QR Code Link:', error);
            showCustomMessage(error.message || 'Gagal memverifikasi QR Code Link.', 'error');
            // Tampilkan kembali form generate QR jika verifikasi gagal
            handleQrTypeChange();
        }
    }


    // Event listeners for QR type radio buttons
    qrTypeTtdDigital.addEventListener('change', handleQrTypeChange);
    qrTypeAccessLink.addEventListener('change', handleQrTypeChange);

    // Check URL parameters on page load
    const queryParams = getQueryParams();

    if (Object.keys(queryParams).length > 0 && queryParams.id) { // Periksa 'id' untuk detail
        // Jika parameter 'id' ada, coba tampilkan status
        if (queryParams.type === 'ttdDigital') {
            displayTtdStatus(queryParams);
        } else if (queryParams.type === 'accessLink') {
            displayLinkDetails(queryParams);
        } else {
            // Jika ada ID tapi tipe tidak dikenal, kembali ke form generate
            handleQrTypeChange();
        }
    } else {
        // Jika tidak ada parameter, tampilkan form generate QR secara default
        handleQrTypeChange(); // Ini akan menampilkan form TTD default
    }

    // Add event listener to the TTD Digital generate button
    if (generateQrTtdBtn) {
        generateQrTtdBtn.addEventListener('click', async function(event) {
            event.preventDefault(); // Mencegah pengiriman formulir default

            // Untuk Admin Rayon, periksa apakah logo diunggah atau beri peringatan
            if (userRole === 'rayon' && !uploadedLogoDataURL) {
                showCustomConfirm(
                    'Konfirmasi Logo',
                    'Anda belum mengunggah logo rayon. Kode QR akan dibuat tanpa logo. Lanjutkan?',
                    async () => {
                        await generateQRCode('ttdDigital'); // Pengguna mengkonfirmasi, buat tanpa logo
                    },
                    () => {
                        showCustomMessage('Pembuatan QR Code TTD Digital dibatalkan.', 'info');
                        qrCodeOutputContainer.classList.add('hidden');
                    }
                );
            } else {
                await generateQRCode('ttdDigital'); // Buat QR code (dengan logo jika Komisariat atau Rayon mengunggah)
            }
        });
    }

    // Add event listener to the Access Link generate button
    if (generateQrLinkBtn) {
        generateQrLinkBtn.addEventListener('click', async function(event) {
            event.preventDefault(); // Mencegah pengiriman formulir default

            // Untuk Admin Rayon, periksa apakah logo diunggah atau beri peringatan (untuk link akses juga)
            if (userRole === 'rayon' && !uploadedLogoDataURL) {
                showCustomConfirm(
                    'Konfirmasi Logo',
                    'Anda belum mengunggah logo rayon. Kode QR link akan dibuat tanpa logo. Lanjutkan?',
                    async () => {
                        await generateQRCode('accessLink'); // Pengguna mengkonfirmasi, buat tanpa logo
                    },
                    () => {
                        showCustomMessage('Pembuatan QR Code Link dibatalkan.', 'info');
                        qrCodeOutputContainer.classList.add('hidden');
                    }
                );
            } else {
                await generateQRCode('accessLink'); // Buat QR code (dengan logo jika Komisariat atau Rayon mengunggah)
            }
        });
    }

    // Download QR button functionality
    if (downloadQrBtn) {
        downloadQrBtn.addEventListener('click', function() {
            // Pastikan QR code sudah dibuat sebelum mencoba mengunduh
            if (!qr) {
                showCustomMessage('Tidak ada QR Code yang dapat diunduh. Harap buat QR Code terlebih dahulu.', 'error');
                return;
            }

            const img = qrcodeCanvas.toDataURL("image/png");

            const link = document.createElement('a');
            link.href = img;
            const selectedRadioButton = document.querySelector('input[name="qrType"]:checked');
            const selectedType = selectedRadioButton ? selectedRadioButton.value : 'QR_Code'; // Tipe nama file default
            let fileName = 'QR_Code';

            if (selectedType === 'ttdDigital') {
                const nomor = nomorSuratInput.value || 'Surat';
                const ttdOleh = ditandatanganiOlehInput.value || 'TidakDikenal';
                // Bersihkan nama file untuk menghapus karakter yang tidak valid
                fileName = `QR_TTD_${nomor.replace(/[^a-zA-Z0-9]/g, '_')}_${ttdOleh.replace(/[^a-zA-Z0-9]/g, '_')}`;
            } else if (selectedType === 'accessLink') {
                const title = linkTitleInput.value || 'Link';
                // Bersihkan nama file untuk menghapus karakter yang tidak valid
                fileName = `QR_Link_${title.replace(/[^a-zA-Z0-9]/g, '_')}`;
            }
            link.download = `${fileName}.png`;
            document.body.appendChild(link); // Diperlukan untuk Firefox dan beberapa browser lain untuk unduhan dinamis
            link.click();
            document.body.removeChild(link); // Bersihkan
            showCustomMessage('QR Code berhasil diunduh!', 'success');
        });
    }

    // Setel tahun footer
    const tahunFooterDashboard = document.getElementById('tahun-footer-dashboard');
    if (tahunFooterDashboard) {
        tahunFooterDashboard.textContent = new Date().getFullYear();
    }

    // Fungsionalitas tombol gulir ke atas
    const scrollToTopBtnDashboard = document.getElementById('scrollToTopBtnDashboard');
    if (scrollToTopBtnDashboard) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 200) {
                scrollToTopBtnDashboard.classList.remove('hidden');
                scrollToTopBtnDashboard.classList.add('flex');
            } else {
                scrollToTopBtnDashboard.classList.add('hidden');
                scrollToTopBtnDashboard.classList.remove('flex');
            }
        });
        scrollToTopBtnDashboard.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Panggil update UI awal
    updatePageSpecificUI();
});
