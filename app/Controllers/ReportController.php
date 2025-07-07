<?php
// app/controllers/ReportController.php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\User;             // Sertakan model User
use App\Models\SuratSubmission;  // Sertakan model SuratSubmission
use App\Models\NewsArticle;      // Sertakan model NewsArticle
use App\Models\Activity;         // Sertakan model Activity
use App\Models\GalleryItem;      // Sertakan model GalleryItem
use App\Models\ScientificWork;   // Sertakan model ScientificWork
use App\Models\SystemActivityLog; // Sertakan model SystemActivityLog
use App\Models\KepengurusanArchive; // Sertakan model KepengurusanArchive
// use App\Models\Rayon;            // Jika perlu data rayon
use App\Services\DataExportService; // Sertakan service DataExportService

class ReportController
{
    private $request;
    private $response;
    private $db;
    private $dataExportService;

    public function __construct()
    {
        $this->request = new Request();
        $this->response = new Response();
        $this->db = new \App\Core\Database(); // Inisialisasi koneksi database
        $this->dataExportService = new DataExportService(); // Inisialisasi DataExportService
    }

    /**
     * Menghasilkan laporan berdasarkan jenis dan periode yang diminta.
     * Endpoint: POST /api/reports/generate
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @return void Respons JSON akan dikirim langsung
     */
    public function generate()
    {
        $requestData = $this->request->getBody();
        // Asumsi user yang login dapat diakses
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        $reportType = $requestData['reportType'] ?? null;
        $reportPeriod = $requestData['reportPeriod'] ?? null;
        $startDate = $requestData['startDate'] ?? null;
        $endDate = $requestData['endDate'] ?? null;

        if (!$reportType || !$reportPeriod) {
            return $this->response->json(['message' => 'Report type and period are required.'], 400);
        }

        try {
            $data = [];
            $reportTitle = '';
            $filters = [];

            // Tentukan rentang tanggal berdasarkan reportPeriod
            $filterStartDate = null;
            $filterEndDate = null;
            $now = new \DateTime(); // Gunakan namespace penuh untuk DateTime

            if ($reportPeriod === 'today') {
                $filterStartDate = $now->format('Y-m-d 00:00:00');
                $filterEndDate = $now->format('Y-m-d 23:59:59');
            } elseif ($reportPeriod === 'this_week') {
                $dayOfWeek = (int)$now->format('w'); // 0 for Sunday, 1 for Monday
                $startOfWeek = (clone $now)->modify('-' . $dayOfWeek . ' days');
                $endOfWeek = (clone $startOfWeek)->modify('+6 days');
                $filterStartDate = $startOfWeek->format('Y-m-d 00:00:00');
                $filterEndDate = $endOfWeek->format('Y-m-d 23:59:59');
            } elseif ($reportPeriod === 'this_month') {
                $filterStartDate = $now->format('Y-m-01 00:00:00');
                $filterEndDate = $now->format('Y-m-t 23:59:59'); // t = last day of month
            } elseif ($reportPeriod === 'this_year') {
                $filterStartDate = $now->format('Y-01-01 00:00:00');
                $filterEndDate = $now->format('Y-12-31 23:59:59');
            } elseif ($reportPeriod === 'last_month') {
                $lastMonth = (clone $now)->modify('first day of last month');
                $filterStartDate = $lastMonth->format('Y-m-d 00:00:00');
                $filterEndDate = (clone $lastMonth)->modify('last day of this month')->format('Y-m-d 23:59:59');
            } elseif ($reportPeriod === 'last_year') {
                $lastYear = (clone $now)->modify('first day of last year');
                $filterStartDate = $lastYear->format('Y-m-d 00:00:00');
                $filterEndDate = (clone $lastYear)->modify('last day of december this year')->format('Y-m-d 23:59:59');
            } elseif ($reportPeriod === 'custom') {
                if (!$startDate || !$endDate) {
                    return $this->response->json(['message' => 'Start date and end date are required for custom period.'], 400);
                }
                $filterStartDate = (new \DateTime($startDate))->format('Y-m-d 00:00:00');
                $filterEndDate = (new \DateTime($endDate))->format('Y-m-d 23:59:59');
            }

            if ($filterStartDate && $filterEndDate) {
                $filters['start_date'] = $filterStartDate;
                $filters['end_date'] = $filterEndDate;
            }

            switch ($reportType) {
                case 'kader':
                    $reportTitle = 'Laporan Data Kader';
                    $data = User::all($filters); // Asumsi User::all() mendukung filter tanggal created_at
                    break;
                case 'surat':
                    $reportTitle = 'Laporan Pengajuan Surat';
                    $data = SuratSubmission::all($filters); // Asumsi SuratSubmission::all() mendukung filter tanggal submission_date
                    break;
                case 'karya-ilmiah':
                    $reportTitle = 'Laporan Karya Ilmiah';
                    $data = ScientificWork::all($filters); // Asumsi ScientificWork::all() mendukung filter tanggal upload_date
                    break;
                case 'berita':
                    $reportTitle = 'Laporan Berita & Artikel';
                    $data = NewsArticle::all($filters); // Asumsi NewsArticle::all() mendukung filter tanggal publication_date
                    break;
                case 'kegiatan':
                    $reportTitle = 'Laporan Kegiatan';
                    $data = Activity::all($filters); // Asumsi Activity::all() mendukung filter tanggal activity_date
                    break;
                case 'galeri':
                    $reportTitle = 'Laporan Galeri';
                    $data = GalleryItem::all($filters); // Asumsi GalleryItem::all() mendukung filter tanggal upload_date
                    break;
                case 'aktivitas-sistem':
                    $reportTitle = 'Laporan Aktivitas Sistem';
                    $data = SystemActivityLog::all($filters); // Asumsi SystemActivityLog::all() mendukung filter timestamp
                    break;
                case 'kepengurusan_archives':
                    $reportTitle = 'Laporan Arsip Kepengurusan';
                    $data = KepengurusanArchive::all($filters); // Asumsi KepengurusanArchive::all() mendukung filter tanggal tanggal_berdiri_periode
                    break;
                default:
                    return $this->response->json(['message' => 'Invalid report type.'], 400);
            }

            if ($data === false) {
                return $this->response->json(['message' => 'Failed to retrieve data for the report.'], 500);
            }

            // Catat aktivitas
            // \App\Models\SystemActivityLog::create([
            //     'activity_type' => 'Generate Report',
            //     'description' => 'Generated ' . $reportTitle . ' for period ' . $reportPeriod . '.',
            //     'user_id' => $loggedInUser['user_id'] ?? 'unknown',
            //     'user_name' => $loggedInUser['user_name'] ?? 'unknown',
            //     'user_role' => $loggedInUser['user_role'] ?? 'unknown',
            //     'timestamp' => date('Y-m-d H:i:s')
            // ]);

            return $this->response->json([
                'message' => 'Report generated successfully.',
                'report_title' => $reportTitle,
                'data' => $data
            ], 200);

        } catch (\PDOException $e) {
            error_log("Database Error in ReportController@generate: " . $e->getMessage());
            return $this->response->json(['message' => 'Server error occurred while generating the report.'], 500);
        } catch (\Exception $e) { // Tangani error dari DateTime atau lainnya
            error_log("Error in ReportController@generate: " . $e->getMessage());
            return $this->response->json(['message' => 'An unexpected error occurred while generating the report: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Mengekspor laporan sebagai file CSV.
     * Endpoint: GET /api/reports/export/{reportType}
     * Memerlukan autentikasi dan peran 'komisariat'.
     *
     * @param array $params Parameter dari URL (reportType)
     * @return void File CSV akan diunduh langsung
     */
    public function export($params)
    {
        $reportType = $params['reportType'] ?? null;
        $queryParams = $this->request->getQueryParams();
        $reportPeriod = $queryParams['reportPeriod'] ?? null;
        $startDate = $queryParams['startDate'] ?? null;
        $endDate = $queryParams['endDate'] ?? null;
        // $loggedInUser = $_SERVER['user_data'] ?? null;

        if (!$reportType || !$reportPeriod) {
            return $this->response->json(['message' => 'Report type and period are required for export.'], 400);
        }

        // Panggil kembali logika generate untuk mendapatkan data
        // Perhatian: Memanggil metode controller lain secara langsung seperti ini tidak ideal dalam arsitektur MVC yang ketat.
        // Idealnya, logika pengambilan data laporan harus diisolasi ke dalam Service (misalnya ReportService)
        // yang kemudian dipanggil oleh ReportController@generate dan ReportController@export.
        // Untuk tujuan demonstrasi, kita akan memanggil generate() secara internal.
        $generateResponse = $this->generate(); // Panggil metode generate secara internal
        $responseData = json_decode($generateResponse->content, true); // Akses properti content dari objek Response

        if ($generateResponse->statusCode !== 200 || empty($responseData['data'])) {
            return $this->response->json(['message' => 'No data found to export or an error occurred during data retrieval.'], 404);
        }

        $data = $responseData['data'];
        $reportTitle = $responseData['report_title'];

        // Gunakan DataExportService untuk mengekspor data
        $this->dataExportService->exportToCsv(
            $data,
            str_replace(' ', '_', strtolower($reportTitle)), // Nama file yang aman
            $loggedInUser['user_id'] ?? null,
            $loggedInUser['user_name'] ?? null,
            $loggedInUser['user_role'] ?? null
        );
        // exportToCsv akan memanggil exit() setelah mengirim file
    }
}
