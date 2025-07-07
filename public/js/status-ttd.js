// public/js/status-ttd.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from './auth.js';
import { getQrCodeDetails, verifyPublicQrCode } from './api.js'; // Asumsi ada fungsi API untuk QR

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

    // Elements specific to this page
    const displayNomorSurat = document.getElementById('displayNomorSurat');
    const displayDitandatanganiOleh = document.getElementById('displayDitandatanganiOleh');
    const displayJabatan = document.getElementById('displayJabatan');
    const displayTanggalSurat = document.getElementById('displayTanggalSurat');
    const displayPerihalSurat = document.getElementById('displayPerihalSurat');
    const komisariatLogoDisplay = document.getElementById('komisariatLogoDisplay');
    const mainPageTitle = document.querySelector('main .text-center h1');
    const mainPageDescription = document.querySelector('main .text-center p');


    /**
     * Custom message box function to replace alert() and confirm().
     * @param {string} message - The message to display.
     * @param {string} type - 'success', 'error', 'info'.
     * @param {Function} [callback] - Optional callback function to run after message fades out.
     */
    function showCustomMessage(message, type = 'info', callback = null) {
        const messageBox = document.getElementById('customMessageBox');
        messageBox.textContent = message;
        messageBox.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0'; // Reset classes

        // Apply type-specific styling
        if (type === 'success') {
            messageBox.classList.add('bg-green-500');
        } else if (type === 'error') {
            messageBox.classList.add('bg-red-500');
        } else { // Default to info (blue)
            messageBox.classList.add('bg-blue-500');
        }

        // Show message
        messageBox.classList.remove('translate-x-full', 'opacity-0');
        messageBox.classList.add('translate-x-0', 'opacity-100');

        setTimeout(() => {
            messageBox.classList.remove('translate-x-0', 'opacity-100');
            messageBox.classList.add('translate-x-full', 'opacity-0');
            if (callback) {
                // Execute callback after the fade-out transition completes
                messageBox.addEventListener('transitionend', function handler() {
                    callback();
                    messageBox.removeEventListener('transitionend', handler);
                });
            }
        }, 3000);
    }

    /* Custom Confirmation Modal Logic */
    const customConfirmModal = document.getElementById('customConfirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    let currentConfirmCallback = null;

    /**
     * Shows a custom confirmation modal.
     * @param {string} title - The title of the confirmation modal.
     * @param {string} message - The message to display in the modal.
     * @param {Function} onConfirm - Callback function to execute if 'Yes' is clicked.
     * @param {Function} [onCancel] - Optional callback function to execute if 'No' is clicked.
     */
    function showCustomConfirm(title, message, onConfirm, onCancel = null) {
        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        customConfirmModal.classList.add('active');
        currentConfirmCallback = onConfirm;

        confirmYesBtn.onclick = () => {
            if (currentConfirmCallback) {
                currentConfirmCallback();
            }
            hideCustomConfirm();
        };
        confirmCancelBtn.onclick = () => {
            if (onCancel) {
                onCancel();
            }
            hideCustomConfirm();
        };
    }

    /**
     * Hides the custom confirmation modal.
     */
    function hideCustomConfirm() {
        customConfirmModal.classList.remove('active');
        currentConfirmCallback = null;
    }

    // Close modal when clicking outside the content
    customConfirmModal.addEventListener('click', function(event) {
        if (event.target === customConfirmModal) {
            hideCustomConfirm();
        }
    });

    /**
     * Simulates login/logout.
     */
    function handleAuthClick(e) {
        e.preventDefault();
        const mobileMenuContent = document.getElementById('mobile-menu-content');
        if (mobileMenuContent.classList.contains('menu-active')) {
            toggleMobileMenu();
        }

        const action = e.target.dataset.action || (e.target.closest('a') ? e.target.closest('a').dataset.action : null);

        if (action === 'login') {
            window.location.href = 'login.php'; // Arahkan ke login.php

        } else if (action === 'logout') {
            showCustomConfirm('Konfirmasi Logout', 'Apakah Anda yakin ingin logout?', () => {
                document.body.classList.add('fade-out-page');
                setTimeout(() => {
                    handleLogout(); // Panggil fungsi logout dari auth.js
                    window.location.reload();
                }, 500);
            }, () => {
                showCustomMessage('Logout dibatalkan.', 'info');
            });
        }
    }

    function updatePageSpecificUI() {
        // Panggil updateAuthUI dari modul auth.js untuk menginisialisasi status login di UI
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
            populateMobileMenu();
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
     * Memuat dan menampilkan detail TTD Digital dari API.
     * @param {string} qrId - ID unik QR code yang akan diverifikasi.
     */
    async function loadTtdStatus(qrId) {
        try {
            const response = await verifyPublicQrCode(qrId); // Panggil API publik untuk verifikasi
            if (response.success && response.data) {
                const qrDetails = response.data;
                displayNomorSurat.textContent = qrDetails.nomor_surat || 'Tidak Tersedia';
                displayDitandatanganiOleh.textContent = qrDetails.ditandatangani_oleh || 'Tidak Tersedia';
                displayJabatan.textContent = qrDetails.jabatan || 'Tidak Tersedia';
                displayTanggalSurat.textContent = qrDetails.tanggal_surat || 'Tidak Tersedia';
                displayPerihalSurat.textContent = qrDetails.perihal_surat || 'Tidak Tersedia';

                // Tampilkan logo Komisariat jika peran yang menandatangani adalah 'komisariat'
                if (qrDetails.user_role === 'komisariat' && komisariatLogoDisplay) {
                    komisariatLogoDisplay.classList.remove('hidden');
                } else {
                    komisariatLogoDisplay.classList.add('hidden');
                }
                mainPageTitle.textContent = "Tanda Tangan Digital SAH";
                mainPageDescription.textContent = "Dokumen ini telah diverifikasi dan sah secara digital.";
                showCustomMessage('Verifikasi TTD Digital berhasil!', 'success');

            } else {
                throw new Error(response.message || 'Data TTD Digital tidak valid atau tidak ditemukan.');
            }
        } catch (error) {
            console.error('Error saat memverifikasi TTD Digital:', error);
            mainPageTitle.textContent = "Verifikasi Gagal";
            mainPageDescription.textContent = "Terjadi kesalahan saat memverifikasi TTD Digital.";
            showCustomMessage(error.message || 'Gagal memverifikasi TTD Digital.', 'error');
            // Sembunyikan detail dan tampilkan pesan error
            displayNomorSurat.textContent = 'ERROR';
            displayDitandatanganiOleh.textContent = 'ERROR';
            displayJabatan.textContent = 'ERROR';
            displayTanggalSurat.textContent = 'ERROR';
            displayPerihalSurat.textContent = 'ERROR';
            komisariatLogoDisplay.classList.add('hidden'); // Pastikan logo tersembunyi
        }
    }

    // --- Inisialisasi Halaman ---
    // Panggil update UI awal
    updatePageSpecificUI();

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

    // Update footer year
    const tahunFooterDashboard = document.getElementById('tahun-footer-dashboard');
    if (tahunFooterDashboard) {
        tahunFooterDashboard.textContent = new Date().getFullYear();
    }

    // Ambil parameter URL saat halaman dimuat
    const queryParams = getQueryParams();
    const qrId = queryParams.id; // Asumsi ID QR ada di parameter 'id'

    if (qrId) {
        loadTtdStatus(qrId);
    } else {
        // Jika tidak ada ID QR di URL, tampilkan pesan error atau arahkan kembali
        mainPageTitle.textContent = "QR Code Tidak Valid";
        mainPageDescription.textContent = "Tidak ada ID QR Code yang ditemukan untuk verifikasi.";
        showCustomMessage('QR Code tidak valid atau rusak.', 'error');
        // Sembunyikan semua detail jika tidak ada ID
        displayNomorSurat.textContent = 'N/A';
        displayDitandatanganiOleh.textContent = 'N/A';
        displayJabatan.textContent = 'N/A';
        displayTanggalSurat.textContent = 'N/A';
        displayPerihalSurat.textContent = 'N/A';
        komisariatLogoDisplay.classList.add('hidden');
    }
});
