// public/js/digilib-prosiding-seminar.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from './auth.js';
import { getDigilibItems, uploadDigilibItem, updateDigilibItem, deleteDigilibItem, getDigilibItemById } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // --- STATE & DATA MANAGEMENT ---
    let proceedings = []; // Main data array for all proceedings
    const MAX_RECENT_FILES = 5;
    let recentFiles = JSON.parse(localStorage.getItem('recentFiles')) || []; // Load recent files from localStorage

    let userRole = 'public'; // 'public', 'kader', 'rayon', 'komisariat'
    let loggedInUserPage = null; // Stores info about the currently logged-in user

    let stagedFile = null; // To hold the File object for upload

    // --- DOM ELEMENTS ---
    const userInfo = document.getElementById('user-info');
    const authInfoHeader = document.getElementById('auth-info-header');
    const adminControls = document.querySelectorAll('.admin-controls');
    const proceedingList = document.getElementById('proceeding-list');
    const noDataMessage = document.getElementById('no-data-message');
    const searchInput = document.getElementById('search-input');
    
    const dataModal = document.getElementById('data-modal');
    const dataForm = document.getElementById('data-form');
    const docIdInput = document.getElementById('document-id');
    const submitBtn = document.getElementById('submit-btn');
    const fileUploadInput = document.getElementById('file-upload');
    const fileNamePreview = document.getElementById('file-name-preview');

    // Elements for universal detail modal (from digilib.js context)
    const detailSearchResultModal = document.getElementById('detailSearchResultModal');
    const detailResultJudul = document.getElementById('detailResultJudul');
    const detailResultPenulis = document.getElementById('detailResultPenulis');
    const detailResultRayonContainer = document.getElementById('detailResultRayonContainer');
    const detailResultRayon = document.getElementById('detailResultRayon');
    const detailResultTahunContainer = document.getElementById('detailResultTahunContainer');
    const detailResultTahun = document.getElementById('detailResultTahun');
    const detailResultPenerbitContainer = document.getElementById('detailResultPenerbitContainer');
    const detailResultPenerbit = document.getElementById('detailResultPenerbit');
    const detailResultPeriodeContainer = document.getElementById('detailResultPeriodeContainer');
    const detailResultPeriode = document.getElementById('detailResultPeriode');
    const detailResultTanggalUnggahContainer = document.getElementById('detailResultTanggalUnggahContainer');
    const detailResultTanggalUnggah = document.getElementById('detailResultTanggalUnggah');
    const detailResultAbstrak = document.getElementById('detailResultAbstrak');
    const detailResultDownloadLink = document.getElementById('detailResultDownloadLink');


    // --- UTILITY FUNCTIONS (Notification, Confirmation) ---
    const customMessageBox = document.getElementById('customMessageBox');
    const customConfirmModal = document.getElementById('customConfirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    let currentConfirmCallback = null;

    /**
     * Menampilkan pesan kustom kepada pengguna.
     * @param {string} message - Pesan yang akan ditampilkan.
     * @param {string} type - 'success', 'error', 'info', 'warning'.
     * @param {Function} [callback] - Fungsi callback opsional yang akan dieksekusi setelah pesan memudar.
     */
    function showCustomMessage(message, type = 'info', callback = null) {
        if (!customMessageBox) return;

        customMessageBox.textContent = message;
        customMessageBox.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0';

        if (type === 'success') {
            customMessageBox.classList.add('bg-green-500');
        } else if (type === 'error') {
            customMessageBox.classList.add('bg-red-500');
        } else if (type === 'warning') {
            customMessageBox.classList.add('bg-yellow-500', 'text-gray-900');
        } else {
            customMessageBox.classList.add('bg-blue-500');
        }

        customMessageBox.classList.remove('translate-x-full', 'opacity-0');
        customMessageBox.classList.add('translate-x-0', 'opacity-100');

        setTimeout(() => {
            customMessageBox.classList.remove('translate-x-0', 'opacity-100');
            customMessageBox.classList.add('translate-x-full', 'opacity-0');
            if (callback) {
                customMessageBox.addEventListener('transitionend', function handler() {
                    callback();
                    customMessageBox.removeEventListener('transitionend', handler);
                });
            }
        }, 3000);
    }

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
        customConfirmModal.classList.remove('hidden'); // Ensure it's visible
        customConfirmModal.classList.add('active'); // Activate transition
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
     * Menyembunyikan modal konfirmasi kustom.
     */
    function hideCustomConfirm() {
        customConfirmModal.classList.remove('active');
        customConfirmModal.classList.add('hidden'); // Hide completely after transition
        currentConfirmCallback = null;
    }

    // Tutup modal konfirmasi saat mengklik di luar konten
    customConfirmModal.addEventListener('click', function(event) {
        if (event.target === customConfirmModal) {
            hideCustomConfirm();
        }
    });

    // --- AUTHENTICATION & UI SETUP ---
    function updateAuthStatusAndUI() {
        const authData = getAuthData();
        loggedInUserPage = authData.userData;
        userRole = loggedInUserPage ? loggedInUserPage.user_role : 'public';

        // Update header user info and auth button
        if (loggedInUserPage) {
            userInfo.textContent = `Halo, ${loggedInUserPage.user_name || 'Pengguna'}`;
            userInfo.classList.remove('hidden');
            authInfoHeader.textContent = 'Logout';
            authInfoHeader.classList.add('logout-active');
            authInfoHeader.removeEventListener('click', handleAuthClick); // Remove old listener
            authInfoHeader.addEventListener('click', handleAuthClick); // Add new listener
        } else {
            userInfo.classList.add('hidden');
            authInfoHeader.textContent = 'Login';
            authInfoHeader.classList.remove('logout-active');
            authInfoHeader.removeEventListener('click', handleAuthClick); // Remove old listener
            authInfoHeader.addEventListener('click', handleAuthClick); // Add new listener
        }

        // Show/hide admin controls (Add Prosiding button, Edit/Delete actions on items)
        if (userRole === 'komisariat') { // Only Komisariat can add/edit/delete proceedings
            adminControls.forEach(el => el.style.display = 'inline-flex');
        } else {
            adminControls.forEach(el => el.style.display = 'none');
        }
        renderProceedings(); // Re-render proceedings to apply admin action visibility on items
    }

    /**
     * Menangani klik autentikasi (login/logout).
     * @param {Event} e - Objek event klik.
     */
    function handleAuthClick(e) {
        e.preventDefault();
        const action = e.target.dataset.action || (e.target.closest('a') ? e.target.closest('a').dataset.action : null);

        if (action === 'login') {
            window.location.href = 'login.php';
        } else if (action === 'logout') {
            showCustomConfirm('Konfirmasi Logout', 'Apakah Anda yakin ingin logout?', () => {
                document.body.classList.add('fade-out-page'); // Add fade-out effect
                setTimeout(() => {
                    handleLogout(); // Call logout from auth.js
                    window.location.reload(); // Reload page to reflect logout state
                }, 500); // Match CSS fade-out duration
            });
        }
    }

    // Universal modal open/close functions (consistent with other digilib pages)
    /**
     * Membuka modal dengan menambahkan kelas 'active'.
     * @param {string} modalId - ID elemen modal.
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.remove('hidden'); // Ensure it's not hidden
            setTimeout(() => modal.classList.add('active'), 10); // Add active after a tiny delay for transition
        }
    }

    /**
     * Menutup modal dengan menghapus kelas 'active'.
     * @param {string} modalId - ID elemen modal.
     */
    window.closeModal = function(modalId) { // Made global for onclick in HTML
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.remove('active');
            modal.addEventListener('transitionend', function handler() {
                modal.classList.add('hidden'); // Hide completely after transition
                modal.removeEventListener('transitionend', handler);
            });
        }
    }

    /**
     * Menampilkan modal detail universal dengan informasi tentang dokumen.
     * @param {object} item - Objek dokumen yang berisi detail.
     * @param {string} item.title - Judul dokumen.
     * @param {string} item.author - Penulis dokumen.
     * @param {string} item.description - Abstrak/deskripsi dokumen.
     * @param {string} item.type - Tipe dokumen (mis. 'prosiding').
     * @param {number} [item.publication_year] - Tahun publikasi.
     * @param {string} [item.file_path] - URL untuk mengunduh file dari API.
     * @param {string} [item.file_name] - Nama file yang disarankan untuk diunduh dari API.
     */
    function showUniversalDetailModal(item) {
        detailResultJudul.textContent = item.title || 'Tidak Diketahui';
        detailResultPenulis.textContent = item.author || 'Tidak Diketahui';
        detailResultAbstrak.textContent = item.description || 'Tidak ada deskripsi.';

        // Sembunyikan semua bidang opsional secara default
        detailResultRayonContainer.classList.add('hidden');
        detailResultTahunContainer.classList.add('hidden');
        detailResultPenerbitContainer.classList.add('hidden');
        detailResultPeriodeContainer.classList.add('hidden');
        detailResultTanggalUnggahContainer.classList.add('hidden');

        // Tampilkan bidang yang relevan berdasarkan jenis dokumen
        if (item.type === 'prosiding') {
            if (item.publication_year) { detailResultTahun.textContent = item.publication_year; detailResultTahunContainer.classList.remove('hidden'); }
        } 
        // Add conditions for other types if this modal is truly universal for all digilib items

        // Handle download link based on login status
        const actualFileUrl = item.file_path || '#'; // Use file_path from API
        const actualFileName = item.file_name || 'document'; // Use file_name from API

        if (userRole === 'public') {
            detailResultDownloadLink.removeAttribute('href');
            detailResultDownloadLink.onclick = (e) => {
                e.preventDefault();
                closeModal('detailSearchResultModal');
                showCustomMessage('Silakan login untuk mengunduh dokumen.', 'info', () => {
                    window.location.assign('login.php');
                });
            };
            detailResultDownloadLink.classList.remove('hidden');
        } else {
            detailResultDownloadLink.href = actualFileUrl;
            detailResultDownloadLink.download = actualFileName;
            detailResultDownloadLink.onclick = null; 
            detailResultDownloadLink.classList.remove('hidden');

            // Add file to recent history only if download is permitted (user is logged in)
            addFileToHistory(item); 
        }

        openModal('detailSearchResultModal');
    }

    // --- File History Management (consistent with digilib.js) ---
    /**
     * Menambahkan item file ke riwayat file terbaru di localStorage.
     * @param {object} fileItem - Objek file yang akan ditambahkan ke riwayat.
     */
    function addFileToHistory(fileItem) {
        if (!fileItem || (!fileItem.file_path && !fileItem.file_name)) {
            console.warn("Mencoba menambahkan item file tidak valid ke riwayat:", fileItem);
            return;
        }
        
        const simplifiedItem = {
            id: fileItem.item_id || fileItem.scientific_work_id, // Use appropriate ID
            title: fileItem.title,
            author: fileItem.author || fileItem.author_name,
            type: fileItem.type, // 'buku', 'makalah', etc.
            file_path: fileItem.file_path,
            file_name: fileItem.file_name
        };

        recentFiles = recentFiles.filter(item => !(item.id === simplifiedItem.id && item.type === simplifiedItem.type));
        recentFiles.unshift(simplifiedItem);
        
        if (recentFiles.length > MAX_RECENT_FILES) {
            recentFiles = recentFiles.slice(0, MAX_RECENT_FILES);
        }
        localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
    }

    // --- DATA FETCHING & RENDERING ---
    /**
     * Memuat semua data prosiding seminar dari API.
     * Ini adalah fungsi utama untuk mendapatkan data prosiding.
     */
    async function loadProceedingsData() {
        try {
            // Fetch digilib items filtered by category_name 'Prosiding Seminar' and status 'approved'
            const response = await getDigilibItems({ category_name: 'Prosiding Seminar', status: 'approved' });
            if (response.success && response.data) {
                proceedings = response.data.map(item => ({
                    id: item.item_id, // Use item_id as the unique ID
                    title: item.title,
                    author: item.author,
                    description: item.description,
                    publication_year: item.publication_year, // Use publication_year for year
                    file_path: item.file_path,
                    file_name: item.file_name,
                    type: 'prosiding' // Explicitly set type
                }));
                console.log("Prosiding Seminar dimuat dari API:", proceedings);
            } else {
                proceedings = [];
                showCustomMessage(response.message || "Gagal memuat data prosiding dari server.", "error");
            }
        } catch (error) {
            console.error("Error memuat prosiding:", error);
            proceedings = [];
            showCustomMessage("Terjadi kesalahan jaringan saat memuat prosiding.", "error");
        } finally {
            renderProceedings(); // Always render after data load attempt
        }
    }
        
    /**
     * Merender daftar prosiding berdasarkan input pencarian.
     */
    function renderProceedings() {
        const query = searchInput.value.toLowerCase();
        const filteredData = proceedings.filter(p => 
            (p.title && p.title.toLowerCase().includes(query)) || 
            (p.author && p.author.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.publication_year && p.publication_year.toString().includes(query))
        );

        proceedingList.innerHTML = '';
        if (filteredData.length === 0) {
            noDataMessage.classList.remove('hidden');
            noDataMessage.textContent = query ? 'Tidak ada prosiding yang cocok.' : 'Belum ada data prosiding.';
        } else {
            noDataMessage.classList.add('hidden');
            filteredData.forEach(p => {
                const item = document.createElement('div');
                item.className = 'proceeding-item';
                item.setAttribute('data-id', p.id); // Add data-id
                item.setAttribute('data-type', p.type); // Add data-type

                item.innerHTML = `
                    <div class="icon-wrapper"><i class="fas fa-file-powerpoint"></i></div>
                    <div class="item-content">
                        <p class="item-title">${p.title}</p>
                        <p class="item-year">Tahun: ${p.publication_year}</p>
                    </div>
                    <div class="flex-shrink-0 ml-4">
                        <a href="${p.file_path}" download="${p.file_name || 'prosiding.pdf'}" class="btn btn-success btn-sm">
                            <i class="fas fa-download mr-2"></i>Unduh
                        </a>
                    </div>
                    <div class="admin-actions flex-shrink-0 ml-4 space-x-3">
                         <button data-action="edit" data-id="${p.id}" class="text-yellow-600 hover:text-yellow-800" title="Edit"><i class="fas fa-edit"></i></button>
                         <button data-action="delete" data-id="${p.id}" class="text-red-600 hover:text-red-800" title="Hapus"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                proceedingList.appendChild(item);
            });
        }
        
        if (userRole === 'komisariat') { // Only Komisariat can see and perform admin actions
            proceedingList.querySelectorAll('.admin-actions').forEach(el => el.style.display = 'flex');
        } else {
            proceedingList.querySelectorAll('.admin-actions').forEach(el => el.style.display = 'none');
        }
    }
        
    // --- FILE HANDLING ---
    /**
     * Handles file input change, validating file size and staging the file.
     * @param {Event} e - The event object.
     */
    fileUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showCustomMessage('Ukuran file terlalu besar. Maksimal 10MB.', 'error');
                fileUploadInput.value = '';
                stagedFile = null;
                fileNamePreview.textContent = 'PDF, DOC, DOCX hingga 10MB';
                return;
            }
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                showCustomMessage('Format file tidak didukung. Mohon gunakan PDF, DOC, atau DOCX.', 'error');
                fileUploadInput.value = '';
                stagedFile = null;
                fileNamePreview.textContent = 'PDF, DOC, DOCX hingga 10MB';
                return;
            }

            stagedFile = file;
            fileNamePreview.textContent = file.name;
        } else {
            stagedFile = null;
            fileNamePreview.textContent = 'PDF, DOC, DOCX hingga 10MB';
        }
    });

    // --- CRUD OPERATIONS ---
    /**
     * Handles the form submission for adding or editing proceeding data.
     * @param {Event} e - The event object.
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Menyimpan...';

        const id = docIdInput.value ? docIdInput.value : null; // item_id from API is string/number
        const file = fileUploadInput.files[0];

        if (!id && !file) { // If new entry and no file
            showCustomMessage('Mohon unggah file prosiding.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan';
            return;
        }
        
        const proceedingData = {
            title: document.getElementById('judul').value,
            publication_year: parseInt(document.getElementById('tahun').value),
            category_name: 'Prosiding Seminar', // Hardcoded category for this page
            status: 'approved' // Assuming proceedings are approved directly
        };

        const formData = new FormData();
        for (const key in proceedingData) {
            formData.append(key, proceedingData[key]);
        }
        if (file) {
            formData.append('file', file);
        }

        try {
            let response;
            if (id) {
                // Update existing
                response = await updateDigilibItem(id, formData); // Send FormData for update
                if (response.success) {
                    showCustomMessage(response.message || 'Prosiding berhasil diperbarui!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal memperbarui prosiding.');
                }
            } else {
                // Add new
                response = await uploadDigilibItem(formData); // Send FormData for upload
                if (response.success) {
                    showCustomMessage(response.message || 'Prosiding baru berhasil ditambahkan!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal menambahkan prosiding baru.');
                }
            }
            
            await loadProceedingsData(); // Reload data from API
            closeModal('data-modal');
            
        } catch (error) {
            console.error("Error during proceeding CRUD operation:", error);
            showCustomMessage(error.message || "Terjadi kesalahan saat menyimpan data prosiding.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan';
        }
    }

    /**
     * Deletes a proceeding from the database via API.
     * @param {string} id - The ID of the proceeding to delete.
     */
    async function deleteProceeding(id) {
        try {
            const response = await deleteDigilibItem(id);
            if (response.success) {
                showCustomMessage(response.message || 'Prosiding berhasil dihapus.', 'success');
                await loadProceedingsData(); // Reload data after deletion
            } else {
                throw new Error(response.message || 'Gagal menghapus prosiding.');
            }
        } catch (error) {
            console.error('Error deleting proceeding:', error);
            showCustomMessage(error.message || 'Terjadi kesalahan saat menghapus prosiding.', 'error');
        }
    }

    // --- MODAL & EVENT LISTENERS ---
    /**
     * Opens the data entry modal for adding or editing a proceeding.
     * @param {object|null} proceeding - The proceeding object to edit, or null for a new entry.
     */
    function openDataModalForProceeding(proceeding = null) {
        dataForm.reset();
        fileNamePreview.textContent = 'PDF, DOC, DOCX hingga 10MB';
        stagedFile = null;

        if (proceeding) {
            document.getElementById('modal-title').textContent = 'Edit Prosiding';
            docIdInput.value = proceeding.id; // Use item_id as 'id'
            document.getElementById('judul').value = proceeding.title;
            document.getElementById('tahun').value = proceeding.publication_year;
            if(proceeding.file_name) fileNamePreview.textContent = `File saat ini: ${proceeding.file_name}`;
        } else {
            document.getElementById('modal-title').textContent = 'Tambah Prosiding Baru';
            docIdInput.value = '';
        }
        openModal('data-modal'); // Use the universal openModal
    }

    // Event listeners
    document.getElementById('add-data-btn').addEventListener('click', () => openDataModalForProceeding());
    document.getElementById('close-modal-btn').addEventListener('click', () => closeModal('data-modal'));
    document.getElementById('cancel-btn').addEventListener('click', () => closeModal('data-modal'));
    dataForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', renderProceedings);
    
    proceedingList.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id; // ID can be string from API
        
        if (action === 'edit') {
            // Fetch fresh data for editing to ensure it's up-to-date
            getDigilibItemById(id).then(response => {
                if (response.success && response.data) {
                    openDataModalForProceeding({ ...response.data, id: response.data.item_id }); // Pass item_id as 'id'
                } else {
                    showCustomMessage(response.message || 'Prosiding tidak ditemukan untuk diedit.', 'error');
                }
            }).catch(error => {
                console.error('Error fetching proceeding for edit:', error);
                showCustomMessage('Gagal memuat detail prosiding untuk diedit.', 'error');
            });
        } else if (action === 'delete') {
            showCustomConfirm('Hapus Prosiding', 'Apakah Anda yakin ingin menghapus data ini?', () => deleteProceeding(id));
        }
    });

    // --- INITIALIZATION ---
    (async function initialize() {
        document.getElementById('footer-year').textContent = new Date().getFullYear();
        await loadProceedingsData(); // Load data from API
        updateAuthStatusAndUI(); // Update UI based on auth and loaded data
    })();
});
