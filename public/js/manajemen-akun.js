// public/js/manajemen-akun.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getUsers, createUser, updateUser, deleteUser, resetUserPassword, getAllRayons, getSystemActivityLogs } from './api.js';

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP (diakses melalui window global) ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;
    let allUsers = []; // Akan menampung semua data pengguna dari API
    let allRayons = []; // Akan menampung semua data rayon dari API

    // Navbar & Auth Elements
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

    // Elemen DOM spesifik untuk halaman manajemen akun
    const pageTitle = document.querySelector('.page-title');
    const pageSubtitle = document.querySelector('.page-subtitle');
    const accountsTableBody = document.getElementById('accountsTableBody');
    const addAccountBtn = document.getElementById('addAccountBtn');

    // Modal elements
    const accountModal = document.getElementById('accountModal');
    const accountModalTitle = document.getElementById('accountModalTitle');
    const accountForm = document.getElementById('accountForm');
    const accountIdInput = document.getElementById('accountId'); // Hidden input for ID

    const accountNameInput = document.getElementById('accountName');
    const accountNIMUsernameInput = document.getElementById('accountNIMUsername');
    const accountEmailInput = document.getElementById('accountEmail');
    const accountRoleSelect = document.getElementById('accountRole');
    const accountJabatanContainer = document.getElementById('accountJabatanContainer');
    const accountJabatanSelect = document.getElementById('accountJabatan');
    const accountRayonContainer = document.getElementById('accountRayonContainer');
    const accountRayonSelect = document.getElementById('accountRayon');
    const accountKlasifikasiContainer = document.getElementById('accountKlasifikasiContainer');
    const accountKlasifikasiSelect = document.getElementById('accountKlasifikasi');
    const accountPasswordContainer = document.getElementById('accountPasswordContainer');
    const accountPasswordInput = document.getElementById('accountPassword');
    const accountConfirmPasswordContainer = document.getElementById('accountConfirmPasswordContainer');
    const accountConfirmPasswordInput = document.getElementById('accountConfirmPassword');

    // Reset Password Modal elements
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    const resetPasswordUserName = document.getElementById('resetPasswordUserName');
    const resetPasswordUserId = document.getElementById('resetPasswordUserId');
    const newPasswordInput = document.getElementById('newPassword');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    // Log Aktivitas Modal elements
    const logAktivitasModal = document.getElementById('logAktivitasModal');
    const logUserName = document.getElementById('logUserName');
    const logAktivitasContent = document.getElementById('logAktivitasContent');

    // Dummy data for select options, these would also come from API in a real scenario
    const mockJabatanData = [
        'Ketua', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Anggota', 'Kabid Kaderisasi',
        'Kabid Keuangan', 'Kabid Humas', 'Kabid Pergerakan', 'Staf', 'Koordinator Bidang'
    ];
    const mockKlasifikasiData = [
        'Kader Mu\'taqid', 'Kader Mujahid', 'Kader Mujtahid', 'Kader Muharik'
    ];

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

    if (authLinkMain) {
        authLinkMain.removeEventListener('click', handleAuthClick);
        authLinkMain.addEventListener('click', handleAuthClick);
    }
    if (authLinkMobile) {
        authLinkMobile.removeEventListener('click', handleAuthClick);
        authLinkMobile.addEventListener('click', handleAuthClick);
    }

    // --- Pemeriksaan Otentikasi dan Kontrol Akses Halaman ---
    async function initializePageAccess() {
        const allowedRolesForThisPage = ['komisariat']; // Hanya admin komisariat yang bisa akses halaman ini
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
            return false;
        }

        // Jika pengguna memiliki akses, update UI header
        if (hasAccess) {
            // Update nama admin jika ada elemennya
            const adminNameDashboard = document.getElementById('admin-name-dashboard');
            const adminNameDashboardBanner = document.querySelector('.welcome-banner #admin-name-dashboard-banner'); // Selector untuk banner
            if (adminNameDashboard) {
                adminNameDashboard.textContent = loggedInUser.nama || 'Admin Komisariat';
            }
            if (adminNameDashboardBanner) {
                adminNameDashboardBanner.textContent = loggedInUser.nama || 'Admin Komisariat';
            }

            // Update header title ke SINTAKSIS
            const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';
            if (headerTitleText) {
                headerTitleText.textContent = loggedInTitle;
            }
            if (mobileHeaderTitleText) {
                mobileHeaderTitleText.textContent = loggedInTitle;
            }
        } else {
            // Jika tidak memiliki akses, atau halaman publik, pastikan header normal
            const defaultTitle = 'PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung';
            if (headerTitleText) {
                headerTitleText.textContent = defaultTitle;
            }
            if (mobileHeaderTitleText) {
                mobileHeaderTitleText.textContent = defaultTitle;
            }
        }
        return true;
    }


    // --- Account Management Functions ---

    // Function to render accounts in the table
    async function renderAccounts() {
        accountsTableBody.innerHTML = '<tr><td colspan="9" class="py-8 text-center text-text-muted">Memuat akun...</td></tr>';
        try {
            const response = await getUsers(); // Get all users from API
            if (response && response.data) {
                allUsers = response.data; // Store all users
            } else {
                allUsers = [];
                window.showCustomMessage("Gagal memuat daftar akun dari server.", "error");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            window.showCustomMessage(error.message || "Terjadi kesalahan saat memuat akun.", "error");
            allUsers = [];
        }

        accountsTableBody.innerHTML = ''; // Clear existing table rows

        if (allUsers.length === 0) {
            accountsTableBody.innerHTML = `<tr><td colspan="9" class="py-4 text-center">Tidak ada akun yang terdaftar.</td></tr>`;
            return;
        }

        allUsers.forEach(user => {
            let statusClass = '';
            if (user.status === 'aktif') { statusClass = 'status-aktif'; }
            else if (user.status === 'nonaktif') { statusClass = 'status-nonaktif'; }
            else if (user.status === 'alumni') { statusClass = 'status-alumni'; }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2 px-4">${user.full_name || user.name || '-'}</td>
                <td class="py-2 px-4">${user.nim || user.username || '-'}</td>
                <td class="py-2 px-4">${user.email || '-'}</td>
                <td class="py-2 px-4">${user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : '-'}</td>
                <td class="py-2 px-4">${user.position || user.jabatan || '-'}</td>
                <td class="py-2 px-4">${user.rayon_name || user.rayon || '-'}</td>
                <td class="py-2 px-4">${user.cadre_level || user.klasifikasi || '-'}</td>
                <td class="py-2 px-4">
                    <span class="status-dot ${statusClass}"></span>
                    ${user.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1)) : '-'}
                </td>
                <td class="py-2 px-4 text-center action-links whitespace-nowrap">
                    <div class="action-icon-group">
                        <button title="Edit Akun" class="action-btn" data-id="${user.user_id}" data-action="edit"><i class="fas fa-pen-to-square"></i></button>
                        <button title="Reset Password" class="action-btn" data-id="${user.user_id}" data-action="reset-password"><i class="fas fa-key"></i></button>
                        <button title="Lihat Log" class="action-btn" data-id="${user.user_id}" data-action="view-log"><i class="fas fa-history"></i></button>
                        <button title="Hapus Akun" class="action-btn" data-id="${user.user_id}" data-action="delete"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            accountsTableBody.appendChild(row);
        });

        // Attach event listeners to newly rendered action buttons
        accountsTableBody.querySelectorAll('.action-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                const action = this.dataset.action;
                const user = allUsers.find(acc => acc.user_id === id); // Find user by user_id

                if (!user) {
                    window.showCustomMessage('Akun tidak ditemukan.', 'error');
                    return;
                }

                switch (action) {
                    case 'edit':
                        openAccountModalForEdit(user); // Pass the user object
                        break;
                    case 'reset-password':
                        openResetPasswordModal(user.user_id, user.full_name || user.name);
                        break;
                    case 'view-log':
                        openLogModal(user.user_id, user.full_name || user.name);
                        break;
                    case 'delete':
                        deleteUserFromApi(user.user_id, user.full_name || user.name);
                        break;
                }
            });
        });
    }

    // Function to populate rayon dropdown in modal
    async function populateRayonOptions() {
        try {
            const response = await getAllRayons();
            if (response && response.data) {
                allRayons = response.data; // Store for future use
                accountRayonSelect.innerHTML = '<option value="">Pilih Rayon</option>';
                allRayons.forEach(rayon => {
                    const option = document.createElement('option');
                    option.value = rayon.id; // Use rayon ID as value
                    option.textContent = rayon.name;
                    accountRayonSelect.appendChild(option);
                });
            } else {
                window.showCustomMessage('Gagal memuat daftar rayon.', 'error');
            }
        } catch (error) {
            console.error("Error fetching rayons:", error);
            window.showCustomMessage('Terjadi kesalahan saat memuat daftar rayon.', 'error');
        }
    }

    // Function to populate jabatan dropdown in modal
    function populateJabatanOptions() {
        accountJabatanSelect.innerHTML = '<option value="">Pilih Jabatan</option>';
        mockJabatanData.forEach(jabatan => {
            const option = document.createElement('option');
            option.value = jabatan;
            option.textContent = jabatan;
            accountJabatanSelect.appendChild(option);
        });
    }

    // Function to populate klasifikasi dropdown in modal
    function populateKlasifikasiOptions() {
        accountKlasifikasiSelect.innerHTML = '<option value="">Pilih Klasifikasi</option>';
        mockKlasifikasiData.forEach(klasifikasi => {
            const option = document.createElement('option');
            option.value = klasifikasi;
            option.textContent = klasifikasi;
            accountKlasifikasiSelect.appendChild(option);
        });
    }

    // Show/hide fields based on role selection in modal
    accountRoleSelect.addEventListener('change', (e) => {
        toggleRoleSpecificFields(e.target.value);
    });

    function toggleRoleSpecificFields(role) {
        // Reset all to hidden/not required first
        accountJabatanContainer.classList.add('hidden');
        accountJabatanSelect.removeAttribute('required');
        accountJabatanSelect.value = '';

        accountRayonContainer.classList.add('hidden');
        accountRayonSelect.removeAttribute('required');
        accountRayonSelect.value = '';

        accountKlasifikasiContainer.classList.add('hidden');
        accountKlasifikasiSelect.removeAttribute('required');
        accountKlasifikasiSelect.value = '';

        // Password fields are only required for NEW accounts, hidden for EDIT
        const isEditing = accountIdInput.value !== '';
        if (isEditing) {
            accountPasswordContainer.classList.add('hidden');
            accountPasswordInput.removeAttribute('required');
            accountConfirmPasswordContainer.classList.add('hidden');
            accountConfirmPasswordInput.removeAttribute('required');
        } else {
            accountPasswordContainer.classList.remove('hidden');
            accountPasswordInput.setAttribute('required', 'required');
            accountConfirmPasswordContainer.classList.remove('hidden');
            accountConfirmPasswordInput.setAttribute('required', 'required');
        }


        if (role === 'kader' || role === 'rayon') {
            accountJabatanContainer.classList.remove('hidden');
            accountJabatanSelect.setAttribute('required', 'required');
            accountRayonContainer.classList.remove('hidden');
            accountRayonSelect.setAttribute('required', 'required');
            if (role === 'kader') {
                accountKlasifikasiContainer.classList.remove('hidden');
                accountKlasifikasiSelect.setAttribute('required', 'required');
            }
        }
    }


    // Open/Close Account Modal
    addAccountBtn.addEventListener('click', () => {
        accountModalTitle.textContent = 'Tambah Akun Baru';
        accountForm.reset();
        accountIdInput.value = ''; // Clear ID for new account
        toggleRoleSpecificFields(''); // Reset fields for new account
        populateJabatanOptions();
        populateKlasifikasiOptions();
        populateRayonOptions(); // Re-populate rayons
        accountModal.classList.add('active');
    });

    window.openAccountModal = function() { // Make global for manual calls
        accountModal.classList.add('active');
    };

    window.closeAccountModal = function() { // Make global for onclick in HTML
        accountModal.classList.remove('active');
        accountForm.reset();
        accountIdInput.value = '';
        // Reset visibility of conditional fields
        accountJabatanContainer.classList.add('hidden');
        accountJabatanSelect.removeAttribute('required');
        accountJabatanSelect.value = '';
        accountRayonContainer.classList.add('hidden');
        accountRayonSelect.removeAttribute('required');
        accountRayonSelect.value = '';
        accountKlasifikasiContainer.classList.add('hidden');
        accountKlasifikasiSelect.removeAttribute('required');
        accountKlasifikasiSelect.value = '';
        accountPasswordContainer.classList.remove('hidden'); // Ensure password fields are visible for new entry next time
        accountPasswordInput.setAttribute('required', 'required');
        accountConfirmPasswordContainer.classList.remove('hidden');
        accountConfirmPasswordInput.setAttribute('required', 'required');
    };

    accountModal.addEventListener('click', function(event) {
        if (event.target === accountModal) {
            closeAccountModal();
        }
    });

    // Function to open the account modal for editing
    function openAccountModalForEdit(user) {
        accountModalTitle.textContent = 'Edit Akun';
        accountIdInput.value = user.user_id;
        accountNameInput.value = user.full_name || user.name || '';
        accountNIMUsernameInput.value = user.nim || user.username || '';
        accountEmailInput.value = user.email || '';
        accountRoleSelect.value = user.role || '';
        
        // Populate all dropdowns before setting values
        populateJabatanOptions();
        populateKlasifikasiOptions();
        populateRayonOptions();

        toggleRoleSpecificFields(user.role); // Adjust visibility based on retrieved role

        accountJabatanSelect.value = user.position || user.jabatan || '';
        accountRayonSelect.value = user.rayon_id || user.rayon || ''; // Use rayon_id from API, fallback to rayon name
        accountKlasifikasiSelect.value = user.cadre_level || user.klasifikasi || '';
        
        accountModal.classList.add('active');
    }

    // Handle form submission (Add/Edit)
    accountForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const id = accountIdInput.value; // User ID from hidden input (will be empty for new user)
        const name = accountNameInput.value.trim();
        const nimOrUsername = accountNIMUsernameInput.value.trim();
        const email = accountEmailInput.value.trim();
        const role = accountRoleSelect.value;
        const position = accountJabatanSelect.value; // Renamed to position for API consistency
        const rayonId = accountRayonSelect.value; // Renamed to rayon_id for API consistency
        const cadreLevel = accountKlasifikasiSelect.value; // Renamed to cadre_level for API consistency
        const password = accountPasswordInput.value;
        const confirmPassword = accountConfirmPasswordInput.value;

        // Basic validation
        if (!name || !email || !role) {
            window.showCustomMessage('Nama, Email, dan Peran harus diisi.', 'error');
            return;
        }
        if (role === 'kader' || role === 'rayon') {
            if (!position) {
                window.showCustomMessage('Jabatan harus diisi untuk peran Kader atau Rayon.', 'error');
                return;
            }
            if (!rayonId) {
                window.showCustomMessage('Rayon harus diisi untuk peran Kader atau Rayon.', 'error');
                return;
            }
        }
        if (role === 'kader' && !cadreLevel) {
            window.showCustomMessage('Klasifikasi harus diisi untuk peran Kader.', 'error');
            return;
        }

        if (!id) { // Adding new account, so password fields are visible and required
            if (password.length < 6) {
                window.showCustomMessage('Password minimal 6 karakter.', 'error');
                return;
            }
            if (password !== confirmPassword) {
                window.showCustomMessage('Konfirmasi password tidak cocok.', 'error');
                return;
            }
        }
        
        let userData = {
            full_name: name,
            email: email,
            role: role,
            position: position,
            rayon_id: rayonId,
            cadre_level: cadreLevel,
            password: password, // Only sent if adding or resetting
            nim: nimOrUsername, // Use nim field for nim/username
            username: nimOrUsername // Also send as username if your API uses it
        };

        try {
            if (id) { // Edit existing user
                const response = await updateUser(id, userData);
                if (response && response.success) {
                    window.showCustomMessage('Akun berhasil diperbarui!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal memperbarui akun.');
                }
            } else { // Create new user
                const response = await createUser(userData);
                if (response && response.success) {
                    window.showCustomMessage('Akun berhasil ditambahkan!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal menambahkan akun. Email/NIM mungkin sudah terdaftar.');
                }
            }
            renderAccounts(); // Re-render table after success
            closeAccountModal(); // Close modal
        } catch (error) {
            console.error('Error saving account:', error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat menyimpan akun.', 'error');
        }
    });

    // Function to delete an account from API
    async function deleteUserFromApi(userId, userName) {
        window.showCustomConfirm('Hapus Akun', `Apakah Anda yakin ingin menghapus akun ${userName}? Aksi ini tidak dapat dibatalkan.`, async () => {
            try {
                const response = await deleteUser(userId);
                if (response && response.success) {
                    window.showCustomMessage('Akun berhasil dihapus.', 'success');
                    renderAccounts(); // Re-render table
                } else {
                    throw new Error(response.message || 'Gagal menghapus akun.');
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                window.showCustomMessage(error.message || 'Terjadi kesalahan saat menghapus akun.', 'error');
            }
        });
    }

    // Open Reset Password Modal
    window.openResetPasswordModal = function(userId, userName) {
        resetPasswordUserId.value = userId;
        resetPasswordUserName.textContent = userName;
        newPasswordInput.value = ''; // Clear previous password
        resetPasswordModal.classList.add('active');
    };

    window.closeResetPasswordModal = function() {
        resetPasswordModal.classList.remove('active');
    };

    resetPasswordModal.addEventListener('click', function(event) {
        if (event.target === resetPasswordModal) {
            closeResetPasswordModal();
        }
    });

    // Handle Reset Password Form Submission
    resetPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const userId = resetPasswordUserId.value;
        const newPassword = newPasswordInput.value;

        if (newPassword.length < 6) {
            window.showCustomMessage('Password baru minimal 6 karakter.', 'error');
            return;
        }

        try {
            const response = await resetUserPassword(userId, newPassword);
            if (response && response.success) {
                window.showCustomMessage('Password berhasil direset.', 'success');
            } else {
                throw new Error(response.message || 'Gagal mereset password.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat mereset password.', 'error');
        } finally {
            closeResetPasswordModal();
        }
    });


    // Open Log Aktivitas Modal
    window.openLogModal = async function(userId, userName) {
        logUserName.textContent = userName;
        logAktivitasContent.innerHTML = '<p class="text-text-muted text-center">Memuat log aktivitas...</p>'; // Loading state

        try {
            const response = await getSystemActivityLogs({ user_id: userId }); // Asumsi API mendukung filter user_id
            if (response && response.data && response.data.length > 0) {
                let logHtml = `<ul class="list-disc list-inside space-y-2 text-text-secondary">`;
                response.data.forEach(log => {
                    const timestamp = new Date(log.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                    logHtml += `<li><strong>${log.action_type}:</strong> ${log.description} pada ${timestamp}</li>`;
                });
                logHtml += `</ul>`;
                logAktivitasContent.innerHTML = logHtml;
            } else {
                logAktivitasContent.innerHTML = `<p class="text-text-muted text-center">Tidak ada log aktivitas ditemukan untuk akun ini.</p>`;
            }
        } catch (error) {
            console.error("Error fetching user logs:", error);
            logAktivitasContent.innerHTML = `<p class="text-red-500 text-center">Gagal memuat log aktivitas: ${error.message || 'Terjadi kesalahan'}</p>`;
        }
        logAktivitasModal.classList.add('active');
    };

    window.closeLogModal = function() {
        logAktivitasModal.classList.remove('active');
    };

    logAktivitasModal.addEventListener('click', function(event) {
        if (event.target === logAktivitasModal) {
            closeLogModal();
        }
    });


    // --- INITIALIZATION ---
    const pageCanContinue = await initializePageAccess();

    if (pageCanContinue) {
        await populateRayonOptions(); // Populasikan dropdown Rayon terlebih dahulu
        populateJabatanOptions();
        populateKlasifikasiOptions();
        renderAccounts(); // Render tabel akun setelah data dimuat

        // Setel tahun di footer
        document.getElementById('tahun-footer-manajemen-akun').textContent = new Date().getFullYear();

        // Scroll to top button functionality
        const scrollToTopBtnManajemenAkun = document.getElementById('scrollToTopBtnManajemenAkun');
        if (scrollToTopBtnManajemenAkun) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 200) {
                    scrollToTopBtnManajemenAkun.classList.remove('hidden');
                    scrollToTopBtnManajemenAkun.classList.add('flex');
                } else {
                    scrollToTopBtnManajemenAkun.classList.add('hidden');
                    scrollToTopBtnManajemenAkun.classList.remove('flex');
                }
            });
            scrollToTopBtnManajemenAkun.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
});