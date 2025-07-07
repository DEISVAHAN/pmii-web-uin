// public/js/pengaturan-akun-kader.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from './auth.js';
import { getUserById, updateUser, resetUserPassword, deleteUser } from './api.js';

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null; // Ini akan menampung data user yang di-parse dari auth.js/PHP

    // Navbar & Auth Elements
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link'); // ID dari HTML mobile menu
    const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
    const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');

    const authElements = {
        authLinkMain, mobileAuthLink: authLinkMobile, desktopKaderMenuContainer,
        desktopAdminMenuContainer, headerTitleText, mobileHeaderTitleText
    };

    // Panggil updateAuthUI dari modul auth.js untuk menginisialisasi status login di UI
    updateAuthUI(authElements);

    // Dapatkan data pengguna yang login setelah updateAuthUI() dipanggil
    const authData = getAuthData();
    loggedInUser = authData.userData || phpLoggedInUser; // Prioritaskan data dari auth.js/localStorage, fallback ke PHP


    // Elemen spesifik untuk Pengaturan Akun Kader
    const kaderNameHeader = document.getElementById('kader-name-header');
    const authInfoHeader = document.getElementById('auth-info-header'); // Ini adalah tombol Logout/Login di header

    // Elements for Account Settings Form
    const kaderAccountEmail = document.getElementById('kaderAccountEmail');
    const kaderAccountNIM = document.getElementById('kaderAccountNIM');
    const kaderAccountRole = document.getElementById('kaderAccountRole');
    const kaderAccountRegDate = document.getElementById('kaderAccountRegDate');
    const kaderAccountLastUpdate = document.getElementById('kaderAccountLastUpdate');
    const accountSettingsFormResponse = document.getElementById('account-settings-form-response');
    const accountSettingsForm = document.getElementById('accountSettingsForm');

    // Elements for Change Password Form
    const changePasswordForm = document.getElementById('changePasswordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const changePasswordFormResponse = document.getElementById('change-password-form-response');

    // Elements for Privacy Settings Form
    const privacySettingsForm = document.getElementById('privacySettingsForm');
    const profileVisibilityCheckbox = document.getElementById('profileVisibility');
    const notificationEmailsCheckbox = document.getElementById('notificationEmails');
    const privacySettingsFormResponse = document.getElementById('privacy-settings-form-response');

    // Elements for Delete Account
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    // Elements for Custom Confirmation Modal (for delete)
    const confirmModal = document.getElementById('confirm-modal');
    const closeConfirmModalBtn = document.getElementById('close-confirm-modal-btn');
    const confirmModalMessage = document.getElementById('confirm-modal-message');
    const confirmModalCancelBtn = document.getElementById('confirm-modal-cancel-btn');
    const confirmModalConfirmBtn = document.getElementById('confirm-modal-confirm-btn');
    let confirmCallback = null; // Callback for the confirmation modal


    // --- Fungsi Kotak Pesan Kustom ---
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

    // --- Fungsi Otentikasi & Akses Halaman ---
    async function initializePageAccess() {
        const allowedRolesForThisPage = ['kader'];
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
            window.showCustomMessage("Anda tidak memiliki hak akses ke halaman ini. Silakan login sebagai Kader.", 'error', () => {
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

        // Jika memiliki akses, update nama kader di header
        if (hasAccess) {
            if (kaderNameHeader) {
                kaderNameHeader.textContent = `Halo, ${loggedInUser.full_name || loggedInUser.nama || 'Kader'}`;
                kaderNameHeader.classList.remove('hidden');
            }
        } else {
            if (kaderNameHeader) kaderNameHeader.classList.add('hidden');
        }
        return true;
    }

    // --- LOAD ACCOUNT SETTINGS FROM API ---
    async function loadAccountSettings() {
        if (!loggedInUser || !loggedInUser.user_id) {
            window.showCustomMessage("Pengguna tidak terautentikasi.", "error");
            return;
        }

        try {
            // Asumsi getUserById mengembalikan detail pengguna termasuk email, username/nim, role, dll.
            const response = await getUserById(loggedInUser.user_id);
            if (response && response.data) {
                const userData = response.data;
                kaderAccountEmail.value = userData.email || '';
                kaderAccountNIM.value = userData.nim || userData.username || '';
                kaderAccountRole.value = userData.role ? (userData.role.charAt(0).toUpperCase() + userData.role.slice(1)) : '';
                // Asumsi `created_at` untuk tanggal pendaftaran, `updated_at` untuk terakhir diperbarui
                kaderAccountRegDate.value = userData.created_at ? new Date(userData.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Tidak Tersedia';
                kaderAccountLastUpdate.value = userData.updated_at ? new Date(userData.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Tidak Tersedia';
                
                // Load privacy settings if available (assuming these are part of user data or a separate API)
                profileVisibilityCheckbox.checked = userData.profile_visibility === 1; // Assuming 1 for public, 0 for private
                notificationEmailsCheckbox.checked = userData.receive_notifications === 1; // Assuming 1 for true, 0 for false

            } else {
                window.showCustomMessage("Gagal memuat pengaturan akun Anda.", "error");
            }
        } catch (error) {
            console.error("Error loading account settings:", error);
            window.showCustomMessage(error.message || "Terjadi kesalahan saat memuat pengaturan akun.", "error");
        } finally {
            // Update floating labels after loading
            allInputs.forEach(input => {
                const label = input.nextElementSibling; // Adjust if label is not direct sibling
                if (label && label.classList.contains('form-label-modern')) {
                    if (input.value.trim() !== '' || (input.tagName === 'SELECT' && input.value !== '')) {
                        input.classList.add('has-value');
                    } else {
                        input.classList.remove('has-value');
                    }
                }
            });
        }
    }


    // --- FORM SUBMISSION HANDLERS ---
    // Account Settings Form Submission
    accountSettingsForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!loggedInUser || !loggedInUser.user_id) {
            window.showCustomMessage('Anda harus login untuk menyimpan pengaturan akun.', 'error');
            return;
        }

        const updatedData = {
            email: kaderAccountEmail.value.trim()
            // role, nim/username, etc. should not be editable from here usually
            // but if they were, include them here.
        };

        try {
            const response = await updateUser(loggedInUser.user_id, updatedData);
            if (response && response.success) {
                window.showCustomMessage('Pengaturan akun berhasil disimpan!', 'success');
                // Update local loggedInUser to reflect changes
                loggedInUser.email = updatedData.email;
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(loggedInUser));
                loadAccountSettings(); // Reload to update "Last Updated" date
            } else {
                throw new Error(response.message || 'Gagal menyimpan pengaturan akun.');
            }
        } catch (error) {
            console.error('Error updating account settings:', error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat menyimpan pengaturan akun.', 'error');
        }
    });

    // Change Password Form Submission
    changePasswordForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!loggedInUser || !loggedInUser.user_id) {
            window.showCustomMessage('Anda harus login untuk mengubah password.', 'error');
            return;
        }

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        // Basic validation (backend should also validate securely)
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            window.showCustomMessage('Semua kolom password wajib diisi.', 'error');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            window.showCustomMessage('Password baru dan konfirmasi tidak cocok.', 'error');
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            window.showCustomMessage('Password baru harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.', 'error');
            return;
        }
        if (newPassword === currentPassword) {
            window.showCustomMessage('Password baru tidak boleh sama dengan password saat ini.', 'error');
            return;
        }


        try {
            // Asumsi resetUserPassword bisa digunakan untuk mengubah password (memerlukan current_password)
            // Atau Anda memiliki API terpisah seperti changePassword(userId, currentPassword, newPassword)
            const response = await resetUserPassword(loggedInUser.user_id, newPassword, currentPassword);
            if (response && response.success) {
                window.showCustomMessage('Password berhasil diubah!', 'success');
                changePasswordForm.reset(); // Reset form
                // Update local loggedInUser to reflect new password (only for simulation if stored client-side)
                if(loggedInUser.password) loggedInUser.password = newPassword;
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(loggedInUser));

            } else {
                throw new Error(response.message || 'Gagal mengubah password. Password saat ini mungkin salah.');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat mengubah password.', 'error');
        }
    });

    // Privacy Settings Form Submission
    privacySettingsForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!loggedInUser || !loggedInUser.user_id) {
            window.showCustomMessage('Anda harus login untuk menyimpan pengaturan privasi.', 'error');
            return;
        }

        const profileVisibility = profileVisibilityCheckbox.checked ? 1 : 0; // Convert boolean to 1/0
        const notificationEmails = notificationEmailsCheckbox.checked ? 1 : 0; // Convert boolean to 1/0

        const updatedPrivacyData = {
            profile_visibility: profileVisibility,
            receive_notifications: notificationEmails
        };

        try {
            const response = await updateUser(loggedInUser.user_id, updatedPrivacyData);
            if (response && response.success) {
                window.showCustomMessage('Pengaturan privasi berhasil disimpan!', 'success');
                // Update local loggedInUser
                loggedInUser.profile_visibility = updatedPrivacyData.profile_visibility;
                loggedInUser.receive_notifications = updatedPrivacyData.receive_notifications;
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(loggedInUser));
            } else {
                throw new Error(response.message || 'Gagal menyimpan pengaturan privasi.');
            }
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat menyimpan pengaturan privasi.', 'error');
        }
    });

    // Delete Account Functionality
    deleteAccountBtn?.addEventListener('click', function() {
        if (!loggedInUser || !loggedInUser.user_id) {
            window.showCustomMessage('Tidak ada akun yang sedang login untuk dihapus.', 'error');
            return;
        }
        window.showCustomConfirm(
            'Konfirmasi Hapus Akun',
            `Apakah Anda yakin ingin menghapus akun Anda (${loggedInUser.full_name || loggedInUser.nama || loggedInUser.nim})? Tindakan ini tidak dapat dibatalkan.`,
            async function() { // Callback on confirmation
                try {
                    const response = await deleteUser(loggedInUser.user_id);
                    if (response && response.success) {
                        window.showCustomMessage('Akun berhasil dihapus!', 'success', () => {
                            // Trigger fade-out animation then redirect
                            document.body.classList.add('fade-out-page');
                            setTimeout(() => {
                                // Clear local storage and redirect
                                localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
                                localStorage.removeItem('authToken'); // Clear auth token too
                                window.location.assign('../index.php'); // Redirect after deletion
                            }, 500); // Match CSS transition duration
                        });
                    } else {
                        throw new Error(response.message || 'Gagal menghapus akun.');
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    window.showCustomMessage(error.message || 'Terjadi kesalahan saat menghapus akun.', 'error');
                }
            }
        );
    });

    // --- INITIALIZATION ---
    const pageCanContinue = await initializePageAccess(); // Tunggu hasil pengecekan akses

    if (pageCanContinue) {
        await loadAccountSettings(); // Muat pengaturan akun dari API

        // Setel tahun di footer
        document.getElementById('tahun-footer-kader-settings').textContent = new Date().getFullYear();

        // Scroll to top button functionality
        const scrollToTopBtnKaderSettings = document.getElementById('scrollToTopBtnKaderSettings');
        if (scrollToTopBtnKaderSettings) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 200) {
                    scrollToTopBtnKaderSettings.classList.remove('hidden');
                    scrollToTopBtnKaderSettings.classList.add('flex');
                } else {
                    scrollToTopBtnKaderSettings.classList.add('hidden');
                    scrollToTopBtnKaderSettings.classList.remove('flex');
                }
            });
            scrollToTopBtnKaderSettings.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
});