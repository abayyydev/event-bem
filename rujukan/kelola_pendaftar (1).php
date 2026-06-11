<?php
if (!defined('BASE_PATH')) {
    define('BASE_PATH', dirname(__DIR__));
}
$page_title = 'Data Pendaftar';
$current_page = 'data_pendaftar';
require_once BASE_PATH . '/admin/templates/header.php';
require_once BASE_PATH . '/core/koneksi.php';

$penyelenggara_id = $_SESSION['penyelenggara_id_bersama'];

// Pagination settings
$limit = 10;
$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
$offset = ($page - 1) * $limit;

// Search functionality
$search = isset($_GET['search']) ? $_GET['search'] : '';
$search_condition = '';
$search_params = [];

if (!empty($search)) {
    $search_condition = " AND (w.judul LIKE ? OR w.deskripsi LIKE ?)";
    $search_params[] = "%$search%";
    $search_params[] = "%$search%";
}

// Get total number of records for pagination
try {
    $count_sql = "SELECT COUNT(*) as total 
                  FROM workshops w 
                  WHERE w.penyelenggara_id = ? $search_condition";
    $count_stmt = $pdo->prepare($count_sql);

    // Bind params manual
    $count_stmt->bindValue(1, $penyelenggara_id, PDO::PARAM_INT);
    foreach ($search_params as $k => $v) {
        $count_stmt->bindValue($k + 2, $v, PDO::PARAM_STR);
    }

    $count_stmt->execute();
    $total_records = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    $total_pages = ceil($total_records / $limit);
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}

