// public/js/digilib-lanjutan.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from '../js/auth.js';
import { 
    getScientificWorks, 
    uploadScientificWork, 
    updateScientificWork, 
    deleteScientificWork, 
    approveScientificWork, 
    rejectScientificWork,
    getAllRayons // Untuk mengisi dropdown rayon
} from '../js/api.js';

document.addEventListener('DOMContentLoaded', async function () {
    // --- STATE & DATA MANAGEMENT ---
    let makalahKader = []; // Main data array for all makalah
    let userRole = 'public'; // 'public', 'kader', 'rayon', 'komisariat'
    let loggedInUserPage = null; // Stores info about the currently logged-in user
    let stagedFile = null; // To hold the file selected in the modal

    // --- DOM ELEMENTS ---
    const adminNameHeader = document.getElementById('admin-name-header');
    const authInfoHeader = document.getElementById('auth-info-header');
    const backToDashboardLink = document.getElementById('back-to-dashboard-link');

    const pageMainTitle = document.getElementById('page-main-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const formSectionTitle = document.getElementById('form-section-title');

    const makalahFormSection = document.getElementById('makalah-form-section');
    const makalahForm = document.getElementById('makalahForm');
    const makalahIdInput = document.getElementById('makalahId');
    const makalahPenulisInput = document.getElementById('makalahPenulis');
    const makalahRayonSelect = document.getElementById('makalahRayon');
    const makalahJudulInput = document.getElementById('makalahJudul');
    const makalahAbstrakTextarea = document.getElementById('makalahAbstrak');
    const makalahFileInput = document.getElementById('makalahFile');
    const fileNamePreview = document.getElementById('fileNamePreview');
    const submitFormButton = document.getElementById('submitFormButton');
    const resetFormButton = document.getElementById('resetFormButton');
    const rayonInputGroup = document.getElementById('rayon-input-group');

    const searchMakalahInput = document.getElementById('searchMakalah');
    const filterStatusSelect = document.getElementById('filterStatus');
    const filterStatusContainer = document.getElementById('filter-status-container');
    const filterRayonSelect = document.getElementById('filterRayon');
    const filterRayonContainer = document.getElementById('filter-rayon-container');
    const makalahTableBody = document.getElementById('makalahTableBody');
    const actionHeader = document.getElementById('action-header');

    // Detail Modal Elements
    const detailMakalahModal = document.getElementById('detailMakalahModal');
    const detailJudul = document.getElementById('detailJudul');
    const detailPenulis = document.getElementById('detailPenulis');
    const detailRayon = document.getElementById('detailRayon');
    const detailTanggal = document.getElementById('detailTanggal');
    const detailStatus = document.getElementById('detailStatus');
    const detailKomentarAdminContainer = document.getElementById('detailKomentarAdminContainer');
    const detailKomentarAdmin = document.getElementById('detailKomentarAdmin');
    const detailAbstrak = document.getElementById('detailAbstrak');
    const detailDownloadLink = document.getElementById('detailDownloadLink');

    // Custom Confirm Modal Elements
    const customConfirmModal = document.getElementById('customConfirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    let confirmCallback = null;

    // Custom Message Box
    const customMessageBox = document.getElementById('customMessageBox');

    // All form input elements for floating label logic
    const allFormInputs = document.querySelectorAll('.form-input-modern');

    // --- AUTHENTICATION & UI SETUP ---
    function checkAuth() {
        const authData = getAuthData();
        loggedInUserPage = authData.userData;
        userRole = loggedInUserPage ? loggedInUserPage.user_role : 'public';
        return true;
    }

    function updateMakalahUI() {
        // Reset visibility for all elements
        makalahFormSection.classList.add('hidden');
        filterStatusContainer.classList.add('hidden');
        filterRayonContainer.classList.add('hidden');
        actionHeader.classList.remove('hidden');
        backToDashboardLink.classList.add('hidden');

        // Update Header
        if (userRole === 'public') {
            adminNameHeader.classList.add('hidden');
            authInfoHeader.textContent = 'Login';
            authInfoHeader.href = '../login.php';
            authInfoHeader.classList.remove('logout-active');
            authInfoHeader.removeEventListener('click', handleAuthClick);
        } else {
            adminNameHeader.textContent = `Halo, ${loggedInUserPage.user_name || 'Pengguna'}`;
            adminNameHeader.classList.remove('hidden');
            authInfoHeader.textContent = 'Logout';
            authInfoHeader.href = '#';
            authInfoHeader.classList.add('logout-active');
            authInfoHeader.removeEventListener('click', handleAuthClick);
            authInfoHeader.addEventListener('click', handleAuthClick);

            if (userRole === 'komisariat') {
                backToDashboardLink.href = 'admin-dashboard-komisariat.php';
            } else if (userRole === 'rayon') {
                backToDashboardLink.href = 'admin-dashboard-rayon.php';
            } else if (userRole === 'kader') {
                backToDashboardLink.href = '../index.php';
            }
            backToDashboardLink.classList.remove('hidden');
        }

        // Adjust page titles and subtitles
        if (userRole === 'public') {
            pageMainTitle.textContent = 'Makalah Kader';
            pageSubtitle.textContent = 'Lihat koleksi makalah ilmiah kader PMII yang telah disetujui.';
        } else if (userRole === 'kader') {
            pageMainTitle.textContent = 'Makalah Kader';
            pageSubtitle.textContent = `Ajukan dan lihat riwayat makalah Anda.`;
        } else { // Admin Rayon or Komisariat
            pageMainTitle.textContent = 'Manajemen Makalah Kader';
            pageSubtitle.textContent = 'Kelola dan verifikasi karya ilmiah kader.';
        }

        // Form and Filters visibility
        if (userRole === 'rayon' || userRole === 'komisariat' || userRole === 'kader') {
            makalahFormSection.classList.remove('hidden');
            if (userRole === 'kader') {
                formSectionTitle.textContent = 'Unggah Makalah Baru';
                makalahPenulisInput.value = loggedInUserPage.user_name || '';
                makalahPenulisInput.disabled = true;
                makalahPenulisInput.classList.add('has-value');

                // Set rayon for kader based on their assigned rayon_id
                if (loggedInUserPage.rayon_id) {
                    populateRayonSelect(loggedInUserPage.rayon_id); // Populate with all, then select theirs
                    makalahRayonSelect.disabled = true;
                    makalahRayonSelect.classList.add('has-value');
                } else {
                    makalahRayonSelect.disabled = false; // Allow manual selection if no rayon_id
                }
                rayonInputGroup.classList.remove('hidden');
            } else { // Admin Rayon / Komisariat
                formSectionTitle.textContent = 'Ajukan / Edit Makalah Kader';
                makalahPenulisInput.disabled = false;
                makalahPenulisInput.classList.remove('has-value');
                makalahPenulisInput.value = '';

                makalahRayonSelect.disabled = false;
                makalahRayonSelect.classList.remove('has-value');
                makalahRayonSelect.value = '';
                rayonInputGroup.classList.remove('hidden');
                populateRayonSelect(); // Populate all rayons for admins
            }

            if (userRole === 'komisariat') {
                filterStatusContainer.classList.remove('hidden');
                filterRayonContainer.classList.remove('hidden');
                populateRayonFilter(); // Populate for Komisariat
            } else if (userRole === 'rayon') {
                filterStatusContainer.classList.remove('hidden');
                filterRayonContainer.classList.add('hidden');
            } else { // Kader
                filterStatusContainer.classList.add('hidden');
                filterRayonContainer.classList.add('hidden');
            }
        } else { // Public/Guest
            makalahFormSection.classList.add('hidden');
            filterStatusContainer.classList.add('hidden');
            filterRayonContainer.classList.add('hidden');
        }

        if (userRole === 'public') {
            actionHeader.classList.add('hidden');
        } else {
            actionHeader.classList.remove('hidden');
        }
    }

    function handleAuthClick(e) {
        e.preventDefault();
        if (e.target.textContent === 'Logout') {
            showCustomConfirm('Konfirmasi Logout', 'Apakah Anda yakin ingin logout?', () => {
                handleLogout();
                window.location.reload();
            });
        } else {
            window.location.assign('../login.php');
        }
    }

    // --- INITIAL DATA LOAD ---
    async function loadMakalahData() {
        try {
            const response = await getScientificWorks();
            if (response.success && response.data) {
                makalahKader = response.data;
            } else {
                makalahKader = [];
                showCustomMessage("Gagal memuat data makalah dari server.", "error");
            }
        } catch (error) {
            console.error("Error memuat makalah:", error);
            makalahKader = [];
            showCustomMessage("Terjadi kesalahan jaringan saat memuat makalah.", "error");
        }
    }

    // Populate Rayon Select (for form)
    async function populateRayonSelect(selectedRayonId = null) {
        try {
            const response = await getAllRayons();
            const rayons = response.data || [];
            makalahRayonSelect.innerHTML = '<option value="" disabled selected>Pilih Asal Rayon</option>';
            rayons.forEach(rayon => {
                const option = document.createElement('option');
                option.value = rayon.rayon_id; // Use rayon_id from API
                option.textContent = rayon.name;
                makalahRayonSelect.appendChild(option);
            });
            if (selectedRayonId) {
                makalahRayonSelect.value = selectedRayonId;
            }
            updateLabelClass(makalahRayonSelect);
        } catch (error) {
            console.error("Error populating rayons:", error);
            showCustomMessage("Gagal memuat daftar rayon.", "error");
        }
    }

    // Populate Rayon Filter (for Komisariat Admin)
    async function populateRayonFilter() {
        try {
            const response = await getAllRayons();
            const rayons = response.data || [];
            filterRayonSelect.innerHTML = '<option value="all">Semua Rayon</option>';
            rayons.forEach(rayon => {
                const option = document.createElement('option');
                option.value = rayon.rayon_id;
                option.textContent = rayon.name;
                filterRayonSelect.appendChild(option);
            });
            updateLabelClass(filterRayonSelect);
        } catch (error) {
            console.error("Error populating rayon filter:", error);
            showCustomMessage("Gagal memuat filter rayon.", "error");
        }
    }

    // --- CRUD OPERATIONS ---
    function renderMakalahTable() {
        makalahTableBody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-text-muted">Memuat data makalah...</td></tr>';
        
        let filteredData = makalahKader;

        if (userRole === 'kader') {
            filteredData = filteredData.filter(m => 
                m.user_id === (loggedInUserPage.user_id || '') && (m.status === 'approved' || m.status === 'pending' || m.status === 'rejected')
            );
        } else if (userRole === 'rayon') {
            filteredData = filteredData.filter(m => m.rayon_id === loggedInUserPage.rayon_id);
        } else if (userRole === 'public') {
            filteredData = filteredData.filter(m => m.status === 'approved');
        }

        const searchTerm = searchMakalahInput.value.toLowerCase();
        if (searchTerm) {
            filteredData = filteredData.filter(m => 
                m.title.toLowerCase().includes(searchTerm) || 
                m.author_name.toLowerCase().includes(searchTerm)
            );
        }

        if (userRole === 'rayon' || userRole === 'komisariat') {
            const selectedStatus = filterStatusSelect.value;
            if (selectedStatus !== 'all') {
                filteredData = filteredData.filter(m => m.status === selectedStatus);
            }
        }

        if (userRole === 'komisariat') {
            const selectedRayonFilter = filterRayonSelect.value;
            if (selectedRayonFilter !== 'all') {
                filteredData = filteredData.filter(m => m.rayon_id === selectedRayonFilter);
            }
        }
        
        if (filteredData.length === 0) {
            makalahTableBody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-text-muted">Tidak ada makalah yang cocok.</td></tr>';
            return;
        }

        filteredData.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));

        makalahTableBody.innerHTML = ''; // Clear loading message
        filteredData.forEach(makalah => {
            let statusClass = '';
            let statusText = '';
            if (makalah.status === 'pending') { statusClass = 'pending'; statusText = 'Pending'; }
            else if (makalah.status === 'approved') { statusClass = 'approved'; statusText = 'Disetujui'; }
            else { statusClass = 'rejected'; statusText = 'Ditolak'; }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${makalah.title}</td>
                <td>${makalah.author_name}</td>
                <td>${makalah.rayon_name || 'N/A'}</td>
                <td>${new Date(makalah.upload_date).toLocaleDateString('id-ID')}</td>
                <td><span class="status-badge status-${statusClass}"><i class="fas ${statusClass === 'pending' ? 'fa-clock' : (statusClass === 'approved' ? 'fa-check-circle' : 'fa-times-circle')}"></i> ${statusText}</span></td>
                <td class="text-center whitespace-nowrap">
                    <button title="Lihat Detail" class="btn-modern btn-outline-modern btn-sm view-btn" data-id="${makalah.scientific_work_id}"><i class="fas fa-eye"></i></button>
                    ${(userRole === 'komisariat' || (userRole === 'rayon' && makalah.rayon_id === loggedInUserPage.rayon_id && makalah.status === 'pending') || (userRole === 'kader' && makalah.user_id === loggedInUserPage.user_id && makalah.status === 'pending')) ?
                        `<button title="Edit" class="btn-modern btn-outline-modern btn-sm edit-btn" data-id="${makalah.scientific_work_id}"><i class="fas fa-edit"></i></button>` : ''
                    }
                    ${userRole === 'komisariat' ? `
                        <button title="Setujui" class="btn-modern btn-success-modern btn-sm approve-btn" data-id="${makalah.scientific_work_id}" ${makalah.status === 'approved' ? 'disabled' : ''}><i class="fas fa-check"></i></button>
                        <button title="Tolak" class="btn-modern btn-danger-modern btn-sm reject-btn" data-id="${makalah.scientific_work_id}" ${makalah.status === 'rejected' ? 'disabled' : ''}><i class="fas fa-times"></i></button>
                    ` : ''}
                    ${(userRole === 'komisariat' || (userRole === 'rayon' && makalah.rayon_id === loggedInUserPage.rayon_id && (makalah.status === 'pending' || makalah.status === 'rejected')) || (userRole === 'kader' && makalah.user_id === loggedInUserPage.user_id && (makalah.status === 'pending' || makalah.status === 'rejected'))) ?
                        `<button title="Hapus" class="btn-modern btn-danger-modern btn-sm delete-btn" data-id="${makalah.scientific_work_id}"><i class="fas fa-trash-alt"></i></button>` : ''
                    }
                </td>
            </tr>
            `;
            makalahTableBody.appendChild(row);
        });

        if (userRole === 'public') {
            actionHeader.classList.add('hidden');
            makalahTableBody.querySelectorAll('tr').forEach(row => {
                const actionCell = row.querySelector('td:last-child');
                if (actionCell) actionCell.classList.add('hidden');
            });
        } else {
            actionHeader.classList.remove('hidden');
            makalahTableBody.querySelectorAll('tr').forEach(row => {
                const actionCell = row.querySelector('td:last-child');
                if (actionCell) actionCell.classList.remove('hidden');
            });
        }

        attachTableButtonListeners();
    }

    function attachTableButtonListeners() {
        makalahTableBody.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', (e) => viewMakalah(e.currentTarget.dataset.id));
        });
        makalahTableBody.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => editMakalah(e.currentTarget.dataset.id));
        });
        makalahTableBody.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', (e) => showCustomConfirm('Apakah Anda yakin ingin MENYETUJUI makalah ini?', 'Setujui', () => approveMakalah(e.currentTarget.dataset.id)));
        });
        makalahTableBody.querySelectorAll('.reject-btn').forEach(button => {
            button.addEventListener('click', (e) => showCustomConfirm('Apakah Anda yakin ingin MENOLAK makalah ini? Anda bisa menambahkan komentar revisi.', 'Tolak', () => rejectMakalah(e.currentTarget.dataset.id)));
        });
        makalahTableBody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => showCustomConfirm('Apakah Anda yakin ingin MENGHAPUS makalah ini? Aksi ini tidak dapat dibatalkan.', 'Hapus', () => deleteMakalah(e.currentTarget.dataset.id)));
        });
    }

    // --- FORM HANDLING ---
    function populateFormForEdit(makalah) {
        makalahIdInput.value = makalah.scientific_work_id;
        makalahJudulInput.value = makalah.title;
        makalahAbstrakTextarea.value = makalah.abstract;
        fileNamePreview.textContent = makalah.file_name || 'Tidak ada file dipilih.'; // Show current file name

        if (userRole === 'komisariat') {
            makalahPenulisInput.value = makalah.author_name;
            makalahPenulisInput.disabled = false;
            makalahRayonSelect.value = makalah.rayon_id;
            makalahRayonSelect.disabled = false;
        } else if (userRole === 'rayon' || userRole === 'kader') {
            makalahPenulisInput.value = makalah.author_name;
            makalahPenulisInput.disabled = true;
            makalahRayonSelect.value = makalah.rayon_id;
            makalahRayonSelect.disabled = true;
        }
        
        submitFormButton.innerHTML = '<i class="fas fa-save mr-2"></i> Perbarui Makalah';
        allFormInputs.forEach(input => updateLabelClass(input));
    }

    function resetForm() {
        makalahForm.reset();
        makalahIdInput.value = '';
        fileNamePreview.textContent = 'Tidak ada file dipilih.';
        makalahFileInput.value = '';
        stagedFile = null; // Clear staged file
        submitFormButton.innerHTML = '<i class="fas fa-upload mr-2"></i> Unggah Makalah';
        
        if (userRole === 'kader') {
            makalahPenulisInput.value = loggedInUserPage.user_name || '';
            makalahPenulisInput.disabled = true;
            if (loggedInUserPage.rayon_id) {
                makalahRayonSelect.value = loggedInUserPage.rayon_id;
                makalahRayonSelect.disabled = true;
            } else {
                makalahRayonSelect.value = '';
                makalahRayonSelect.disabled = false;
            }
        } else { // Admin Rayon / Komisariat
            makalahPenulisInput.value = '';
            makalahPenulisInput.disabled = false;
            makalahRayonSelect.value = '';
            makalahRayonSelect.disabled = false;
        }

        allFormInputs.forEach(input => updateLabelClass(input));
    }

    makalahForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const id = makalahIdInput.value; // scientific_work_id is string
        const file = makalahFileInput.files[0];

        if (!id && !file) { // If new entry and no file
            showCustomMessage('Mohon unggah file makalah.', 'error');
            return;
        }
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showCustomMessage('Ukuran file terlalu besar. Maksimal 5MB.', 'error');
                return;
            }
            if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
                showCustomMessage('Format file tidak didukung. Mohon gunakan PDF atau DOCX.', 'error');
                return;
            }
        }

        submitFormButton.disabled = true;
        submitFormButton.textContent = id ? 'Memperbarui...' : 'Mengunggah...';

        const formData = new FormData();
        formData.append('title', makalahJudulInput.value);
        formData.append('abstract', makalahAbstrakTextarea.value);
        formData.append('author_name', makalahPenulisInput.value);
        formData.append('rayon_id', makalahRayonSelect.value);
        formData.append('user_id', loggedInUserPage.user_id); // User ID from logged-in user
        formData.append('user_role', userRole); // User role from logged-in user

        if (file) {
            formData.append('file', file);
        }

        try {
            let response;
            if (id) {
                // Update existing
                response = await updateScientificWork(id, formData);
                if (response.success) {
                    showCustomMessage(response.message || 'Makalah berhasil diperbarui!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal memperbarui makalah.');
                }
            } else {
                // Add new
                response = await uploadScientificWork(formData);
                if (response.success) {
                    showCustomMessage(response.message || 'Makalah berhasil diajukan untuk verifikasi!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal mengajukan makalah.');
                }
            }
            
            await loadMakalahData(); // Reload data from API
            renderMakalahTable();
            resetForm();

        } catch (error) {
            console.error("Error during makalah form submission:", error);
            showCustomMessage(error.message || `Terjadi kesalahan saat menyimpan makalah.`, 'error');
        } finally {
            submitFormButton.disabled = false;
            submitFormButton.textContent = id ? '<i class="fas fa-save mr-2"></i> Perbarui Makalah' : '<i class="fas fa-upload mr-2"></i> Unggah Makalah';
        }
    });

    resetFormButton.addEventListener('click', resetForm);

    // --- ACTION FUNCTIONS ---
    async function viewMakalah(id) {
        try {
            const response = await getScientificWorks({ scientific_work_id: id });
            const makalah = response.data && response.data.length > 0 ? response.data[0] : null;

            if (!makalah) {
                showCustomMessage('Detail makalah tidak ditemukan.', 'error');
                return;
            }

            detailJudul.textContent = makalah.title;
            detailPenulis.textContent = makalah.author_name;
            detailRayon.textContent = makalah.rayon_name || 'N/A';
            detailTanggal.textContent = new Date(makalah.upload_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            
            detailStatus.textContent = makalah.status;
            detailStatus.className = `status-badge status-${makalah.status}`;
            
            if (makalah.admin_comment) {
                detailKomentarAdminContainer.classList.remove('hidden');
                detailKomentarAdmin.textContent = makalah.admin_comment;
            } else {
                detailKomentarAdminContainer.classList.add('hidden');
                detailKomentarAdmin.textContent = '';
            }
            
            detailAbstrak.textContent = makalah.abstract;

            if (userRole === 'public') {
                detailDownloadLink.removeAttribute('href');
                detailDownloadLink.onclick = (e) => {
                    e.preventDefault();
                    closeModal('detailMakalahModal');
                    showCustomMessage('Silakan login untuk mengunduh makalah.', 'info', () => {
                        window.location.assign('../login.php');
                    });
                };
            } else {
                detailDownloadLink.href = makalah.file_path;
                detailDownloadLink.download = makalah.file_name;
                detailDownloadLink.onclick = null;
            }

            openModal('detailMakalahModal');
        } catch (error) {
            console.error("Error viewing makalah:", error);
            showCustomMessage(error.message || "Gagal memuat detail makalah.", "error");
        }
    }

    async function editMakalah(id) {
        const makalah = makalahKader.find(m => m.scientific_work_id === id);
        if (!makalah) return;
        
        let canEdit = false;
        if (userRole === 'komisariat') {
            canEdit = true;
        } else if (userRole === 'rayon') {
            if (makalah.rayon_id === loggedInUserPage.rayon_id && makalah.status === 'pending') {
                canEdit = true;
            }
        } else if (userRole === 'kader') {
            if (makalah.user_id === loggedInUserPage.user_id && makalah.status === 'pending') {
                canEdit = true;
            }
        }

        if (!canEdit) {
            showCustomMessage('Anda tidak memiliki izin untuk mengedit makalah ini.', 'error');
            return;
        }

        populateFormForEdit(makalah);
        makalahFormSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function approveMakalah(id) {
        if (userRole !== 'komisariat') {
            showCustomMessage('Anda tidak memiliki izin untuk menyetujui makalah.', 'error');
            return;
        }
        try {
            const response = await approveScientificWork(id);
            if (response.success) {
                showCustomMessage(response.message || `Makalah berhasil disetujui!`, 'success');
                await loadMakalahData();
                renderMakalahTable();
            } else {
                throw new Error(response.message || 'Gagal menyetujui makalah.');
            }
        } catch (error) {
            console.error("Error approving makalah:", error);
            showCustomMessage(error.message || "Terjadi kesalahan saat menyetujui makalah.", "error");
        }
    }

    async function rejectMakalah(id) {
        if (userRole !== 'komisariat') {
            showCustomMessage('Anda tidak memiliki izin untuk menolak makalah.', 'error');
            return;
        }
        const comment = prompt("Masukkan komentar (opsional) untuk penolakan makalah:");
        try {
            const response = await rejectScientificWork(id, { admin_comment: comment });
            if (response.success) {
                showCustomMessage(response.message || `Makalah berhasil ditolak.`, 'info');
                await loadMakalahData();
                renderMakalahTable();
            } else {
                throw new Error(response.message || 'Gagal menolak makalah.');
            }
        } catch (error) {
            console.error("Error rejecting makalah:", error);
            showCustomMessage(error.message || "Terjadi kesalahan saat menolak makalah.", "error");
        }
    }

    async function deleteMakalah(id) {
        const makalahToDelete = makalahKader.find(m => m.scientific_work_id === id);
        if (!makalahToDelete) return;

        let canDelete = false;
        if (userRole === 'komisariat') {
            canDelete = true;
        } else if (userRole === 'rayon') {
            if (makalahToDelete.rayon_id === loggedInUserPage.rayon_id && (makalahToDelete.status === 'pending' || makalahToDelete.status === 'rejected')) {
                canDelete = true;
            }
        } else if (userRole === 'kader') {
            if (makalahToDelete.user_id === loggedInUserPage.user_id && (makalahToDelete.status === 'pending' || makalahToDelete.status === 'rejected')) {
                canDelete = true;
            }
        }

        if (!canDelete) {
            showCustomMessage('Anda tidak memiliki izin untuk menghapus makalah ini.', 'error');
            return;
        }
        
        showCustomConfirm('Hapus Makalah', `Apakah Anda yakin ingin MENGHAPUS makalah "${makalahToDelete.title}"? Aksi ini tidak dapat dibatalkan.`, async () => {
            try {
                const response = await deleteScientificWork(id);
                if (response.success) {
                    showCustomMessage(response.message || `Makalah "${makalahToDelete.title}" berhasil dihapus.`, 'success');
                    await loadMakalahData();
                    renderMakalahTable();
                } else {
                    throw new Error(response.message || 'Gagal menghapus makalah.');
                }
            } catch (error) {
                console.error("Error deleting makalah:", error);
                showCustomMessage(error.message || "Terjadi kesalahan saat menghapus makalah.", "error");
            }
        });
    }

    // --- UI UTILITIES ---
    function updateLabelClass(input) {
        const label = input.nextElementSibling;
        if (label && label.classList.contains('form-label-modern')) {
            if (input.value.trim() !== '' || (input.tagName === 'SELECT' && input.value !== '') || (input.type === 'file' && input.files.length > 0)) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        }
    }

    allFormInputs.forEach(input => {
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

    makalahFileInput.addEventListener('change', function() {
        fileNamePreview.textContent = this.files[0] ? this.files[0].name : 'Tidak ada file dipilih.';
        updateLabelClass(this);
    });

    // Scroll to Top Button
    const scrollToTopBtnMakalah = document.getElementById('scrollToTopBtnMakalah');
    if (scrollToTopBtnMakalah) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 200) {
                scrollToTopBtnMakalah.classList.remove('hidden');
                scrollToTopBtnMakalah.classList.add('flex');
            } else {
                scrollToTopBtnMakalah.classList.add('hidden');
                scrollToTopBtnMakalah.classList.remove('flex');
            }
        });
        scrollToTopBtnMakalah.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Tahun di footer
    const tahunFooterMakalah = document.getElementById('tahun-footer-makalah');
    if (tahunFooterMakalah) {
        tahunFooterMakalah.textContent = new Date().getFullYear();
    }

    // --- INITIALIZATION ---
    (async function initialize() {
        checkAuth();
        await loadMakalahData();
        updateMakalahUI();
        renderMakalahTable();

        searchMakalahInput.addEventListener('input', renderMakalahTable);
        filterStatusSelect.addEventListener('change', renderMakalahTable);
        filterRayonSelect.addEventListener('change', renderMakalahTable);
    })();
});
