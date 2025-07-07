// public/js/notifikasi.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getMyNotifications, getSentNotifications, sendManualNotification, deleteNotification, getUsers, getAllRayons } from './api.js'; // Impor API yang diperlukan

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;
    let allUsers = []; // Untuk daftar penerima notifikasi

    // Navbar & Auth Elements (dari index.php)
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');

    // Admin/Kader Links Map (dari index.php)
    const adminMenuLinks = {
        manajemenAkun: { desktop: document.getElementById('manajemen-akun-link-desktop') },
        manajemenKader: { desktop: document.getElementById('manajemen-kader-link-desktop') },
        repositoryIlmiah: { desktop: document.getElementById('repository-ilmiah-link-desktop') },
        pengajuanSurat: { desktop: document.getElementById('pengajuan-surat-link-desktop') },
        verifikasiSurat: { desktop: document.getElementById('verifikasi-surat-link-desktop') },
        kelolaNotifikasi: { desktop: document.getElementById('kelola-notifikasi-link-desktop') }, // New
        dashboardRayon: { desktop: document.getElementById('admin-dashboard-rayon-link-desktop') },
        adminDashboard: { desktop: document.getElementById('admin-dashboard-komisariat-link-desktop') },
        editBeranda: { desktop: document.getElementById('edit-beranda-link-desktop') },
        jurnalAlHarokahAdmin: { desktop: document.getElementById('jurnal-alharokah-link-desktop-admin') },
        editProfilKader: { desktop: document.getElementById('edit-profil-kader-link-desktop') },
        pengaturanAkunKader: { desktop: document.getElementById('pengaturan-akun-kader-link-desktop') },
        jurnalAlHarokahKader: { desktop: document.getElementById('jurnal-alharokah-link-desktop-kader') },
        pengajuanSuratKader: { desktop: document.getElementById('pengajuan-surat-link-desktop-kader') },
        verifikasiKontenRayon: { desktop: document.getElementById('verifikasi-konten-link-desktop') },
        tambahBeritaRayon: { desktop: document.getElementById('rayon-tambah-berita-link-desktop') },
        tambahKegiatanRayon: { desktop: document.getElementById('rayon-tambah-kegiatan-link-desktop') },
        tambahGaleriRayon: { desktop: document.getElementById('rayon-tambah-galeri-link-desktop') },
        editProfilRayon: { desktop: document.getElementById('edit-profil-rayon-link-desktop') },
        pengaturanSitus: { desktop: document.getElementById('pengaturan-situs-link-desktop') },
        dashboardStatistik: { desktop: document.getElementById('dashboard-statistik-link-desktop') },
        laporanAnalisis: { desktop: document.getElementById('laporan-analisis-link-desktop') },
        ttdDigital: { desktop: document.getElementById('ttd-digital-link-desktop') },
        arsiparisKepengurusan: { desktop: document.getElementById('arsiparis-kepengurusan-link-desktop') },
        notifikasiGeneral: { desktop: document.getElementById('notifikasi-link-desktop-general') } // Notifikasi link for all users
    };

    const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
    const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu-button');
    const mobileMenuContent = document.getElementById('mobile-menu-content');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileNavLinksContainer = document.getElementById('mobile-nav-links');


    // Elemen DOM spesifik untuk halaman notifikasi
    const notificationBadge = document.getElementById('notification-badge');
    const receivedNotificationListContainer = document.getElementById('received-notification-list');
    const emptyReceivedNotificationsState = document.getElementById('empty-received-notifications');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    const adminNotificationPanel = document.getElementById('admin-notification-panel');
    const sendNotificationForm = document.getElementById('sendNotificationForm');
    const notificationTitleInput = document.getElementById('notificationTitle');
    const notificationMessageInput = document.getElementById('notificationMessage');
    const notificationRecipientSelect = document.getElementById('notificationRecipient');
    const notificationTypeSelect = document.getElementById('notificationType');
    const sendNotificationFormResponse = document.getElementById('send-notification-form-response');
    const sentNotificationsListContainer = document.getElementById('sent-notifications-list');
    const emptySentNotificationsState = document.getElementById('empty-sent-notifications');


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
    async function updateAuthUIAndPageAccess() {
        const authData = getAuthData();
        loggedInUser = authData.userData || phpLoggedInUser; // Prioritize actual login data

        let userRole = loggedInUser ? loggedInUser.role : 'public';

        // Update common UI elements like login/logout button and header title
        const defaultTitle = 'PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung';
        const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';

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

        // Hide all desktop admin menu links by default
        for (const key in adminMenuLinks) {
            const desktopLink = adminMenuLinks[key].desktop;
            if(desktopLink) desktopLink.style.display = 'none';
        }

        // Hide desktop menu containers by default
        if(desktopKaderMenuContainer) desktopKaderMenuContainer.classList.add('hidden');
        if(desktopAdminMenuContainer) desktopAdminMenuContainer.classList.add('hidden');

        // Show relevant links based on user role
        if (userRole === 'komisariat') {
            if(desktopAdminMenuContainer) desktopAdminMenuContainer.classList.remove('hidden');
            if (adminMenuLinks.manajemenAkun.desktop) adminMenuLinks.manajemenAkun.desktop.style.display = 'flex';
            if (adminMenuLinks.manajemenKader.desktop) adminMenuLinks.manajemenKader.desktop.style.display = 'flex';
            if (adminMenuLinks.repositoryIlmiah.desktop) adminMenuLinks.repositoryIlmiah.desktop.style.display = 'flex';
            if (adminMenuLinks.pengajuanSurat.desktop) adminMenuLinks.pengajuanSurat.desktop.style.display = 'flex'; // Riwayat Pengajuan
            if (adminMenuLinks.verifikasiSurat.desktop) adminMenuLinks.verifikasiSurat.desktop.style.display = 'flex';
            if (adminMenuLinks.dashboardRayon.desktop) adminMenuLinks.dashboardRayon.desktop.style.display = 'flex';
            if (adminMenuLinks.adminDashboard.desktop) adminMenuLinks.adminDashboard.desktop.style.display = 'flex';
            if (adminMenuLinks.editBeranda.desktop) adminMenuLinks.editBeranda.desktop.style.display = 'flex';
            if (adminMenuLinks.jurnalAlHarokahAdmin.desktop) adminMenuLinks.jurnalAlHarokahAdmin.desktop.style.display = 'flex';
            if (adminMenuLinks.verifikasiKontenRayon.desktop) adminMenuLinks.verifikasiKontenRayon.desktop.style.display = 'flex';
            if (adminMenuLinks.tambahBeritaRayon.desktop) adminMenuLinks.tambahBeritaRayon.desktop.style.display = 'flex'; // Admin Komisariat dapat akses ini
            if (adminMenuLinks.tambahKegiatanRayon.desktop) adminMenuLinks.tambahKegiatanRayon.desktop.style.display = 'flex';
            if (adminMenuLinks.tambahGaleriRayon.desktop) adminMenuLinks.tambahGaleriRayon.desktop.style.display = 'flex';
            if (adminMenuLinks.editProfilRayon.desktop) adminMenuLinks.editProfilRayon.desktop.style.display = 'flex'; // Admin Komisariat dapat akses ini
            if (adminMenuLinks.pengaturanSitus.desktop) adminMenuLinks.pengaturanSitus.desktop.style.display = 'flex';
            if (adminMenuLinks.dashboardStatistik.desktop) adminMenuLinks.dashboardStatistik.desktop.style.display = 'flex';
            if (adminMenuLinks.kelolaNotifikasi.desktop) adminMenuLinks.kelolaNotifikasi.desktop.style.display = 'flex'; // Kelola Notifikasi
            if (adminMenuLinks.laporanAnalisis.desktop) adminMenuLinks.laporanAnalisis.desktop.style.display = 'flex';
            if (adminMenuLinks.ttdDigital.desktop) adminMenuLinks.ttdDigital.desktop.style.display = 'flex';
            if (adminMenuLinks.arsiparisKepengurusan.desktop) adminMenuLinks.arsiparisKepengurusan.desktop.style.display = 'flex';


        } else if (userRole === 'rayon') {
            if(desktopAdminMenuContainer) desktopAdminMenuContainer.classList.remove('hidden');
            if (adminMenuLinks.manajemenKader.desktop) adminMenuLinks.manajemenKader.desktop.style.display = 'flex';
            if (adminMenuLinks.repositoryIlmiah.desktop) adminMenuLinks.repositoryIlmiah.desktop.style.display = 'flex';
            if (adminMenuLinks.pengajuanSurat.desktop) adminMenuLinks.pengajuanSurat.desktop.style.display = 'flex'; // Pengajuan Surat
            if (adminMenuLinks.dashboardRayon.desktop) adminMenuLinks.dashboardRayon.desktop.style.display = 'flex';
            if (adminMenuLinks.jurnalAlHarokahAdmin.desktop) adminMenuLinks.jurnalAlHarokahAdmin.desktop.style.display = 'flex';
            if (adminMenuLinks.verifikasiKontenRayon.desktop) adminMenuLinks.verifikasiKontenRayon.desktop.style.display = 'flex';
            if (adminMenuLinks.tambahBeritaRayon.desktop) adminMenuLinks.tambahBeritaRayon.desktop.style.display = 'flex';
            if (adminMenuLinks.tambahKegiatanRayon.desktop) adminMenuLinks.tambahKegiatanRayon.desktop.style.display = 'flex';
            if (adminMenuLinks.tambahGaleriRayon.desktop) adminMenuLinks.tambahGaleriRayon.desktop.style.display = 'flex';
            if (adminMenuLinks.editProfilRayon.desktop) adminMenuLinks.editProfilRayon.desktop.style.display = 'flex';
            if (adminMenuLinks.arsiparisKepengurusan.desktop) adminMenuLinks.arsiparisKepengurusan.desktop.style.display = 'flex';

        } else if (userRole === 'kader') {
            if(desktopKaderMenuContainer) desktopKaderMenuContainer.classList.remove('hidden');
            if (adminMenuLinks.editProfilKader.desktop) adminMenuLinks.editProfilKader.desktop.style.display = 'flex';
            if (adminMenuLinks.pengaturanAkunKader.desktop) adminMenuLinks.pengaturanAkunKader.desktop.style.display = 'flex';
            if (adminMenuLinks.jurnalAlHarokahKader.desktop) adminMenuLinks.jurnalAlHarokahKader.desktop.style.display = 'flex';
            if (adminMenuLinks.pengajuanSuratKader.desktop) adminMenuLinks.pengajuanSuratKader.desktop.style.display = 'flex';
        }
        // Notifikasi link is always visible if logged in
        if (adminMenuLinks.notifikasiGeneral.desktop) adminMenuLinks.notifikasiGeneral.desktop.style.display = 'flex';


        // Control page access: redirect if not logged in
        const currentPage = window.location.pathname.split('/').pop();
        const internalPages = [
            'dashboard-statistik.php', 'admin-dashboard-komisariat.php',
            'manajemen-akun.php', 'manajemen-kader.php', 'repository-ilmiah.php',
            'pengajuan-surat.php', 'verifikasi-surat.php', 'admin-dashboard-rayon.php',
            'edit-beranda.php', 'akses-ojs.php', 'edit-profil-kader.php',
            'pengaturan-akun-kader.php', 'verifikasi-konten-rayon.php',
            'rayon-tambah-berita.php', 'rayon-tambah-kegiatan.php',
            'rayon-tambah-galeri.php', 'edit-profil-rayon.php',
            'pengaturan-situs.php', 'kelola-notifikasi.php',
            'laporan-analisis.php', 'generate-qr.php', 'arsiparis.php',
            'notifikasi.php', // Add this page to internal pages
            'manajemen-buku-referensi.php', // New
            'manajemen-makalah-kader.php', // New
            'manajemen-naskah-sejarah.php' // New
        ];

        const shouldRedirectToLogin = internalPages.includes(currentPage) && userRole === 'public';

        if (shouldRedirectToLogin) {
            window.showCustomMessage("Anda harus login untuk mengakses halaman ini.", 'error', () => {
                window.location.assign('../login.php');
            });
            // Replace body content to show access denied message
            document.body.innerHTML = `
                <div class="main-content-wrapper flex flex-col items-center justify-center min-h-screen text-center bg-gray-900 text-white p-8">
                    <i class="fas fa-exclamation-triangle text-6xl text-pmii-yellow mb-4 animate-bounce"></i>
                    <h1 class="text-3xl lg:text-4xl font-bold mb-4">Akses Ditolak</h1>
                    <p class="text-lg mb-6">Anda harus login untuk mengakses halaman ini.</p>
                    <a href="../login.php" class="btn btn-primary-pmii text-lg">
                        <i class="fas fa-sign-in-alt mr-2"></i> Kembali ke Login
                    </a>
                </div>
            `;
        }

        // Always populate mobile menu after all desktop link visibility is set
        populateMobileMenu();
    }


    // --- NOTIFICATION MANAGEMENT ---
    /**
     * Mengambil notifikasi yang diterima untuk pengguna yang sedang login dari API.
     */
    async function getReceivedNotificationsForUser() {
        try {
            // Asumsi getMyNotifications mengembalikan notifikasi yang ditujukan untuk user yang login
            const response = await getMyNotifications();
            if (response && response.data) {
                return response.data;
            }
        } catch (error) {
            console.error("Error fetching received notifications:", error);
            window.showCustomMessage("Gagal memuat notifikasi Anda. Silakan coba lagi.", "error");
        }
        return [];
    }

    /**
     * Mengambil notifikasi yang dikirim oleh admin dari API.
     */
    async function getSentNotificationsForAdmin() {
        try {
            // Asumsi getSentNotifications mengembalikan notifikasi yang dikirim oleh user yang login
            const response = await getSentNotifications();
            if (response && response.data) {
                return response.data;
            }
        } catch (error) {
            console.error("Error fetching sent notifications:", error);
            window.showCustomMessage("Gagal memuat notifikasi terkirim. Silakan coba lagi.", "error");
        }
        return [];
    }

    /**
     * Merender daftar notifikasi yang diterima oleh pengguna.
     */
    async function renderReceivedNotifications() {
        const notifications = await getReceivedNotificationsForUser(); // Ambil dari API
        receivedNotificationListContainer.innerHTML = '';

        if (notifications.length === 0) {
            emptyReceivedNotificationsState.classList.remove('hidden');
            markAllReadBtn.classList.add('hidden');
        } else {
            emptyReceivedNotificationsState.classList.add('hidden');
            markAllReadBtn.classList.remove('hidden');

            // Sort newest first
            notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Asumsi created_at field

            notifications.forEach(notif => {
                const notificationCard = document.createElement('div');
                notificationCard.classList.add('notification-card');
                if (notif.status === 'unread') { // Asumsi status adalah 'read'/'unread'
                    notificationCard.classList.add('unread');
                }
                
                let iconClass = 'fas fa-info-circle';
                let iconColorClass = 'text-pmii-blue';
                if (notif.type === 'success') { iconClass = 'fas fa-check-circle'; iconColorClass = 'text-success'; }
                else if (notif.type === 'warning') { iconClass = 'fas fa-exclamation-triangle'; iconColorClass = 'text-warning'; }
                else if (notif.type === 'error') { iconClass = 'fas fa-times-circle'; iconColorClass = 'text-danger'; }

                const timestampDate = new Date(notif.created_at);
                const formattedDate = timestampDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                const formattedTime = timestampDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                notificationCard.innerHTML = `
                    <div class="notification-icon ${iconColorClass}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="notification-content-wrapper">
                        <p class="font-semibold">${notif.title}</p>
                        <p>${notif.message}</p>
                        <div class="notification-meta">
                            <span>${formattedDate} ${formattedTime}</span>
                        </div>
                    </div>
                    <div class="notification-actions">
                        ${notif.status === 'unread' ? `<button class="mark-read-btn" data-id="${notif.id}" title="Tandai sudah dibaca"><i class="fas fa-envelope-open"></i></button>` : ''}
                        <button class="delete-btn" data-id="${notif.id}" title="Hapus notifikasi"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                receivedNotificationListContainer.appendChild(notificationCard);
            });

            receivedNotificationListContainer.querySelectorAll('.mark-read-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    try {
                        // Asumsi ada API untuk menandai notifikasi sudah dibaca
                        // contoh: await markNotificationAsRead(id);
                        const response = await fetch(`/api/notifications/${id}/read`, { method: 'PUT', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });
                        const data = await response.json();
                        if (data.success) {
                            window.showCustomMessage('Notifikasi ditandai sudah dibaca.', 'success');
                            renderReceivedNotifications(); // Reload to reflect changes
                            updateNotificationBadge(); // Update badge
                        } else {
                            throw new Error(data.message || 'Gagal menandai notifikasi sudah dibaca.');
                        }
                    } catch (error) {
                        console.error("Error marking notification as read:", error);
                        window.showCustomMessage(error.message || 'Terjadi kesalahan.', 'error');
                    }
                });
            });
            receivedNotificationListContainer.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    openDeleteModal(id, 'received');
                });
            });
        }

        async function updateNotificationBadge() {
            const notifications = await getReceivedNotificationsForUser();
            const unreadCount = notifications.filter(notif => notif.status === 'unread').length; // Filter berdasarkan status

            if (notificationBadge) {
                if (unreadCount > 0) {
                    notificationBadge.textContent = unreadCount;
                    notificationBadge.classList.remove('hidden');
                } else {
                    notificationBadge.classList.add('hidden');
                }
            }
        }

    // --- ADMIN PANEL FUNCTIONS ---
    async function populateRecipientDropdown() {
        if (!notificationRecipientSelect) return;
        notificationRecipientSelect.innerHTML = `<option value="" disabled selected>Pilih Penerima...</option>
                                               <option value="all">Semua Pengguna</option>
                                               <option value="kader">Semua Kader</option>
                                               <option value="rayon">Semua Admin Rayon</option>`;
        
        try {
            const usersResponse = await getUsers();
            const rayonsResponse = await getAllRayons();
            let allKader = usersResponse.data ? usersResponse.data.filter(u => u.role === 'kader') : [];
            let allRayonsData = rayonsResponse.data || [];

            // Add specific Rayon options
            const rayonGroup = document.createElement('optgroup');
            rayonGroup.label = 'Rayon Spesifik';
            allRayonsData.forEach(rayon => {
                const option = document.createElement('option');
                option.value = `rayon:${rayon.id}`; // Format: role:id
                option.textContent = rayon.name;
                rayonGroup.appendChild(option);
            });
            notificationRecipientSelect.appendChild(rayonGroup);

            // Add specific Kader options
            const kaderGroup = document.createElement('optgroup');
            kaderGroup.label = 'Kader Spesifik';
            allKader.forEach(kader => {
                const option = document.createElement('option');
                option.value = `kader:${kader.user_id}`; // Format: role:id
                option.textContent = `${kader.full_name || kader.name} (${kader.rayon_name || kader.rayon})`;
                kaderGroup.appendChild(option);
            });
            notificationRecipientSelect.appendChild(kaderGroup);

            // Add floating label functionality
            updateLabelClass(notificationRecipientSelect);

        } catch (error) {
            console.error("Error populating recipient dropdown:", error);
            window.showCustomMessage('Gagal memuat daftar penerima notifikasi.', 'error');
        }
    }

    sendNotificationForm?.addEventListener('submit', async function(e) { // Tambahkan async
        e.preventDefault();
        const title = notificationTitleInput?.value.trim();
        const message = notificationMessageInput?.value.trim();
        const recipientValue = notificationRecipientSelect?.value;
        const notificationType = notificationTypeSelect?.value;

        if (!title || !message || !recipientValue || !notificationType) {
            displayMessage(sendNotificationFormResponse, 'Semua kolom wajib diisi.', 'error');
            return;
        }

        let targetRole, targetId;
        if (recipientValue.includes(':')) {
            [targetRole, targetId] = recipientValue.split(':');
        } else {
            targetRole = recipientValue;
            targetId = (targetRole === 'komisariat') ? loggedInUser.user_id : null; // Komisariat target is self
        }

        // Asumsi API sendManualNotification menerima sender_id dan sender_role
        const senderId = loggedInUser.user_id;
        const senderRole = loggedInUser.role;

        try {
            const response = await sendManualNotification({
                title: title,
                message: message,
                type: notificationType,
                target_role: targetRole,
                target_id: targetId, // Can be user_id, rayon_id, or null for general
                sender_id: senderId,
                sender_role: senderRole
            });
            
            if (response && response.success) {
                window.showCustomMessage('Notifikasi berhasil dikirim!', 'success');
                sendNotificationForm.reset();
                allInputs.forEach(input => updateLabelClass(input)); // Update floating labels
                populateRecipientDropdown(); // Reset dropdown state and floating label
                await renderSentNotifications(); // Re-render the admin's sent list
            } else {
                throw new Error(response.message || 'Gagal mengirim notifikasi.');
            }
        } catch (error) {
            console.error("Error sending notification:", error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat mengirim notifikasi.', 'error');
        }
    });

    async function renderSentNotifications() {
        const sentNotifications = await getSentNotificationsForAdmin(); // Ambil dari API
        sentNotificationsListContainer.innerHTML = '';
        if (sentNotifications.length === 0) {
            emptySentNotificationsState.classList.remove('hidden');
        } else {
            emptySentNotificationsState.classList.add('hidden');
            sentNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            sentNotifications.forEach(notif => {
                const notifElement = document.createElement('div');
                notifElement.className = `admin-notification-item`;
                notifElement.setAttribute('data-id', notif.id);

                const targetLabel = getRecipientLabelText(notif.target_role, notif.target_id); // Gunakan target_role, target_id
                const formattedTimestamp = new Date(notif.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                let iconClass = 'fas fa-info-circle'; // Default
                if (notif.type === 'success') iconClass = 'fas fa-check-circle';
                else if (notif.type === 'warning') iconClass = 'fas fa-exclamation-triangle';
                else if (notif.type === 'error') iconClass = 'fas fa-times-circle';

                notifElement.innerHTML = `
                    <div class="icon type-${notif.type}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="content">
                        <strong>${notif.title}</strong>
                        <span>${notif.message}</span>
                        <span class="text-xs text-text-muted mt-1">Penerima: ${targetLabel} - Dikirim: ${formattedTimestamp}</span>
                    </div>
                    <div class="actions">
                        <button title="Hapus Notifikasi" onclick="openDeleteModal(${notif.id}, 'sent')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                sentNotificationsListContainer.appendChild(notifElement);
            });
        }
    }

    // Helper function to get readable recipient label for display
    function getRecipientLabelText(targetRole, targetId) {
        if (targetRole === 'all') return 'Semua Pengguna';
        if (targetRole === 'kader' && !targetId) return 'Semua Kader';
        if (targetRole === 'rayon' && !targetId) return 'Semua Admin Rayon';
        if (targetRole === 'komisariat') return 'Admin Komisariat';

        if (targetRole === 'kader' && targetId) {
            const kader = allUsers.find(k => k.user_id === targetId);
            return kader ? `${kader.full_name || kader.name} (Kader)` : `Kader Spesifik (${targetId})`;
        }
        if (targetRole === 'rayon' && targetId) {
            const rayon = allRayons.find(r => r.id === targetId);
            return rayon ? `${rayon.name}` : `Rayon Spesifik (${targetId})`;
        }
        return targetId || targetRole;
    }

    // --- MODAL LOGIC (DELETE NOTIFICATION) ---
    let notificationToDeleteId = null;
    let notificationListTypeToDelete = null; // 'received' or 'sent'
    const deleteNotificationModal = document.getElementById('deleteNotificationModal');
    const confirmDeleteNotificationBtn = document.getElementById('confirmDeleteNotificationBtn');

    window.openDeleteModal = function(notifId, listType) {
        notificationToDeleteId = notifId;
        notificationListTypeToDelete = listType;
        deleteNotificationModal?.classList.add('active');
    };

    window.closeModal = function(modalId) { // Global helper for modals
        document.getElementById(modalId)?.classList.remove('active');
        notificationToDeleteId = null;
        notificationListTypeToDelete = null;
    };

    confirmDeleteNotificationBtn?.addEventListener('click', async function() {
        if (notificationToDeleteId !== null) {
            try {
                const response = await deleteNotification(notificationToDeleteId);
                if (response && response.success) {
                    window.showCustomMessage('Notifikasi berhasil dihapus!', 'success');
                    closeModal('deleteNotificationModal');
                    // Re-render based on which list the notification was deleted from
                    if (notificationListTypeToDelete === 'received') {
                        await renderReceivedNotifications();
                    } else if (notificationListTypeToDelete === 'sent') {
                        await renderSentNotifications();
                    }
                    updateNotificationBadge();
                } else {
                    throw new Error(response.message || 'Gagal menghapus notifikasi.');
                }
            } catch (error) {
                console.error("Error deleting notification:", error);
                window.showCustomMessage(error.message || 'Terjadi kesalahan saat menghapus notifikasi.', 'error');
            }
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

    // --- HEADER & UI UPDATE FUNCTIONS (from index.php for consistency) ---
    const navbar = document.getElementById('navbar');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    window.addEventListener('scroll', () => {
        if(navbar) navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
        if (scrollToTopBtn) {
            scrollToTopBtn.classList.toggle('hidden', window.pageYOffset <= 300);
            scrollToTopBtn.classList.toggle('flex', window.pageYOffset > 300);
        }
    });

    // Mobile menu functionality
    const mobileMenuContent = document.getElementById('mobile-menu-content');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    function populateMobileMenu() {
        if (!mobileNavLinksContainer || !loggedInUser) return; // Only populate if logged in

        mobileNavLinksContainer.innerHTML = '';

        const generalLinksData = [
            { text: 'Beranda', href: '../index.php', icon: 'fas fa-home' },
            { text: 'Digilib', href: '../digilib.php', icon: 'fas fa-book' }
        ];

        generalLinksData.forEach(linkData => {
            const link = document.createElement('a');
            link.href = linkData.href;
            link.classList.add('mobile-nav-link');
            if (window.location.pathname.includes(linkData.href.split('/').pop())) {
                link.classList.add('active-mobile-link');
            }
            link.innerHTML = `<i class="${linkData.icon}"></i><span>${linkData.text}</span>`;
            mobileNavLinksContainer.appendChild(link);
        });

        // Add System Internal dropdown based on user role
        if (['komisariat', 'rayon', 'kader'].includes(loggedInUser.role)) {
            const systemInternalTitle = document.createElement('div');
            systemInternalTitle.classList.add('mobile-submenu-title');
            systemInternalTitle.textContent = 'Sistem Internal';
            mobileNavLinksContainer.appendChild(systemInternalTitle);

            for (const key in adminMenuLinks) {
                const desktopLink = adminMenuLinks[key].desktop;
                if (desktopLink && getComputedStyle(desktopLink).display !== 'none') {
                    const link = document.createElement('a');
                    link.href = desktopLink.href;
                    link.classList.add('mobile-submenu-item');
                    if (window.location.pathname.includes(link.href.split('/').pop())) {
                        link.classList.add('active-mobile-link');
                    }
                    link.innerHTML = desktopLink.innerHTML;
                    mobileNavLinksContainer.appendChild(link);
                }
            }
        }

        // Notifikasi link for mobile (always shown if logged in)
        const notifMobileLink = document.createElement('a');
        notifMobileLink.href = 'notifikasi.php';
        notifMobileLink.classList.add('mobile-nav-link', 'justify-center');
        if (window.location.pathname.includes('notifikasi.php')) {
            notifMobileLink.classList.add('active-mobile-link');
        }
        notifMobileLink.innerHTML = `<i class="fas fa-bell"></i><span>Notifikasi <span class="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" id="mobile-notification-badge">0</span></span>`;
        mobileNavLinksContainer.appendChild(notifMobileLink);

        // Update mobile badge
        updateNotificationBadge();


        // Add Kontak link
        const kontakLink = document.createElement('a');
        kontakLink.href = '../index.php#kontak';
        kontakLink.classList.add('mobile-nav-link');
        kontakLink.innerHTML = `<i class="fas fa-address-book"></i><span>Kontak</span>`;
        mobileNavLinksContainer.appendChild(kontakLink);

        // Add Logout link
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.id = 'mobile-logout-link';
        logoutLink.classList.add('mobile-nav-link', 'mt-4', 'bg-red-500', 'hover:bg-red-600', 'justify-center');
        logoutLink.innerHTML = `<i class="fas fa-sign-out-alt"></i><span>Logout</span>`;
        logoutLink.addEventListener('click', handleAuthClick);
        mobileNavLinksContainer.appendChild(logoutLink);
    }

    function toggleMobileMenu() {
        const isOpen = mobileMenuContent.classList.contains('hidden');
        if (isOpen) {
            populateMobileMenu();
            mobileMenuContent.classList.remove('hidden');
            mobileMenuOverlay.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        } else {
            mobileMenuContent.classList.add('hidden');
            mobileMenuOverlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }

    if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMobileMenu);
    if (closeMobileMenuButton) closeMobileMenuButton.addEventListener('click', toggleMobileMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', toggleMobileMenu);


    // --- INITIALIZATION ---
    await updateAuthUIAndPageAccess(); // Ini akan menangani otentikasi dan akses halaman

    // Render notifikasi setelah auth dan UI siap
    if (loggedInUser) {
        renderReceivedNotifications();
        if (loggedInUser.role === 'komisariat') { // Only Komisariat admin can see sent notifications panel
            adminNotificationPanel.classList.remove('hidden');
            populateRecipientDropdown();
            renderSentNotifications();
        }
    }

    // Setel tahun di footer
    document.getElementById('tahun-footer').textContent = new Date().getFullYear();

    // Scroll to top button functionality
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
});