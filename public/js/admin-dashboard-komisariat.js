// public/js/admin-dashboard-komisariat.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
// Impor fungsi-fungsi API yang diperlukan
import { getUsers, getSuratSubmissions, getNews, getActivities, getScientificWorks, getRayons } from './api.js';

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP (diakses melalui window global) ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;

    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');

    const authElements = {
        authLinkMain, authLinkMobile,
        desktopKaderMenuContainer: document.getElementById('desktop-kader-menu-container'),
        desktopAdminMenuContainer: document.getElementById('desktop-admin-menu-container'),
        headerTitleText, mobileHeaderTitleText
    };

    updateAuthUI(authElements);

    const authData = getAuthData();
    loggedInUser = authData.userData || phpLoggedInUser;

    // Fungsi global untuk pesan kustom
    window.showCustomMessage = window.showCustomMessage || function(message, type = 'info', callback = null) {
        const messageBox = document.getElementById('customMessageBox');
        if (!messageBox) return;
        messageBox.textContent = message;
        messageBox.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0';
        if (type === 'success') { messageBox.classList.add('bg-green-500'); } else if (type === 'error') { messageBox.classList.add('bg-red-500'); } else { messageBox.classList.add('bg-blue-500'); }
        messageBox.classList.remove('translate-x-full', 'opacity-0');
        messageBox.classList.add('translate-x-0', 'opacity-100');
        setTimeout(() => {
            messageBox.classList.remove('translate-x-0', 'opacity-100');
            messageBox.classList.add('translate-x-full', 'opacity-0');
            if (callback) messageBox.addEventListener('transitionend', function handler() { callback(); messageBox.removeEventListener('transitionend', handler); });
        }, 3000);
    };

    window.showCustomConfirm = window.showCustomConfirm || function(title, message, onConfirm, onCancel = null) {
        const customConfirmModal = document.getElementById('customConfirmModal');
        const confirmModalTitle = document.getElementById('confirmModalTitle');
        const confirmModalMessage = document.getElementById('confirmModalMessage');
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmCancelBtn = document.getElementById('confirmCancelBtn');
        let currentConfirmCallback = null;
        if (!customConfirmModal || !confirmModalTitle || !confirmModalMessage || !confirmYesBtn || !confirmCancelBtn) return;
        confirmModalTitle.textContent = title; confirmModalMessage.textContent = message;
        customConfirmModal.classList.add('active'); currentConfirmCallback = onConfirm;
        confirmYesBtn.onclick = () => { if (currentConfirmCallback) { currentConfirmCallback(); } hideCustomConfirm(); };
        confirmCancelBtn.onclick = () => { if (onCancel) { onCancel(); } hideCustomConfirm(); };
        function hideCustomConfirm() { customConfirmModal.classList.remove('active'); currentConfirmCallback = null; }
        customConfirmModal.addEventListener('click', function(event) { if (event.target === customConfirmModal) hideCustomConfirm(); });
    };

    if (authLinkMain) {
        authLinkMain.removeEventListener('click', handleAuthClick);
        authLinkMain.addEventListener('click', handleAuthClick);
    }
    if (authLinkMobile) {
        authLinkMobile.removeEventListener('click', handleAuthClick);
        authLinkMobile.addEventListener('click', handleAuthClick);
    }

    // --- Logika Spesifik Halaman Dashboard Admin Komisariat ---
    const adminNameDashboard = document.getElementById('admin-name-dashboard');
    const adminNameDashboardBanner = document.querySelector('.welcome-banner #admin-name-dashboard-banner');

    // Fungsi untuk memperbarui UI spesifik halaman
    async function updateKomisariatDashboardUI() { // Tambahkan async di sini
        // Peran yang diizinkan untuk halaman ini
        const allowedRolesForThisPage = ['komisariat'];
        const defaultAllowedPages = [
            'index.php', 'login.php', 'digilib.php', 'tentang-kami.php',
            'berita-artikel.php', 'agenda-kegiatan.php', 'galeri-foto.php',
            'all-rayons.php', 'rayon-profile.php', 'akses-ojs.php',
            'lupa-password.php', 'register-kader.php', 'status-ttd.php',
            'generate-qr.php',
            ''
        ];

        const currentPage = window.location.pathname.split('/').pop();

        let hasAccess = false;
        let userRole = loggedInUser ? loggedInUser.role : null;

        if (userRole && allowedRolesForThisPage.includes(userRole)) {
            hasAccess = true;
        }

        if (!defaultAllowedPages.includes(currentPage) && !hasAccess) {
            window.showCustomMessage("Anda tidak memiliki hak akses ke halaman ini. Silakan login sebagai Admin Komisariat.", 'error', () => {
                window.location.assign('../login.php');
            });
            document.body.innerHTML = `
                <div class="main-content-wrapper flex flex-col items-center justify-center min-h-screen text-center bg-pmii-darkblue text-white p-8">
                    <i class="fas fa-exclamation-triangle text-6xl text-pmii-yellow mb-4 animate-bounce"></i>
                    <h1 class="text-3xl lg:text-4xl font-bold mb-4">Akses Ditolak</h1>
                    <p class="text-lg mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                    <a href="../login.php" class="btn btn-primary-pmii text-lg">
                        <i class="fas fa-sign-in-alt mr-2"></i> Kembali ke Login
                    </a>
                </div>
            `;
            return;
        }

        if (hasAccess) {
            const adminDisplayName = loggedInUser.nama || 'Admin Komisariat';
            if (adminNameDashboard) adminNameDashboard.textContent = adminDisplayName;
            if (adminNameDashboardBanner) adminNameDashboardBanner.textContent = adminDisplayName;

            const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';
            if (headerTitleText) {
                headerTitleText.textContent = loggedInTitle;
            }
            if (mobileHeaderTitleText) {
                mobileHeaderTitleText.textContent = loggedInTitle;
            }
        } else {
            const defaultTitle = 'PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung';
            if (headerTitleText) {
                headerTitleText.textContent = defaultTitle;
            }
            if (mobileHeaderTitleText) {
                mobileHeaderTitleText.textContent = defaultTitle;
            }
        }

        const tahunFooterDashboard = document.getElementById('tahun-footer-dashboard');
        if (tahunFooterDashboard) {
            tahunFooterDashboard.textContent = new Date().getFullYear();
        }

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
    }

    // Panggil fungsi pembaruan UI utama saat DOM siap
    updateKomisariatDashboardUI();
});