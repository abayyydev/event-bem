<?php
// user/proses_bayar_denda.php

session_start();
require_once '../core/koneksi.php';

// 1. Cek Login
if (!isset($_SESSION['santri_id'])) {
    header("Location: ../login.php");
    exit();
}

if (!isset($_GET['id']) || empty($_GET['id'])) {
    die("ID Pendaftaran tidak valid.");
}

$id_pendaftaran = (int) $_GET['id'];
$santri_id = $_SESSION['santri_id'];

// 2. Ambil data pendaftaran & besaran denda
$stmt = $pdo->prepare("SELECT p.*, w.judul, w.nominal_denda 
                       FROM pendaftaran p 
                       JOIN workshops w ON p.workshop_id = w.id 
                       WHERE p.id = ? AND p.santri_id = ?");
$stmt->execute([$id_pendaftaran, $santri_id]);
$data = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$data) {
    die("Data pendaftaran tidak ditemukan.");
}

if ($data['status_denda'] !== 'kena_denda' || $data['nominal_denda'] <= 0) {
    echo "<script>alert('Tidak ada tagihan denda.'); window.location='riwayat_transaksi.php';</script>";
    exit();
}

// 3. Konfigurasi Duitku
$merchantCode = 'D20354';
$apiKey = 'cc7e768f19d886126b3ef8b1babe81b8';
$duitku_endpoint = 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry';

$paymentAmount = (int) $data['nominal_denda'];

// Agar tidak bentrok di Duitku (Duplicate Order ID) jika santri klik berkali-kali,
// Kita buat format ID khusus: DND-{KODE_UNIK}-{TIMESTAMP}
$merchantOrderId = 'DND-' . $data['kode_unik'] . '-' . time(); 
$productDetails = 'Denda Telat Check-out: ' . substr($data['judul'], 0, 25);
$returnUrl = 'https://ukmelrahma.my.id/user/riwayat_transaksi.php';
// Penting! Kita buat file callback khusus denda agar tidak merusak logika callback tiket utama
$callbackUrl = 'https://ukmelrahma.my.id/callback_denda.php'; 

$signature = md5($merchantCode . $merchantOrderId . $paymentAmount . $apiKey);
$expiryPeriod = 60; // Batas waktu bayar 60 menit

$params = [
    'merchantCode' => $merchantCode,
    'paymentAmount' => $paymentAmount,
    'merchantOrderId' => $merchantOrderId,
    'productDetails' => $productDetails,
    'email' => $data['email_peserta'],
    'customerVaName' => $data['nama_peserta'],
    'phoneNumber' => preg_replace('/^0/', '62', trim($data['telepon_peserta'])),
    'callbackUrl' => $callbackUrl,
    'returnUrl' => $returnUrl,
    'signature' => $signature,
    'paymentMethod' => 'SQ', // Menggunakan QRIS by default
    'expiryPeriod' => $expiryPeriod
];

// 4. Eksekusi cURL ke Duitku
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $duitku_endpoint);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);

$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 5. Response / Redirect
if ($http_status == 200) {
    $result = json_decode($response, true);
    if (isset($result['paymentUrl'])) {
        // Redirect ke link bayar
        header('Location: ' . $result['paymentUrl']);
        exit();
    } else {
        die("❌ Error dari Duitku: " . ($result['statusMessage'] ?? 'Format URL tidak valid.'));
    }
} else {
    die("❌ Gagal terhubung ke Server Duitku (Status $http_status).");
}
?>