// public/js/utils.js

/**
 * Menampilkan kotak pesan kustom untuk menggantikan alert().
 * @param {string} message - Pesan yang akan ditampilkan.
 * @param {string} type - Tipe pesan: 'success', 'error', 'info'.
 * @param {Function} [callback] - Fungsi callback opsional yang akan dijalankan setelah pesan memudar.
 */
export function showCustomMessage(message, type = 'info', callback = null) {
    const messageBox = document.getElementById('customMessageBox');
    if (!messageBox) {
        console.error('Elemen #customMessageBox tidak ditemukan.');
        // Fallback to console log if message box element is missing
        console.log(`Pesan: ${message} (Tipe: ${type})`);
        if (callback) callback();
        return;
    }

    messageBox.textContent = message;
    // Reset kelas untuk memastikan transisi yang benar
    messageBox.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0';

    // Terapkan styling berdasarkan tipe
    if (type === 'success') {
        messageBox.classList.add('bg-green-500');
    } else if (type === 'error') {
        messageBox.classList.add('bg-red-500');
    } else { // Default ke info (biru)
        messageBox.classList.add('bg-blue-500');
    }

    // Tampilkan pesan
    messageBox.classList.remove('translate-x-full', 'opacity-0');
    messageBox.classList.add('translate-x-0', 'opacity-100');

    setTimeout(() => {
        messageBox.classList.remove('translate-x-0', 'opacity-100');
        messageBox.classList.add('translate-x-full', 'opacity-0');
        if (callback) {
            // Jalankan callback setelah transisi fade-out selesai
            messageBox.addEventListener('transitionend', function handler() {
                callback();
                messageBox.removeEventListener('transitionend', handler);
            });
        }
    }, 3000); // Pesan terlihat selama 3 detik
}

let currentConfirmCallback = null; // Untuk menyimpan fungsi callback konfirmasi

/**
 * Menampilkan modal konfirmasi kustom.
 * @param {string} title - Judul modal konfirmasi.
 * @param {string} message - Pesan yang akan ditampilkan di modal.
 * @param {Function} onConfirm - Fungsi callback yang akan dijalankan jika 'Ya' diklik.
 * @param {Function} [onCancel=null] - Fungsi callback opsional yang akan dijalankan jika 'Tidak' diklik.
 */
export function showCustomConfirm(title, message, onConfirm, onCancel = null) {
    const customConfirmModal = document.getElementById('customConfirmModal');
    const confirmModalTitle = document.getElementById('confirmModalTitle');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    if (!customConfirmModal || !confirmModalTitle || !confirmModalMessage || !confirmYesBtn || !confirmCancelBtn) {
        console.error('Elemen modal konfirmasi tidak ditemukan. Fallback ke window.confirm.');
        if (window.confirm(`${title}\n${message}`)) {
            onConfirm();
        } else if (onCancel) {
            onCancel();
        }
        return;
    }

    confirmModalTitle.textContent = title;
    confirmModalMessage.textContent = message;
    customConfirmModal.classList.add('active'); // Tampilkan overlay modal
    currentConfirmCallback = onConfirm; // Simpan callback konfirmasi

    // Siapkan event listener untuk tombol modal
    confirmYesBtn.onclick = () => {
        if (currentConfirmCallback) {
            currentConfirmCallback(); // Jalankan callback konfirmasi
        }
        hideCustomConfirm(); // Sembunyikan modal
    };
    confirmCancelBtn.onclick = () => {
        if (onCancel) {
            onCancel(); // Jalankan callback batal jika disediakan
        }
        hideCustomConfirm(); // Sembunyikan modal
    };

    // Tutup modal saat mengklik di luar konten
    customConfirmModal.addEventListener('click', function handler(event) {
        if (event.target === customConfirmModal) { // Periksa apakah klik terjadi pada overlay itu sendiri
            hideCustomConfirm();
        }
        customConfirmModal.removeEventListener('click', handler); // Hapus listener setelah digunakan
    });
}

/**
 * Menyembunyikan modal konfirmasi kustom.
 */
export function hideCustomConfirm() {
    const customConfirmModal = document.getElementById('customConfirmModal');
    if (customConfirmModal) {
        customConfirmModal.classList.remove('active'); // Sembunyikan overlay modal
    }
    currentConfirmCallback = null; // Bersihkan callback
}
