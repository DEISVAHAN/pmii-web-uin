// public/js/manajemen-naskah-sejarah.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from './auth.js';
import { getDigilibItems, getDigilibItemById, uploadFile, uploadDigilibItem, updateDigilibItem, deleteDigilibItem } from './api.js'; // Impor API yang diperlukan

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;
    let allDigilibItems = []; // Akan menampung semua item digilib dari API
    let naskahSejarahItems = []; // Filtered to show only historical texts

    // DOM Elements
    const userInfo = document.getElementById('user-info');
    const authInfoHeader = document.getElementById('auth-info-header');
    const adminControls = document.querySelectorAll('.admin-controls'); // Tombol "Tambah Naskah"
    const historyList = document.getElementById('history-list');
    const noDataMessage = document.getElementById('no-data-message');
    const searchInput = document.getElementById('search-input');
    
    // Modal Tambah/Edit Data
    const dataModal = document.getElementById('data-modal');
    const dataForm = document.getElementById('data-form');
    const docIdInput = document.getElementById('document-id');
    const judulInput = document.getElementById('judul');
    const penulisInput = document.getElementById('penulis');
    const periodeInput = document.getElementById('periode');
    const deskripsiTextarea = document.getElementById('deskripsi');
    const fileUploadInput = document.getElementById('file-upload');
    const fileNamePreview = document.getElementById('file-name-preview');
    const filePreviewImage = document.getElementById('file-preview-image');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');

    // Universal Detail Modal Elements (from digilib.js)
    const detailSearchResultModal = document.getElementById('detailSearchResultModal');
    const detailResultJudul = document.getElementById('detailResultJudul');
    const detailResultPenulis = document.getElementById('detailResultPenulis');
    const detailResultRayonContainer = document.getElementById('detailResultRayonContainer'); // Hidden for naskah
    const detailResultRayon = document.getElementById('detailResultRayon'); // Hidden for naskah
    const detailResultTahunContainer = document.getElementById('detailResultTahunContainer'); // Hidden for naskah
    const detailResultTahun = document.getElementById('detailResultTahun'); // Hidden for naskah
    const detailResultPenerbitContainer = document.getElementById('detailResultPenerbitContainer'); // Hidden for naskah
    const detailResultPenerbit = document.getElementById('detailResultPenerbit'); // Hidden for naskah
    const detailResultPeriodeContainer = document.getElementById('detailResultPeriodeContainer');
    const detailResultPeriode = document.getElementById('detailResultPeriode');
    const detailResultTanggalUnggahContainer = document.getElementById('detailResultTanggalUnggahContainer'); // Hidden for naskah
    const detailResultTanggalUnggah = document.getElementById('detailResultTanggalUnggah'); // Hidden for naskah
    const detailResultAbstrak = document.getElementById('detailResultAbstrak');
    const detailResultDownloadLink = document.getElementById('detailResultDownloadLink');

    let stagedFile = null; // Untuk menyimpan file yang diunggah sementara

    // --- Custom Message Box & Confirm Modal (Global Helper Functions) ---
    // Pastikan ini didefinisikan secara global di index.php atau file global lainnya
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
        // Panggil updateAuthUI dari modul auth.js untuk menginisialisasi status login di UI
        const authElements = {
            authLinkMain: document.getElementById('auth-info-header'), // Using auth-info-header for main link
            mobileAuthLink: document.getElementById('mobile-logout-link'), // Assuming this exists for mobile
            // Add other navbar elements as needed for auth.js
        };
        updateAuthUI(authElements);

        const authData = getAuthData();
        loggedInUser = authData.userData || phpLoggedInUser; // Prioritize actual login data

        let userRole = loggedInUser ? loggedInUser.role : 'public';

        // Update header user info
        if (loggedInUser && loggedInUser.nama) {
            userInfo.textContent = `Halo, ${loggedInUser.nama}`;
            userInfo.classList.remove('hidden');
            authInfoHeader.textContent = 'Logout';
            authInfoHeader.href = '#'; // Logout link
            authInfoHeader.addEventListener('click', handleLogout); // Add logout listener
        } else {
            userInfo.classList.add('hidden');
            authInfoHeader.textContent = 'Login';
            authInfoHeader.href = '../login.php'; // Login link
            authInfoHeader.removeEventListener('click', handleLogout); // Remove logout listener
        }

        // Control admin features visibility
        if (userRole === 'komisariat') {
            adminControls.forEach(el => el.style.display = 'inline-flex'); // Show
        } else {
            adminControls.forEach(el => el.style.display = 'none'); // Hide
        }

        // Redirect if not authorized for this page
        const currentPage = window.location.pathname.split('/').pop();
        const allowedRolesForThisPage = ['komisariat']; // Only Komisariat can manage historical texts
        const defaultAllowedPages = [
            'index.php', 'login.php', 'digilib.php', 'tentang-kami.php',
            'berita-artikel.php', 'agenda-kegiatan.php', 'galeri-foto.php',
            'all-rayons.php', 'rayon-profile.php', 'akses-ojs.php',
            'lupa-password.php', 'register-kader.php', 'status-ttd.php',
            'generate-qr.php'
        ]; // Pages publicly accessible

        const isAlwaysAllowedPage = defaultAllowedPages.includes(currentPage);
        const hasRequiredRole = loggedInUser && allowedRolesForThisPage.includes(loggedInUser.role);

        if (!isAlwaysAllowedPage && !hasRequiredRole) {
            window.showCustomMessage("Anda tidak memiliki hak akses ke halaman ini. Silakan login sebagai Admin Komisariat.", 'error', () => {
                window.location.assign('../login.php');
            });
            document.body.innerHTML = `
                <div class="main-content-wrapper flex flex-col items-center justify-center min-h-screen text-center bg-gray-900 text-white p-8">
                    <i class="fas fa-exclamation-triangle text-6xl text-yellow-400 mb-4 animate-bounce"></i>
                    <h1 class="text-3xl lg:text-4xl font-bold mb-4">Akses Ditolak</h1>
                    <p class="text-lg mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                    <a href="../login.php" class="btn bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                        <i class="fas fa-sign-in-alt mr-2"></i> Kembali ke Login
                    </a>
                </div>
            `;
        }
    }

    // --- DATA HANDLING ---
    /**
     * Loads all digital library data from API.
     * Filters for 'Naskah Sejarah' type for this page.
     */
    async function loadNaskahSejarahData() {
        if (!historyList) return;
        historyList.innerHTML = '';
        noDataMessage.classList.add('hidden'); // Sembunyikan pesan

        try {
            // Asumsi getDigilibItems bisa difilter berdasarkan category_name atau memiliki tipe
            const response = await getDigilibItems({ category_name: 'Naskah Sejarah', status: 'approved' }); // Filter by category
            if (response && response.data) {
                allDigilibItems = response.data.map(item => ({
                    id: item.item_id, // Gunakan item_id sebagai ID
                    judul: item.title,
                    penulis: item.author,
                    periode: item.period, // Asumsi ada field 'period' di API untuk Naskah Sejarah
                    deskripsi: item.description,
                    file_url: item.file_path, // Asumsi file_path adalah URL file
                    file_name: item.file_name,
                    type: 'naskah',
                    searchKeywords: `${item.title} ${item.author} ${item.description} ${item.period} ${item.file_name || ''}`.toLowerCase()
                }));
                naskahSejarahItems = allDigilibItems; // Ini adalah data yang akan ditampilkan

                renderHistories(); // Render daftar setelah dimuat
            } else {
                console.warn("Tidak ada data Naskah Sejarah dari API.");
                noDataMessage.classList.remove('hidden'); // Tampilkan pesan jika tidak ada data
            }
        } catch (error) {
            console.error("Error loading Naskah Sejarah from API:", error);
            window.showCustomMessage("Gagal memuat Naskah Sejarah. Silakan coba lagi.", "error");
            noDataMessage.classList.remove('hidden');
            noDataMessage.textContent = `Gagal memuat data: ${error.message || 'Terjadi kesalahan jaringan'}.`;
        }
    }

    // --- UI LOGIC ---
    /**
     * Renders the list of history documents based on the search input.
     */
    function renderHistories() {
        const query = searchInput.value.toLowerCase();
        let filteredData = naskahSejarahItems; // Gunakan data nyata yang sudah dimuat

        if (query) {
            filteredData = filteredData.filter(h =>
                (h.judul && h.judul.toLowerCase().includes(query)) ||
                (h.penulis && h.penulis.toLowerCase().includes(query)) ||
                (h.periode && h.periode.toLowerCase().includes(query)) ||
                (h.deskripsi && h.deskripsi.toLowerCase().includes(query))
            );
        }

        historyList.innerHTML = '';
        if (filteredData.length === 0) {
            noDataMessage.classList.remove('hidden');
            noDataMessage.textContent = query ? 'Naskah tidak ditemukan.' : 'Belum ada data naskah sejarah.';
        } else {
            noDataMessage.classList.add('hidden');
            filteredData.forEach(h => {
                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `
                    <div class="icon-wrapper"><i class="fas fa-landmark"></i></div>
                    <div class="item-content">
                        <p class="item-title">${h.judul}</p>
                        <p class="item-period">Penulis: ${h.penulis} | Periode: ${h.periode || 'N/A'}</p>
                    </div>
                    <div class="flex-shrink-0 ml-4">
                        <button class="btn btn-primary-modern btn-sm view-detail-btn" data-id="${h.id}" data-type="${h.type}">
                            <i class="fas fa-eye mr-2"></i>Lihat Detail
                        </button>
                    </div>
                    <div class="admin-actions flex-shrink-0 ml-4 space-x-3" style="display: ${loggedInUser && loggedInUser.role === 'komisariat' ? 'flex' : 'none'};">
                         <button data-action="edit" data-id="${h.id}" class="text-pmii-yellow hover:text-white" title="Edit"><i class="fas fa-edit"></i></button>
                         <button data-action="delete" data-id="${h.id}" class="text-red-600 hover:text-red-800" title="Hapus"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                historyList.appendChild(item);
            });

            historyList.querySelectorAll('.view-detail-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const itemId = e.currentTarget.dataset.id;
                    const itemType = e.currentTarget.dataset.type;
                    const foundItem = allDigilibItems.find(item => item.id === itemId && item.type === itemType); // Find from all items, not just historical
                    if (foundItem) {
                        showUniversalDetailModal(foundItem);
                    } else {
                        window.showCustomMessage('Dokumen tidak ditemukan.', 'error');
                    }
                });
            });

            // Attach event listeners for admin action buttons (edit/delete)
            historyList.querySelectorAll('.admin-actions button').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const action = this.dataset.action;
                    const id = this.dataset.id;
                    if (action === 'edit') {
                        const itemToEdit = naskahSejarahItems.find(item => item.id === id);
                        if (itemToEdit) openDataModal(itemToEdit);
                        else window.showCustomMessage('Item tidak ditemukan untuk diedit.', 'error');
                    } else if (action === 'delete') {
                        window.showCustomConfirm('Hapus Naskah', 'Apakah Anda yakin ingin menghapus naskah ini? Tindakan ini tidak dapat dibatalkan.', async () => {
                            try {
                                const response = await deleteDigilibItem(id); // Panggil API delete
                                if (response && response.success) {
                                    window.showCustomMessage('Naskah berhasil dihapus!', 'success');
                                    await loadNaskahSejarahData(); // Muat ulang data
                                } else {
                                    throw new Error(response.message || 'Gagal menghapus naskah.');
                                }
                            } catch (error) {
                                console.error("Error deleting naskah:", error);
                                window.showCustomMessage(error.message || 'Terjadi kesalahan saat menghapus naskah.', 'error');
                            }
                        });
                    }
                });
            });
        }
    }

    // Universal modal open/close functions (replicated for consistency)
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.add('active');
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.classList.remove('active');
    };

    // Universal Detail Modal display function (from digilib.js, adapted for Naskah)
    function showUniversalDetailModal(item) {
        detailResultJudul.textContent = item.judul || item.title || 'Tidak Diketahui';
        detailResultPenulis.textContent = item.penulis || item.author || 'Tidak Diketahui';
        detailResultAbstrak.textContent = item.abstrak || item.deskripsi || item.description || 'Tidak ada deskripsi.';

        // Hide all optional fields by default
        detailResultRayonContainer.classList.add('hidden');
        detailResultTahunContainer.classList.add('hidden');
        detailResultPenerbitContainer.classList.add('hidden');
        detailResultPeriodeContainer.classList.add('hidden');
        detailResultTanggalUnggahContainer.classList.add('hidden');

        // Show relevant fields based on document type (focused on Naskah, but generic parts kept)
        if (item.type === 'naskah') {
            if (item.periode) { detailResultPeriode.textContent = item.periode; detailResultPeriodeContainer.classList.remove('hidden'); }
        } else if (item.type === 'makalah') {
            if (item.rayon_name) { detailResultRayon.textContent = item.rayon_name; detailResultRayonContainer.classList.remove('hidden'); }
            if (item.upload_date) { detailResultTanggalUnggah.textContent = new Date(item.upload_date).toLocaleDateString('id-ID'); detailResultTanggalUnggahContainer.classList.remove('hidden'); }
        } else if (item.type === 'buku') {
            if (item.publication_year) { detailResultTahun.textContent = item.publication_year; detailResultTahunContainer.classList.remove('hidden'); }
            if (item.publisher) { detailResultPenerbit.textContent = item.publisher; detailResultPenerbitContainer.classList.remove('hidden'); }
        } else if (item.type === 'prosiding' || item.type === 'jurnal') {
            if (item.year) { detailResultTahun.textContent = item.year; detailResultTahunContainer.classList.remove('hidden'); }
        }

        // Handle download link based on login status
        const actualFileUrl = item.file_url || '#';
        const actualFileName = item.file_name || 'document';

        const authData = getAuthData(); // Get current auth status
        const userRole = authData.userData ? authData.userData.role : 'public';

        if (userRole === 'public') {
            detailResultDownloadLink.removeAttribute('href');
            detailResultDownloadLink.onclick = (e) => {
                e.preventDefault();
                closeModal('detailSearchResultModal');
                window.showCustomMessage('Silakan login untuk mengunduh dokumen.', 'info', () => {
                    window.location.assign('../login.php');
                });
            };
            detailResultDownloadLink.classList.remove('hidden');
        } else {
            detailResultDownloadLink.href = actualFileUrl;
            detailResultDownloadLink.download = actualFileName;
            detailResultDownloadLink.onclick = null; // Remove previous onclick handler if any
            detailResultDownloadLink.classList.remove('hidden');
        }

        openModal('detailSearchResultModal');
    }

    // --- FORM & FILE HANDLING ---
    /**
     * Handles file input change, validating file size and staging the file.
     */
    fileUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                window.showCustomMessage('Ukuran file terlalu besar. Maksimal 10MB.', 'error');
                fileUploadInput.value = '';
                stagedFile = null;
                fileNamePreview.textContent = 'PDF, DOCX, JPG, PNG hingga 10MB';
                filePreviewImage.classList.add('hidden');
                filePreviewImage.src = '';
                return;
            }
            
            // Check file type for image preview
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    filePreviewImage.src = event.target.result;
                    filePreviewImage.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                filePreviewImage.classList.add('hidden');
                filePreviewImage.src = '';
            }

            stagedFile = file;
            fileNamePreview.textContent = file.name;
        } else {
            stagedFile = null;
            fileNamePreview.textContent = 'PDF, DOCX, JPG, PNG hingga 10MB';
            filePreviewImage.classList.add('hidden');
            filePreviewImage.src = '';
        }
    });

    /**
     * Handles the form submission for adding or editing history documents.
     */
    dataForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = docIdInput.value || null; // Will be empty for new entry
        const judul = judulInput.value.trim();
        const penulis = penulisInput.value.trim();
        const periode = periodeInput.value.trim();
        const deskripsi = deskripsiTextarea.value.trim();

        if (!judul || !penulis || !periode) {
            window.showCustomMessage('Judul, Penulis, dan Periode wajib diisi.', 'error');
            return;
        }

        let fileUrl = null;
        let fileName = null;

        if (stagedFile) {
            // Unggah file baru
            try {
                // Asumsi uploadFile mengembalikan { file_url, file_name }
                const uploadResponse = await uploadFile(fileUploadInput, { type: 'document', category_name: 'Naskah Sejarah' });
                if (uploadResponse && uploadResponse.file_url) {
                    fileUrl = uploadResponse.file_url;
                    fileName = uploadResponse.file_name;
                    window.showCustomMessage(`File "${fileName}" berhasil diunggah.`, 'success');
                } else {
                    throw new Error(uploadResponse.message || "Gagal mengunggah file.");
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                window.showCustomMessage(`Gagal mengunggah file: ${error.message}`, 'error');
                return; // Hentikan proses jika unggah gagal
            }
        } else if (id) {
            // Jika mengedit dan tidak ada file baru diunggah, pertahankan file yang sudah ada
            const existingItem = naskahSejarahItems.find(item => item.id === id);
            if (existingItem) {
                fileUrl = existingItem.file_url;
                fileName = existingItem.file_name;
            }
        }

        if (!fileUrl) {
            window.showCustomMessage('Mohon unggah file naskah atau pastikan file sudah ada jika mengedit.', 'error');
            return;
        }

        const itemData = {
            title: judul, // Map to API's 'title' field
            author: penulis,
            period: periode,
            description: deskripsi,
            file_path: fileUrl, // Map to API's 'file_path' field
            file_name: fileName,
            category_name: 'Naskah Sejarah' // Tentukan kategori untuk API DigilibItem
        };

        try {
            let response;
            if (id) {
                response = await updateDigilibItem(id, itemData); // Panggil API update
            } else {
                response = await uploadDigilibItem(itemData); // Panggil API upload (create)
            }

            if (response && response.success) {
                window.showCustomMessage(`Naskah berhasil ${id ? 'diperbarui' : 'ditambahkan'}!`, 'success');
                dataForm.reset();
                fileNamePreview.textContent = 'PDF, DOCX, JPG, PNG hingga 10MB';
                filePreviewImage.classList.add('hidden');
                filePreviewImage.src = '';
                stagedFile = null;
                closeModal('data-modal');
                await loadNaskahSejarahData(); // Muat ulang data setelah perubahan
            } else {
                throw new Error(response.message || `Gagal ${id ? 'memperbarui' : 'menambahkan'} naskah.`);
            }
        } catch (error) {
            console.error(`Error saving naskah:`, error);
            window.showCustomMessage(error.message || `Terjadi kesalahan saat menyimpan naskah.`, 'error');
        }
    });


    // --- MODAL & EVENT LISTENERS ---
    /**
     * Opens the data entry modal for adding or editing a history document.
     */
    function openDataModal(itemToEdit = null) {
        dataForm.reset();
        fileNamePreview.textContent = 'PDF, DOCX, JPG, PNG hingga 10MB';
        filePreviewImage.classList.add('hidden');
        filePreviewImage.src = '';
        stagedFile = null;

        if (itemToEdit) {
            modalTitle.textContent = 'Edit Naskah Sejarah';
            docIdInput.value = itemToEdit.id;
            judulInput.value = itemToEdit.judul;
            penulisInput.value = itemToEdit.penulis;
            periodeInput.value = itemToEdit.periode;
            deskripsiTextarea.value = itemToEdit.deskripsi;
            
            // Tampilkan nama file yang sudah ada dan pratinjau jika itu gambar
            if (itemToEdit.file_name) {
                fileNamePreview.textContent = `File saat ini: ${itemToEdit.file_name}`;
                if (itemToEdit.file_url && (itemToEdit.file_name.endsWith('.jpg') || itemToEdit.file_name.endsWith('.jpeg') || itemToEdit.file_name.endsWith('.png') || itemToEdit.file_name.endsWith('.gif'))) {
                    filePreviewImage.src = itemToEdit.file_url;
                    filePreviewImage.classList.remove('hidden');
                }
            }
        } else {
            modalTitle.textContent = 'Tambah Naskah Sejarah';
            docIdInput.value = '';
        }
        openModal('data-modal');
    }

    // Event listeners
    document.getElementById('add-data-btn').addEventListener('click', () => openDataModal());
    document.getElementById('close-modal-btn').addEventListener('click', () => closeModal('data-modal'));
    document.getElementById('cancel-btn').addEventListener('click', () => closeModal('data-modal'));
    searchInput.addEventListener('input', renderHistories);

    // --- INITIALIZATION ---
    // Panggil fungsi inisialisasi setelah DOM siap
    updateAuthUIAndPageAccess(); // Ini akan menangani otentikasi dan akses halaman

    // Setelah UI dan akses diatur, muat data
    await loadNaskahSejarahData(); // Pastikan data dimuat setelah auth

    document.getElementById('footer-year').textContent = new Date().getFullYear();

    // Scroll to Top Button
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
});