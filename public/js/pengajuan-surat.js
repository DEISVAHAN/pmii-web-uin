// public/js/pengajuan-surat.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getSuratSubmissions, createSuratSubmission, getUsers, getAllRayons, uploadFile, getOjsSettings } from './api.js'; // getOjsSettings for screening sheet links

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;
    let allRayons = []; // Untuk dropdown tujuan dan nama Rayon
    let allUsers = []; // Untuk daftar kader/user untuk pengiriman dokumen

    // Navbar & Auth Elements (dari index.php)
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');

    const authElements = {
        authLinkMain, mobileAuthLink: authLinkMobile,
        desktopKaderMenuContainer: document.getElementById('desktop-kader-menu-container'),
        desktopAdminMenuContainer: document.getElementById('desktop-admin-menu-container'),
        headerTitleText, mobileHeaderTitleText
    };

    updateAuthUI(authElements);

    const authData = getAuthData();
    loggedInUser = authData.userData || phpLoggedInUser;

    // Elemen DOM spesifik untuk halaman pengajuan surat
    const userRolePlaceholder = document.getElementById('user-role-placeholder');
    const rayonNamePlaceholder = document.getElementById('rayon-name-surat-placeholder-content');
    const rayonInput = document.getElementById('rayon_pengirim_surat');
    const jenisSuratSelect = document.getElementById('jenis_surat_rayon');
    const jenisSuratLainnyaContainer = document.getElementById('jenis_surat_lainnya_container');
    const tujuanPengajuanContainer = document.getElementById('tujuan_pengajuan_container');
    const tujuanPengajuanSelect = document.getElementById('tujuan_pengajuan');
    const nomorSuratPengajuanContainer = document.getElementById('nomor_surat_pengajuan_container');
    const nomorSuratPengajuanInput = document.getElementById('nomor_surat_pengajuan');

    const formRekomendasiPelantikan = document.getElementById('form_rekomendasi_pelantikan');
    const formRekomendasiRtar = document.getElementById('form_rekomendasi_rtar');
    const formRekomendasiPkd = document.getElementById('form_rekomendasi_pkd');
    const generalTextFieldsGroup = document.getElementById('general_text_fields_group');
    const fileUploadDraftGroup = document.getElementById('file_upload_draft_group');
    const backToDashboardLink = document.getElementById('back-to-dashboard-link');

    // Options for Jenis Surat
    const rayonOnlyOptions = document.querySelectorAll('.rayon-only');
    const kaderOnlyOptions = document.querySelectorAll('.kader-only');
    const generalOptions = document.querySelectorAll('.general-only');

    // Riwayat Pengajuan
    const riwayatPengajuanList = document.getElementById('riwayat-pengajuan-list');

    // Admin-provided documents (for Kader/Rayon Admin)
    const adminDocumentsSection = document.getElementById('admin-documents-section');
    const adminDocumentSectionTitle = document.getElementById('admin-document-section-title');
    const adminDocumentSectionDescription = document.getElementById('admin-document-section-description');
    const adminDocumentList = document.getElementById('admin-document-list'); // Container for dynamic docs

    // All Accounts Document History (for Komisariat Admin)
    const allAccountsDocumentHistorySection = document.getElementById('all-accounts-document-history-section');
    const allAccountsDocumentHistoryList = document.getElementById('all-accounts-document-history-list');

    // Surat Keluar Section (for Rayon & Komisariat Admin)
    const suratKeluarSection = document.getElementById('surat-keluar-section');
    const suratKeluarList = document.getElementById('surat-keluar-list');

    // File Submission Section (for Komisariat Admin)
    const fileSubmissionSection = document.getElementById('file-submission-section');
    const formFileSubmission = document.getElementById('formFileSubmission');
    const submissionTargetSelect = document.getElementById('submission_target');
    const documentTitleInput = document.getElementById('document_title');
    const documentFileInput = document.getElementById('document_file');

    // File inputs for specific surat types
    const fileDatabasePelantikan = document.getElementById('file_database_pelantikan');
    const filePermohonanRekomendasiPelantikan = document.getElementById('file_permohonan_rekomendasi_pelantikan');
    const fileLpjKepengurusan = document.getElementById('file_lpj_kepengurusan');
    const fileBeritaAcaraRtar = document.getElementById('file_berita_acara_rtar');
    const fileBeritaAcaraTimFormatur = document.getElementById('file_berita_acara_tim_formatur');
    const fileStrukturKepengurusan = document.getElementById('file_struktur_kepengurusan');
    const fileDatabaseRtar = document.getElementById('file_database_rtar');
    const filePermohonanRekomendasiRtar = document.getElementById('file_permohonan_rekomendasi_rtar');
    const fileSuketMapaba = document.getElementById('file_suket_mapaba');
    const fileHasilScreeningPkd = document.getElementById('file_hasil_screening_pkd');
    const fileRekomendasiPkdRayon = document.getElementById('file_rekomendasi_pkd_rayon');
    const fileSuratRayon = document.getElementById('file_surat_rayon'); // General draft file

    // Links for screening sheet download
    const screeningSheetDownloadHtmlLink = document.getElementById('screening_sheet_download_html_link');
    const screeningSheetDownloadWordLink = document.getElementById('screening_sheet_download_word_link');
    const screeningSheetDownloadPdfLink = document.getElementById('screening_sheet_download_pdf_link');
    let ojsSettings = null; // For OJS related download links


    // --- UTILITY FUNCTIONS ---
    // Floating label logic (adapted from previous files)
    const allFormInputs = document.querySelectorAll('.form-input');
    allFormInputs.forEach(input => {
        const label = input.closest('.input-group')?.querySelector('.input-label') || input.previousElementSibling;
        const updateLabel = () => {
            if (label && label.classList.contains('input-label')) { // Check if it's the specific floating label
                 if (input.value.trim() !== '' || (input.tagName === 'SELECT' && input.value !== '')) {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            } else if (input.classList.contains('form-input')) { // For general form-input if no floating label
                 if (input.value.trim() !== '') {
                    input.classList.add('has-value'); // Can use this class for basic styling if needed
                } else {
                    input.classList.remove('has-value');
                }
            }
        };
        updateLabel();
        input.addEventListener('input', updateLabel);
        input.addEventListener('change', updateLabel);
        input.addEventListener('blur', updateLabel);
        input.addEventListener('focus', () => {
            if (label && label.classList.contains('input-label')) label.classList.add('active-label-style');
        });
        input.addEventListener('blur', () => {
            updateLabel();
            if (label && label.classList.contains('input-label')) label.classList.remove('active-label-style');
        });
    });


    // --- DATA LOADING & RENDERING (API-BASED) ---
    async function loadInitialData() {
        try {
            const usersResponse = await getUsers();
            if (usersResponse && usersResponse.data) {
                allUsers = usersResponse.data;
            } else {
                console.warn("Gagal memuat data pengguna untuk notifikasi/dropdown.");
            }

            const rayonsResponse = await getAllRayons();
            if (rayonsResponse && rayonsResponse.data) {
                allRayons = rayonsResponse.data;
            } else {
                console.warn("Gagal memuat data rayon untuk dropdown.");
            }

            const ojsResponse = await getOjsSettings();
            if (ojsResponse && ojsResponse.data && ojsResponse.data.length > 0) {
                ojsSettings = ojsResponse.data[0]; // Assuming it returns an array
            } else {
                console.warn("Gagal memuat pengaturan OJS. Link download lembar screening mungkin tidak akurat.");
            }

        } catch (error) {
            console.error("Error loading initial data:", error);
            window.showCustomMessage("Gagal memuat data pendukung halaman. Beberapa fitur mungkin terbatas.", "error");
        }
    }


    /**
     * Memuat dan merender riwayat pengajuan surat berdasarkan peran pengguna.
     */
    async function renderRiwayat() {
        if (!riwayatPengajuanList) return;
        riwayatPengajuanList.innerHTML = '';
        riwayatPengajuanList.innerHTML = '<p class="text-center text-text-muted">Memuat riwayat pengajuan...</p>';

        try {
            const submissionsResponse = await getSuratSubmissions(); // Ambil semua pengajuan
            let allSubmissions = submissionsResponse.data || [];

            let displayedRiwayatData = [];

            if (!loggedInUser || !loggedInUser.role) {
                // If not logged in, or no role, show empty state
                riwayatPengajuanList.innerHTML = '<p class="text-center text-text-muted">Silakan login untuk melihat riwayat pengajuan Anda.</p>';
                return;
            }
            
            if (loggedInUser.role === 'kader') {
                displayedRiwayatData = allSubmissions.filter(s => s.sender_user_id === loggedInUser.user_id);
            } else if (loggedInUser.role === 'rayon') {
                displayedRiwayatData = allSubmissions.filter(s => s.sender_rayon_id === loggedInUser.rayon_id);
            } else if (loggedInUser.role === 'komisariat') {
                // Komisariat doesn't have a direct 'riwayat' form submission history
                // This section might display a message or be hidden for Komisariat
                riwayatPengajuanList.innerHTML = '<p class="text-center text-text-muted">Admin Komisariat melihat semua riwayat verifikasi di "Verifikasi Surat".</p>';
                return;
            }

            if (displayedRiwayatData.length === 0) {
                riwayatPengajuanList.innerHTML = '<p class="text-center text-text-muted">Belum ada riwayat pengajuan.</p>';
                return;
            }
            
            // Sort by latest submission date
            displayedRiwayatData.sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date));

            riwayatPengajuanList.innerHTML = ''; // Clear loading message
            displayedRiwayatData.forEach(item => {
                let statusClass, statusIcon;
                // Asumsi status API adalah 'pending', 'approved', 'rejected', 'revision'
                if(item.status === 'approved') { statusClass = 'status-disetujui'; statusIcon = 'fa-check-circle'; }
                else if (item.status === 'pending') { statusClass = 'status-menunggu'; statusIcon = 'fa-clock'; }
                else if (item.status === 'rejected') { statusClass = 'status-revisi'; statusIcon = 'fa-times-circle'; }
                else if (item.status === 'revision') { statusClass = 'status-revisi'; statusIcon = 'fa-exclamation-triangle'; } // New status
                else { statusClass = 'border-pmii-blue'; statusIcon = 'fa-info-circle'; } // Default

                const displayTanggal = item.submission_date ? new Date(item.submission_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Tanggal tidak tersedia';
                const senderName = item.sender_name || 'Tidak Diketahui'; // Asumsi sender_name
                const suratTitle = item.title || item.document_type || 'Surat'; // Asumsi title atau document_type

                riwayatPengajuanList.innerHTML += `
                    <div class="riwayat-card ${statusClass}">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-semibold text-sm text-white">${suratTitle}</p>
                                <p class="text-xs text-text-muted">Dari: ${senderName} - ${displayTanggal}</p>
                                ${item.notes ? `<p class="text-xs text-text-muted">Catatan: ${item.notes}</p>` : ''}
                            </div>
                            <span class="status-badge"><i class="fas ${statusIcon}"></i> ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                        </div>
                    </div>`;
            });
        } catch (error) {
            console.error("Error rendering riwayat:", error);
            riwayatPengajuanList.innerHTML = '<p class="text-center text-red-500">Gagal memuat riwayat pengajuan.</p>';
        }
    }


    /**
     * Memuat dan merender daftar dokumen yang disediakan admin (untuk Kader dan Admin Rayon).
     */
    async function renderAdminDocuments() {
        if (!adminDocumentList) return;
        adminDocumentList.innerHTML = '<p class="text-xs text-text-muted mt-4 text-center italic">Memuat dokumen yang disediakan admin...</p>';

        try {
            // Asumsi ada API endpoint untuk dokumen yang disediakan admin
            // Ini bisa berupa digilib item yang ditandai sebagai 'admin-provided' atau 'public-resource'
            const response = await getDigilibItems({ type: 'public-resource' }); // Asumsi filter type
            const adminDocuments = response.data || [];

            let filteredDocs = [];
            if (loggedInUser.role === 'kader') {
                filteredDocs = adminDocuments.filter(doc => doc.target_role === 'all' || doc.target_role === 'kader');
            } else if (loggedInUser.role === 'rayon') {
                filteredDocs = adminDocuments.filter(doc => doc.target_role === 'all' || doc.target_role === 'rayon');
            } else { // Should not happen if section is hidden correctly
                adminDocumentList.innerHTML = '<p class="text-xs text-text-muted mt-4 text-center italic">Tidak ada dokumen yang relevan.</p>';
                return;
            }

            adminDocumentList.innerHTML = '';
            if (filteredDocs.length === 0) {
                adminDocumentList.innerHTML = '<p class="text-xs text-text-muted mt-4 text-center italic">Tidak ada dokumen yang disediakan admin saat ini.</p>';
                return;
            }

            filteredDocs.forEach(doc => {
                const docElement = document.createElement('div');
                docElement.classList.add('riwayat-card', 'border-l-4', 'border-pmii-blue'); // General style
                docElement.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold text-sm text-white">${doc.title || doc.file_name}</p>
                            <p class="text-xs text-text-muted">Dari: ${doc.uploaded_by || 'Admin'} - ${new Date(doc.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                        <a href="${doc.file_path}" download="${doc.file_name}" class="btn-modern btn-outline-modern text-xs">
                            <i class="fas fa-download mr-1"></i> Unduh ${doc.file_name ? doc.file_name.split('.').pop().toUpperCase() : 'File'}
                        </a>
                    </div>
                `;
                adminDocumentList.appendChild(docElement);
            });

        } catch (error) {
            console.error("Error loading admin provided documents:", error);
            adminDocumentList.innerHTML = '<p class="text-xs text-red-500 mt-4 text-center italic">Gagal memuat dokumen admin.</p>';
        }
    }

    /**
     * Memuat dan merender riwayat pengiriman dokumen oleh seluruh akun (khusus Admin Komisariat).
     */
    async function renderAllAccountsDocumentHistory() {
        if (!allAccountsDocumentHistoryList) return;
        allAccountsDocumentHistoryList.innerHTML = '<p class="text-xs text-text-muted mt-4 text-center italic">Memuat riwayat pengiriman dokumen...</p>';
        
        try {
            // Asumsi API untuk mendapatkan riwayat pengiriman dokumen seluruh akun
            // Ini bisa jadi filtered activity logs atau specific endpoint
            const response = await getSystemActivityLogs({ action_type: 'document_sent' }); // Asumsi action_type
            const sentLogs = response.data || [];

            allAccountsDocumentHistoryList.innerHTML = '';
            if (sentLogs.length === 0) {
                allAccountsDocumentHistoryList.innerHTML = '<p class="text-xs text-text-muted mt-4 text-center italic">Belum ada riwayat pengiriman dokumen oleh akun.</p>';
                return;
            }

            sentLogs.forEach(log => {
                // Asumsi log memiliki fields seperti title, sender_name, recipient_name, document_url, created_at
                const logElement = document.createElement('div');
                logElement.classList.add('riwayat-card', 'border-l-4', 'border-pmii-darkblue');
                logElement.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-semibold text-sm text-white">${log.title || 'Dokumen Tanpa Judul'}</p>
                            <p class="text-xs text-text-muted">Dikirim oleh: ${log.sender_name || 'Admin'} - ${new Date(log.created_at).toLocaleDateString('id-ID')}</p>
                            <p class="text-xs text-text-muted">Kepada: ${log.recipient_name || 'Tidak Diketahui'}</p>
                        </div>
                        <a href="${log.document_url || '#'}" download="${log.document_name || 'document'}" class="btn-modern btn-outline-modern text-xs">
                            <i class="fas fa-download mr-1"></i> Unduh
                        </a>
                    </div>
                `;
                allAccountsDocumentHistoryList.appendChild(logElement);
            });

        } catch (error) {
            console.error("Error loading all accounts document history:", error);
            allAccountsDocumentHistoryList.innerHTML = '<p class="text-xs text-red-500 mt-4 text-center italic">Gagal memuat riwayat pengiriman dokumen.</p>';
        }
    }


    /**
     * Memuat dan merender daftar surat keluar (khusus Admin Rayon & Komisariat).
     */
    async function renderOutgoingSurat(role, userRayonId) {
        if (!suratKeluarList) return;
        suratKeluarList.innerHTML = '<p class="text-xs text-text-muted mt-4 text-center italic">Memuat daftar surat keluar...</p>';

        try {
            // Asumsi API untuk mendapatkan surat keluar
            let response;
            if (role === 'komisariat') {
                response = await getSuratSubmissions({ type: 'outgoing' }); // Asumsi API filter type
            } else if (role === 'rayon') {
                response = await getSuratSubmissions({ type: 'outgoing', sender_rayon_id: userRayonId });
            } else {
                suratKeluarList.innerHTML = '<p class="text-xs text-text-muted mt-4 text-center italic">Tidak ada surat keluar yang relevan.</p>';
                return;
            }

            const outgoingSurat = response.data || [];
            suratKeluarList.innerHTML = '';
            if (outgoingSurat.length === 0) {
                suratKeluarList.innerHTML = '<p class="text-xs text-text-muted mt-4 text-center italic">Belum ada surat keluar yang tercatat.</p>';
                return;
            }

            outgoingSurat.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('riwayat-card', 'border-l-4', 'border-pmii-blue');
                itemElement.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-semibold text-sm text-white">${item.document_type} - ${item.submission_id}</p>
                            <p class="text-xs text-text-muted">Penerima: ${item.recipient_name || 'Tidak Diketahui'}</p>
                            <p class="text-xs text-text-muted">Tanggal Kirim: ${new Date(item.submission_date).toLocaleDateString('id-ID')}</p>
                            <p class="text-xs text-text-muted">Status: ${item.status}</p>
                        </div>
                        <a href="${item.file_path || '#'}" target="_blank" download="${item.file_name || 'surat_keluar'}" class="btn-modern btn-outline-modern text-xs">
                            <i class="fas fa-eye mr-1"></i> Lihat Detail
                        </a>
                    </div>
                `;
                suratKeluarList.appendChild(itemElement);
            });
        } catch (error) {
            console.error("Error loading outgoing surat:", error);
            suratKeluarList.innerHTML = '<p class="text-xs text-red-500 mt-4 text-center italic">Gagal memuat daftar surat keluar.</p>';
        }
    }

    // --- FORM HANDLING (PENGIRIMAN DOKUMEN KE RAYON/KADER) ---
    async function populateSubmissionTargetDropdown() {
        if (!submissionTargetSelect) return;

        submissionTargetSelect.innerHTML = '<option value="" disabled selected>Pilih Tujuan...</option>';
        const komisariatOption = document.createElement('option');
        komisariatOption.value = 'komisariat';
        komisariatOption.textContent = 'Komisariat (Diri Sendiri)';
        submissionTargetSelect.appendChild(komisariatOption);

        try {
            const usersResponse = await getUsers();
            const rayonsResponse = await getAllRayons();
            const allRayonsData = rayonsResponse.data || [];
            const allKader = usersResponse.data ? usersResponse.data.filter(u => u.role === 'kader') : [];

            // Add Rayon options
            const rayonGroup = document.createElement('optgroup');
            rayonGroup.label = 'Rayon';
            allRayonsData.forEach(rayon => {
                const option = document.createElement('option');
                option.value = `rayon:${rayon.id}`;
                option.textContent = rayon.name;
                rayonGroup.appendChild(option);
            });
            submissionTargetSelect.appendChild(rayonGroup);

            // Add Kader options
            const kaderGroup = document.createElement('optgroup');
            kaderGroup.label = 'Kader';
            allKader.forEach(kader => {
                const option = document.createElement('option');
                option.value = `kader:${kader.user_id}`;
                option.textContent = `${kader.full_name || kader.name} (${kader.nim || kader.username} - ${kader.rayon_name || kader.rayon})`;
                kaderGroup.appendChild(option);
            });
            submissionTargetSelect.appendChild(kaderGroup);

            // Update floating label
            updateLabelClass(submissionTargetSelect);

        } catch (error) {
            console.error("Error populating submission target dropdown:", error);
            window.showCustomMessage('Gagal memuat daftar tujuan pengiriman dokumen.', 'error');
        }
    }

    // Handle form submission for "Pengiriman Dokumen" (Komisariat Admin)
    if (formFileSubmission) {
        formFileSubmission.addEventListener('submit', async function(e) {
            e.preventDefault();
            const documentTitle = documentTitleInput.value.trim();
            const submissionTargetValue = submissionTargetSelect.value;
            const documentFile = documentFileInput.files[0];

            if (!documentTitle || !submissionTargetValue || !documentFile) {
                window.showCustomMessage('Judul, tujuan, dan file dokumen wajib diisi.', 'error');
                return;
            }

            if (documentFile.size > 5 * 1024 * 1024) { // 5MB limit
                window.showCustomMessage('Ukuran file dokumen terlalu besar. Maksimal 5MB.', 'error');
                return;
            }

            let targetRole, targetId;
            if (submissionTargetValue.includes(':')) {
                [targetRole, targetId] = submissionTargetValue.split(':');
            } else {
                targetRole = submissionTargetValue;
                targetId = (targetRole === 'komisariat') ? loggedInUser.user_id : null; // Komisariat target is self
            }
            
            try {
                // 1. Upload the file first
                const uploadResponse = await uploadFile(documentFileInput, { type: 'document', purpose: 'admin_submission', sender_id: loggedInUser.user_id });
                if (!uploadResponse || !uploadResponse.file_url) {
                    throw new Error(uploadResponse.message || "Gagal mengunggah dokumen.");
                }
                const fileUrl = uploadResponse.file_url;
                const fileName = uploadResponse.file_name;

                // 2. Then create a "notification" or "document submission record"
                // Assuming `sendManualNotification` or a similar API handles sending documents
                // to specific users/roles/rayons
                const notificationResponse = await sendManualNotification({
                    title: `Dokumen Baru: ${documentTitle}`,
                    message: `Admin Komisariat telah mengirim dokumen: "${documentTitle}"`,
                    type: 'info', // Could be 'document' type if your API supports it
                    target_role: targetRole,
                    target_id: targetId,
                    sender_id: loggedInUser.user_id,
                    sender_role: loggedInUser.role,
                    document_url: fileUrl, // Include the URL of the uploaded document
                    document_name: fileName
                });

                if (notificationResponse && notificationResponse.success) {
                    window.showCustomMessage(`Dokumen "${documentTitle}" berhasil dikirim!`, 'success');
                    formFileSubmission.reset();
                    allInputs.forEach(input => updateLabelClass(input));
                    populateSubmissionTargetDropdown();
                    await renderAllAccountsDocumentHistory(); // Refresh the list of sent documents
                    await renderOutgoingSurat(loggedInUser.role, loggedInUser.rayon_id); // Refresh outgoing mail
                } else {
                    throw new Error(notificationResponse.message || 'Gagal merekam pengiriman dokumen.');
                }

            } catch (error) {
                console.error("Error submitting document:", error);
                window.showCustomMessage(error.message || 'Terjadi kesalahan saat mengirim dokumen.', 'error');
            }
        });
    }

    // --- Jenis Surat Dinamis dan Form Visibility ---
    jenisSuratSelect?.addEventListener('change', function() {
        resetFormVisibility(); // Reset all visibility before applying specific rules
        const selectedValue = this.value;

        // Pre-fill sender rayon for Rayon Admin
        if (loggedInUser && rayonInput) {
            if (loggedInUser.role === 'rayon') {
                const currentRayon = allRayons.find(r => r.id === loggedInUser.rayon_id);
                if (currentRayon) {
                    rayonInput.value = currentRayon.name;
                    rayonInput.disabled = true; // Disable if pre-filled
                    rayonInput.classList.add('has-value');
                }
            } else if (loggedInUser.role === 'kader') {
                const kaderRayon = allRayons.find(r => r.id === loggedInUser.rayon_id);
                if (kaderRayon) {
                    rayonInput.value = kaderRayon.name;
                    rayonInput.disabled = true;
                    rayonInput.classList.add('has-value');
                }
            } else {
                rayonInput.value = ''; // Clear for Komisariat
                rayonInput.disabled = false;
                rayonInput.classList.remove('has-value');
            }
        }
        
        // Show/hide Tujuan Pengajuan for Kader only
        if (loggedInUser && loggedInUser.role === 'kader') {
            tujuanPengajuanContainer.classList.remove('hidden');
            tujuanPengajuanSelect.setAttribute('required', 'required');
        } else {
            tujuanPengajuanContainer.classList.add('hidden');
            tujuanPengajuanSelect.removeAttribute('required');
        }


        if (selectedValue === 'Lainnya') {
            jenisSuratLainnyaContainer.classList.remove('hidden');
            generalTextFieldsGroup.classList.remove('hidden');
            fileUploadDraftGroup.classList.remove('hidden');
            fileSuratRayon.setAttribute('required', 'required');

            if (loggedInUser && loggedInUser.role === 'kader') {
                nomorSuratPengajuanContainer.classList.remove('hidden');
                nomorSuratPengajuanInput.setAttribute('required', 'required');
                nomorSuratPengajuanInput.removeAttribute('disabled');
            } else {
                nomorSuratPengajuanContainer.classList.add('hidden');
                nomorSuratPengajuanInput.removeAttribute('required');
                nomorSuratPengajuanInput.setAttribute('disabled', 'true');
            }

        } else if (loggedInUser && loggedInUser.role === 'rayon') {
            if (selectedValue === 'Surat Rekomendasi Pelantikan') {
                formRekomendasiPelantikan.classList.remove('hidden');
                generalTextFieldsGroup.classList.add('hidden');
                fileUploadDraftGroup.classList.add('hidden');
                fileSuratRayon.removeAttribute('required');
                // Set required for specific files
                fileDatabasePelantikan.setAttribute('required', 'required');
                filePermohonanRekomendasiPelantikan.setAttribute('required', 'required');
                fileLpjKepengurusan.setAttribute('required', 'required');
                fileBeritaAcaraRtar.setAttribute('required', 'required');
                fileBeritaAcaraTimFormatur.setAttribute('required', 'required');
                fileStrukturKepengurusan.setAttribute('required', 'required');
                judul_surat_rayon.value = `Rekomendasi Pelantikan Rayon ${loggedInUser.rayon_name || ''}`;
                isi_surat_rayon.value = 'Permohonan rekomendasi pelantikan kepengurusan rayon.';
                nomorSuratPengajuanContainer.classList.remove('hidden');
                nomorSuratPengajuanInput.setAttribute('required', 'required');

            } else if (selectedValue === 'Surat Rekomendasi RTAR') {
                formRekomendasiRtar.classList.remove('hidden');
                generalTextFieldsGroup.classList.add('hidden');
                fileUploadDraftGroup.classList.add('hidden');
                fileSuratRayon.removeAttribute('required');
                // Set required for specific files
                fileDatabaseRtar.setAttribute('required', 'required');
                filePermohonanRekomendasiRtar.setAttribute('required', 'required');
                judul_surat_rayon.value = `Rekomendasi RTAR Rayon ${loggedInUser.rayon_name || ''}`;
                isi_surat_rayon.value = 'Permohonan rekomendasi RTAR rayon.';
                nomorSuratPengajuanContainer.classList.remove('hidden');
                nomorSuratPengajuanInput.setAttribute('required', 'required');

            } else { // General type for Rayon
                generalTextFieldsGroup.classList.remove('hidden');
                fileUploadDraftGroup.classList.remove('hidden');
                fileSuratRayon.setAttribute('required', 'required');
                nomorSuratPengajuanContainer.classList.remove('hidden');
                nomorSuratPengajuanInput.setAttribute('required', 'required');
            }
        } else if (loggedInUser && loggedInUser.role === 'kader') {
            generalTextFieldsGroup.classList.remove('hidden'); // Kader always uses general text fields
            fileUploadDraftGroup.classList.add('hidden'); // Kader doesn't upload draft surat
            fileSuratRayon.removeAttribute('required');
            nomorSuratPengajuanContainer.classList.add('hidden'); // Default hidden for kader
            nomorSuratPengajuanInput.removeAttribute('required');
            nomorSuratPengajuanInput.setAttribute('disabled', 'true');

            if (selectedValue === 'Surat Rekomendasi PKD') {
                formRekomendasiPkd.classList.remove('hidden');
                // Set required for specific files
                fileSuketMapaba.setAttribute('required', 'required');
                fileHasilScreeningPkd.setAttribute('required', 'required');
                fileRekomendasiPkdRayon.setAttribute('required', 'required');
                judul_surat_rayon.value = `Rekomendasi PKD ${loggedInUser.full_name || loggedInUser.nama || ''}`;
                isi_surat_rayon.value = 'Permohonan rekomendasi Pendidikan Kader Dasar (PKD).';
            } else if (selectedValue === 'Surat Keterangan PKD') {
                judul_surat_rayon.value = `Surat Keterangan PKD ${loggedInUser.full_name || loggedInUser.nama || ''}`;
                isi_surat_rayon.value = 'Permohonan surat keterangan telah mengikuti PKD.';
            } else if (selectedValue === 'Piagam Kader Mujahid') {
                judul_surat_rayon.value = `Piagam Kader Mujahid ${loggedInUser.full_name || loggedInUser.nama || ''}`;
                isi_surat_rayon.value = 'Permohonan piagam Kader Mujahid.';
            } else if (selectedValue === 'Piagam Kader Mutaqid') {
                judul_surat_rayon.value = `Piagam Kader Mu\'taqid ${loggedInUser.full_name || loggedInUser.nama || ''}`;
                isi_surat_rayon.value = 'Permohonan piagam Kader Mu\'taqid.';
            }
        } else { // Public or Komisariat (form is mostly hidden, or for general use)
            generalTextFieldsGroup.classList.remove('hidden');
            fileUploadDraftGroup.classList.remove('hidden');
            fileSuratRayon.setAttribute('required', 'required');
            nomorSuratPengajuanContainer.classList.add('hidden');
            nomorSuratPengajuanInput.removeAttribute('required');
            nomorSuratPengajuanInput.setAttribute('disabled', 'true');
        }

        // Filter options based on role
        jenisSuratSelect.querySelectorAll('option').forEach(option => {
            option.style.display = 'none'; // Hide all first
            if (option.value === "" || option.disabled) { // Always show default empty option
                option.style.display = 'block';
            } else if (option.classList.contains('general-only')) {
                option.style.display = 'block';
            } else if (loggedInUser) {
                if (loggedInUser.role === 'rayon' && option.classList.contains('rayon-only')) {
                    option.style.display = 'block';
                }
                if (loggedInUser.role === 'kader' && option.classList.contains('kader-only')) {
                    option.style.display = 'block';
                }
            }
        });

        // Ensure current selected option is visible, or reset
        const currentSelectedOption = jenisSuratSelect.options[jenisSuratSelect.selectedIndex];
        if (currentSelectedOption && currentSelectedOption.style.display === 'none') {
            jenisSuratSelect.value = "";
        }
        updateLabelClass(jenisSuratSelect); // Update floating label
    });

    // Handle form submission
    sendNotificationForm?.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Data pengajuan umum
        let submissionData = {
            sender_user_id: loggedInUser.user_id,
            sender_role: loggedInUser.role,
            sender_name: loggedInUser.full_name || loggedInUser.nama || loggedInUser.username,
            sender_rayon_id: loggedInUser.rayon_id || null, // If Rayon Admin or Kader
            document_type: jenisSuratSelect.value, // Jenis surat yang dipilih
            notes: '', // Komentar/catatan untuk admin, bisa dari field 'isi_ringkas'
            recipient_role: null, // Diisi berdasarkan tujuan_pengajuan
            recipient_id: null,
            recipient_name: null,
            status: 'pending', // Default status
            submission_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
            file_name: null,
            file_path: null,
            metadata: {} // Untuk data spesifik jenis surat
        };

        if (jenisSuratSelect.value === 'Lainnya') {
            submissionData.document_type = document.getElementById('jenis_surat_lainnya').value.trim();
        }
        submissionData.title = document.getElementById('judul_surat_rayon').value.trim();
        submissionData.notes = document.getElementById('isi_surat_rayon').value.trim();
        submissionData.submission_id = nomorSuratPengajuanInput.value.trim(); // Gunakan sebagai ID pengajuan

        // Tentukan penerima
        if (tujuanPengajuanSelect.value) {
            const recipientParts = tujuanPengajuanSelect.value.split(':');
            submissionData.recipient_role = recipientParts[0];
            submissionData.recipient_id = recipientParts[1] || null;
            submissionData.recipient_name = tujuanPengajuanSelect.options[tujuanPengajuanSelect.selectedIndex].textContent;
        } else {
            submissionData.recipient_role = 'komisariat';
            submissionData.recipient_id = 'komisariat'; // Target default Komisariat
            submissionData.recipient_name = 'Komisariat';
        }

        // Unggah file utama (jika ada)
        let primaryFileUploaded = false;
        if (fileSuratRayon && fileSuratRayon.files && fileSuratRayon.files.length > 0) {
            try {
                const uploadResponse = await uploadFile(fileSuratRayon, { purpose: 'surat_submission', sender_id: loggedInUser.user_id });
                if (uploadResponse && uploadResponse.file_url) {
                    submissionData.file_name = uploadResponse.file_name;
                    submissionData.file_path = uploadResponse.file_url;
                    primaryFileUploaded = true;
                } else {
                    throw new Error(uploadResponse.message || "Gagal mengunggah draft surat.");
                }
            } catch (error) {
                window.showCustomMessage(`Error upload draft surat: ${error.message}`, 'error');
                return;
            }
        }

        // Handle specific document types and their metadata
        const handleSpecificFiles = async (fileInput, metadataKey, type) => {
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                try {
                    const uploadResponse = await uploadFile(fileInput, { purpose: metadataKey, sender_id: loggedInUser.user_id });
                    if (uploadResponse && uploadResponse.file_url) {
                        submissionData.metadata[metadataKey] = {
                            file_name: uploadResponse.file_name,
                            file_url: uploadResponse.file_url,
                            file_type: type
                        };
                        return true;
                    } else {
                        throw new Error(uploadResponse.message || `Gagal mengunggah ${metadataKey}.`);
                    }
                } catch (error) {
                    window.showCustomMessage(`Error upload ${metadataKey}: ${error.message}`, 'error');
                    return false;
                }
            } else if (fileInput && fileInput.hasAttribute('required')) {
                window.showCustomMessage(`File ${fileInput.labels[0].textContent.replace('(PDF/DOCX, Maks. 2MB)', '')} wajib diunggah.`, 'error');
                return false;
            }
            return true; // No file to upload or not required
        };

        let allSpecificFilesUploaded = true;

        if (jenisSuratSelect.value === 'Surat Rekomendasi Pelantikan') {
            allSpecificFilesUploaded = await handleSpecificFiles(fileDatabasePelantikan, 'database_pelantikan', 'document') && allSpecificFilesUploaded;
            allSpecificFilesUploaded = await handleSpecificFiles(filePermohonanRekomendasiPelantikan, 'permohonan_rekomendasi_pelantikan', 'document') && allSpecificFilesUploaded;
            allSpecificFilesUploaded = await handleSpecificFiles(fileLpjKepengurusan, 'lpj_kepengurusan', 'document') && allSpecificFilesUploaded;
            allSpecificFilesUploaded = await handleSpecificFiles(fileBeritaAcaraRtar, 'berita_acara_rtar', 'document') && allSpecificFilesUploaded;
            allSpecificFilesUploaded = await handleSpecificFiles(fileBeritaAcaraTimFormatur, 'berita_acara_tim_formatur', 'document') && allSpecificFilesUploaded;
            allSpecificFilesUploaded = await handleSpecificFiles(fileStrukturKepengurusan, 'struktur_kepengurusan', 'document') && allSpecificFilesUploaded;
        } else if (jenisSuratSelect.value === 'Surat Rekomendasi RTAR') {
            allSpecificFilesUploaded = await handleSpecificFiles(fileDatabaseRtar, 'database_rtar', 'document') && allSpecificFilesUploaded;
            allSpecificFilesUploaded = await handleSpecificFiles(filePermohonanRekomendasiRtar, 'permohonan_rekomendasi_rtar', 'document') && allSpecificFilesUploaded;
        } else if (jenisSuratSelect.value === 'Surat Rekomendasi PKD') {
            allSpecificFilesUploaded = await handleSpecificFiles(fileSuketMapaba, 'suket_mapaba', 'document') && allSpecificFilesUploaded;
            allSpecificFilesUploaded = await handleSpecificFiles(fileHasilScreeningPkd, 'hasil_screening_pkd', 'document') && allSpecificFilesUploaded;
            allSpecificFilesUploaded = await handleSpecificFiles(fileRekomendasiPkdRayon, 'rekomendasi_pkd_rayon', 'document') && allSpecificFilesUploaded;
        }

        if (!allSpecificFilesUploaded) {
            return; // Stop submission if any required specific file failed to upload
        }
        
        // Final check for general draft file if not specific form
        if (generalTextFieldsGroup.classList.contains('hidden') === false && !primaryFileUploaded && fileSuratRayon.hasAttribute('required')) {
            window.showCustomMessage('Draft surat wajib diunggah.', 'error');
            return;
        }


        try {
            const response = await createSuratSubmission(submissionData);
            if (response && response.success) {
                window.showCustomMessage('Pengajuan surat berhasil dikirim!', 'success');
                sendNotificationForm.reset(); // Reset form for admin panel
                // Also reset pengajuan surat form
                document.getElementById('formPengajuanSuratInternal').reset();
                resetFormVisibility();
                // Re-render relevant lists
                await renderRiwayat();
                if (loggedInUser.role === 'komisariat') {
                    await renderAllAccountsDocumentHistory();
                    await renderOutgoingSurat(loggedInUser.role, loggedInUser.rayon_id);
                } else if (loggedInUser.role === 'rayon') {
                    await renderOutgoingSurat(loggedInUser.role, loggedInUser.rayon_id);
                }
            } else {
                throw new Error(response.message || 'Gagal mengirim pengajuan surat.');
            }
        } catch (error) {
            console.error("Error submitting surat:", error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat mengirim pengajuan surat.', 'error');
        }
    });

    // Reset form visibility based on role and selected type
    function resetFormVisibility() {
        // Hide all specific forms and fields first
        jenisSuratLainnyaContainer.classList.add('hidden');
        formRekomendasiPelantikan.classList.add('hidden');
        formRekomendasiRtar.classList.add('hidden');
        formRekomendasiPkd.classList.add('hidden');

        // Remove required attributes from specific form files
        document.querySelectorAll('#form_rekomendasi_pelantikan .form-input-file, #form_rekomendasi_rtar .form-input-file, #form_rekomendasi_pkd .form-input-file').forEach(input => input.removeAttribute('required'));

        // Show general fields by default
        generalTextFieldsGroup.classList.remove('hidden');
        fileUploadDraftGroup.classList.remove('hidden');
        fileSuratRayon.setAttribute('required', 'required'); // General draft required by default

        // Hide Tujuan Pengajuan by default
        tujuanPengajuanContainer.classList.add('hidden');
        tujuanPengajuanSelect.removeAttribute('required');


        // Hide Nomor Surat by default
        nomorSuratPengajuanContainer.classList.add('hidden');
        nomorSuratPengajuanInput.removeAttribute('required');
        nomorSuratPengajuanInput.setAttribute('disabled', 'true');

        // Clear pre-filled Judul/Isi for general types
        document.getElementById('judul_surat_rayon').value = '';
        document.getElementById('isi_surat_rayon').value = '';

        // Filter 'Jenis Surat' options based on role
        jenisSuratSelect.querySelectorAll('option').forEach(option => {
            option.style.display = 'none'; // Hide all
            if (option.value === "" || option.disabled) { // Always show empty/disabled options
                option.style.display = 'block';
            } else if (option.classList.contains('general-only')) {
                option.style.display = 'block';
            } else if (loggedInUser) {
                if (loggedInUser.role === 'rayon' && option.classList.contains('rayon-only')) {
                    option.style.display = 'block';
                }
                if (loggedInUser.role === 'kader' && option.classList.contains('kader-only')) {
                    option.style.display = 'block';
                }
            }
        });

        // Ensure currently selected option (if any) is visible, or reset selection
        const currentSelectedOption = jenisSuratSelect.options[jenisSuratSelect.selectedIndex];
        if (currentSelectedOption && currentSelectedOption.style.display === 'none') {
            jenisSuratSelect.value = ""; // Reset selection if current is hidden
        }
        updateLabelClass(jenisSuratSelect); // Update floating label for jenisSuratSelect

        // Update sender rayon
        if (loggedInUser && rayonInput) {
            if (loggedInUser.role === 'rayon') {
                const currentRayon = allRayons.find(r => r.id === loggedInUser.rayon_id);
                rayonInput.value = currentRayon ? currentRayon.name : '';
                rayonInput.disabled = true;
                rayonInput.classList.add('has-value');
            } else if (loggedInUser.role === 'kader') {
                const kaderRayon = allRayons.find(r => r.id === loggedInUser.rayon_id);
                rayonInput.value = kaderRayon ? kaderRayon.name : '';
                rayonInput.disabled = true;
                rayonInput.classList.add('has-value');
            } else {
                rayonInput.value = '';
                rayonInput.disabled = false;
                rayonInput.classList.remove('has-value');
            }
        }
    }

    // Populate Tujuan Pengajuan dropdown (Komisariat, Rayon, Kader)
    async function populateTujuanPengajuanDropdown() {
        if (!tujuanPengajuanSelect) return;

        tujuanPengajuanSelect.innerHTML = '<option value="" disabled selected>Pilih tujuan...</option>';
        const komisariatOption = document.createElement('option');
        komisariatOption.value = 'komisariat';
        komisariatOption.textContent = 'Komisariat';
        tujuanPengajuanSelect.appendChild(komisariatOption);

        if (loggedInUser && loggedInUser.role !== 'komisariat') { // Kader and Rayon can submit to specific Rayons
            const rayonGroup = document.createElement('optgroup');
            rayonGroup.label = 'Rayon';
            allRayons.forEach(rayon => {
                const option = document.createElement('option');
                option.value = `rayon:${rayon.id}`;
                option.textContent = rayon.name;
                rayonGroup.appendChild(option);
            });
            tujuanPengajuanSelect.appendChild(rayonGroup);

            if (loggedInUser.role === 'kader') { // Kader can also submit to specific Kaders (if for internal doc distribution)
                const kaderGroup = document.createElement('optgroup');
                kaderGroup.label = 'Kader';
                // Asumsi getKaderProfileById API untuk mendapatkan nama kader
                const allKaderUsers = allUsers.filter(u => u.role === 'kader');
                allKaderUsers.forEach(kader => {
                    const option = document.createElement('option');
                    option.value = `kader:${kader.user_id}`;
                    option.textContent = `${kader.full_name || kader.name} (${kader.nim || kader.username})`;
                    kaderGroup.appendChild(option);
                });
                tujuanPengajuanSelect.appendChild(kaderGroup);
            }
        }
        updateLabelClass(tujuanPengajuanSelect);
    }


    // --- INITIALIZATION ---
    await updateAuthUIAndPageAccess(); // Ini akan menangani otentikasi dan akses halaman

    if (loggedInUser) {
        await loadInitialData(); // Muat data users dan rayons
        await renderRiwayat(); // Render riwayat pengajuan surat
        resetFormVisibility(); // Set initial form state based on role

        // Render admin sections if applicable
        if (loggedInUser.role === 'komisariat') {
            if (formSectionWrapper) formSectionWrapper.classList.add('hidden'); // Komisariat doesn't use this form
            if (riwayatSectionWrapper) riwayatSectionWrapper.classList.add('hidden'); // Hide rayon/kader specific history

            if (allAccountsDocumentHistorySection) {
                allAccountsDocumentHistorySection.classList.remove('hidden');
                allAccountsDocumentHistorySection.classList.add('lg:col-span-5'); // Full width
                await renderAllAccountsDocumentHistory();
            }
            if (suratKeluarSection) {
                suratKeluarSection.classList.remove('hidden');
                suratKeluarSection.classList.add('lg:col-span-5'); // Full width
                await renderOutgoingSurat(loggedInUser.role, loggedInUser.rayon_id); // Pass rayon_id if available
            }
            if (fileSubmissionSection) {
                fileSubmissionSection.classList.remove('hidden');
                fileSubmissionSection.classList.add('lg:col-span-5'); // Full width
                await populateSubmissionTargetDropdown();
            }

            // Update back link for Komisariat
            const backLink = document.getElementById('back-link');
            if (backLink) {
                backLink.href = 'admin-dashboard-komisariat.php';
                backLink.innerHTML = `<i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard Admin Kom.`;
            }

        } else if (loggedInUser.role === 'rayon') {
            if (formSectionWrapper) formSectionWrapper.classList.remove('hidden');
            if (riwayatSectionWrapper) riwayatSectionWrapper.classList.remove('hidden');

            if (adminDocumentsSection) {
                adminDocumentsSection.classList.remove('hidden');
                adminDocumentSectionTitle.textContent = 'Dokumen untuk Rayon Anda';
                adminDocumentSectionDescription.textContent = 'Berikut adalah dokumen-dokumen penting yang dapat Anda unduh dari admin komisariat.';
                await renderAdminDocuments(); // Render for Rayon
            }
            if (suratKeluarSection) {
                suratKeluarSection.classList.remove('hidden');
                await renderOutgoingSurat(loggedInUser.role, loggedInUser.rayon_id);
            }
            if (allAccountsDocumentHistorySection) allAccountsDocumentHistorySection.classList.add('hidden');
            if (fileSubmissionSection) fileSubmissionSection.classList.add('hidden');

            // Update back link for Rayon
            const backLink = document.getElementById('back-link');
            if (backLink) {
                backLink.href = 'admin-dashboard-rayon.php'; // Atau manajemen-kader.php
                backLink.innerHTML = `<i class="fas fa-arrow-left mr-2"></i>Kembali ke Dashboard Admin Rayon`;
            }

        } else if (loggedInUser.role === 'kader') {
            if (formSectionWrapper) formSectionWrapper.classList.remove('hidden');
            if (riwayatSectionWrapper) riwayatPengajuanList.closest('.content-card').classList.remove('hidden'); // Show riwayat card
            else if (riwayatSectionWrapper) riwayatSectionWrapper.classList.add('hidden'); // Hide if not needed for some reason

            if (adminDocumentsSection) {
                adminDocumentsSection.classList.remove('hidden');
                adminDocumentSectionTitle.textContent = 'Dokumen Disediakan Admin';
                adminDocumentSectionDescription.textContent = 'Berikut adalah dokumen-dokumen yang dapat Anda unduh dari admin rayon atau komisariat.';
                await renderAdminDocuments(); // Render for Kader
            }
            if (allAccountsDocumentHistorySection) allAccountsDocumentHistorySection.classList.add('hidden');
            if (suratKeluarSection) suratKeluarSection.classList.add('hidden');
            if (fileSubmissionSection) fileSubmissionSection.classList.add('hidden');

            // Update back link for Kader
            const backLink = document.getElementById('back-link');
            if (backLink) {
                backLink.href = '../index.php';
                backLink.innerHTML = `<i class="fas fa-arrow-left mr-2"></i>Kembali ke Beranda`;
            }
        }
        
        // Populate "Tujuan Pengajuan" dropdown after roles are determined
        populateTujuanPengajuanDropdown();

        // Screening Sheet Download Links (from OJS Settings)
        if (screeningSheetDownloadHtmlLink) {
            // HTML file is dynamically generated client-side from a template
            const screeningSheetHtmlContent = `
                <!DOCTYPE html>
                <html lang="id">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Lembar Screening PKD PMII</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; margin: 20px; color: #333; }
                        .container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                        h1, h2, h3 { color: #005c97; text-align: center; }
                        h1 { font-size: 2em; margin-bottom: 10px; }
                        h2 { font-size: 1.5em; margin-top: 20px; border-bottom: 2px solid #fdd835; padding-bottom: 5px; }
                        p { margin-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        th { background-color: #f0f8ff; }
                        .signature-area { display: flex; justify-content: space-around; margin-top: 50px; text-align: center; }
                        .signature-box { width: 45%; border-top: 1px dashed #aaa; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>LEMBAR SCREENING PENDIDIKAN KADER DASAR (PKD)</h1>
                        <p style="text-align: center;">Pergerakan Mahasiswa Islam Indonesia Komisariat UIN Sunan Gunung Djati Cabang Kota Bandung</p>
                        
                        <h2 style="text-align: left;">Identitas Kader</h2>
                        <p><strong>Nama:</strong> ___________________________________________________________</p>
                        <p><strong>NIM:</strong> ___________________________________________________________</p>
                        <p><strong>Asal Rayon:</strong> _______________________________________________________</p>

                        <h2 style="text-align: left;">Materi dan Paraf Screener</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Materi Screening</th>
                                    <th>Paraf Screener</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>1</td><td>Sejarah dan Keorganisasian PMII</td><td></td></tr>
                                <tr><td>2</td><td>Nilai Dasar Pergerakan (NDP)</td><td></td></tr>
                                <tr><td>3</td><td>Ahlussunnah Wal Jama'ah</td><td></td></tr>
                                <tr><td>4</td><td>Sejarah Perjuangan Bangsa</td><td></td></tr>
                                <tr><td>5</td><td>Retorika dan Public Speaking</td><td></td></tr>
                                <tr><td>6</td><td>Analisis Sosial</td><td></td></tr>
                                <tr><td>7</td><td>Manajemen Organisasi</td><td></td></tr>
                                <tr><td>8</td><td>Kepemimpinan Mahasiswa</td><td></td></tr>
                            </tbody>
                        </table>

                        <div class="signature-area">
                            <div>
                                <p>Screener</p>
                                <br><br>
                                <p>(_________________________)</p>
                            </div>
                            <div>
                                <p>Kader yang Discreening</p>
                                <br><br>
                                <p>(_________________________)</p>
                            </div>
                        </div>
                        <p style="text-align: center; font-size: 0.8em; color: #666; margin-top: 30px;">Lembar ini harus diisi lengkap dan diserahkan kepada panitia PKD.</p>
                    </div>
                </body>
                </html>
            `;
            const encodedScreeningSheet = btoa(unescape(encodeURIComponent(screeningSheetHtmlContent)));
            screeningSheetDownloadHtmlLink.href = `data:text/html;base64,${encodedScreeningSheet}`;
        }
        
        // DOCX and PDF links can come from OJS settings or other static URLs
        if (ojsSettings && ojsSettings.screening_sheet_docx_url) {
            screeningSheetDownloadWordLink.href = ojsSettings.screening_sheet_docx_url;
        } else {
            screeningSheetDownloadWordLink.href = '#'; // Placeholder if not available
        }
        if (ojsSettings && ojsSettings.screening_sheet_pdf_url) {
            screeningSheetDownloadPdfLink.href = ojsSettings.screening_sheet_pdf_url;
        } else {
            screeningSheetDownloadPdfLink.href = '#'; // Placeholder if not available
        }
    }
});