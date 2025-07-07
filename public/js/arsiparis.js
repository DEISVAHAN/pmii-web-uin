// public/js/arsiparis.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getAllRayons, getKepengurusanArchives, createKepengurusanArchive, updateKepengurusanArchive, uploadFile } from './api.js';

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

    // --- Logika Spesifik Halaman Arsiparis ---
    const uploadFormSection = document.getElementById('upload-form-section');
    const uploadFormResponse = document.getElementById('upload-form-response');
    const uploadKepengurusanForm = document.getElementById('uploadKepengurusanForm');
    const rayonSelectUpload = document.getElementById('rayonSelectUpload');
    const rayonSelectorContainer = document.getElementById('rayon-selector-container');
    const periodeInput = document.getElementById('periode');
    const ketuaInput = document.getElementById('ketua');
    const sekretarisInput = document.getElementById('sekretaris');
    const bendaharaInput = document.getElementById('bendahara');
    const jumlahKaderInput = document.getElementById('jumlahKader');
    const tanggalBerdiriInput = document.getElementById('tanggalBerdiri');
    const fileSKInput = document.getElementById('fileSK');
    const otherFilesInput = document.getElementById('otherFiles');
    const fileSKPreviewList = document.getElementById('fileSK-preview');
    const otherFilesPreviewList = document.getElementById('otherFiles-preview');

    const uploadModeRadios = document.querySelectorAll('input[name="uploadMode"]');
    const newKepengurusanFields = document.getElementById('new-kepengurusan-fields');
    const existingKepengurusanSelector = document.getElementById('existing-kepengurusan-selector');
    const existingKepengurusanSelect = document.getElementById('existingKepengurusanSelect');

    const archiveListContainer = document.getElementById('archive-list-container');
    const noArchivesMessage = document.getElementById('no-archives-message');
    const backToDashboardLink = document.getElementById('back-to-dashboard-link');
    const arsipSubtitle = document.getElementById('arsip-subtitle');

    let allRayons = []; // Data rayon dari API
    let kepengurusanArchives = []; // Data arsip dari API


    // --- Fungsi Memuat Data Rayon dari API ---
    async function loadRayonsData() {
        try {
            const response = await getAllRayons();
            if (response && response.data) {
                allRayons = response.data;
            } else {
                console.warn("Gagal memuat data rayon dari API.");
                window.showCustomMessage('Gagal memuat daftar rayon. Silakan coba lagi.', 'error');
            }
        } catch (error) {
            console.error("Error loading rayons from API:", error);
            window.showCustomMessage('Terjadi kesalahan saat memuat data rayon.', 'error');
        }
    }

    // --- Fungsi Memuat Arsip Kepengurusan dari API ---
    async function loadKepengurusanArchivesFromAPI() {
        try {
            const response = await getKepengurusanArchives(); // Asumsi endpoint ini mengambil semua arsip
            if (response && response.data) {
                kepengurusanArchives = response.data;
            } else {
                console.warn("Gagal memuat arsip kepengurusan dari API.");
                window.showCustomMessage('Gagal memuat arsip kepengurusan. Silakan coba lagi.', 'error');
            }
        } catch (error) {
            console.error("Error loading kepengurusan archives from API:", error);
            window.showCustomMessage('Terjadi kesalahan saat memuat arsip kepengurusan.', 'error');
        }
    }


    /**
     * Merender daftar arsip kepengurusan berdasarkan peran pengguna.
     */
    function renderKepengurusanArchives() {
        if (!archiveListContainer) return;

        archiveListContainer.innerHTML = '';
        noArchivesMessage.classList.add('hidden');

        let filteredArchives = [];
        if (!loggedInUser || (loggedInUser.role !== 'komisariat' && loggedInUser.role !== 'rayon')) {
            archiveListContainer.innerHTML = `<p class="text-text-muted text-center col-span-full">Silakan login sebagai Admin Komisariat atau Rayon untuk melihat arsip kepengurusan.</p>`;
            return;
        }
        
        if (loggedInUser.role === 'komisariat') {
            filteredArchives = kepengurusanArchives;
            arsipSubtitle.textContent = 'Lihat semua arsip kepengurusan Komisariat dan Rayon.';
        } else if (loggedInUser.role === 'rayon' && loggedInUser.rayon_id) { // Menggunakan rayon_id dari data login
            filteredArchives = kepengurusanArchives.filter(archive =>
                archive.rayon_id === loggedInUser.rayon_id || archive.rayon_id === 'komisariat' // Asumsi arsip komisariat juga punya rayon_id 'komisariat'
            );
            arsipSubtitle.innerHTML = `Lihat arsip kepengurusan Rayon Anda (<strong class="text-pmii-blue">${loggedInUser.rayon_name || loggedInUser.namaRayon}</strong>) dan Komisariat.`;
        } else {
            archiveListContainer.innerHTML = `<p class="text-text-muted text-center col-span-full">Akses tidak diizinkan atau data rayon tidak ditemukan.</p>`;
            return;
        }

        if (filteredArchives.length === 0) {
            noArchivesMessage.classList.remove('hidden');
            return;
        }

        // Urutkan terbaru dulu berdasarkan tanggal unggah atau tanggal berdiri
        filteredArchives.sort((a, b) => new Date(b.upload_date || b.established_date) - new Date(a.upload_date || a.established_date));

        filteredArchives.forEach(archive => {
            const card = document.createElement('div');
            card.className = 'archive-card';

            const fileSKUrl = archive.sk_file_url || '#'; // Asumsi nama field file SK adalah sk_file_url
            const fileSKName = archive.sk_file_name || 'SK'; // Asumsi nama field file SK adalah sk_file_name
            
            let otherFilesButtons = '';
            if (archive.other_files && archive.other_files.length > 0) { // Asumsi field other_files adalah array
                otherFilesButtons = archive.other_files.map((file, idx) => {
                    const fileUrl = file.file_url || '#'; // Asumsi sub-field untuk URL file lain
                    const fileName = file.file_name || `Berkas Lainnya ${idx + 1}`;
                    return fileUrl ? `<a href="${fileUrl}" download="${fileName}" class="btn-archive-action btn-download" target="_blank"><i class="fas fa-file-download mr-2"></i> ${fileName}</a>` : '';
                }).filter(Boolean).join('');
            }

            card.innerHTML = `
                <h4 class="font-bold text-pmii-darkblue">${archive.period} - ${archive.rayon_name || archive.komisariat_name || 'Komisariat'}</h4>
                <p class="text-sm text-text-secondary">Ketua: ${archive.chairman_name}</p>
                <div class="detail-row">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Berdiri: ${new Date(archive.established_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                    <i class="fas fa-users"></i>
                    <span>Jumlah Kader: ${archive.cadre_count || 0}</span>
                </div>
                <div class="detail-row">
                    <i class="fas fa-upload"></i>
                    <span>Diunggah Oleh: ${archive.uploaded_by_name || 'Admin'} (${new Date(archive.uploaded_at).toLocaleDateString('id-ID')})</span>
                </div>
                <div class="actions">
                    ${fileSKUrl !== '#' ? `<a href="${fileSKUrl}" target="_blank" download="${fileSKName}" class="btn-archive-action btn-view"><i class="fas fa-file-alt mr-2"></i> Lihat SK</a>` : ''}
                    ${otherFilesButtons}
                    <button type="button" class="btn-archive-action btn-danger delete-archive-btn" data-id="${archive.id}"><i class="fas fa-trash-alt mr-2"></i> Hapus</button>
                </div>
            `;
            archiveListContainer.appendChild(card);
        });

        // Tambahkan event listener untuk tombol hapus
        archiveListContainer.querySelectorAll('.delete-archive-btn').forEach(button => {
            button.addEventListener('click', function() {
                const archiveId = this.dataset.id;
                window.showCustomConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus arsip ini? Tindakan ini tidak dapat dibatalkan.', async (confirmed) => {
                    if (confirmed) {
                        try {
                            // Panggil API delete
                            const response = await deleteKepengurusanArchive(archiveId);
                            if (response && response.success) {
                                window.showCustomMessage('Arsip berhasil dihapus!', 'success');
                                await loadKepengurusanArchivesFromAPI(); // Muat ulang data
                                renderKepengurusanArchives(); // Render ulang daftar
                            } else {
                                throw new Error(response.message || 'Gagal menghapus arsip.');
                            }
                        } catch (error) {
                            console.error("Error deleting archive:", error);
                            window.showCustomMessage(error.message || 'Terjadi kesalahan saat menghapus arsip.', 'error');
                        }
                    }
                });
            });
        });
    }


    /**
     * Helper function to upload files and return their URL.
     * @param {FileList} filesInput - The FileList object from an input.
     * @param {string} type - 'document' or 'image' for backend validation.
     * @returns {Promise<Array<{file_name: string, file_url: string}>>} - Array of uploaded file info.
     */
    async function handleMultipleFileUpload(filesInput, type) {
        const uploadedFilesInfo = [];
        if (!filesInput || filesInput.length === 0) {
            return uploadedFilesInfo;
        }

        for (const file of filesInput) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                window.showCustomMessage(`Ukuran file "${file.name}" terlalu besar. Maksimal 5MB.`, 'error');
                continue; // Skip this file
            }
            try {
                // Perhatikan: uploadFile di api.js saat ini mungkin hanya mendukung single file.
                // Jika backend Anda mengharapkan multiple files di satu request, Anda perlu memodifikasi api.js.
                // Untuk kesederhanaan, saya akan memanggilnya satu per satu.
                const tempInput = document.createElement('input');
                tempInput.type = 'file';
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                tempInput.files = dataTransfer.files;

                const uploadResponse = await uploadFile(tempInput, { type: type, user_id: loggedInUser.user_id }); // Sertakan user_id
                if (uploadResponse && uploadResponse.file_url) {
                    uploadedFilesInfo.push({
                        file_name: file.name,
                        file_url: uploadResponse.file_url,
                        file_type: file.type // Tambahkan tipe file jika diperlukan backend
                    });
                } else {
                    throw new Error(uploadResponse.message || `Unggah file "${file.name}" gagal.`);
                }
            } catch (error) {
                console.error(`Error uploading file "${file.name}":`, error);
                window.showCustomMessage(`Gagal mengunggah file "${file.name}". ${error.message}`, 'error');
            }
        }
        return uploadedFilesInfo;
    }


    // --- Setup Upload Form ---
    async function setupUploadForm() { // Tambahkan async
        if (loggedInUser.role === 'komisariat') {
            rayonSelectorContainer.classList.remove('hidden');
            rayonSelectUpload.innerHTML = '<option value="">Pilih Rayon...</option><option value="komisariat">Komisariat</option>';
            allRayons.forEach(rayon => {
                const option = document.createElement('option');
                option.value = rayon.id;
                option.textContent = rayon.name;
                rayonSelectUpload.appendChild(option);
            });
            rayonSelectUpload.value = "";
        } else {
            rayonSelectorContainer.classList.add('hidden');
        }

        function setFormMode(mode) {
            if (mode === 'new') {
                newKepengurusanFields.classList.remove('hidden');
                existingKepengurusanSelector.classList.add('hidden');
                uploadKepengurusanForm.reset();
                periodeInput.disabled = false;
                ketuaInput.disabled = false;
                sekretarisInput.disabled = false;
                bendaharaInput.disabled = false;
                jumlahKaderInput.disabled = false;
                tanggalBerdiriInput.disabled = false;
                if (loggedInUser.role === 'komisariat') rayonSelectUpload.disabled = false;
                
                renderFilePreviews(null, fileSKPreviewList);
                renderFilePreviews(null, otherFilesPreviewList);

            } else if (mode === 'existing') {
                newKepengurusanFields.classList.add('hidden');
                existingKepengurusanSelector.classList.remove('hidden');
                uploadKepengurusanForm.reset();
                populateExistingKepengurusanDropdown(); // Panggil fungsi ini
                
                periodeInput.disabled = true;
                ketuaInput.disabled = true;
                sekretarisInput.disabled = true;
                bendaharaInput.disabled = true;
                jumlahKaderInput.disabled = true;
                tanggalBerdiriInput.disabled = true;
                rayonSelectUpload.disabled = true;
                
                renderFilePreviews(null, fileSKPreviewList);
                renderFilePreviews(null, otherFilesPreviewList);
            }
        }

        function populateExistingKepengurusanDropdown() {
            existingKepengurusanSelect.innerHTML = '<option value="">Pilih Kepengurusan...</option>';
            let relevantArchives = [];

            if (loggedInUser.role === 'komisariat') {
                relevantArchives = kepengurusanArchives;
            } else if (loggedInUser.role === 'rayon' && loggedInUser.rayon_id) {
                relevantArchives = kepengurusanArchives.filter(archive => archive.rayon_id === loggedInUser.rayon_id);
            }

            relevantArchives.forEach(archive => {
                const option = document.createElement('option');
                option.value = archive.id;
                option.textContent = `${archive.period} - ${archive.rayon_name || archive.komisariat_name || 'Komisariat'} (${archive.chairman_name})`;
                existingKepengurusanSelect.appendChild(option);
            });
        }

        existingKepengurusanSelect.addEventListener('change', function() {
            const selectedId = this.value;
            const selectedArchive = kepengurusanArchives.find(archive => archive.id === selectedId);

            if (selectedArchive) {
                periodeInput.value = selectedArchive.period || '';
                ketuaInput.value = selectedArchive.chairman_name || '';
                sekretarisInput.value = selectedArchive.secretary_name || '';
                bendaharaInput.value = selectedArchive.treasurer_name || '';
                jumlahKaderInput.value = selectedArchive.cadre_count || 0;
                tanggalBerdiriInput.value = selectedArchive.established_date ? selectedArchive.established_date.split('T')[0] : ''; // Format YYYY-MM-DD
                
                if (selectedArchive.rayon_id === 'komisariat' || !selectedArchive.rayon_id) {
                    rayonSelectUpload.value = 'komisariat';
                } else {
                    rayonSelectUpload.value = selectedArchive.rayon_id;
                }

                // Tampilkan pratinjau file yang sudah ada
                if (selectedArchive.sk_file_url && selectedArchive.sk_file_name) {
                    // Buat objek File dummy jika URL sudah ada, agar renderFilePreviews bisa menampilkannya
                    const dummyFile = new File([], selectedArchive.sk_file_name, { type: 'application/pdf' }); // Tipe bisa apa saja
                    Object.defineProperty(dummyFile, 'name', { writable: false, value: selectedArchive.sk_file_name }); // Set properti name
                    Object.defineProperty(dummyFile, 'url', { writable: false, value: selectedArchive.sk_file_url }); // Simpan URL asli
                    renderFilePreviews(dummyFile, fileSKPreviewList, true); // True untuk menandakan URL
                } else {
                    renderFilePreviews(null, fileSKPreviewList);
                }

                if (selectedArchive.other_files && selectedArchive.other_files.length > 0) {
                    const dummyOtherFiles = selectedArchive.other_files.map(file => {
                        const dummy = new File([], file.file_name, { type: file.file_type || 'application/octet-stream' });
                        Object.defineProperty(dummy, 'name', { writable: false, value: file.file_name });
                        Object.defineProperty(dummy, 'url', { writable: false, value: file.file_url });
                        return dummy;
                    });
                    renderFilePreviews(dummyOtherFiles, otherFilesPreviewList, true);
                } else {
                    renderFilePreviews(null, otherFilesPreviewList);
                }

            } else {
                uploadKepengurusanForm.reset();
                renderFilePreviews(null, fileSKPreviewList);
                renderFilePreviews(null, otherFilesPreviewList);
            }
            document.querySelectorAll('.form-input').forEach(input => {
                if (input.value) input.classList.add('has-value');
                else input.classList.remove('has-value');
            });
        });

        uploadModeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                setFormMode(this.value);
            });
        });
        setFormMode('new'); // Set mode awal


        fileSKInput.addEventListener('change', () => renderFilePreviews(fileSKInput.files[0], fileSKPreviewList));
        otherFilesInput.addEventListener('change', () => renderFilePreviews(otherFilesInput.files, otherFilesPreviewList));

        uploadKepengurusanForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            let targetRayonId = '';
            let targetRayonName = '';
            const isNewEntry = document.querySelector('input[name="uploadMode"]:checked').value === 'new';
            let currentArchiveId = null;

            let archiveData = {};

            if (isNewEntry) {
                if (loggedInUser.role === 'komisariat') {
                    if (!rayonSelectUpload.value) {
                        window.showCustomMessage('Harap pilih rayon atau "Komisariat" untuk unggahan.', 'error');
                        return;
                    }
                    targetRayonId = rayonSelectUpload.value;
                    targetRayonName = rayonSelectUpload.options[rayonSelectUpload.selectedIndex].textContent;
                } else if (loggedInUser.role === 'rayon' && loggedInUser.rayon_id) {
                    targetRayonId = loggedInUser.rayon_id;
                    targetRayonName = loggedInUser.rayon_name || 'Rayon';
                } else {
                    window.showCustomMessage('Rayon target untuk unggahan tidak dapat ditentukan.', 'error');
                    return;
                }

                if (!periodeInput.value || !ketuaInput.value || !sekretarisInput.value || !bendaharaInput.value || !tanggalBerdiriInput.value) {
                    window.showCustomMessage('Harap isi semua bidang wajib (Periode, Ketua, Sekretaris, Bendahara, Tanggal Berdiri).', 'error');
                    return;
                }
                if (!fileSKInput.files[0]) {
                    window.showCustomMessage('File SK wajib diunggah untuk kepengurusan baru.', 'error');
                    return;
                }

                archiveData = {
                    rayon_id: targetRayonId,
                    rayon_name: targetRayonId === 'komisariat' ? 'Komisariat' : targetRayonName, // Jika ID adalah 'komisariat', gunakan nama itu
                    period: periodeInput.value,
                    chairman_name: ketuaInput.value,
                    secretary_name: sekretarisInput.value,
                    treasurer_name: bendaharaInput.value,
                    cadre_count: parseInt(jumlahKaderInput.value) || 0,
                    established_date: tanggalBerdiriInput.value,
                    uploaded_by_user_id: loggedInUser.user_id, // Gunakan ID pengguna yang login
                    uploaded_by_name: loggedInUser.nama || loggedInUser.rayon_name || 'Admin',
                    uploaded_at: new Date().toISOString(),
                    sk_file_url: null, // Akan diisi setelah unggah
                    sk_file_name: null, // Akan diisi setelah unggah
                    sk_file_type: null,
                    other_files: [] // Akan diisi setelah unggah
                };
            } else { // Mode existing
                currentArchiveId = existingKepengurusanSelect.value;
                if (!currentArchiveId) {
                    window.showCustomMessage('Harap pilih kepengurusan yang sudah ada untuk menambahkan berkas.', 'error');
                    return;
                }
                let existingArchive = kepengurusanArchives.find(a => a.id === currentArchiveId);
                if (!existingArchive) {
                    window.showCustomMessage('Kesalahan: Arsip lama tidak ditemukan untuk diperbarui.', 'error');
                    return;
                }
                archiveData = {
                    ...existingArchive, // Salin data yang sudah ada
                    uploaded_by_user_id: loggedInUser.user_id,
                    uploaded_by_name: loggedInUser.nama || loggedInUser.rayon_name || 'Admin',
                    uploaded_at: new Date().toISOString()
                };
            }

            // Unggah File SK (jika ada atau baru)
            if (fileSKInput.files.length > 0) {
                const skUploadResult = await handleMultipleFileUpload(fileSKInput.files, 'document');
                if (skUploadResult.length > 0) {
                    archiveData.sk_file_url = skUploadResult[0].file_url;
                    archiveData.sk_file_name = skUploadResult[0].file_name;
                    archiveData.sk_file_type = skUploadResult[0].file_type;
                } else {
                    if (isNewEntry) { // SK file is required for new entry
                        window.showCustomMessage('Gagal mengunggah File SK. Unggahan dibatalkan.', 'error');
                        return;
                    }
                    // For existing entry, if new SK upload fails, keep old one or set null if none was previously
                    // You might want to explicitly check if old SK should be removed/kept
                }
            } else if (isNewEntry && !archiveData.sk_file_url) { // Jika mode baru dan tidak ada file SK, dan tidak ada URL lama
                window.showCustomMessage('File SK wajib diunggah untuk kepengurusan baru.', 'error');
                return;
            }

            // Unggah Berkas Lainnya
            const otherFilesUploaded = await handleMultipleFileUpload(otherFilesInput.files, 'document');
            if (otherFilesUploaded.length > 0) {
                // Gabungkan file baru dengan yang sudah ada (pastikan unik berdasarkan nama file)
                const existingOtherFiles = archiveData.other_files || [];
                const combinedOtherFiles = [...existingOtherFiles, ...otherFilesUploaded];
                const uniqueOtherFiles = [];
                const fileNamesSet = new Set();
                for(const file of combinedOtherFiles) {
                    if (file && file.file_name && !fileNamesSet.has(file.file_name)) {
                        uniqueOtherFiles.push(file);
                        fileNamesSet.add(file.file_name);
                    }
                }
                archiveData.other_files = uniqueOtherFiles;
            }


            // Kirim data ke API (create atau update)
            try {
                let response;
                if (isNewEntry) {
                    response = await createKepengurusanArchive(archiveData);
                } else {
                    response = await updateKepengurusanArchive(currentArchiveId, archiveData);
                }

                if (response && response.success) {
                    window.showCustomMessage(`Arsip kepengurusan berhasil ${isNewEntry ? 'diunggah' : 'diperbarui'}!`, 'success');
                    uploadKepengurusanForm.reset();
                    renderFilePreviews(null, fileSKPreviewList);
                    renderFilePreviews(null, otherFilesPreviewList);
                    document.querySelector('input[name="uploadMode"][value="new"]').checked = true;
                    setFormMode('new');
                    await loadKepengurusanArchivesFromAPI(); // Muat ulang data arsip dari API
                    renderKepengurusanArchives(); // Render ulang daftar arsip
                } else {
                    throw new Error(response.message || `Gagal ${isNewEntry ? 'mengunggah' : 'memperbarui'} arsip.`);
                }
            } catch (error) {
                console.error(`Error ${isNewEntry ? 'creating' : 'updating'} archive:`, error);
                window.showCustomMessage(error.message || `Terjadi kesalahan saat ${isNewEntry ? 'mengunggah' : 'memperbarui'} arsip.`, 'error');
            }
        });
    }

    /**
     * Renders file previews for file input.
     * @param {File|FileList|null} filesInput - The File object(s) or null.
     * @param {HTMLElement} previewListElement - The <ul> element to render previews into.
     * @param {boolean} isExistingFileFromUrl - True if the file is a dummy File object from a URL.
     */
    function renderFilePreviews(filesInput, previewListElement, isExistingFileFromUrl = false) {
        previewListElement.innerHTML = '';
        const files = filesInput instanceof FileList ? Array.from(filesInput) : (filesInput ? [filesInput] : []);

        files.forEach((file, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'file-preview-item';
            const fileName = file.name || "Tidak ada nama file"; // Default name
            const fileUrl = file.url || '#'; // Untuk file yang sudah ada dari URL
            
            listItem.innerHTML = `
                <span><i class="fas fa-file-alt"></i> <span class="file-name">${fileName}</span></span>
                ${isExistingFileFromUrl ? `<a href="${fileUrl}" target="_blank" class="text-pmii-blue hover:underline ml-2"><i class="fas fa-eye"></i></a>` : ''}
                <button type="button" class="remove-file-btn" data-index="${index}" data-input-id="${previewListElement.previousElementSibling.id}" data-is-existing="${isExistingFileFromUrl}">
                    <i class="fas fa-times-circle"></i>
                </button>
            `;
            previewListElement.appendChild(listItem);
        });

        previewListElement.querySelectorAll('.remove-file-btn').forEach(button => {
            button.addEventListener('click', function() {
                const indexToRemove = parseInt(this.dataset.index);
                const inputId = this.dataset.inputId;
                const isExisting = this.dataset.isExisting === 'true'; // Convert string to boolean
                
                // If it's an existing file from URL, we need to handle its removal from the main data structure later.
                // For now, just remove from display.
                if (isExisting) {
                    // Find the corresponding item in kepengurusanArchives and remove the file from its other_files array
                    const selectedArchiveId = existingKepengurusanSelect.value;
                    const archive = kepengurusanArchives.find(a => a.id === selectedArchiveId);
                    if (archive) {
                        const fileNameToRemove = this.closest('.file-preview-item').querySelector('.file-name').textContent;
                        if (inputId.includes('fileSK')) { // If it's the main SK file
                            archive.sk_file_url = null;
                            archive.sk_file_name = null;
                            archive.sk_file_type = null;
                        } else if (inputId.includes('otherFiles')) { // If it's from other files
                            archive.other_files = (archive.other_files || []).filter(f => f.file_name !== fileNameToRemove);
                        }
                        // Optionally, save the updated archive back to the API/backend
                        // await updateKepengurusanArchive(archive.id, archive); // This would be the real API call
                    }
                }

                // Remove from the FileList object
                const fileInput = document.getElementById(inputId);
                if (fileInput) {
                    const newFiles = new DataTransfer();
                    Array.from(fileInput.files).forEach((file, i) => {
                        if (i !== indexToRemove) {
                            newFiles.items.add(file);
                        }
                    });
                    fileInput.files = newFiles.files;
                    renderFilePreviews(fileInput.files, previewListElement, isExisting); // Render with updated files
                } else if (isExisting) { // Handle case where input might not be in DOM anymore, but file from URL
                    // Directly remove the list item if it's from an existing URL and no associated input
                    this.closest('.file-preview-item').remove();
                }

                window.showCustomMessage(`File "${fileName}" dihapus dari pratinjau.`, 'info');
            });
        });
    }

    // Panggil fungsi inisialisasi setelah DOM siap
    const pageCanContinue = await initializePageAccess();

    if (pageCanContinue) {
        await loadRayonsData(); // Muat data rayon untuk dropdown
        await loadKepengurusanArchivesFromAPI(); // Muat data arsip kepengurusan
        renderKepengurusanArchives(); // Render daftar arsip setelah dimuat
        setupUploadForm(); // Siapkan formulir unggah

        // Update footer year
        const tahunFooterKader = document.getElementById('tahun-footer-kader');
        if (tahunFooterKader) {
            tahunFooterKader.textContent = new Date().getFullYear();
        }

        // Scroll to top button functionality
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        window.addEventListener('scroll', () => {
            if (scrollToTopBtn) {
                scrollToTopBtn.classList.toggle('hidden', window.pageYOffset <= 300);
                scrollToTopBtn.classList.toggle('flex', window.pageYOffset > 300);
            }
        });
        if (scrollToTopBtn) scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
});