// public/js/pengaturan-situs.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getSiteSettings, updateSiteSettings, getHomepageSections, updateHomepageSection, getSocialMediaLinks, updateSocialMediaLink } from './api.js';

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;

    // Navbar & Auth Elements
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');

    const authElements = {
        authLinkMain, mobileAuthLink: authLinkMobile, // Pastikan mobileAuthLink juga disertakan
        desktopKaderMenuContainer: document.getElementById('desktop-kader-menu-container'),
        desktopAdminMenuContainer: document.getElementById('desktop-admin-menu-container'),
        headerTitleText, mobileHeaderTitleText
    };

    updateAuthUI(authElements);

    const authData = getAuthData();
    loggedInUser = authData.userData || phpLoggedInUser;

    // Elemen DOM spesifik untuk halaman pengaturan situs
    const generalSettingsForm = document.getElementById('generalSettingsForm');
    const siteTitleInput = document.getElementById('siteTitle');
    const siteDescriptionInput = document.getElementById('siteDescription');
    const contactEmailInput = document.getElementById('contactEmail');
    const contactPhoneInput = document.getElementById('contactPhone');
    const siteAddressInput = document.getElementById('siteAddress');
    const generalSettingsFormResponse = document.getElementById('general-settings-form-response');

    const announcementSettingsForm = document.getElementById('announcementSettingsForm');
    const announcementTextInput = document.getElementById('announcementText');
    const announcementSettingsFormResponse = document.getElementById('announcement-settings-form-response');

    const socialMediaSettingsForm = document.getElementById('socialMediaSettingsForm');
    const instagramUrlInput = document.getElementById('instagramUrl');
    const facebookUrlInput = document.getElementById('facebookUrl');
    const twitterUrlInput = document.getElementById('twitterUrl');
    const youtubeUrlInput = document.getElementById('youtubeUrl');
    const socialMediaSettingsFormResponse = document.getElementById('social-media-settings-form-response');

    // --- Custom Message Box & Confirm Modal (Global Helper Functions) ---
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

    // --- AUTHENTICATION & UI SETUP ---
    async function updatePengaturanSitusUI() {
        const allowedRolesForThisPage = ['komisariat']; // Hanya admin komisariat yang bisa akses
        const defaultAllowedPages = [
            'index.php', 'login.php', 'digilib.php', 'tentang-kami.php',
            'berita-artikel.php', 'agenda-kegiatan.php', 'galeri-foto.php',
            'all-rayons.php', 'rayon-profile.php', 'akses-ojs.php',
            'lupa-password.php', 'register-kader.php', 'status-ttd.php',
            'generate-qr.php'
        ];

        const currentPage = window.location.pathname.split('/').pop();
        let hasAccess = false;
        let userRole = loggedInUser ? loggedInUser.role : 'public';

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
            return false;
        }

        // Update common UI elements (navbar, etc.)
        const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';
        const defaultTitle = 'PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung';

        if (headerTitleText) {
            headerTitleText.textContent = (userRole !== 'public') ? loggedInTitle : defaultTitle;
        }
        if (mobileHeaderTitleText) {
            mobileHeaderTitleText.textContent = (userRole !== 'public') ? loggedInTitle : defaultTitle;
        }

        // Handle Auth Link (Login/Logout button)
        if (authLinkMain) {
            authLinkMain.removeEventListener('click', handleAuthClick);
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
            authLinkMain.addEventListener('click', handleAuthClick);
        }
        if (authLinkMobile) {
            authLinkMobile.removeEventListener('click', handleAuthClick);
            if (userRole !== 'public') {
                authLinkMobile.innerHTML = `<i class="fas fa-sign-out-alt"></i><span>Logout</span>`;
                authLinkMobile.classList.add('logout-active');
                authLinkMobile.dataset.action = "logout";
            } else {
                authLinkMobile.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Login</span>`;
                authLinkMobile.classList.remove('logout-active');
                authLinkMobile.classList.add('logged-out-styles');
                authLinkMobile.dataset.action = "login";
            }
            authLinkMobile.addEventListener('click', handleAuthClick);
        }

        // Update desktop menu visibility (assuming these are defined in style.css or parent scripts)
        // This is a simplified version, as the full menu logic is in common functions
        if (desktopKaderMenuContainer) desktopKaderMenuContainer.classList.add('hidden');
        if (desktopAdminMenuContainer) desktopAdminMenuContainer.classList.add('hidden');
        if (userRole === 'komisariat') {
            if (desktopAdminMenuContainer) desktopAdminMenuContainer.classList.remove('hidden');
            // Assuming adminMenuLinks desktop visibility is handled by auth.js based on role
        }

        // Populate mobile menu (function from auth.js)
        populateMobileMenu();

        return true;
    }


    // --- DATA LOADING & FORM FILLING ---
    async function loadSiteSettingsData() {
        try {
            const response = await getSiteSettings();
            if (response && response.data) {
                const settings = response.data;
                siteTitleInput.value = settings.site_title || '';
                siteDescriptionInput.value = settings.site_description || '';
                contactEmailInput.value = settings.contact_email || '';
                contactPhoneInput.value = settings.contact_phone || '';
                siteAddressInput.value = settings.site_address || '';
            } else {
                window.showCustomMessage('Gagal memuat pengaturan umum situs dari server. Menggunakan nilai default.', 'error');
                // Use default values from HTML if API fails
            }
        } catch (error) {
            console.error("Error loading general settings:", error);
            window.showCustomMessage(error.message || "Terjadi kesalahan saat memuat pengaturan umum situs.", "error");
        }
    }

    async function loadAnnouncementSettingsData() {
        try {
            const response = await getHomepageSections(); // Assuming homepage sections contain announcement text
            if (response && response.data) {
                const announcementSection = response.data.find(s => s.section_name === 'hero'); // Assuming announcement is part of hero section
                if (announcementSection && announcementSection.content_json && announcementSection.content_json.announcementText) {
                    announcementTextInput.value = announcementSection.content_json.announcementText;
                } else {
                    announcementTextInput.value = ''; // No announcement text
                }
            } else {
                window.showCustomMessage('Gagal memuat pengaturan pengumuman dari server.', 'error');
            }
        } catch (error) {
            console.error("Error loading announcement settings:", error);
            window.showCustomMessage(error.message || "Terjadi kesalahan saat memuat pengaturan pengumuman.", "error");
        }
    }

    async function loadSocialMediaSettingsData() {
        try {
            const response = await getSocialMediaLinks();
            if (response && response.data) {
                response.data.forEach(link => {
                    if (link.platform === 'instagram') instagramUrlInput.value = link.url || '';
                    else if (link.platform === 'facebook') facebookUrlInput.value = link.url || '';
                    else if (link.platform === 'twitter') twitterUrlInput.value = link.url || '';
                    else if (link.platform === 'youtube') youtubeUrlInput.value = link.url || '';
                });
            } else {
                window.showCustomMessage('Gagal memuat tautan media sosial dari server. Menggunakan nilai default.', 'error');
                // Use default values from HTML if API fails
            }
        } catch (error) {
            console.error("Error loading social media settings:", error);
            window.showCustomMessage(error.message || "Terjadi kesalahan saat memuat tautan media sosial.", "error");
        }
    }

    // --- FORM SUBMISSION HANDLERS ---
    // General Settings Form Submission
    generalSettingsForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const settings = {
            site_title: formData.get('siteTitle'),
            site_description: formData.get('siteDescription'),
            contact_email: formData.get('contactEmail'),
            contact_phone: formData.get('contactPhone'),
            site_address: formData.get('siteAddress')
        };

        try {
            const response = await updateSiteSettings(settings); // Assuming updateSiteSettings takes the full settings object
            if (response && response.success) {
                window.showCustomMessage('Pengaturan umum berhasil disimpan!', 'success');
            } else {
                throw new Error(response.message || 'Gagal menyimpan pengaturan umum.');
            }
        } catch (error) {
            console.error('Error updating general settings:', error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat menyimpan pengaturan umum.', 'error');
        }
    });

    // Announcement Settings Form Submission
    announcementSettingsForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const announcementText = announcementTextInput.value.trim();

        try {
            // Update the 'hero' homepage section with new announcement text
            const response = await updateHomepageSection('hero', { announcementText: announcementText });
            if (response && response.success) {
                window.showCustomMessage('Pengumuman situs berhasil diperbarui!', 'success');
            } else {
                throw new Error(response.message || 'Gagal memperbarui pengumuman situs.');
            }
        } catch (error) {
            console.error('Error updating announcement settings:', error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat memperbarui pengumuman situs.', 'error');
        }
    });

    // Social Media Settings Form Submission
    socialMediaSettingsForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const platforms = ['instagram', 'facebook', 'twitter', 'youtube'];
        let successCount = 0;
        let errorMessages = [];

        for (const platform of platforms) {
            const inputElement = document.getElementById(`${platform}Url`);
            const url = inputElement.value.trim();

            try {
                // Assuming updateSocialMediaLink updates by platform name and takes { url, is_active }
                const response = await updateSocialMediaLink(platform, { url: url, is_active: (url !== '' && url !== '#') ? 1 : 0 });
                if (response && response.success) {
                    successCount++;
                } else {
                    throw new Error(response.message || `Gagal memperbarui ${platform}.`);
                }
            } catch (error) {
                console.error(`Error updating ${platform} link:`, error);
                errorMessages.push(`Gagal memperbarui ${platform}: ${error.message}`);
            }
        }

        if (errorMessages.length > 0) {
            window.showCustomMessage(`Beberapa tautan media sosial gagal disimpan: ${errorMessages.join('; ')}`, 'error');
        } else {
            window.showCustomMessage('Tautan media sosial berhasil disimpan!', 'success');
        }
    });

    // --- FLOATING LABEL LOGIC ---
    function updateLabelClass(input) {
        const label = input.nextElementSibling;
        if (label && label.classList.contains('form-label-modern')) {
            if (input.value.trim() !== '' || (input.tagName === 'SELECT' && input.value !== '')) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        }
    }

    const allInputs = document.querySelectorAll('.form-input-modern');
    allInputs.forEach(input => {
        updateLabelClass(input); // Initial check
        input.addEventListener('input', () => updateLabelClass(input));
        input.addEventListener('change', () => updateLabelClass(input));
        input.addEventListener('blur', () => updateLabelClass(input));
        input.addEventListener('focus', () => {
            const label = input.nextElementSibling;
            if(label && label.classList.contains('form-label-modern')) label.classList.add('active-label-style');
        });
        input.addEventListener('blur', () => {
            const label = input.nextElementSibling;
            updateLabelClass(input);
            if(label && label.classList.contains('form-label-modern')) label.classList.remove('active-label-style');
        });
    });

    // --- INITIALIZATION ---
    const pageCanContinue = await updatePengaturanSitusUI(); // Tunggu hasil pengecekan akses

    if (pageCanContinue) {
        await loadSiteSettingsData();
        await loadAnnouncementSettingsData();
        await loadSocialMediaSettingsData();

        // Setel tahun di footer
        document.getElementById('tahun-footer').textContent = new Date().getFullYear();

        // Scroll to top button functionality
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        if (scrollToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 200) {
                    scrollToTopBtn.classList.remove('hidden');
                    scrollToTopBtn.classList.add('flex');
                } else {
                    scrollToTopBtn.classList.add('hidden');
                    scrollToTopBtn.classList.remove('flex');
                }
            });
            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
});