"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Coins, TrendingUp, Search, Loader2, MessageSquare, 
  CheckCircle, XCircle, Users, Calendar, Filter, DollarSign 
} from "lucide-react";
import Link from "next/link";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";
import Swal from "sweetalert2";

interface WorkshopDetails {
  id: number;
  judul: string;
  tipe_event: string;
  harga: number;
  nominal_denda: number;
}

interface FinancialStats {
  total_pendaftaran_lunas: number;
  total_pendaftaran_belum_lunas: number;
  total_denda_lunas: number;
  total_denda_belum_lunas: number;
  total_pemasukan_lunas: number;
  total_pemasukan_belum_lunas: number;
  grand_total: number;
}

interface FinancialRecord {
  id: string;
  nama_peserta: string;
  nim: string;
  email: string;
  tipe: "pendaftaran" | "denda";
  keterangan: string;
  nominal: number;
  status: "lunas" | "belum_lunas";
  tanggal: string;
}

export default function KeuanganEventPage() {
  const router = useRouter();
  const params = useParams();
  const { event_id } = params;

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [workshop, setWorkshop] = useState<WorkshopDetails | null>(null);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipe, setFilterTipe] = useState<"all" | "pendaftaran" | "denda">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "lunas" | "belum_lunas">("all");

  const navLinks = [
    { href: "/organizer/dashboard", icon: <Calendar className="w-5 h-5" />, label: "Dashboard" },
    { href: "/organizer/events", icon: <Calendar className="w-5 h-5" />, label: "Kelola Event" },
    { href: "/organizer/pendaftar", icon: <Users className="w-5 h-5" />, label: "Kelola Pendaftar", active: true },
    { href: "/organizer/tim", icon: <Users className="w-5 h-5" />, label: "Kelola Tim" },
    { href: "/organizer/diskusi", icon: <MessageSquare className="w-5 h-5" />, label: "Diskusi Kelas" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (!storedUser || JSON.parse(storedUser).role?.toLowerCase() !== "penyelenggara") {
        router.replace("/login");
      } else {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [router]);

  const fetchKeuangan = async () => {
    try {
      setLoading(true);
      let decoded_id = event_id as string;
      try {
        decoded_id = atob(decodeURIComponent(event_id as string));
      } catch (e) {}

      const res = await api.get(`/pendaftar/${decoded_id}/keuangan`);
      setWorkshop(res.data.workshop);
      setStats(res.data.stats);
      setRecords(res.data.records);
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data keuangan",
        text: err.response?.data?.message || "Terjadi kesalahan pada server.",
        confirmButtonColor: "#4f46e5",
      }).then(() => {
        router.push("/organizer/pendaftar");
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (event_id) {
      fetchKeuangan();
    }
  }, [event_id]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Helper to format currency
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Filtering Logic
  const filteredRecords = records.filter((rec) => {
    const matchesSearch = 
      rec.nama_peserta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.nim.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipe = filterTipe === "all" || rec.tipe === filterTipe;
    const matchesStatus = filterStatus === "all" || rec.status === filterStatus;

    return matchesSearch && matchesTipe && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout user={user} title="" subtitle="" links={navLinks} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      user={user} 
      title="Rincian Keuangan Event" 
      subtitle="Analisis pemasukan dari registrasi tiket dan akumulasi denda peserta." 
      links={navLinks} 
      onLogout={handleLogout}
    >
      <div className="min-h-screen bg-gray-50 font-sans -m-6 pb-32">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pb-24 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden -mx-4 md:-mx-8 -mt-8">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-800 rounded-full opacity-40 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 rounded-full opacity-20 blur-3xl"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <Link 
              href="/organizer/pendaftar" 
              className="inline-flex items-center gap-2 text-indigo-200 hover:text-white mb-6 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Pendaftar
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-3">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Panel Keuangan</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight line-clamp-2">
                  {workshop?.judul}
                </h1>
                <p className="text-indigo-200/80 text-xs md:text-sm mt-1">
                  Harga Tiket: <span className="font-bold text-white">{formatRupiah(workshop?.harga || 0)}</span> • 
                  Denda Absen: <span className="font-bold text-rose-300">{formatRupiah(workshop?.nominal_denda || 0)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Total Realized Income */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex items-center justify-between group hover:shadow-xl transition-all duration-350">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Pemasukan (Lunas)</span>
                <h3 className="text-2xl md:text-3xl font-black text-emerald-600">
                  {formatRupiah(stats?.total_pemasukan_lunas || 0)}
                </h3>
                <span className="text-xs text-slate-500 mt-2 block">
                  Uang tunai yang telah diterima
                </span>
              </div>
              <div className="w-14 h-14 bg-emerald-55 opacity-90 rounded-2xl flex items-center justify-center text-emerald-600 bg-emerald-50 shrink-0">
                <CheckCircle className="w-7 h-7" />
              </div>
            </div>

            {/* Card 2: Total Unpaid Income / Receivables */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex items-center justify-between group hover:shadow-xl transition-all duration-350">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Piutang (Belum Lunas)</span>
                <h3 className="text-2xl md:text-3xl font-black text-amber-500">
                  {formatRupiah(stats?.total_pemasukan_belum_lunas || 0)}
                </h3>
                <span className="text-xs text-slate-500 mt-2 block">
                  Uang tertunda / belum diselesaikan
                </span>
              </div>
              <div className="w-14 h-14 bg-amber-50 opacity-90 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                <XCircle className="w-7 h-7" />
              </div>
            </div>

            {/* Card 3: Grand Total Estimate */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex items-center justify-between group hover:shadow-xl transition-all duration-350">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Estimasi Total Pendapatan</span>
                <h3 className="text-2xl md:text-3xl font-black text-indigo-600">
                  {formatRupiah(stats?.grand_total || 0)}
                </h3>
                <span className="text-xs text-slate-500 mt-2 block">
                  Total keseluruhan yang harusnya masuk
                </span>
              </div>
              <div className="w-14 h-14 bg-indigo-50 opacity-90 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                <TrendingUp className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 md:p-8 mb-8">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3.5 mb-5 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" /> Rincian Aliran Dana
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Registration Income */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-sm text-slate-700">1. Pemasukan Tiket Event</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Registrasi Lunas:</span>
                    <span className="font-bold text-emerald-600">{formatRupiah(stats?.total_pendaftaran_lunas || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Registrasi Tertunda (Belum Lunas):</span>
                    <span className="font-bold text-amber-500">{formatRupiah(stats?.total_pendaftaran_belum_lunas || 0)}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-center text-xs font-extrabold">
                    <span className="text-slate-700">Subtotal Tiket:</span>
                    <span className="text-indigo-600">{formatRupiah((stats?.total_pendaftaran_lunas || 0) + (stats?.total_pendaftaran_belum_lunas || 0))}</span>
                  </div>
                </div>
              </div>

              {/* Fines Income */}
              <div className="space-y-4 md:pl-8 pt-4 md:pt-0">
                <h4 className="font-extrabold text-sm text-slate-700">2. Pemasukan Denda Keterlambatan/Absen</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Denda Terbayar (Lunas):</span>
                    <span className="font-bold text-emerald-600">{formatRupiah(stats?.total_denda_lunas || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Denda Aktif (Belum Lunas):</span>
                    <span className="font-bold text-amber-500">{formatRupiah(stats?.total_denda_belum_lunas || 0)}</span>
                  </div>
                  <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-center text-xs font-extrabold">
                    <span className="text-slate-700">Subtotal Denda:</span>
                    <span className="text-indigo-600">{formatRupiah((stats?.total_denda_lunas || 0) + (stats?.total_denda_belum_lunas || 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Table with Filters */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            
            {/* Filter and Search Bar */}
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
              <div className="relative flex-grow max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama atau NIM peserta..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-150"
                />
              </div>

              {/* Filters dropdown */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </div>
                
                {/* Type Filter */}
                <select 
                  value={filterTipe}
                  onChange={(e: any) => setFilterTipe(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="all">Semua Jenis Pemasukan</option>
                  <option value="pendaftaran">Pendaftaran Event</option>
                  <option value="denda">Denda</option>
                </select>

                {/* Status Filter */}
                <select 
                  value={filterStatus}
                  onChange={(e: any) => setFilterStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="all">Semua Status Pelunasan</option>
                  <option value="lunas">Lunas</option>
                  <option value="belum_lunas">Belum Lunas</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Peserta</th>
                    <th className="px-6 py-4">Tipe Transaksi</th>
                    <th className="px-6 py-4">Deskripsi</th>
                    <th className="px-6 py-4">Nominal</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Tanggal Daftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-55 divide-slate-100 text-xs">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-800">{rec.nama_peserta}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">NIM: {rec.nim} • {rec.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          {rec.tipe === "pendaftaran" ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wide">
                              Registrasi
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] font-bold uppercase tracking-wide">
                              Denda
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-550 font-medium">{rec.keterangan}</td>
                        <td className="px-6 py-4 font-extrabold text-slate-800">
                          {formatRupiah(rec.nominal)}
                        </td>
                        <td className="px-6 py-4">
                          {rec.status === "lunas" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Lunas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Belum Lunas
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-medium">
                          {new Date(rec.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-bold">
                        Tidak ada data pemasukan yang cocok dengan saringan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4 bg-slate-50">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <div key={rec.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col gap-3">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${rec.status === 'lunas' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <div className="pl-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{rec.nama_peserta}</div>
                          <div className="text-[10px] text-slate-400">NIM: {rec.nim}</div>
                        </div>
                        {rec.tipe === "pendaftaran" ? (
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-wide">
                            Registrasi
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-[9px] font-bold uppercase tracking-wide">
                            Denda
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-slate-50 p-2 rounded-lg mb-3">
                        <div className="text-xs text-slate-600 font-medium line-clamp-2">{rec.keterangan}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs items-end">
                        <div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Nominal</div>
                          <div className="font-black text-slate-800">{formatRupiah(rec.nominal)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Status & Waktu</div>
                          {rec.status === "lunas" ? (
                            <div className="font-bold text-emerald-600 mb-0.5">LUNAS</div>
                          ) : (
                            <div className="font-bold text-amber-500 mb-0.5">BELUM LUNAS</div>
                          )}
                          <div className="text-[9px] text-slate-400">
                            {new Date(rec.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 font-bold text-xs">
                  Tidak ada data pemasukan yang cocok.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
