<?php
require_once 'core/koneksi.php';
require_once 'templates/header.php';

try {
    // Ambil semua workshop yang akan datang (tanggalnya lebih besar atau sama dengan hari ini)
    $stmt = $pdo->query("SELECT * FROM workshops WHERE tanggal_waktu >= CURDATE() ORDER BY tanggal_waktu ASC");
    $workshops = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
?>


<!-- Hero Section -->
<section class="bg-gradient-to-br from-primary via-blue-800 to-darkblue text-white py-20 relative overflow-hidden">
    <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 left-0 w-full h-full parallax"
            style="background-image: url('assets/img/images/qurban_bareng.jpeg');">
        </div>
    </div>

    <!-- Floating elements -->
    <div class="absolute top-10 left-10 w-20 h-20 rounded-full bg-secondary/20 animate-float"></div>
    <div class="absolute top-1/4 right-20 w-16 h-16 rounded-full bg-accent/30 animate-float delay-200"></div>
    <div class="absolute bottom-20 left-1/4 w-12 h-12 rounded-full bg-white/10 animate-float delay-300"></div>

    <div class="container mx-auto px-6 flex flex-col-reverse md:flex-row items-center md:space-x-12 relative z-10">
        <div class="md:w-1/2 text-center md:text-left animate-fade-in">
            <h1 class="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">BEM El Rahma<br /><span
                    class="text-accent">Wadah Kreativitas & Inovasi</span></h1>
            <p class="text-lg md:text-xl mb-8 max-w-xl mx-auto md:mx-0 glass p-4 rounded-xl">Badan Eksekutif
                Mahasiswa yang berkomitmen mengembangkan potensi mahasiswa melalui berbagai program kreatif,
                inovatif, dan bermanfaat untuk kemajuan bersama.</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="#events"
                    class="inline-flex items-center bg-gradient-to-r from-secondary to-orange-600 hover:from-orange-600 hover:to-secondary text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300 transform hover:-translate-y-1">
                    Ikuti Kegiatan <i class="ml-2 fas fa-arrow-right"></i>
                </a>
                <a href="#about"
                    class="inline-flex items-center border-2 border-white hover:bg-white hover:text-primary text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                    Jelajahi BEM Kami
                </a>
            </div>
        </div>
        <div class="md:w-1/2 mb-12 md:mb-0 flex justify-center animate-fade-in delay-100">
            <div class="relative">
                <div
                    class="absolute -inset-4 bg-gradient-to-r from-secondary to-accent rounded-full blur-lg opacity-30">
                </div>
                <img src="assets/img/images/workshop.jpeg" alt="Kegiatan BEM"
                    class="rounded-xl shadow-2xl w-80 h-80 object-cover border-4 border-white relative z-10" />
            </div>
        </div>
    </div>
</section>

<!-- About BEM Section -->
<section id="about" class="py-16 bg-lightblue relative overflow-hidden">
    <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full translate-y-40 -translate-x-40">
    </div>

    <div class="container mx-auto px-6 max-w-6xl relative z-10">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-primary mb-3">Tentang BEM El Rahma</h2>
            <div class="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            <p class="text-gray-700 max-w-3xl mx-auto text-lg">BEM El Rahma merupakan organisasi mahasiswa yang
                menjadi wadah pengembangan diri, kreativitas, dan kepemimpinan mahasiswa untuk mencapai visi
                bersama.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div class="relative">
                <div class="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-xl blur-lg opacity-20">
                </div>
                <img src="assets/img/images/sunat_bareng.jpeg" alt="Kegiatan BEM"
                    class="rounded-xl shadow-lg w-full h-80 object-cover relative z-10" />
            </div>
            <div>
                <h3 class="text-2xl font-bold text-darkblue mb-4">Visi & Misi BEM El Rahma</h3>
                <div class="mb-6 bg-white p-6 rounded-xl shadow-md">
                    <h4 class="text-xl font-semibold text-primary mb-2 flex items-center">
                        <i class="fas fa-bullseye mr-2 text-secondary"></i> Visi
                    </h4>
                    <p class="text-gray-700">Menjadi wadah pengembangan mahasiswa yang unggul, inovatif, dan
                        berkontribusi positif untuk kemajuan kampus dan masyarakat.</p>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h4 class="text-xl font-semibold text-primary mb-2 flex items-center">
                        <i class="fas fa-tasks mr-2 text-secondary"></i> Misi
                    </h4>
                    <ul class="text-gray-700 space-y-2">
                        <li class="flex items-start">
                            <i class="fas fa-check text-secondary mr-2 mt-1"></i>
                            Mengembangkan potensi mahasiswa melalui berbagai program kreatif
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-secondary mr-2 mt-1"></i>
                            Memperkuat jaringan dan kolaborasi dengan berbagai pihak
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-secondary mr-2 mt-1"></i>
                            Menjadi representasi aspirasi mahasiswa yang profesional
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-secondary mr-2 mt-1"></i>
                            Menyelenggarakan kegiatan yang bermanfaat untuk kampus dan masyarakat
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Programs Section -->
<section id="programs" class="py-16 bg-white relative overflow-hidden">
    <div class="absolute top-10 right-10 w-40 h-40 bg-accent/10 rounded-full"></div>
    <div class="absolute bottom-10 left-10 w-32 h-32 bg-primary/10 rounded-full"></div>

    <div class="container mx-auto px-6 max-w-6xl relative z-10">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-primary mb-3">Program Unggulan</h2>
            <div class="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            <p class="text-gray-700 max-w-3xl mx-auto text-lg">Berbagai program unggulan yang diselenggarakan BEM El
                Rahma untuk pengembangan diri dan kontribusi sosial mahasiswa.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-animation">
            <div
                class="bg-white rounded-xl shadow-lg p-6 card-hover border-t-4 border-primary relative overflow-hidden">
                <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12">
                </div>
                <div
                    class="w-14 h-14 bg-gradient-to-r from-primary to-blue-700 rounded-full flex items-center justify-center text-white text-2xl mb-4 relative z-10">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <h3 class="text-xl font-bold text-darkblue mb-3 relative z-10">Program Akademik</h3>
                <p class="text-gray-600 mb-4 relative z-10">Workshop, seminar, dan pendampingan akademik untuk
                    meningkatkan kompetensi mahasiswa.</p>
                <a href="#" class="text-primary font-semibold hover:underline flex items-center relative z-10">
                    Selengkapnya <i class="fas fa-arrow-right ml-2 text-xs"></i>
                </a>
            </div>

            <div
                class="bg-white rounded-xl shadow-lg p-6 card-hover border-t-4 border-secondary relative overflow-hidden">
                <div
                    class="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -translate-y-12 translate-x-12">
                </div>
                <div
                    class="w-14 h-14 bg-gradient-to-r from-secondary to-orange-600 rounded-full flex items-center justify-center text-white text-2xl mb-4 relative z-10">
                    <i class="fas fa-hands-helping"></i>
                </div>
                <h3 class="text-xl font-bold text-darkblue mb-3 relative z-10">Pengabdian Masyarakat</h3>
                <p class="text-gray-600 mb-4 relative z-10">Kegiatan sosial dan pemberdayaan masyarakat untuk
                    mengasah kepekaan sosial mahasiswa.</p>
                <a href="#" class="text-primary font-semibold hover:underline flex items-center relative z-10">
                    Selengkapnya <i class="fas fa-arrow-right ml-2 text-xs"></i>
                </a>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-6 card-hover border-t-4 border-accent relative overflow-hidden">
                <div class="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -translate-y-12 translate-x-12">
                </div>
                <div
                    class="w-14 h-14 bg-gradient-to-r from-accent to-yellow-400 rounded-full flex items-center justify-center text-darkblue text-2xl mb-4 relative z-10">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <h3 class="text-xl font-bold text-darkblue mb-3 relative z-10">Kewirausahaan Mahasiswa</h3>
                <p class="text-gray-600 mb-4 relative z-10">Program pengembangan ide bisnis, pelatihan
                    enterpreneurship, dan inkubasi usaha untuk mendukung kemandirian mahasiswa.</p>
                <a href="#" class="text-primary font-semibold hover:underline flex items-center relative z-10">
                    Selengkapnya <i class="fas fa-arrow-right ml-2 text-xs"></i>
                </a>
            </div>
        </div>
    </div>
</section>

<!-- Products/Services Section -->
<section id="products" class="py-16 bg-gradient-to-br from-gray-50 to-lightblue relative overflow-hidden">
    <div class="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
    <div class="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>

    <div class="container mx-auto px-6 max-w-6xl relative z-10">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-primary mb-3">Produk & Layanan Kami</h2>
            <div class="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            <p class="text-gray-700 max-w-3xl mx-auto text-lg">BEM El Rahma menyediakan berbagai produk dan layanan
                berkualitas untuk mendukung pengembangan diri mahasiswa dan kontribusi sosial.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
            <!-- Product 1: Workshop & Pelatihan -->
            <div
                class="bg-white rounded-xl shadow-lg p-6 card-hover border-t-4 border-primary relative overflow-hidden">
                <div class="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-10 translate-x-10">
                </div>
                <div
                    class="w-16 h-16 bg-gradient-to-r from-primary to-blue-700 rounded-full flex items-center justify-center text-white text-2xl mb-4 relative z-10">
                    <i class="fas fa-laptop-code"></i>
                </div>
                <h3 class="text-xl font-bold text-darkblue mb-3 relative z-10">Workshop & Pelatihan</h3>
                <p class="text-gray-600 mb-4 relative z-10">Program pelatihan keterampilan teknis dan soft skills
                    untuk meningkatkan kompetensi mahasiswa di berbagai bidang.</p>
                <ul class="text-gray-600 space-y-2 mb-4 relative z-10">
                    <li class="flex items-center">
                        <i class="fas fa-check text-secondary mr-2 text-sm"></i>
                        Workshop Programming
                    </li>
                    <li class="flex items-center">
                        <i class="fas fa-check text-secondary mr-2 text-sm"></i>
                        Pelatihan Public Speaking
                    </li>
                    <li class="flex items-center">
                        <i class="fas fa-check text-secondary mr-2 text-sm"></i>
                        Digital Marketing Training
                    </li>
                </ul>
            </div>

            <!-- Product 2: Merchandise BEM -->
            <div
                class="bg-white rounded-xl shadow-lg p-6 card-hover border-t-4 border-secondary relative overflow-hidden">
                <div
                    class="absolute top-0 right-0 w-20 h-20 bg-secondary/5 rounded-full -translate-y-10 translate-x-10">
                </div>
                <div
                    class="w-16 h-16 bg-gradient-to-r from-secondary to-orange-600 rounded-full flex items-center justify-center text-white text-2xl mb-4 relative z-10">
                    <i class="fas fa-tshirt"></i>
                </div>
                <h3 class="text-xl font-bold text-darkblue mb-3 relative z-10">Merchandise Eksklusif</h3>
                <p class="text-gray-600 mb-4 relative z-10">Koleksi merchandise resmi BEM El Rahma dengan desain
                    eksklusif untuk menunjukkan kebanggaan sebagai bagian dari komunitas.</p>
                <ul class="text-gray-600 space-y-2 mb-4 relative z-10">
                    <li class="flex items-center">
                        <i class="fas fa-check text-secondary mr-2 text-sm"></i>
                        Kaos & Hoodie BEM
                    </li>
                    <li class="flex items-center">
                        <i class="fas fa-check text-secondary mr-2 text-sm"></i>
                        Totebag & Merchandise
                    </li>
                    <li class="flex items-center">
                        <i class="fas fa-check text-secondary mr-2 text-sm"></i>
                        Aksesoris Eksklusif
                    </li>
                </ul>
            </div>





            <!-- Product 5: Digital Content -->
            <div
                class="bg-white rounded-xl shadow-lg p-6 card-hover border-t-4 border-secondary relative overflow-hidden">
                <div
                    class="absolute top-0 right-0 w-20 h-20 bg-secondary/5 rounded-full -translate-y-10 translate-x-10">
                </div>
                <div
                    class="w-16 h-16 bg-gradient-to-r from-secondary to-orange-600 rounded-full flex items-center justify-center text-white text-2xl mb-4 relative z-10">
                    <i class="fas fa-film"></i>
                </div>
                <h3 class="text-xl font-bold text-darkblue mb-3 relative z-10">Konten Digital & Media</h3>
                <p class="text-gray-600 mb-4 relative z-10">Produksi konten digital edukatif dan informatif untuk
                    platform media sosial dan website BEM El Rahma.</p>
                <ul class="text-gray-600 space-y-2 mb-4 relative z-10">
                    <li class="flex items-center">
                        <i class="fas fa-check text-secondary mr-2 text-sm"></i>
                        Video Edukasi
                    </li>
                    <li class="flex items-center">
                        <i class="fas fa-check text-secondary mr-2 text-sm"></i>
                        Konten Media Sosial
                    </li>
                    <li class="flex items-center">
                        <i class="fas fa-check text-secondary mr-2 text-sm"></i>
                        Dokumentasi Kegiatan
                    </li>
                </ul>
            </div>


        </div>

        <div class="text-center mt-12">
            <a href="#contact"
                class="inline-flex items-center bg-gradient-to-r from-primary to-blue-800 hover:from-blue-800 hover:to-primary text-white font-semibold py-3 px-8 rounded-lg transition shadow-md hover:shadow-lg transform hover:-translate-y-1">
                Informasi Lebih Lanjut <i class="fas fa-arrow-right ml-2"></i>
            </a>
        </div>
    </div>
</section>

<!-- Event & Workshop Terdekat Section -->
<section id="events" class="py-16 bg-gray-100 relative overflow-hidden">
    <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full translate-y-40 -translate-x-40">
    </div>

    <div class="container mx-auto px-6 max-w-7xl relative z-10">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-primary mb-3">Kegiatan Terdekat</h2>
            <div class="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            <p class="text-gray-700 max-w-3xl mx-auto text-lg">Jangan lewatkan kesempatan untuk berkembang bersama
                melalui event-event berkualitas yang kami sediakan khusus untuk Anda.</p>
        </div>

        <?php if (count($workshops) > 0): ?>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation">
                <?php
                $color_classes = [
                    'bg-gradient-to-r from-primary to-blue-700',
                    'bg-gradient-to-r from-secondary to-orange-500',
                    'bg-gradient-to-r from-blue-500 to-primary'
                ];
                $tag_classes = [
                    'bg-secondary text-white',
                    'bg-primary text-white',
                    'bg-accent text-gray-800'
                ];
                $i = 0;
                ?>
                <?php foreach ($workshops as $workshop): ?>
                    <article class="rounded-xl shadow-lg overflow-hidden card-hover bg-white relative">
                        <?php if ($workshop['poster']): ?>
                            <div class="relative overflow-hidden">
                                <img src="assets/img/posters/<?= htmlspecialchars($workshop['poster']) ?>"
                                    alt="<?= htmlspecialchars($workshop['judul']) ?>"
                                    class="w-full h-48 object-cover transition-transform duration-500 hover:scale-110">
                                <div
                                    class="absolute top-4 right-4 <?= $tag_classes[$i % 3] ?> text-xs font-semibold py-1 px-3 rounded-full">
                                    Event
                                </div>
                            </div>
                        <?php else: ?>
                            <div
                                class="w-full h-48 flex items-center justify-center bg-gradient-to-r from-primary to-blue-700 text-white">
                                <i class="fas fa-calendar-alt text-4xl"></i>
                            </div>
                        <?php endif; ?>

                        <div class="p-6 bg-white">
                            <h3 class="text-xl font-semibold text-gray-800 mb-2"><?= htmlspecialchars($workshop['judul']) ?>
                            </h3>
                            <p class="text-gray-600 mb-4"><?= htmlspecialchars(substr($workshop['deskripsi'], 0, 100)) ?>...
                            </p>

                            <div class="flex items-center text-gray-600 text-sm mb-4">
                                <i class="fas fa-calendar-alt mr-2 text-primary"></i>
                                <span><?= date('d F Y, H:i', strtotime($workshop['tanggal_waktu'])) ?> WIB</span>
                            </div>

                            <div class="flex justify-between items-center">
                                <span class="text-primary font-bold text-lg"><?php
                                // Logika untuk menampilkan harga atau tulisan "Gratis"
                                if ($workshop['tipe_event'] == 'berbayar' && $workshop['harga'] > 0) {
                                    echo 'Rp ' . number_format($workshop['harga'], 0, ',', '.');
                                } else {
                                    echo 'Gratis';
                                }
                                ?></span>
                                <a href="detail_workshop.php?id=<?= $workshop['id'] ?>"
                                    class="text-secondary font-semibold hover:underline flex items-center group">
                                    Lihat Detail & Daftar <i
                                        class="fas fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
                                </a>
                            </div>
                        </div>
                    </article>

                    <?php $i++; ?>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <div class="text-center py-20 text-gray-400 bg-white rounded-xl shadow-md">
                <i class="fas fa-calendar-times text-6xl mb-6"></i>
                <h3 class="text-2xl font-semibold mb-2">Belum ada event yang tersedia</h3>
                <p>Silakan kembali lagi nanti untuk melihat event-event terbaru kami.</p>
            </div>
        <?php endif; ?>

        <div class="text-center mt-12">
            <a href="#"
                class="inline-flex items-center text-primary font-semibold hover:text-secondary transition group">
                Lihat Semua Kegiatan <i
                    class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
            </a>
        </div>
    </div>
</section>

<!-- Structure Section -->
<section id="structure" class="py-16 bg-white relative overflow-hidden">
    <div class="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-32 -translate-x-32"></div>
    <div class="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 rounded-full translate-y-40 translate-x-40"></div>

    <div class="container mx-auto px-6 max-w-6xl relative z-10">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-primary mb-3">Struktur Kepengurusan</h2>
            <div class="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            <p class="text-gray-700 max-w-3xl mx-auto text-lg">Kenali para pengurus BEM El Rahma yang siap melayani
                dan berkontribusi untuk kemajuan bersama.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 stagger-animation">
            <!-- Ketua BEM -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden text-center card-hover relative">
                <div
                    class="h-48 bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-black/10"></div>
                    <div class="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center relative z-10">
                        <i class="fas fa-user-circle text-6xl text-white"></i>
                    </div>
                </div>
                <div class="p-4 relative z-10">
                    <h3 class="font-bold text-lg text-darkblue">Muhammad Akbar Firdaus</h3>
                    <p class="text-primary font-medium">Ketua BEM</p>
                    <div class="flex justify-center mt-3 space-x-2">
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fab fa-instagram"></i></a>
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fab fa-linkedin"></i></a>
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fas fa-envelope"></i></a>
                    </div>
                </div>
            </div>

            <!-- Wakil Ketua -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden text-center card-hover relative">
                <div
                    class="h-48 bg-gradient-to-br from-secondary to-orange-500 flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-black/10"></div>
                    <div class="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center relative z-10">
                        <i class="fas fa-user-circle text-6xl text-white"></i>
                    </div>
                </div>
                <div class="p-4 relative z-10">
                    <h3 class="font-bold text-lg text-darkblue">RA Toriq Adisumarmo</h3>
                    <p class="text-primary font-medium">Wakil Ketua</p>
                    <div class="flex justify-center mt-3 space-x-2">
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fab fa-instagram"></i></a>
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fab fa-linkedin"></i></a>
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fas fa-envelope"></i></a>
                    </div>
                </div>
            </div>

            <!-- Sekretaris -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden text-center card-hover relative">
                <div
                    class="h-48 bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-black/10"></div>
                    <div class="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center relative z-10">
                        <i class="fas fa-user-circle text-6xl text-white"></i>
                    </div>
                </div>
                <div class="p-4 relative z-10">
                    <h3 class="font-bold text-lg text-darkblue">Ayu Lestari</h3>
                    <p class="text-primary font-medium">Sekretaris</p>
                    <div class="flex justify-center mt-3 space-x-2">
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fab fa-instagram"></i></a>
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fab fa-linkedin"></i></a>
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fas fa-envelope"></i></a>
                    </div>
                </div>
            </div>

            <!-- Bendahara -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden text-center card-hover relative">
                <div
                    class="h-48 bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-black/10"></div>
                    <div class="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center relative z-10">
                        <i class="fas fa-user-circle text-6xl text-darkblue"></i>
                    </div>
                </div>
                <div class="p-4 relative z-10">
                    <h3 class="font-bold text-lg text-darkblue">Hera Herlina</h3>
                    <p class="text-primary font-medium">Bendahara</p>
                    <div class="flex justify-center mt-3 space-x-2">
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fab fa-instagram"></i></a>
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fab fa-linkedin"></i></a>
                        <a href="#" class="text-gray-500 hover:text-primary transition"><i
                                class="fas fa-envelope"></i></a>
                    </div>
                </div>
            </div>
        </div>

        <div class="text-center mt-12">
            <a href="#"
                class="inline-flex items-center bg-gradient-to-r from-primary to-blue-800 hover:from-blue-800 hover:to-primary text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg transform hover:-translate-y-1">
                Lihat Seluruh Pengurus <i class="fas fa-arrow-right ml-2"></i>
            </a>
        </div>
    </div>
</section>

<!-- Gallery Section -->
<section class="py-16 bg-gray-50 relative overflow-hidden">
    <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full translate-y-40 -translate-x-40">
    </div>

    <div class="container mx-auto px-6 max-w-6xl relative z-10">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-primary mb-3">Galeri Kegiatan</h2>
            <div class="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            <p class="text-gray-700 max-w-3xl mx-auto text-lg">Dokumentasi momen-momen berharga dalam berbagai
                kegiatan BEM El Rahma.</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div class="aspect-square overflow-hidden rounded-xl shadow-md">
                <img src="assets/img/images/sunat_ngobrol.jpeg" alt="Kegiatan BEM"
                    class="w-full h-full object-cover hover:scale-110 transition duration-500 cursor-pointer">
            </div>
            <div class="aspect-square overflow-hidden rounded-xl shadow-md">
                <img src="assets/img/images/sunat_nonton.jpeg" alt="Kegiatan BEM"
                    class="w-full h-full object-cover hover:scale-110 transition duration-500 cursor-pointer">
            </div>
            <div class="aspect-square overflow-hidden rounded-xl shadow-md">
                <img src="assets/img/images/sunat_nyimak.jpeg" alt="Kegiatan BEM"
                    class="w-full h-full object-cover hover:scale-110 transition duration-500 cursor-pointer">
            </div>
            <div class="aspect-square overflow-hidden rounded-xl shadow-md">
                <img src="assets/img/images/liqo_jelasin.jpeg" alt="Kegiatan BEM"
                    class="w-full h-full object-cover hover:scale-110 transition duration-500 cursor-pointer">
            </div>
        </div>
        <br>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div class="aspect-square overflow-hidden rounded-xl shadow-md">
                <img src="assets/img/images/liqo_hadroh.jpeg" alt="Kegiatan BEM"
                    class="w-full h-full object-cover hover:scale-110 transition duration-500 cursor-pointer">
            </div>
            <div class="aspect-square overflow-hidden rounded-xl shadow-md">
                <img src="assets/img/images/liqo_nanya.jpeg" alt="Kegiatan BEM"
                    class="w-full h-full object-cover hover:scale-110 transition duration-500 cursor-pointer">
            </div>
            <div class="aspect-square overflow-hidden rounded-xl shadow-md">
                <img src="assets/img/images/qurban_daging.jpeg" alt="Kegiatan BEM"
                    class="w-full h-full object-cover hover:scale-110 transition duration-500 cursor-pointer">
            </div>
            <div class="aspect-square overflow-hidden rounded-xl shadow-md">
                <img src="assets/img/images/workshop1.jpeg" alt="Kegiatan BEM"
                    class="w-full h-full object-cover hover:scale-110 transition duration-500 cursor-pointer">
            </div>
        </div>

        <div class="text-center mt-8">
            <a href="#"
                class="inline-flex items-center text-primary font-semibold hover:text-secondary transition group">
                Lihat Galeri Lengkap <i
                    class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
            </a>
        </div>
    </div>
</section>

<?php
require_once 'templates/footer.php';
?>

<!-- Footer -->