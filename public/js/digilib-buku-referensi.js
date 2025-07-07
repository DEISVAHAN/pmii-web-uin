// public/js/digilib-buku-referensi.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleLogout, getAuthData } from './auth.js';
import { getDigilibItems, uploadDigilibItem, updateDigilibItem, deleteDigilibItem, getDigilibItemById } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // --- STATE & DATA MANAGEMENT ---
    const LOCAL_STORAGE_HOMEPAGE_CONTENT_KEY = 'homepageContent'; // Used for updating homepage content
    let books = []; // Main data array for all books (filtered from allDigilibItems)
    let allDigilibItems = []; // This will hold aggregated data from various digilib categories
    const MAX_RECENT_FILES = 5;
    let recentFiles = JSON.parse(localStorage.getItem('recentFiles')) || []; // Load recent files from localStorage

    let userRole = 'public'; // 'public', 'kader', 'rayon', 'komisariat'
    let stagedCoverFile = null; // To hold the File object for upload

    // --- DOM ELEMENTS ---
    const userInfo = document.getElementById('user-info');
    const authInfoHeader = document.getElementById('auth-info-header');
    const adminControls = document.querySelectorAll('.admin-controls');
    const bookGrid = document.getElementById('book-grid');
    const noDataMessage = document.getElementById('no-data-message');
    const searchInput = document.getElementById('search-input');
    
    const dataModal = document.getElementById('data-modal');
    const dataForm = document.getElementById('data-form');
    const docIdInput = document.getElementById('document-id');
    const submitBtn = document.getElementById('submit-btn');
    const coverUploadInput = document.getElementById('cover-upload');
    const coverPreview = document.getElementById('cover-preview');

    // Elements for universal detail modal
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


    // --- NOTIFICATION & CONFIRMATION ---
    const customMessageBox = document.getElementById('customMessageBox');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    let confirmCallback = null;

    /**
     * Menampilkan pesan kustom kepada pengguna.
     * @param {string} message - Pesan yang akan ditampilkan.
     * @param {string} type - 'success', 'error', 'info'.
     * @param {Function} [callback] - Fungsi callback opsional yang akan dieksekusi setelah pesan memudar.
     */
    function showCustomMessage(message, type = 'info', callback = null) {
        customMessageBox.textContent = message;
        customMessageBox.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0'; // Reset kelas
        
        if (type === 'success') {
            customMessageBox.classList.add('bg-green-500');
        } else if (type === 'error') {
            customMessageBox.classList.add('bg-red-500');
        } else { // Default to info (blue)
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
     * Menampilkan modal konfirmasi kepada pengguna.
     * @param {string} title - Judul dialog konfirmasi.
     * @param {string} message - Pesan yang akan ditampilkan.
     * @param {Function} callback - Fungsi yang akan dieksekusi jika pengguna mengkonfirmasi.
     */
    function showCustomConfirm(title, message, callback) {
        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        confirmCallback = callback;
        document.getElementById('customConfirmModal').classList.remove('hidden');
    }

    confirmYesBtn.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        document.getElementById('customConfirmModal').classList.add('hidden');
    });
    confirmCancelBtn.addEventListener('click', () => {
        document.getElementById('customConfirmModal').classList.add('hidden');
    });

    // --- AUTHENTICATION & UI SETUP ---
    function updateAuthUIBasedOnRole() {
        const authData = getAuthData();
        userRole = authData.userData ? authData.userData.user_role : 'public';

        // Update Header (adapted from style.css and index.php)
        const headerTitleElement = document.querySelector('.internal-header .logo-text');
        if (headerTitleElement) {
            headerTitleElement.textContent = (userRole !== 'public') ? 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)' : 'Perpustakaan Digital PMII';
        }

        if (userRole !== 'public') {
            userInfo.textContent = `Halo, ${authData.userData.user_name || 'Pengguna'}`;
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

        // Show/hide admin controls based on role
        if (userRole === 'komisariat' || userRole === 'rayon') {
            adminControls.forEach(el => el.style.display = 'inline-flex');
        } else {
            adminControls.forEach(el => el.style.display = 'none');
        }
        renderBooks(); // Re-render to apply admin actions visibility
    }

    /**
     * Menangani proses logout.
     * @param {Event} e - Objek event.
     */
    function handleAuthClick(e) {
        e.preventDefault();
        if (e.target.textContent === 'Logout') {
            showCustomConfirm('Konfirmasi Logout', 'Apakah Anda yakin ingin logout?', () => {
                handleLogout(); // Panggil fungsi logout dari auth.js
                window.location.reload(); // Muat ulang halaman setelah logout
            });
        } else {
            window.location.assign('login.php'); // Arahkan ke halaman login.php
        }
    }

    // Universal modal open/close functions
    /**
     * Membuka modal dengan menambahkan kelas 'active'.
     * @param {string} modalId - ID elemen modal.
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Menutup modal dengan menghapus kelas 'active'.
     * @param {string} modalId - ID elemen modal.
     */
    window.closeModal = function(modalId) { // Dibuat global agar bisa dipanggil dari onclick di HTML
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.remove('active');
            // Reset form dan preview jika modal data ditutup
            if (modalId === 'data-modal') {
                dataForm.reset();
                coverPreview.src = 'https://placehold.co/100x150/e0e0e0/9e9e9e?text=Pratinjau';
                stagedCoverFile = null;
            }
        }
    }

    /**
     * Menampilkan modal detail universal dengan informasi tentang dokumen.
     * @param {object} item - Objek dokumen yang berisi detail.
     * @param {string} item.title - Judul dokumen.
     * @param {string} item.author - Penulis dokumen.
     * @param {string} item.description - Abstrak/deskripsi dokumen.
     * @param {string} item.type - Tipe dokumen (mis. 'buku').
     * @param {number} [item.publication_year] - Tahun publikasi.
     * @param {string} [item.publisher] - Penerbit.
     * @param {string} [item.isbn] - ISBN.
     * @param {string} [item.file_path] - URL untuk mengunduh file.
     * @param {string} [item.file_name] - Nama file yang disarankan untuk diunduh.
     * @param {string} [item.cover_url] - URL sampul buku.
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
        if (item.type === 'buku') {
            if (item.publication_year) { detailResultTahun.textContent = item.publication_year; detailResultTahunContainer.classList.remove('hidden'); }
            if (item.publisher) { detailResultPenerbit.textContent = item.publisher; detailResultPenerbitContainer.classList.remove('hidden'); }
        }
        // Tambahkan kondisi untuk tipe lain jika modal ini digunakan secara universal

        // Tangani tautan unduhan berdasarkan status login
        const downloadUrl = item.file_path || '#'; // Gunakan file_path dari API
        const downloadFileName = item.file_name || 'document'; // Gunakan file_name dari API

        if (userRole === 'public') {
            detailResultDownloadLink.removeAttribute('href');
            detailResultDownloadLink.onclick = (e) => {
                e.preventDefault();
                closeModal('detailSearchResultModal');
                showCustomMessage('Silakan login untuk mengunduh dokumen.', 'info', () => {
                    window.location.assign('login.php'); // Arahkan ke login.php
                });
            };
            detailResultDownloadLink.classList.remove('hidden');
        } else {
            detailResultDownloadLink.href = downloadUrl;
            detailResultDownloadLink.download = downloadFileName;
            detailResultDownloadLink.onclick = null; 
            detailResultDownloadLink.classList.remove('hidden');

            // Tambahkan file ke riwayat terbaru hanya jika unduhan diizinkan (pengguna login)
            addFileToHistory(item); 
        }

        openModal('detailSearchResultModal');
    }

    // --- File History Management ---
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
            id: fileItem.item_id, // Asumsi item_id adalah ID unik
            title: fileItem.title,
            author: fileItem.author,
            type: fileItem.type,
            file_url: fileItem.file_path,
            file_name: fileItem.file_name
        };

        recentFiles = recentFiles.filter(item => !(item.id === simplifiedItem.id && item.type === simplifiedItem.type));
        recentFiles.unshift(simplifiedItem);
        
        if (recentFiles.length > MAX_RECENT_FILES) {
            recentFiles = recentFiles.slice(0, MAX_RECENT_FILES);
        }
        localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
    }

    // --- DATA AGGREGATION (FROM API) ---
    /**
     * Memuat semua data perpustakaan digital dari API.
     * Menggabungkan data dari berbagai kategori (buku, prosiding, naskah sejarah).
     */
    async function loadAllDigilibData() {
        allDigilibItems = []; // Bersihkan data agregat sebelumnya
        books = []; // Bersihkan data buku spesifik halaman ini

        try {
            const digilibItemsResponse = await getDigilibItems({ status: 'approved' });
            if (digilibItemsResponse && digilibItemsResponse.data) {
                digilibItemsResponse.data.forEach(item => {
                    let type = 'lain-lain'; // Default
                    if (item.category_name === 'Buku Referensi') {
                        type = 'buku';
                    } else if (item.category_name === 'Prosiding Seminar') {
                        type = 'prosiding';
                    } else if (item.category_name === 'Naskah Sejarah') {
                        type = 'naskah';
                    }
                    
                    const processedItem = {
                        item_id: item.item_id,
                        title: item.title,
                        author: item.author,
                        description: item.description,
                        type: type,
                        publication_year: item.publication_year,
                        publisher: item.publisher,
                        isbn: item.isbn,
                        period: item.period, // For historical manuscripts
                        file_path: item.file_path,
                        file_name: item.file_name,
                        cover_url: item.cover_url, // Asumsi ada cover_url
                        searchKeywords: `${item.title} ${item.author} ${item.description} ${item.category_name} ${item.publication_year} ${item.publisher} ${item.isbn} ${item.period}`.toLowerCase()
                    };
                    allDigilibItems.push(processedItem);

                    if (type === 'buku') {
                        books.push(processedItem); // Tambahkan ke array buku spesifik halaman ini
                    }
                });
            }
            console.log("Semua Item Digilib yang Agregat (dari API):", allDigilibItems);
            console.log("Buku Referensi yang Dimuat (dari API):", books);

        } catch (error) {
            console.error("Error memuat data digilib dari API:", error);
            showCustomMessage("Gagal memuat data perpustakaan digital dari server. Silakan coba lagi nanti.", "error");
        } finally {
            renderBooks(); // Render buku setelah data dimuat (atau gagal dimuat)
        }
    }

    // --- UI LOGIC ---
    /**
     * Merender daftar buku berdasarkan input pencarian.
     */
    function renderBooks() {
        const query = searchInput.value.toLowerCase();
        const filteredBooks = books.filter(book => 
            book.searchKeywords.includes(query) // Gunakan searchKeywords yang sudah dibuat
        );

        bookGrid.innerHTML = '';
        if (filteredBooks.length === 0) {
            noDataMessage.classList.remove('hidden');
            noDataMessage.textContent = query ? 'Tidak ada buku yang cocok.' : 'Belum ada data buku.';
        } else {
            noDataMessage.classList.add('hidden');
            filteredBooks.forEach(book => {
                const card = document.createElement('div');
                card.className = 'book-card';
                card.setAttribute('data-id', book.item_id); // Gunakan item_id
                card.setAttribute('data-type', book.type);
                
                card.innerHTML = `
                    <div class="cover-image" style="background-image: url('${book.cover_url || 'https://placehold.co/400x600/e0e0e0/9e9e9e?text=No+Cover'}')"
                         onerror="this.style.backgroundImage='url(https://placehold.co/400x600/e0e0e0/9e9e9e?text=Error)'">
                        ${!book.cover_url ? '<i class="fas fa-book-open fa-3x"></i>' : ''}
                    </div>
                    <div class="card-content">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">${book.author}</p>
                        <div class="action-buttons">
                            <button class="btn-modern btn-outline-modern view-detail-btn" data-id="${book.item_id}" data-type="${book.type}">
                                Lihat Detail
                            </button>
                        </div>
                    </div>
                    <div class="admin-actions p-3 text-right">
                         <button data-action="edit" data-id="${book.item_id}" class="text-yellow-600 hover:text-yellow-800 mr-3" title="Edit"><i class="fas fa-edit"></i></button>
                         <button data-action="delete" data-id="${book.item_id}" class="text-red-600 hover:text-red-800" title="Hapus"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                bookGrid.appendChild(card);
            });

            // Add event listeners for the "Lihat Detail" buttons
            bookGrid.querySelectorAll('.view-detail-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const itemId = e.currentTarget.dataset.id;
                    const itemType = e.currentTarget.dataset.type;
                    
                    try {
                        const response = await getDigilibItemById(itemId); // Ambil detail dari API
                        if (response.success && response.data) {
                            showUniversalDetailModal({ ...response.data, type: itemType }); // Gabungkan dengan tipe
                        } else {
                            showCustomMessage('Detail buku tidak ditemukan dari server.', 'error');
                        }
                    } catch (error) {
                        console.error('Error fetching book detail:', error);
                        showCustomMessage('Gagal memuat detail buku.', 'error');
                    }
                });
            });
        }
        
        // Tampilkan/sembunyikan kontrol admin
        if (userRole === 'komisariat' || userRole === 'rayon') {
            bookGrid.querySelectorAll('.admin-actions').forEach(el => el.style.display = 'block');
        } else {
            bookGrid.querySelectorAll('.admin-actions').forEach(el => el.style.display = 'none');
        }
    }
        
    // --- FILE HANDLING ---
    /**
     * Menangani perubahan input file, memvalidasi ukuran file dan menyiapkan file.
     * @param {Event} e - Objek event.
     */
    coverUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showCustomMessage('File yang diunggah harus berupa gambar.', 'error');
                coverUploadInput.value = '';
                stagedCoverFile = null;
                coverPreview.src = 'https://placehold.co/100x150/e0e0e0/9e9e9e?text=Pratinjau';
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // Batas 2MB
                showCustomMessage('Ukuran file terlalu besar. Maksimal 2MB.', 'error');
                coverUploadInput.value = '';
                stagedCoverFile = null;
                coverPreview.src = 'https://placehold.co/100x150/e0e0e0/9e9e9e?text=Pratinjau';
                return;
            }
            stagedCoverFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                coverPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            stagedCoverFile = null;
            coverPreview.src = 'https://placehold.co/100x150/e0e0e0/9e9e9e?text=Pratinjau';
        }
    });


    // --- CRUD OPERATIONS ---
    /**
     * Menangani pengiriman formulir untuk menambah atau mengedit data buku.
     * @param {Event} e - Objek event.
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Menyimpan...';

        const id = docIdInput.value ? docIdInput.value : null; // item_id dari API adalah string/number
        
        const bookData = {
            title: document.getElementById('judul').value,
            author: document.getElementById('penulis').value,
            publisher: document.getElementById('penerbit').value,
            publication_year: parseInt(document.getElementById('tahun').value),
            isbn: document.getElementById('isbn').value,
            description: document.getElementById('ringkasan').value,
            external_link: document.getElementById('linkEksternal').value,
            category_name: 'Buku Referensi', // Kategori tetap
            status: 'approved', // Asumsi buku referensi langsung disetujui
            user_id: getAuthData().userData ? getAuthData().userData.user_id : null // ID pengguna yang mengunggah
        };

        const formData = new FormData();
        for (const key in bookData) {
            formData.append(key, bookData[key]);
        }

        if (stagedCoverFile) {
            formData.append('cover_image', stagedCoverFile);
        }

        try {
            let response;
            if (id) {
                // Perbarui buku yang sudah ada
                response = await updateDigilibItem(id, formData); // Mengirim FormData untuk update
                if (response.success) {
                    showCustomMessage(response.message || 'Buku berhasil diperbarui!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal memperbarui buku.');
                }
            } else {
                // Tambah buku baru
                if (!stagedCoverFile) {
                    showCustomMessage('Mohon unggah sampul buku.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Simpan';
                    return;
                }
                response = await uploadDigilibItem(formData); // Mengirim FormData untuk upload
                if (response.success) {
                    showCustomMessage(response.message || 'Buku baru berhasil ditambahkan!', 'success');
                } else {
                    throw new Error(response.message || 'Gagal menambahkan buku.');
                }
            }
            
            await loadAllDigilibData(); // Muat ulang data dari API
            renderBooks();
            closeModal('data-modal');
            
        } catch (error) {
            console.error("Error during book CRUD operation:", error);
            showCustomMessage(error.message || "Terjadi kesalahan saat menyimpan data buku.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan';
        }
    }

    /**
     * Membuka modal entri data untuk menambah atau mengedit buku.
     * @param {object|null} book - Objek buku untuk diedit, atau null untuk entri baru.
     */
    function openDataModal(book = null) {
        dataForm.reset();
        coverPreview.src = 'https://placehold.co/100x150/e0e0e0/9e9e9e?text=Pratinjau'; // Reset preview
        stagedCoverFile = null; // Clear staged file

        if (book) {
            document.getElementById('modal-title').textContent = 'Edit Buku';
            docIdInput.value = book.item_id; // Gunakan item_id
            document.getElementById('judul').value = book.title;
            document.getElementById('penulis').value = book.author;
            document.getElementById('penerbit').value = book.publisher;
            document.getElementById('tahun').value = book.publication_year;
            document.getElementById('isbn').value = book.isbn;
            document.getElementById('ringkasan').value = book.description;
            document.getElementById('linkEksternal').value = book.external_link;
            if(book.cover_url) coverPreview.src = book.cover_url; // Tampilkan sampul yang ada
        } else {
            document.getElementById('modal-title').textContent = 'Tambah Buku Baru';
            docIdInput.value = '';
        }
        openModal('data-modal'); // Panggil fungsi openModal universal
    }

    /**
     * Menghapus buku dari daftar.
     * @param {number} id - ID buku yang akan dihapus.
     */
    async function deleteBook(id) {
        try {
            const response = await deleteDigilibItem(id); // Panggil API untuk menghapus
            if (response.success) {
                showCustomMessage(response.message || 'Buku berhasil dihapus.', 'success');
                await loadAllDigilibData(); // Muat ulang data setelah penghapusan
                renderBooks();
            } else {
                throw new Error(response.message || 'Gagal menghapus buku.');
            }
        } catch (error) {
            console.error("Error deleting book:", error);
            showCustomMessage(error.message || "Terjadi kesalahan saat menghapus buku.", "error");
        }
    }

    // --- MODAL & EVENT LISTENERS ---
    dataForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', renderBooks);
    
    bookGrid.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (button) { // Handle admin actions (edit/delete)
            const action = button.dataset.action;
            const id = button.dataset.id; // ID dari dataset adalah string
            
            if (action === 'edit') {
                const bookToEdit = books.find(b => b.item_id == id); // Bandingkan dengan ==
                if (bookToEdit) openDataModal(bookToEdit);
                else showCustomMessage('Buku tidak ditemukan untuk diedit.', 'error');
            } else if (action === 'delete') {
                showCustomConfirm('Hapus Buku', 'Apakah Anda yakin ingin menghapus buku ini?', () => {
                    deleteBook(id); // Panggil fungsi deleteBook
                });
            }
        } else { // Handle click on the card itself to view details
            const card = e.target.closest('.book-card');
            if (card) {
                const itemId = card.dataset.id;
                const itemType = card.dataset.type;
                // Panggil API untuk mendapatkan detail item terbaru
                getDigilibItemById(itemId).then(response => {
                    if (response.success && response.data) {
                        showUniversalDetailModal({ ...response.data, type: itemType });
                    } else {
                        showCustomMessage('Detail buku tidak ditemukan dari server.', 'error');
                    }
                }).catch(error => {
                    console.error('Error fetching book detail:', error);
                    showCustomMessage('Gagal memuat detail buku.', 'error');
                });
            }
        }
    });

    document.getElementById('add-data-btn').addEventListener('click', () => openDataModal()); // Call openDataModal
    document.getElementById('close-modal-btn').addEventListener('click', () => closeModal('data-modal')); // Pass modal ID
    document.getElementById('cancel-btn').addEventListener('click', () => closeModal('data-modal')); // Pass modal ID


    // --- INITIALIZATION ---
    (async function initialize() {
        document.getElementById('footer-year').textContent = new Date().getFullYear();
        await loadAllDigilibData(); // Muat data dari API saat inisialisasi
        updateAuthUIBasedOnRole(); // Perbarui UI berdasarkan peran pengguna
    })();
});
