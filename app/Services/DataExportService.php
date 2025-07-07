<?php
// app/services/DataExportService.php

// Layanan ini bertanggung jawab untuk mengekspor data ke berbagai format,
// seperti CSV, PDF, atau Excel.

// Asumsi:
// 1. Ada kelas atau fungsi untuk mencatat log aktivitas (mis. SystemActivityLog).
// 2. Ada konfigurasi filesystem di app/config/services.php (jika perlu menyimpan file ekspor).

// use App\Models\SystemActivityLog; // Jika ada model untuk log aktivitas

class DataExportService
{
    public function __construct()
    {
        // Konstruktor layanan, bisa digunakan untuk menginjeksi dependensi
        // seperti objek filesystem, atau konfigurasi ekspor.
    }

    /**
     * Mengekspor data ke format CSV dan mengirimkannya sebagai unduhan.
     *
     * @param array $data Array data yang akan diekspor (array of associative arrays).
     * @param string $filename Nama file untuk unduhan (tanpa ekstensi).
     * @param string|null $loggedInUserId ID pengguna yang melakukan ekspor (untuk logging).
     * @param string|null $loggedInUserName Nama pengguna yang melakukan ekspor (untuk logging).
     * @param string|null $loggedInUserRole Peran pengguna yang melakukan ekspor (untuk logging).
     * @return void File CSV akan diunduh langsung ke browser.
     */
    public function exportToCsv(array $data, string $filename, ?string $loggedInUserId = null, ?string $loggedInUserName = null, ?string $loggedInUserRole = null): void
    {
        if (empty($data)) {
            // Jika tidak ada data, kirim respons JSON error atau kosongkan file CSV
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="' . $filename . '.csv"');
            echo "No data to export.\n";
            exit();
        }

        // Pastikan nama file hanya mengandung karakter yang aman
        $filename = preg_replace('/[^a-zA-Z0-9_-]/', '', $filename);
        $fullFilename = $filename . '_' . date('Ymd_His') . '.csv';

        // Set header HTTP untuk unduhan file CSV
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $fullFilename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');

        // Buka output stream
        $output = fopen('php://output', 'w');

        // Tulis Byte Order Mark (BOM) untuk kompatibilitas UTF-8 di Excel
        // fputs($output, $bom = (chr(0xEF) . chr(0xBB) . chr(0xBF)));

        // Tulis header kolom (mengambil kunci dari baris pertama data)
        fputcsv($output, array_keys($data[0]));

        // Tulis setiap baris data
        foreach ($data as $row) {
            fputcsv($output, $row);
        }

        // Tutup output stream
        fclose($output);

        // Catat aktivitas ekspor
        // SystemActivityLog::create([
        //     'activity_type' => 'Data Export',
        //     'description' => 'Data exported to CSV: ' . $fullFilename,
        //     'user_id' => $loggedInUserId ?? 'system',
        //     'user_name' => $loggedInUserName ?? 'System',
        //     'user_role' => $loggedInUserRole ?? 'system',
        //     'timestamp' => date('Y-m-d H:i:s')
        // ]);

        exit(); // Penting: Hentikan eksekusi skrip setelah file dikirim
    }

    /**
     * Metode untuk mengekspor ke format PDF (membutuhkan library PDF eksternal seperti FPDF/Dompdf)
     * Ini adalah placeholder.
     *
     * @param array $data Data yang akan diekspor.
     * @param string $filename Nama file.
     * @return bool True jika berhasil, false jika gagal.
     */
    public function exportToPdf(array $data, string $filename): bool
    {
        // Logika untuk menghasilkan PDF di sini
        // Membutuhkan library seperti Dompdf atau FPDF
        error_log("SIMULASI: Mengekspor data ke PDF: {$filename}.pdf");
        // Contoh:
        // use Dompdf\Dompdf;
        // $dompdf = new Dompdf();
        // $html = $this->generateHtmlForPdf($data); // Buat HTML dari data
        // $dompdf->loadHtml($html);
        // $dompdf->render();
        // $dompdf->stream($filename . ".pdf", ["Attachment" => true]);

        return true; // Simulasi sukses
    }

    /**
     * Metode untuk mengekspor ke format Excel (membutuhkan library seperti PhpSpreadsheet)
     * Ini adalah placeholder.
     *
     * @param array $data Data yang akan diekspor.
     * @param string $filename Nama file.
     * @return bool True jika berhasil, false jika gagal.
     */
    public function exportToExcel(array $data, string $filename): bool
    {
        // Logika untuk menghasilkan file Excel di sini
        // Membutuhkan library seperti PhpSpreadsheet
        error_log("SIMULASI: Mengekspor data ke Excel: {$filename}.xlsx");
        return true; // Simulasi sukses
    }
}