// Get events with pagination
try {
    $sql = "SELECT w.*, 
                   (SELECT COUNT(*) FROM pendaftaran p WHERE p.workshop_id = w.id) as jumlah_pendaftar,
                   (SELECT COUNT(*) FROM pendaftaran p WHERE p.workshop_id = w.id AND p.status_kehadiran = 'hadir') as jumlah_hadir
            FROM workshops w 
            WHERE w.penyelenggara_id = ? $search_condition
            ORDER BY w.tanggal_waktu DESC 
            LIMIT ? OFFSET ?";

    $stmt = $pdo->prepare($sql);

    $index = 1;
    $stmt->bindValue($index++, $penyelenggara_id, PDO::PARAM_INT);
    foreach ($search_params as $v) {
        $stmt->bindValue($index++, $v, PDO::PARAM_STR);
    }

    $stmt->bindValue($index++, (int) $limit, PDO::PARAM_INT);
    $stmt->bindValue($index++, (int) $offset, PDO::PARAM_INT);

    $stmt->execute();
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
?>

<div class="min-h-screen bg-gray-50 font-sans pb-32">
    
    <div class="bg-emerald-900 pb-20 pt-10 px-4 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div class="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-800 rounded-full opacity-50 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-amber-500 rounded-full opacity-20 blur-2xl"></div>

        <div class="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <div class="flex items-center gap-3 mb-3">
                    <span class="text-emerald-200 text-xs font-bold uppercase tracking-widest border border-emerald-700/50 px-2 py-1 rounded-md">Manajemen Peserta</span>
                </div>
                <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Data Pendaftar
                </h1>
                <p class="text-emerald-100/80 mt-2 text-sm md:text-base max-w-xl">
                    Kelola dan pantau peserta dari semua event yang Anda selenggarakan.
                </p>
            </div>
            
            <div class="flex gap-3">
                <div class="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col items-center min-w-[100px]">
                    <span class="text-2xl font-bold text-white"><?= $total_records ?></span>
                    <span class="text-[10px] text-emerald-200 uppercase font-bold">Total Event</span>
                </div>
                <div class="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col items-center min-w-[100px]">
                    <span class="text-2xl font-bold text-amber-400"><?= array_sum(array_column($events, 'jumlah_pendaftar')) ?></span>
                    <span class="text-[10px] text-emerald-200 uppercase font-bold">Pendaftar</span>
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8">
            <div class="relative w-full">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i class="fas fa-search text-emerald-400"></i>
                </div>
                <input type="text" id="liveSearchInput" value="<?= htmlspecialchars($search) ?>"
                    placeholder="Cari event berdasarkan judul atau deskripsi..."
                    class="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-transparent text-gray-900 placeholder-gray-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 shadow-inner">
                <div class="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <span id="loadingIcon" class="hidden text-amber-500 animate-spin">
                        <i class="fas fa-circle-notch"></i>
                    </span>
                </div>
            </div>
        </div>

        <div id="dataContainer">
            
            <div class="hidden lg:block bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-emerald-900 text-white text-sm uppercase tracking-wider">
                            <th class="px-6 py-5 font-semibold">Event</th>
                            <th class="px-6 py-5 font-semibold">Jadwal</th>
                            <th class="px-6 py-5 font-semibold text-center">Statistik Peserta</th>
                            <th class="px-6 py-5 font-semibold text-center">Status</th>
                            <th class="px-6 py-5 font-semibold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <?php if (count($events) > 0): ?>
                                <?php foreach ($events as $event): ?>
                                        <tr class="hover:bg-emerald-50/40 transition-colors duration-200 group">
                                            <td class="px-6 py-5">
                                                <div class="flex gap-4 items-center">
                                                    <div class="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg shadow-md border border-gray-200 group-hover:shadow-lg transition-all">
                                                        <?php if ($event['poster']): ?>
                                                                <img src="../assets/img/posters/<?= htmlspecialchars($event['poster']) ?>"
                                                                    class="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500">
                                                        <?php else: ?>
                                                                <div class="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                                    <i class="fas fa-image text-xl"></i>
                                                                </div>
                                                        <?php endif; ?>
                                                    </div>
                                                    <div class="min-w-0">
                                                        <h3 class="font-bold text-gray-800 text-base mb-1 group-hover:text-emerald-700 transition-colors truncate max-w-xs">
                                                            <?= htmlspecialchars($event['judul']) ?>
                                                        </h3>
                                                        <div class="flex items-center text-xs text-gray-500">
                                                            <i class="fas fa-map-marker-alt text-emerald-500 mr-1"></i>
                                                            <span class="truncate max-w-[200px]"><?= htmlspecialchars($event['lokasi']) ?></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-5">
                                                <div class="flex flex-col gap-1">
                                                    <div class="flex items-center text-sm text-gray-700 font-medium">
                                                        <i class="far fa-calendar-alt w-5 text-amber-500"></i>
                                                        <?= date('d M Y', strtotime($event['tanggal_waktu'])) ?>
                                                    </div>
                                                    <div class="flex items-center text-xs text-gray-500 ml-5">
                                                        <?= date('H:i', strtotime($event['tanggal_waktu'])) ?> WIB
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-5 text-center">
                                                <div class="flex justify-center gap-6">
                                                    <div class="text-center">
                                                        <span class="block text-lg font-bold text-gray-800"><?= $event['jumlah_pendaftar'] ?></span>
                                                        <span class="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Pendaftar</span>
                                                    </div>
                                                    <div class="text-center">
                                                        <span class="block text-lg font-bold text-emerald-600"><?= $event['jumlah_hadir'] ?></span>
                                                        <span class="text-[10px] text-emerald-600 uppercase font-bold tracking-wide">Hadir</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-5 text-center">
                                                <?php $is_active = strtotime($event['tanggal_waktu']) > time(); ?>
                                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                                            <?= $is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200' ?>">
                                                    <?= $is_active ? 'Akan Datang' : 'Selesai' ?>
                                                </span>
                                            </td>
                                            <td class="px-6 py-5 text-center">
                                                <div class="flex items-center justify-center gap-2">
                                                    <a href="lihat_detail_pendaftar.php?event_id=<?= $event['id'] ?>" 
                                                       class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition-colors" title="Lihat Detail">
                                                        <i class="fas fa-eye"></i>
                                                    </a>
                                                    <button onclick="openModalPeserta(<?= $event['id'] ?>, '<?= htmlspecialchars($event['judul'], ENT_QUOTES) ?>')"
                                                        class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors" title="Tambah Peserta">
                                                        <i class="fas fa-user-plus"></i>
                                                    </button>
                                                    
                                                </div>
                                            </td>
                                        </tr>
                                <?php endforeach; ?>
                        <?php else: ?>
                                <tr>
                                    <td colspan="5" class="px-6 py-16 text-center">
                                        <div class="flex flex-col items-center justify-center">
                                            <div class="bg-emerald-50 p-4 rounded-full mb-3">
                                                <i class="fas fa-search text-3xl text-emerald-300"></i>
                                            </div>
                                            <h3 class="text-lg font-medium text-gray-900">Tidak ada event ditemukan</h3>
                                            <p class="text-gray-500 text-sm mt-1">Coba ubah kata kunci pencarian Anda.</p>
                                        </div>
                                    </td>
                                </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <div class="lg:hidden grid grid-cols-1 gap-6">
                <?php if (count($events) > 0): ?>
                        <?php foreach ($events as $event): ?>
                                <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
                                    <div class="relative h-32 bg-gray-200">
                                        <?php if ($event['poster']): ?>
                                                <img src="../assets/img/posters/<?= htmlspecialchars($event['poster']) ?>" 
                                                     class="w-full h-full object-cover opacity-90">
                                        <?php else: ?>
                                                <div class="w-full h-full bg-emerald-900 flex items-center justify-center">
                                                    <i class="fas fa-image text-4xl text-emerald-700"></i>
                                                </div>
                                        <?php endif; ?>
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div class="absolute bottom-3 left-4 right-4 text-white">
                                            <h3 class="font-bold text-lg leading-tight truncate">
                                                <?= htmlspecialchars($event['judul']) ?>
                                            </h3>
                                            <p class="text-xs opacity-90 flex items-center gap-1 mt-1">
                                                <i class="fas fa-map-marker-alt text-amber-400"></i> <?= htmlspecialchars($event['lokasi']) ?>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="p-5">
                                        <div class="grid grid-cols-2 gap-3 mb-5">
                                            <div class="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                                <span class="block text-xl font-bold text-gray-800"><?= $event['jumlah_pendaftar'] ?></span>
                                                <span class="text-[10px] text-gray-500 uppercase font-bold">Pendaftar</span>
                                            </div>
                                            <div class="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                                                <span class="block text-xl font-bold text-emerald-600"><?= $event['jumlah_hadir'] ?></span>
                                                <span class="text-[10px] text-emerald-600 uppercase font-bold">Hadir</span>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-3 gap-2">
                                            <a href="lihat_detail_pendaftar.php?event_id=<?= $event['id'] ?>" 
                                               class="col-span-1 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2.5 rounded-lg text-center text-sm font-bold transition-colors flex flex-col items-center justify-center gap-1">
                                                <i class="fas fa-eye"></i> Detail
                                            </a>
                                            <button onclick="openModalPeserta(<?= $event['id'] ?>, '<?= htmlspecialchars($event['judul'], ENT_QUOTES) ?>')"
                                                class="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-center text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-200">
                                                <i class="fas fa-user-plus"></i> Tambah Peserta
                                            </button>
                                        </div>
                                    </div>
                                </div>
                        <?php endforeach; ?>
                <?php else: ?>
                        <div class="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p class="text-gray-500">Tidak ada event ditemukan.</p>
                        </div>
                <?php endif; ?>
            </div>

            <?php if ($total_pages > 1): ?>
                    <div class="flex justify-center mt-10 pb-8">
                        <nav class="flex gap-2 p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                            <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                                    <a href="?page=<?= $i ?>&search=<?= urlencode($search) ?>"
                                        class="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-300
                                <?= $i == $page
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md transform scale-105'
                                    : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600' ?>">
                                        <?= $i ?>
                                    </a>
                            <?php endfor; ?>
                        </nav>
                    </div>
            <?php endif; ?>

        </div>
    </div>
</div>

<div id="modalPilihPeserta" class="fixed inset-0 z-[60] hidden bg-emerald-900/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] transform scale-95 opacity-0 transition-all duration-300" id="modalPesertaContent">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-900 text-white relative overflow-hidden shrink-0">
            <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-400 rounded-full opacity-20 blur-xl"></div>
            <div class="relative z-10">
                <h3 class="text-xl font-bold" id="modalTitle">Pilih Santri</h3>
                <p class="text-sm text-emerald-200">Filter, centang santri, lalu simpan ke event.</p>
            </div>
            <button type="button" onclick="closeModalPeserta()" class="relative z-10 text-white/70 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <i class="fas fa-times text-lg"></i>
            </button>
        </div>

        <div class="flex-1 overflow-hidden flex flex-col bg-white">
            <form action="proses_tambah_peserta_internal.php" method="POST" id="formInternal" class="flex flex-col h-full overflow-hidden">
                <input type="hidden" name="workshop_id" id="inputWorkshopId">

                <div class="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-3 shrink-0">
                    <div class="relative flex-1">
                        <i class="fas fa-search absolute left-4 top-3.5 text-gray-400"></i>
                        <input type="text" id="searchSantri" oninput="applyFilters()"
                            placeholder="Cari nama, NIS, atau kelas..."
                            class="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white shadow-sm text-sm">
                    </div>
                    
                    <div class="flex bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <label class="cursor-pointer">
                            <input type="radio" name="filter_jk" value="semua" class="peer sr-only" checked onchange="applyFilters()">
                            <div class="px-4 py-2.5 text-sm font-medium text-gray-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 transition-colors border-r border-gray-100">Semua</div>
                        </label>
                        <label class="cursor-pointer">
                            <input type="radio" name="filter_jk" value="L" class="peer sr-only" onchange="applyFilters()">
                            <div class="px-4 py-2.5 text-sm font-medium text-gray-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 transition-colors border-r border-gray-100">Laki-laki</div>
                        </label>
                        <label class="cursor-pointer">
                            <input type="radio" name="filter_jk" value="P" class="peer sr-only" onchange="applyFilters()">
                            <div class="px-4 py-2.5 text-sm font-medium text-gray-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 transition-colors">Perempuan</div>
                        </label>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto custom-scrollbar relative bg-white">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-white text-gray-500 text-xs font-bold uppercase tracking-wider sticky top-0 z-10 shadow-sm border-b border-gray-100">
                            <tr>
                                <th class="p-4 w-12 text-center">
                                    <input type="checkbox" id="checkAll" class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-all">
                                </th>
                                <th class="p-4">Nama Santri</th>
                                <th class="p-4">Info / Kelas</th>
                                <th class="p-4 text-center">L/P</th>
                            </tr>
                        </thead>
                        <tbody id="listSantriBody" class="divide-y divide-gray-50">
                            </tbody>
                    </table>
                    
                    <div id="loadingIndicator" class="hidden flex flex-col items-center justify-center py-16">
                        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-3"></div>
                        <span class="text-gray-500 text-sm font-medium">Memuat data santri...</span>
                    </div>
                </div>

                <div id="paginationContainer" class="p-3 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-center items-center gap-1 shrink-0">
                    </div>

                <div class="p-5 border-t border-gray-200 bg-white flex justify-between items-center shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-20">
                    <span class="text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100" id="selectedCount">
                        0 terpilih
                    </span>
                    <div class="flex gap-3">
                        <button type="button" onclick="closeModalPeserta()" class="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition text-sm font-bold border border-gray-200">
                            Batal
                        </button>
                        <button type="submit" id="btnSimpan" disabled class="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 text-sm flex items-center gap-2">
                            <i class="fas fa-save"></i> Simpan Peserta
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    // --- 1. Logic Modal, Filter & Pagination ---
    const modal = document.getElementById('modalPilihPeserta');
    const modalContent = document.getElementById('modalPesertaContent');
    const listBody = document.getElementById('listSantriBody');
    const loading = document.getElementById('loadingIndicator');
    const inputId = document.getElementById('inputWorkshopId');
    const titleLabel = document.getElementById('modalTitle');
    const selectedCountLabel = document.getElementById('selectedCount');
    const btnSimpan = document.getElementById('btnSimpan');
    const paginationContainer = document.getElementById('paginationContainer');

    // Variabel state untuk frontend pagination
    let allRows = []; 
    let currentFilteredRows = [];
    let currentPage = 1;
    const rowsPerPage = 15; // Jumlah santri per halaman

    function openModalPeserta(workshopId, judulEvent) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);

        document.body.style.overflow = 'hidden';
        inputId.value = workshopId;
        titleLabel.innerHTML = `Tambah Santri: <span class="text-amber-300 font-normal text-base block mt-0.5">${judulEvent}</span>`;
        
        // Reset state
        listBody.innerHTML = '';
        allRows = [];
        currentFilteredRows = [];
        document.getElementById('checkAll').checked = false;
        document.getElementById('searchSantri').value = '';
        document.querySelector('input[name="filter_jk"][value="semua"]').checked = true;
        updateCount();
        paginationContainer.innerHTML = '';

        loading.classList.remove('hidden');

        // Fetch data
        fetch(`ajax_get_calon_peserta.php?event_id=${workshopId}`)
            .then(response => response.text())
            .then(html => {
                loading.classList.add('hidden');
                listBody.innerHTML = html;
                
                // Ambil semua elemen <tr> yang digenerate oleh AJAX
                allRows = Array.from(listBody.querySelectorAll('tr'));
                
                // Terapkan filter & pagination awal
                applyFilters();
            })
            .catch(err => {
                loading.classList.add('hidden');
                listBody.innerHTML = '<tr><td colspan="4" class="text-center text-red-500 p-8 font-medium">Gagal memuat data.</td></tr>';
                console.error(err);
            });
    }

    function closeModalPeserta() {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Fungsi Utama Filter (Pencarian Text + Jenis Kelamin)
    function applyFilters() {
        const searchText = document.getElementById('searchSantri').value.toLowerCase();
        const filterJK = document.querySelector('input[name="filter_jk"]:checked').value;

        currentFilteredRows = allRows.filter(row => {
            // Filter Text
            const searchTarget = row.querySelector('.search-target');
            const isTextMatch = searchTarget ? searchTarget.innerText.toLowerCase().includes(searchText) : true;

            // Filter Jenis Kelamin (Cek kolom terakhir tabel)
            const jkCell = row.querySelector('td:last-child');
            const jkText = jkCell ? jkCell.innerText.trim().toLowerCase() : '';
            
            let isJkMatch = true;
            if (filterJK === 'L') {
                isJkMatch = (jkText === 'l' || jkText === 'laki-laki');
            } else if (filterJK === 'P') {
                isJkMatch = (jkText === 'p' || jkText === 'perempuan');
            }

            return isTextMatch && isJkMatch;
        });

        // Reset ke halaman 1 setiap kali filter berubah
        currentPage = 1;
        renderPage();
    }

    // Fungsi Render Halaman Saat Ini
    function renderPage() {
        // Sembunyikan semua baris terlebih dahulu
        allRows.forEach(row => row.style.display = 'none');

        // Hitung index potong array
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        // Tampilkan hanya baris yang sesuai halaman
        const rowsToShow = currentFilteredRows.slice(startIndex, endIndex);
        rowsToShow.forEach(row => row.style.display = '');

        // Tampilkan pesan kosong jika filter tidak ketemu
        if (currentFilteredRows.length === 0) {
            paginationContainer.innerHTML = '';
            // Opsional: bisa tambahkan baris "Tidak ada data" secara dinamis di sini
        } else {
            renderPaginationUI();
        }
    }

    // Fungsi Membuat Tombol Pagination
    function renderPaginationUI() {
        const totalPages = Math.ceil(currentFilteredRows.length / rowsPerPage);
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return; // Sembunyikan jika hanya 1 halaman

        // Tombol Prev
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.className = `w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-emerald-600 hover:bg-emerald-50'}`;
        prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderPage(); } };
        paginationContainer.appendChild(prevBtn);

        // Tombol Angka Halaman
        for (let i = 1; i <= totalPages; i++) {
            // Trik untuk menyembunyikan angka berlebih jika halaman terlalu banyak (> 7)
            if (totalPages > 7) {
                if (i !== 1 && i !== totalPages && Math.abs(i - currentPage) > 1) {
                    if (Math.abs(i - currentPage) === 2) {
                        const dots = document.createElement('span');
                        dots.innerHTML = '...';
                        dots.className = 'px-1 text-gray-400 text-xs';
                        paginationContainer.appendChild(dots);
                    }
                    continue;
                }
            }

            const pageBtn = document.createElement('button');
            pageBtn.type = 'button';
            pageBtn.innerText = i;
            pageBtn.className = `min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${i === currentPage ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`;
            pageBtn.onclick = () => { currentPage = i; renderPage(); };
            paginationContainer.appendChild(pageBtn);
        }

        // Tombol Next
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.className = `w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-emerald-600 hover:bg-emerald-50'}`;
        nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderPage(); } };
        paginationContainer.appendChild(nextBtn);
    }

    // Toggle Checkbox baris
    window.toggleRow = function(row) {
        const checkbox = row.querySelector('.santri-checkbox');
        if (event.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
        }
        
        if (checkbox.checked) {
            row.classList.add('bg-emerald-50/50');
        } else {
            row.classList.remove('bg-emerald-50/50');
        }
        updateCount();
    }

    // Check All (Mencentang HANYA data yang masuk filter saat ini)
    document.getElementById('checkAll').addEventListener('change', function () {
        const isChecked = this.checked;
        currentFilteredRows.forEach(row => {
            const box = row.querySelector('.santri-checkbox');
            if(box) {
                box.checked = isChecked;
                if (isChecked) row.classList.add('bg-emerald-50/50');
                else row.classList.remove('bg-emerald-50/50');
            }
        });
        updateCount();
    });

    function updateCount() {
        // Hitung dari DOM asli karena checkbox status tetap tersimpan meski di display:none
        const count = document.querySelectorAll('.santri-checkbox:checked').length;
        selectedCountLabel.innerText = count + " terpilih";

        if (count > 0) {
            btnSimpan.disabled = false;
            btnSimpan.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            btnSimpan.disabled = true;
            btnSimpan.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModalPeserta();
    });

    // --- 2. Live Search Logic (Main Page) ---
    // (Tidak ada perubahan, tetap sama seperti sebelumnya)
    const searchInput = document.getElementById('liveSearchInput');
    const loadingIcon = document.getElementById('loadingIcon');
    const dataContainer = document.getElementById('dataContainer');
    let timeout = null;

    if(searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            const query = this.value;
            loadingIcon.classList.remove('hidden');

            timeout = setTimeout(() => {
                const url = new URL(window.location.href);
                url.searchParams.set('search', query);
                url.searchParams.set('page', 1);

                fetch(url)
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const newContent = doc.getElementById('dataContainer').innerHTML;
                        
                        dataContainer.style.opacity = '0.5';
                        setTimeout(() => {
                            dataContainer.innerHTML = newContent;
                            dataContainer.style.opacity = '1';
                            loadingIcon.classList.add('hidden');
                            window.history.pushState({}, '', url);
                        }, 200);
                    })
                    .catch(err => {
                        console.error('Error fetching data:', err);
                        loadingIcon.classList.add('hidden');
                    });
            }, 500);
        });
    }
</script>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
</style>

<?php require_once BASE_PATH . '/admin/templates/footer.php'; ?>