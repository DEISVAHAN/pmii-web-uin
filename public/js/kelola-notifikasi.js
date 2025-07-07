// public/dashboard/kelola-notifikasi.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from '../js/auth.js';
import { 
    getSentNotifications, 
    sendManualNotification, 
    deleteNotification, 
    triggerAutomaticNotifications,
    getUsers, // Untuk mendapatkan daftar pengguna (kader, admin rayon, admin komisariat)
    getAllRayons, // Untuk mendapatkan daftar rayon
    getApprovedNews, // Untuk notifikasi otomatis berita
    getApprovedActivities // Untuk notifikasi otomatis kegiatan
} from '../js/api.js';

document.addEventListener('DOMContentLoaded', async function () {
    // Define the base path for local file system navigation
    const BASE_PATH = window.location.origin; // Dynamically get origin

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null; 
    
    // Navbar & Auth Elements
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const mobileAuthLink = document.getElementById('mobile-logout-link'); // Mobile auth link
    const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
    const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');

    // Specific Page Elements (Kelola Notifikasi)
    const automaticNotificationSection = document.getElementById('automatic-notification-section');
    const notificationsList = document.getElementById('notifications-list');
    const notificationTitleInput = document.getElementById('notificationTitle');
    const notificationMessageInput = document.getElementById('notificationMessage');
    const notificationRecipientSelect = document.getElementById('notificationRecipient');
    const notificationTypeSelect = document.getElementById('notificationType');
    const sendNotificationFormResponse = document.getElementById('send-notification-form-response');
    const searchSentNotificationsInput = document.getElementById('searchSentNotifications');
    const emptySentNotificationsState = document.getElementById('empty-sent-notifications');
    const triggerAutoNotificationBtn = document.getElementById('triggerAutoNotificationBtn');
    const automaticNotificationResponse = document.getElementById('automatic-notification-response');
    const deleteNotificationModal = document.getElementById('deleteNotificationModal');
    const confirmDeleteNotificationBtn = document.getElementById('confirmDeleteNotificationBtn');
    const customConfirmModal = document.getElementById('customConfirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    let currentConfirmCallback = null; 

    // Admin/Kader Links Map: Stores references to both desktop and mobile link elements
    const adminMenuLinks = {
        manajemenAkun: { desktop: document.getElementById('manajemen-akun-link-desktop') },
        manajemenKader: { desktop: document.getElementById('manajemen-kader-link-desktop') },
        repositoryIlmiah: { desktop: document.getElementById('repository-ilmiah-link-desktop') },
        pengajuanSurat: { desktop: document.getElementById('pengajuan-surat-link-desktop') },
        verifikasiSurat: { desktop: document.getElementById('verifikasi-surat-link-desktop') },
        dashboardRayon: { desktop: document.getElementById('dashboard-rayon-link-desktop') },
        adminDashboard: { desktop: document.getElementById('admin-dashboard-link-desktop') },
        editBeranda: { desktop: document.getElementById('edit-beranda-link-desktop') },
        jurnalAlharokahAdmin: { desktop: document.getElementById('jurnal-alharokah-link-desktop-admin') },
        editProfilKader: { desktop: document.getElementById('edit-profil-kader-link-desktop') },
        pengaturanAkunKader: { desktop: document.getElementById('pengaturan-akun-kader-link-desktop') },
        jurnalAlharokahKader: { desktop: document.getElementById('jurnal-alharokah-link-desktop-kader') },
        pengajuanSuratKader: { desktop: document.getElementById('pengajuan-surat-link-desktop-kader') },
        verifikasiKontenRayon: { desktop: document.getElementById('verifikasi-konten-link-desktop') },
        tambahBeritaRayon: { desktop: document.getElementById('tambah-berita-link-desktop') },
        tambahKegiatanRayon: { desktop: document.getElementById('tambah-kegiatan-link-desktop') },
        tambahGaleriRayon: { desktop: document.getElementById('tambah-galeri-link-desktop') },
        editProfilRayon: { desktop: document.getElementById('edit-profil-rayon-link-desktop') },
        pengaturanSitus: { desktop: document.getElementById('pengaturan-situs-link-desktop') },
        dashboardStatistik: { desktop: document.getElementById('dashboard-statistik-link-desktop') },
        kelolaNotifikasi: { desktop: document.getElementById('kelola-notifikasi-link-desktop') },
        laporanAnalisis: { desktop: document.getElementById('laporan-analisis-link-desktop') },
        ttdDigital: { desktop: document.getElementById('ttd-digital-link-desktop') },
        arsiparisKepengurusan: { desktop: document.getElementById('arsiparis-kepengurusan-link-desktop') }
    };

    // --- UI Update Logic ---
    /**
     * Updates the UI (navbar links) based on the logged-in user's role.
     */
    function updateAdminUI() {
        const defaultTitle = 'PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung';
        const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';
        const loginText = "Login";
        const logoutText = "Logout";
        const loggedInStylesAuthLink = "logout-active";
        const loggedOutStylesAuthLinkClasses = ["bg-pmii-yellow", "text-pmii-blue", "hover:bg-yellow-400"];

        // Update header title based on loggedInUser status
        if (headerTitleText) {
            headerTitleText.textContent = (loggedInUser && (loggedInUser.role === 'rayon' || loggedInUser.role === 'komisariat' || loggedInUser.role === 'kader')) ? loggedInTitle : defaultTitle;
        }
        if (mobileHeaderTitleText) {
            mobileHeaderTitleText.textContent = (loggedInUser && (loggedInUser.role === 'rayon' || loggedInUser.role === 'komisariat' || loggedInUser.role === 'kader')) ? loggedInTitle : defaultTitle;
        }

        // Hide all admin/kader-related links on desktop by default
        for (const key in adminMenuLinks) {
            const desktopLink = adminMenuLinks[key].desktop;
            if (desktopLink) {
                desktopLink.style.display = 'none';
            }
        }

        // Hide main admin/kader menu containers by default
        if(desktopAdminMenuContainer) desktopAdminMenuContainer.classList.add('hidden');
        if(desktopKaderMenuContainer) desktopKaderMenuContainer.classList.add('hidden');

        // Check if current page is allowed for the logged-in user
        const isKomisariatAdmin = loggedInUser && loggedInUser.role === 'komisariat';
        const isRayonAdmin = loggedInUser && loggedInUser.role === 'rayon';

        // Redirect if not authorized
        if (!isKomisariatAdmin && !isRayonAdmin) {
            showCustomMessage('Anda tidak memiliki hak akses ke halaman ini. Silakan login sebagai Admin Komisariat atau Admin Rayon.', 'error', () => {
                 window.location.assign(`${BASE_PATH}/login.php`); // Redirect to login.php
            });
            return; // Stop execution
        }

        // If Admin (Komisariat or Rayon) is logged in
        [authLinkMain, mobileAuthLink].forEach(link => { 
            if (link) {
                link.textContent = logoutText;
                link.href = "#"; // Keep href="#" for logout to enable preventDefault
                link.classList.remove(...loggedOutStylesAuthLinkClasses);
                link.classList.add(loggedInStylesAuthLink);
                link.removeEventListener('click', handleAuthClick); 
                link.addEventListener('click', handleAuthClick);
            }
        });

        // Show admin menu group and separator for relevant admins
        if(desktopAdminMenuContainer) desktopAdminMenuContainer.classList.remove('hidden');

        // Show only relevant desktop and mobile admin links based on role
        let allowedDesktopLinks = [];
        if (isKomisariatAdmin) {
            allowedDesktopLinks = [
                'manajemenAkun', 'manajemenKader', 'repositoryIlmiah',
                'pengajuanSurat', 'verifikasiSurat', 'adminDashboard',
                'editBeranda', 'jurnalAlharokahAdmin', 'verifikasiKontenRayon',
                'editProfilRayon', 'pengaturanSitus', 'dashboardStatistik',
                'kelolaNotifikasi', 'laporanAnalisis', 'ttdDigital', 'arsiparisKepengurusan'
            ];
        } else if (isRayonAdmin) {
             allowedDesktopLinks = [
                'manajemenKader', 'repositoryIlmiah', 'pengajuanSurat',
                'dashboardRayon', 'jurnalAlharokahAdmin', 'verifikasiKontenRayon',
                'tambahBeritaRayon', 'tambahKegiatanRayon', 'tambahGaleriRayon', 'editProfilRayon'
            ];
        }

        Object.keys(adminMenuLinks).forEach(key => {
            if (allowedDesktopLinks.includes(key)) {
                const desktopLink = adminMenuLinks[key].desktop;
                if (desktopLink) {
                    desktopLink.style.display = 'flex'; // Use flex to align icon and text
                }
            }
        });

        // Adjust Automatic Notification Section visibility
        if (automaticNotificationSection) {
            if (isRayonAdmin) {
                automaticNotificationSection.classList.add('hidden'); // Hide for Rayon Admin
            } else {
                automaticNotificationSection.classList.remove('hidden'); // Show for Komisariat Admin
            }
        }

        // Adjust back to dashboard link
        const backToDashboardLink = document.getElementById('back-to-dashboard-link');
        if (backToDashboardLink) {
            if (isRayonAdmin) {
                backToDashboardLink.href = `${BASE_PATH}/dashboard/admin-dashboard-rayon.html`;
                backToDashboardLink.innerHTML = `<i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard Admin Rayon`;
            } else {
                backToDashboardLink.href = `${BASE_PATH}/dashboard/admin-dashboard-komisariat.html`;
                backToDashboardLink.innerHTML = `<i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard Admin Kom.`;
            }
        }

        // Highlight active link for current page (including 'Kelola Notifikasi' itself)
        const currentPagePath = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-link, .dropdown-menu a, .mobile-nav-link, .mobile-submenu-item').forEach(link => {
            link.classList.remove('active-nav-link');
            if (link.href) {
                let normalizedLinkHref = link.href.replace(BASE_PATH, '');
                if (normalizedLinkHref.startsWith('/')) {
                    normalizedLinkHref = normalizedLinkHref.substring(1);
                }
                const linkHrefPage = normalizedLinkHref.split('/').pop().split('#')[0];

                if (linkHrefPage === currentPagePath.split('#')[0] && currentPagePath !== "") {
                    link.classList.add('active-nav-link');
                }
            }
        });

        populateRecipientDropdown(); // Call to populate dropdown based on role
    }

    /**
     * Custom message box function to replace alert() and confirm().
     * @param {string} message - The message to display.
     * @param {string} type - 'success', 'error', 'info', 'warning'.
     * @param {Function} [callback] - Optional callback function to run after message fades out.
     */
    function showCustomMessage(message, type = 'info', callback = null) {
        const messageBox = document.getElementById('customMessageBox');
        messageBox.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i> <span>${message}</span>`;
        messageBox.className = 'custom-message-box'; // Reset classes

        if (type === 'success') {
            messageBox.classList.add('bg-green-500');
        } else if (type === 'error') {
            messageBox.classList.add('bg-red-500');
        } else if (type === 'warning') {
            messageBox.classList.add('bg-yellow-500', 'text-gray-900');
        } else {
            messageBox.classList.add('bg-blue-500');
        }

        messageBox.classList.add('show');

        setTimeout(() => {
            messageBox.classList.remove('show');
            if (callback) {
                messageBox.addEventListener('transitionend', function handler() {
                    callback();
                    messageBox.removeEventListener('transitionend', handler);
                });
            }
        }, 3000);
    }

    /**
     * Handles authentication clicks (login/logout).
     * @param {Event} e - The click event object.
     */
    function handleAuthClick(e) {
        const action = e.target.dataset.action;

        if (action === 'logout') {
            e.preventDefault(); 
            showCustomConfirm('Konfirmasi Logout', 'Apakah Anda yakin ingin logout?', () => {
                document.body.classList.add('fade-out-page');
                setTimeout(() => {
                    handleLogout();
                    const tempLink = document.createElement('a');
                    tempLink.href = `${BASE_PATH}/index.php`;
                    tempLink.style.display = 'none';
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    document.body.removeChild(tempLink);
                }, 500);
            }, () => {
                showCustomMessage('Logout dibatalkan.', 'info');
            });
        } else if (action === 'login') {
            window.location.href = `${BASE_PATH}/login.php`;
        }
    }

    /**
     * Shows a custom confirmation modal.
     * @param {string} title - The title of the confirmation modal.
     * @param {string} message - The message to display in the modal.
     * @param {Function} onConfirm - Callback function to execute if 'Ya' is clicked.
     * @param {Function} [onCancel] - Optional callback function to execute if 'Tidak' is clicked.
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
    if(customConfirmModal) {
        customConfirmModal.addEventListener('click', function(event) {
            if (event.target === customConfirmModal) {
                hideCustomConfirm();
            }
        });
    }

    // --- Mobile menu functionality ---
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            populateMobileMenu();
            toggleMobileMenu();
        });
    }
    if (closeMobileMenuButton) {
        closeMobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', toggleMobileMenu);
    }

    /**
     * Function to populate mobile menu dynamically based on user role and available desktop links
     */
    function populateMobileMenu() {
        if (!mobileNavLinksContainer) return;

        mobileNavLinksContainer.innerHTML = '';

        const generalLinksData = [
            { text: 'Beranda', href: `${BASE_PATH}/index.php#beranda`, icon: 'fas fa-home' },
            { text: 'Tentang Kami', href: `${BASE_PATH}/tentang-kami.php`, icon: 'fas fa-info-circle' },
            { text: 'Berita', href: `${BASE_PATH}/berita-artikel.php`, icon: 'fas fa-newspaper' },
            { text: '📚 Digilib', href: `${BASE_PATH}/digilib.php`, icon: 'fas fa-book-reader' },
            { text: 'Kegiatan', href: `${BASE_PATH}/agenda-kegiatan.php`, icon: 'fas fa-calendar-alt' },
            { text: 'Galeri', href: `${BASE_PATH}/galeri-foto.php`, icon: 'fas fa-images' }
        ];

        generalLinksData.forEach(linkData => {
            const link = document.createElement('a');
            link.href = linkData.href;
            link.classList.add('mobile-nav-link');
            const currentPagePath = window.location.pathname.split('/').pop();
            const linkHrefPage = link.href.split('/').pop().split('#')[0];
            if (linkHrefPage === currentPagePath.split('#')[0]) {
                link.classList.add('active-nav-link');
            }
            link.innerHTML = `<i class="${linkData.icon}"></i><span>${linkData.text}</span>`;
            link.addEventListener('click', toggleMobileMenu);
            mobileNavLinksContainer.appendChild(link);
        });

        const authData = getAuthData();
        const currentUserRole = authData.userData ? authData.userData.user_role : 'public';

        if (currentUserRole === 'kader' || currentUserRole === 'rayon' || currentUserRole === 'komisariat') {
            const systemInternalTitle = document.createElement('div');
            systemInternalTitle.classList.add('mobile-submenu-title');
            systemInternalTitle.textContent = currentUserRole === 'kader' ? 'Profil Kader' : 'Sistem Internal';
            mobileNavLinksContainer.appendChild(systemInternalTitle);

            for (const key in adminMenuLinks) {
                const desktopLink = adminMenuLinks[key].desktop;
                if (desktopLink && window.getComputedStyle(desktopLink).display !== 'none') {
                    const link = document.createElement('a');
                    link.href = `${BASE_PATH}${desktopLink.getAttribute('href').startsWith('/') ? '' : '/'}${desktopLink.getAttribute('href')}`; // Adjust path
                    link.classList.add('mobile-submenu-item');
                    const currentPagePath = window.location.pathname.split('/').pop();
                    const linkHrefPage = link.href.split('/').pop().split('#')[0];
                    if (linkHrefPage === currentPagePath.split('#')[0]) {
                        link.classList.add('active-nav-link');
                    }
                    link.innerHTML = desktopLink.innerHTML;
                    link.addEventListener('click', toggleMobileMenu);
                    mobileNavLinksContainer.appendChild(link);
                }
            }
        }
        
        const kontakLink = document.createElement('a');
        kontakLink.href = `${BASE_PATH}/index.php#kontak`;
        kontakLink.classList.add('mobile-nav-link');
        const currentPagePath = window.location.pathname.split('/').pop();
        const linkHrefPage = kontakLink.href.split('/').pop().split('#')[0];
        if (linkHrefPage === currentPagePath.split('#')[0]) {
            kontakLink.classList.add('active-nav-link');
        }
        kontakLink.innerHTML = `<i class="fas fa-address-book"></i><span>Kontak</span>`;
        kontakLink.addEventListener('click', toggleMobileMenu);
        mobileNavLinksContainer.appendChild(kontakLink);

        const authLink = mobileAuthLink; // Use the already defined mobileAuthLink
        if (authLink) {
            authLink.removeEventListener('click', handleAuthClick);
            authLink.addEventListener('click', handleAuthClick);

            if (loggedInUser) {
                authLink.classList.add('bg-red-500', 'hover:bg-red-600', 'logout-active');
                authLink.classList.remove('logged-out-styles');
                authLink.innerHTML = `<i class="fas fa-sign-out-alt"></i><span>Logout</span>`;
                authLink.dataset.action = "logout";
            } else {
                authLink.classList.remove('bg-red-500', 'hover:bg-red-600', 'logout-active');
                authLink.classList.add('logged-out-styles');
                authLink.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Login</span>`;
                authLink.dataset.action = "login";
            }
        }
    }

    /**
     * Toggles the visibility of the mobile menu and its overlay.
     */
    function toggleMobileMenu() {
        const isOpen = mobileMenuContent.classList.contains('menu-active');
        if (!isOpen) {
            mobileMenuContent.classList.add('menu-active');
            mobileMenuOverlay.classList.add('menu-active');
            document.body.classList.add('overflow-hidden');
        } else {
            mobileMenuContent.classList.remove('menu-active');
            mobileMenuOverlay.classList.remove('menu-active');
            document.body.classList.remove('overflow-hidden');
        }
    }

    // --- Main Execution on DOMContentLoaded ---
    // Load user authentication status from PHP injected data
    loggedInUser = window.phpLoggedInUser;

    updateAdminUI(); // Update UI based on logged-in user

    // --- Event Listeners ---
    // Smooth scroll for internal navigation links (not strictly needed for kelola-notifikasi, but harmless)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            if (this.getAttribute('href') === '#') {
                return;
            }
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar sticky and scroll to top button
    const navbar = document.getElementById('navbar');
    const scrollToTopBtnEl = document.getElementById('scrollToTopBtn');
    window.addEventListener('scroll', () => {
        if (scrollToTopBtnEl) {
            scrollToTopBtnEl.classList.toggle('hidden', window.pageYOffset <= 300);
            scrollToTopBtnEl.classList.toggle('flex', window.pageYOffset > 300);
        }
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }
    });

    // Function to update floating label class
    function updateLabelClass(input) {
        const label = input.nextElementSibling;
        if (label && label.classList.contains('form-label-modern')) {
            if (input.tagName === 'SELECT') {
                if (input.value !== '') {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            } else {
                if (input.value.trim() !== '') {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            }
        }
    }

    // Initialize floating labels for all inputs
    const allInputs = document.querySelectorAll('.form-input-modern');
    allInputs.forEach(input => {
        updateLabelClass(input);
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

    // --- Main Notification Logic (API Calls) ---
    async function renderNotifications() {
        if (!notificationsList) return;
        notificationsList.innerHTML = '<p class="text-text-muted text-center py-4">Memuat notifikasi...</p>';
        emptySentNotificationsState.classList.add('hidden');

        const searchQuery = searchSentNotificationsInput.value.toLowerCase();
        
        try {
            const response = await getSentNotifications(); // Fetch all sent notifications
            let notifications = response.data || [];

            // Filter based on sender (only show notifications sent by the current admin's role and ID)
            // And apply search query filter
            let filteredNotifications = notifications.filter(notif => {
                const isSenderMatch = notif.sender_role === loggedInUser.role && notif.sender_id === loggedInUser.user_id;
                const isSearchMatch = (notif.title.toLowerCase().includes(searchQuery) || 
                                       notif.content.toLowerCase().includes(searchQuery) || 
                                       getRecipientLabel(notif.target_role, notif.target_id).toLowerCase().includes(searchQuery));
                return isSenderMatch && isSearchMatch;
            });

            notificationsList.innerHTML = '';
            if (filteredNotifications.length === 0) {
                notificationsList.innerHTML = '<p class="text-text-muted text-center py-4">Tidak ada notifikasi terkirim yang cocok dengan pencarian Anda.</p>';
                emptySentNotificationsState.classList.remove('hidden');
            } else {
                emptySentNotificationsState.classList.add('hidden');
                filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                filteredNotifications.forEach(notif => {
                    const notifElement = document.createElement('div');
                    notifElement.className = `notification-item type-${notif.type}`;
                    notifElement.setAttribute('data-id', notif.notification_id); // Use notification_id from API

                    let iconClass = 'fas fa-info-circle';
                    if (notif.type === 'success' || notif.type === 'letter_approved') iconClass = 'fas fa-check-circle';
                    else if (notif.type === 'warning' || notif.type === 'letter_pending') iconClass = 'fas fa-exclamation-triangle';
                    else if (notif.type === 'error' || notif.type === 'letter_revision') iconClass = 'fas fa-times-circle';
                    else if (notif.type === 'rayon_content_verification') iconClass = 'fas fa-check-double';
                    else if (notif.type === 'document_sent') iconClass = 'fas fa-file-export';

                    notifElement.innerHTML = `
                        <div class="icon"><i class="${iconClass}"></i></div>
                        <div class="content">
                            <strong>${notif.title}</strong>
                            <span>${notif.content}</span>
                            <span class="text-xs text-text-muted mt-1">
                                Penerima: ${getRecipientLabel(notif.target_role, notif.target_id)} - Dikirim: ${formatTimestamp(notif.timestamp)}
                            </span>
                        </div>
                        <div class="actions">
                            <button title="Hapus Notifikasi" onclick="openDeleteModal('${notif.notification_id}')">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    `;
                    notificationsList.appendChild(notifElement);
                });
            }
        } catch (error) {
            console.error("Error rendering notifications:", error);
            notificationsList.innerHTML = '<p class="text-red-500 text-center py-4">Gagal memuat notifikasi terkirim.</p>';
            emptySentNotificationsState.classList.remove('hidden');
        }
    }

    // Populate Recipient Dropdown (fetches real user data)
    async function populateRecipientDropdown() {
        if (!notificationRecipientSelect) return;

        notificationRecipientSelect.innerHTML = '<option value=""></option>';
        
        const isKomisariatAdmin = loggedInUser && loggedInUser.role === 'komisariat';
        const isRayonAdmin = loggedInUser && loggedInUser.role === 'rayon';

        try {
            const usersResponse = await getUsers(); // Get all users
            const allUsers = usersResponse.data || [];

            const rayonsResponse = await getAllRayons(); // Get all rayons
            const allRayons = rayonsResponse.data || [];

            if (isKomisariatAdmin) {
                const defaultOptions = [
                    { value: 'all', text: 'Semua Pengguna' },
                    { value: 'kader', text: 'Semua Kader' },
                    { value: 'rayon', text: 'Semua Admin Rayon' }
                ];
                defaultOptions.forEach(optionData => {
                    const option = document.createElement('option');
                    option.value = optionData.value;
                    option.textContent = optionData.text;
                    notificationRecipientSelect.appendChild(option);
                });

                // Add individual Rayon Admins
                allUsers.filter(u => u.user_role === 'rayon').forEach(admin => {
                    const rayon = allRayons.find(r => r.rayon_id === admin.rayon_id);
                    const option = document.createElement('option');
                    option.value = `rayon_admin:${admin.user_id}`; // Use user_id for specific admin
                    option.textContent = `Admin Rayon: ${admin.user_name} (${rayon ? rayon.name : 'N/A'})`;
                    notificationRecipientSelect.appendChild(option);
                });

                // Add individual Kader
                allUsers.filter(u => u.user_role === 'kader').forEach(kader => {
                    const rayon = allRayons.find(r => r.rayon_id === kader.rayon_id);
                    const option = document.createElement('option');
                    option.value = `kader:${kader.user_id}`;
                    option.textContent = `Kader: ${kader.user_name} (${kader.nim_username}) - ${rayon ? rayon.name : 'N/A'}`;
                    notificationRecipientSelect.appendChild(option);
                });

            } else if (isRayonAdmin) {
                const optionAllKader = document.createElement('option');
                optionAllKader.value = 'kader'; // This will be filtered by rayon_id in backend
                optionAllKader.textContent = 'Semua Kader (Rayon Saya)';
                notificationRecipientSelect.appendChild(optionAllKader);

                // Add individual Kader from logged-in user's rayon
                allUsers.filter(u => u.user_role === 'kader' && u.rayon_id === loggedInUser.rayon_id).forEach(kader => {
                    const option = document.createElement('option');
                    option.value = `kader:${kader.user_id}`;
                    option.textContent = `Kader: ${kader.user_name} (${kader.nim_username})`;
                    notificationRecipientSelect.appendChild(option);
                });
            }
            updateLabelClass(notificationRecipientSelect);
        } catch (error) {
            console.error("Error populating recipient dropdown:", error);
            showCustomMessage("Gagal memuat daftar penerima.", "error");
        }
    }

    // Centralized recipient label generation (for display in sent notifications list)
    function getRecipientLabel(recipientCode, recipientId = null) {
        if (recipientCode === 'all') return 'Semua Pengguna';
        if (recipientCode === 'kader' && !recipientId) {
            if (loggedInUser && loggedInUser.role === 'rayon') {
                const currentRayon = allRayons.find(rayon => rayon.rayon_id === loggedInUser.rayon_id);
                return currentRayon ? `Semua Kader (${currentRayon.name})` : `Semua Kader`;
            }
            return 'Semua Kader';
        }
        if (recipientCode === 'rayon' && !recipientId) return 'Semua Admin Rayon';
        if (recipientCode === 'komisariat') return 'Admin Komisariat';

        // For specific recipients, try to find their name
        if (recipientCode === 'kader' && recipientId) {
            const kader = allUsers.find(u => u.user_id === recipientId && u.user_role === 'kader');
            return kader ? `${kader.user_name} (${kader.nim_username})` : `Kader Spesifik (${recipientId})`;
        }
        if (recipientCode === 'rayon_admin' && recipientId) {
            const adminRayon = allUsers.find(u => u.user_id === recipientId && u.user_role === 'rayon');
            const rayon = adminRayon ? allRayons.find(r => r.rayon_id === adminRayon.rayon_id) : null;
            return adminRayon ? `Admin Rayon: ${adminRayon.user_name} (${rayon ? rayon.name : 'N/A'})` : `Admin Rayon Spesifik (${recipientId})`;
        }
        return recipientCode;
    }

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    document.getElementById('sendNotificationForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const title = notificationTitleInput.value.trim();
        const content = notificationMessageInput.value.trim();
        const recipientValue = notificationRecipientSelect.value;
        const notificationType = notificationTypeSelect.value;

        if (!title || !content || !recipientValue || !notificationType) {
            displayMessage(sendNotificationFormResponse, 'Semua kolom wajib diisi.', 'error');
            return;
        }

        let targetRole, targetId = null;
        if (recipientValue.includes(':')) {
            [targetRole, targetId] = recipientValue.split(':');
        } else {
            targetRole = recipientValue;
        }

        const senderRole = loggedInUser.role;
        const senderId = loggedInUser.user_id;

        // Frontend validation for Rayon Admin sending rules
        if (senderRole === 'rayon') {
            if (targetRole === 'all' || targetRole === 'rayon' || targetRole === 'komisariat' || (targetRole === 'rayon_admin' && targetId)) {
                displayMessage(sendNotificationFormResponse, 'Admin Rayon hanya dapat mengirim notifikasi kepada kadernya sendiri.', 'error');
                return;
            }
            if (targetRole === 'kader' && targetId) {
                const targetKader = allUsers.find(u => u.user_id === targetId && u.user_role === 'kader');
                if (!targetKader || targetKader.rayon_id !== loggedInUser.rayon_id) {
                    displayMessage(sendNotificationFormResponse, 'Anda hanya dapat mengirim notifikasi kepada kader dari rayon Anda sendiri.', 'error');
                    return;
                }
            }
        }

        const notificationData = {
            title: title,
            content: content,
            type: notificationType,
            target_role: targetRole,
            target_id: targetId, // Can be null for 'all' or 'all kader/rayon'
            sender_role: senderRole,
            sender_id: senderId
        };

        try {
            const response = await sendManualNotification(notificationData); // API call
            if (response.success) {
                showCustomMessage(response.message || 'Notifikasi berhasil dikirim!', 'success');
                renderNotifications(); // Re-render to show the new notification
                this.reset();
                allInputs.forEach(input => updateLabelClass(input));
                populateRecipientDropdown();
            } else {
                throw new Error(response.message || 'Gagal mengirim notifikasi.');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            displayMessage(sendNotificationFormResponse, error.message || 'Terjadi kesalahan saat mengirim notifikasi.', 'error');
        }
    });

    let notificationToDeleteId = null;
    
    window.openDeleteModal = function(notifId) {
        notificationToDeleteId = notifId;
        if(deleteNotificationModal) deleteNotificationModal.classList.add('active');
    };

    window.closeModal = function(modalId) { // Global function for closing modals
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.remove('active');
    };

    if (confirmDeleteNotificationBtn) {
        confirmDeleteNotificationBtn.addEventListener('click', async function() {
            if (notificationToDeleteId !== null) {
                try {
                    const response = await deleteNotification(notificationToDeleteId); // API call
                    if (response.success) {
                        showCustomMessage(response.message || 'Notifikasi berhasil dihapus.', 'success');
                        renderNotifications(); // Re-render after delete
                    } else {
                        throw new Error(response.message || 'Gagal menghapus notifikasi.');
                    }
                } catch (error) {
                    console.error('Error deleting notification:', error);
                    showCustomMessage(error.message || 'Terjadi kesalahan saat menghapus notifikasi.', 'error');
                } finally {
                    notificationToDeleteId = null;
                    closeModal('deleteNotificationModal');
                }
            }
        });
    }

    // Function to display form messages (used for both manual form and automatic section)
    function displayMessage(containerElement, message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message mb-3 ${type === 'success' ? 'form-message-success' : type === 'error' ? 'form-message-error' : 'form-message-info'}`;
        messageDiv.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'} mr-2"></i>${message}`;

        if (containerElement) {
            containerElement.innerHTML = '';
            containerElement.classList.remove('hidden');
            containerElement.appendChild(messageDiv);

            setTimeout(() => {
                messageDiv.remove();
                containerElement.classList.add('hidden');
            }, 5000);
        }
    }

    // --- Automatic Notification Logic (API Call) ---
    if (triggerAutoNotificationBtn) {
        triggerAutoNotificationBtn.addEventListener('click', async function() {
            if (!loggedInUser || loggedInUser.role !== 'komisariat') {
                displayMessage(automaticNotificationResponse, 'Hanya Admin Komisariat yang dapat memicu notifikasi otomatis.', 'error');
                return;
            }
            try {
                const response = await triggerAutomaticNotifications(); // API call
                if (response.success) {
                    showCustomMessage(response.message || `Berhasil memicu notifikasi otomatis.`, 'success');
                    renderNotifications(); // Update list after triggering
                } else {
                    throw new Error(response.message || 'Gagal memicu notifikasi otomatis.');
                }
            } catch (error) {
                console.error('Error triggering automatic notifications:', error);
                displayMessage(automaticNotificationResponse, error.message || 'Terjadi kesalahan saat memicu notifikasi otomatis.', 'error');
            }
        });
    }

    // --- Initial Load ---
    // Panggil fungsi utama saat DOM siap
    // Check if loggedInUser exists and has the necessary role before rendering notifications
    if (loggedInUser && (loggedInUser.role === 'komisariat' || loggedInUser.role === 'rayon')) {
        renderNotifications(); // Render list notifikasi terkirim
        populateRecipientDropdown(); // Populate dropdown only if admin
    } else {
        if (notificationsList) {
            notificationsList.innerHTML = '<p class="text-text-muted text-center py-4">Silakan login sebagai Admin untuk melihat notifikasi.</p>';
        }
        if (emptySentNotificationsState) {
            emptySentNotificationsState.classList.remove('hidden'); // Show empty state if not admin
        }
        if (automaticNotificationSection) {
            automaticNotificationSection.classList.add('hidden'); // Hide automatic notification section
        }
    }

    // Update footer year
    const tahunFooterKader = document.getElementById('tahun-footer-kader');
    if (tahunFooterKader) {
        tahunFooterKader.textContent = new Date().getFullYear();
    }
});
