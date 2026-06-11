"use client";

import { useEffect, useState } from "react";
import api from "../lib/axios";
import Link from "next/link";
import {
  Calendar, MapPin, Ticket, Award, Monitor,
  CheckCircle, ArrowRight, Clock, Globe, ShieldCheck, Zap
} from "lucide-react";
import React from "react";

export default function Home() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await api.get("/events");
        setWorkshops(response.data);
      } catch (error) {
        console.error("Failed to fetch workshops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options) + ' WIB';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30 overflow-x-hidden">

      {/* Navbar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-black text-sm">ER</span>
            </div>
            <span className={`text-2xl font-extrabold tracking-tight ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
              BEM <span className={isScrolled ? 'text-indigo-600' : 'text-indigo-400'}>El Rahma</span>
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/login" className={`hidden md:block font-semibold transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-slate-100 hover:text-white'}`}>
              Login
            </Link>
            <Link href="/register" className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 opacity-90 z-10"></div>
          {/* We can use a generic abstract background from unsplash or just a nice gradient mesh */}
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        </div>

        {/* Floating blobs */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse z-0"></div>
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse z-0" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse z-0" style={{ animationDelay: '4s' }}></div>

        <div className="container mx-auto px-6 relative z-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wide uppercase text-indigo-100">Badan Eksekutif Mahasiswa</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 max-w-4xl">
            BEM El Rahma <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Wadah Kreativitas & Inovasi</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
            Badan Eksekutif Mahasiswa yang berkomitmen mengembangkan potensi mahasiswa melalui berbagai program kreatif, inovatif, dan bermanfaat untuk kemajuan bersama.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#agenda" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              Ikuti Kegiatan <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#profil" className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2">
              Jelajahi BEM Kami
            </a>
          </div>
        </div>
      </section>

      {/* Profil / Sejarah Section */}
      <section id="profil" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Tentang BEM El Rahma</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-400 mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600 max-w-3xl mx-auto text-lg">
              BEM El Rahma merupakan organisasi mahasiswa yang menjadi wadah pengembangan diri, kreativitas, dan kepemimpinan mahasiswa untuk mencapai visi bersama.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
                alt="Kegiatan BEM"
                className="rounded-2xl shadow-xl w-full object-cover relative z-10 h-full min-h-[400px] border border-white/50"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-lg z-20 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Visi & Misi BEM El Rahma</h4>
                    <p className="text-sm text-slate-500">Wadah pengembangan mahasiswa yang unggul</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:w-2 transition-all"></div>
                <h4 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg"><Zap className="w-5 h-5 text-indigo-600" /></div>
                  Visi Kami
                </h4>
                <p className="text-slate-600">
                  Menjadi wadah pengembangan mahasiswa yang unggul, inovatif, dan berkontribusi positif untuk kemajuan kampus dan masyarakat.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600" /> Misi Kami
                </h4>
                <ul className="space-y-3">
                  {[
                    "Mengembangkan potensi mahasiswa melalui berbagai program kreatif",
                    "Memperkuat jaringan dan kolaborasi dengan berbagai pihak",
                    "Menjadi representasi aspirasi mahasiswa yang profesional",
                    "Menyelenggarakan kegiatan yang bermanfaat untuk kampus dan masyarakat"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1 bg-indigo-100 rounded-full p-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <span className="text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Unggulan Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden border-y border-slate-200">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Program Unggulan</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-400 mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600 max-w-3xl mx-auto text-lg">
              Berbagai program unggulan yang diselenggarakan BEM El Rahma untuk pengembangan diri dan kontribusi sosial mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 border-t-4 border-t-indigo-600 group hover:-translate-y-2">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300">
                <Ticket className="w-8 h-8 text-indigo-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Program Akademik</h3>
              <p className="text-slate-600 leading-relaxed">
                Workshop, seminar, dan pendampingan akademik untuk meningkatkan kompetensi mahasiswa di berbagai bidang.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 border-t-4 border-t-purple-500 group hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500 transition-all duration-300">
                <Award className="w-8 h-8 text-purple-500 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Pengabdian Masyarakat</h3>
              <p className="text-slate-600 leading-relaxed">
                Kegiatan sosial dan pemberdayaan masyarakat untuk mengasah kepekaan sosial mahasiswa.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 border-t-4 border-t-amber-500 group hover:-translate-y-2">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500 transition-all duration-300">
                <Monitor className="w-8 h-8 text-amber-500 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Kewirausahaan Mahasiswa</h3>
              <p className="text-slate-600 leading-relaxed">
                Program pengembangan ide bisnis, pelatihan enterpreneurship, dan inkubasi usaha untuk mendukung kemandirian mahasiswa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda Event Section */}
      <section id="agenda" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Katalog Event Terbaru</h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full mb-4"></div>
              <p className="text-slate-600 max-w-2xl text-lg">
                Jangan lewatkan kesempatan untuk berkembang. Daftar event yang sedang buka registrasi sekarang!
              </p>
            </div>
            <Link href="/login" className="hidden md:inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
              Lihat Semua Event <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : workshops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {workshops.map((workshop: any) => {
                const isPaid = workshop.tipe_event === 'berbayar';
                return (
                  <article key={workshop.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden group flex flex-col h-full">
                    <div className="h-56 bg-slate-200 relative overflow-hidden flex-shrink-0">
                      {workshop.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`http://localhost:5000/uploads/${workshop.poster}`}
                          alt={workshop.judul}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                          <Calendar className="w-16 h-16 opacity-50" />
                        </div>
                      )}

                      <div className="absolute top-4 right-4 z-10">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md backdrop-blur-md ${isPaid ? 'bg-amber-500/90' : 'bg-emerald-500/90'}`}>
                          {isPaid ? `Rp ${workshop.harga.toLocaleString()}` : 'Gratis'}
                        </span>
                      </div>

                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md bg-indigo-600/90 backdrop-blur-md flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Publik
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                        {workshop.ukm_penyelenggara || 'Event Kampus'}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {workshop.judul}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-slate-500 text-sm">
                          <Clock className="w-4 h-4 mr-2 text-indigo-500 shrink-0" />
                          <span className="truncate">{formatDate(workshop.tanggal_waktu)}</span>
                        </div>
                        <div className="flex items-center text-slate-500 text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-indigo-500 shrink-0" />
                          <span className="truncate">{workshop.lokasi}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-1">
                        {workshop.deskripsi}
                      </p>

                      <Link href={`/login`} className="block w-full text-center bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold py-3 px-4 rounded-xl transition-colors duration-300 mt-auto">
                        Daftar Sekarang
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Event Terbuka</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Saat ini belum ada event publik yang dibuka. Pantau terus halaman ini untuk update event kampus selanjutnya.
              </p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/login" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
              Lihat Semua Event <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section */}


      {/* Call to Action */}
      <section className="py-24 bg-indigo-600 relative overflow-hidden">
        {/* We use inline SVG for pattern to avoid 404 */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Siap Berkembang Bersama Kami?</h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan BEM El Rahma dan temukan kegiatan yang tepat untuk meningkatkan kreativitas, inovasi, dan relasimu.
          </p>
          <Link href="/register" className="inline-flex items-center justify-center px-10 py-5 bg-white text-indigo-600 font-extrabold rounded-full shadow-xl shadow-indigo-400/20 transition-all hover:scale-105 text-lg">
            Daftar Kegiatan Sekarang
          </Link>
        </div>
      </section>

      {/* Detailed Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-black text-sm">ER</span>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">BEM <span className="text-indigo-500">El Rahma</span></span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm mb-6">
                Wadah pengembangan diri, kreativitas, dan kepemimpinan mahasiswa untuk mencapai visi bersama menuju kampus yang lebih baik.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  <Monitor className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">Tautan Cepat</h4>
              <ul className="space-y-4">
                <li><a href="#profil" className="hover:text-indigo-400 transition-colors">Tentang Kami</a></li>
                <li><a href="#agenda" className="hover:text-indigo-400 transition-colors">Program & Kegiatan</a></li>
                <li><a href="/login" className="hover:text-indigo-400 transition-colors">Portal Login</a></li>
                <li><a href="/register" className="hover:text-indigo-400 transition-colors">Pendaftaran Anggota</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">Hubungi Kami</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Sekretariat BEM STMIK El Rahma<br />Jl. Sisingamangaraja No.76, Brontokusuman, Yogyakarta</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="text-indigo-500 font-bold">@</span>
                  </div>
                  <span className="text-sm">bem@stmikelrahma.ac.id</span>
                </li>
                <li className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="text-sm">bem.stmikelrahma.ac.id</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} BEM El Rahma. Wadah Kreativitas & Inovasi. All rights reserved.
            </p>
            <div className="text-sm space-x-4">
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
