"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Calendar, Users, QrCode, ArrowLeft, Loader2, Search, CheckCircle, XCircle, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import api from "../../../../lib/api";
import DashboardLayout from "../../../../components/DashboardLayout";
import Swal from "sweetalert2";

interface Pendaftar {
  id: number;
  nama_peserta: string;
  email_peserta: string;
  telepon_peserta: string;
  kode_unik: string;
  status_kehadiran: string;
  nim: string | null;
  prodi: string | null;
  sertifikat_predikat?: string | null;
}

export default function DetailPendaftarPage() {
  const router = useRouter();
  const params = useParams();
  const { event_id } = params;

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [pendaftar, setPendaftar] = useState<Pendaftar[]>([]);
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchData = async () => {
    try {
      setLoading(true);
      let decoded_id = event_id;
      try {
        decoded_id = atob(decodeURIComponent(event_id as string));
      } catch (e) {}

      const resEvent = await api.get(`/events/${decoded_id}`);
      setEventData(resEvent.data);

      const resPendaftar = await api.get(`/pendaftar/${decoded_id}`);
      setPendaftar(resPendaftar.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: 'Anda tidak memiliki akses ke event ini atau event tidak ditemukan.',
        confirmButtonColor: '#4f46e5'
      }).then(() => {
        router.push('/organizer/pendaftar');
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (event_id) fetchData();
  }, [event_id]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Peserta yang dihapus akan kehilangan tiket event ini secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/pendaftar/${id}`);
          Swal.fire('Terhapus!', 'Peserta berhasil dihapus.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Gagal menghapus peserta.', 'error');
        }
      }
    });
  };

  let global_decoded_id = event_id as string;
  try {
    global_decoded_id = atob(decodeURIComponent(event_id as string));
  } catch (e) {}

  const handleUpdatePredikat = async (pendaftar_id: number, predikat: string) => {
    try {
      await api.put(`/pendaftar/${global_decoded_id}/pendaftar/${pendaftar_id}/predikat`, { predikat });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal menyimpan predikat.', 'error');
    }
  };

  const filteredPendaftar = pendaftar.filter(p => 
    p.nama_peserta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email_peserta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kode_unik.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hadirCount = pendaftar.filter(p => p.status_kehadiran === 'hadir').length;

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
    <DashboardLayout user={user} title="" subtitle="" links={navLinks} onLogout={handleLogout}>
      <div className="min-h-screen bg-gray-50 font-sans -m-6 pb-32">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pb-24 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden -mx-4 md:-mx-8 -mt-8">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-800 rounded-full opacity-40 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 rounded-full opacity-20 blur-3xl"></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="w-full text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/organizer/pendaftar" className="text-indigo-200 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-sm group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                            <span className="text-xs font-semibold tracking-wide uppercase text-indigo-100">Detail Pendaftar</span>
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 tracking-tight leading-tight line-clamp-2 mb-3">
                        {eventData?.judul || "Loading..."}
                    </h1>
                    <p className="text-indigo-100/80 mt-2 text-sm md:text-base max-w-xl leading-relaxed">
                        Kelola data pendaftar dan lakukan check-in menggunakan Scanner QR.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                    <div className="flex gap-3">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col items-center min-w-[90px]">
                            <span className="text-2xl font-bold text-white">{pendaftar.length}</span>
                            <span className="text-[9px] text-indigo-200 uppercase font-bold tracking-wider mt-1">Total</span>
                        </div>
                        <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-3 flex flex-col items-center min-w-[90px]">
                            <span className="text-2xl font-bold text-emerald-400">{hadirCount}</span>
                            <span className="text-[9px] text-indigo-200 uppercase font-bold tracking-wider mt-1">Hadir</span>
                        </div>
                    </div>
                    <Link href={`/organizer/pendaftar/${event_id}/scan`} 
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-5 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 h-full min-h-[70px]">
                        <QrCode className="w-6 h-6" />
                        <div className="text-left leading-tight">
                            <span className="block text-sm">Mulai Scan</span>
                            <span className="block text-[10px] font-normal text-emerald-100">Check-in Peserta</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
            {/* Search Bar */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-2 mb-8">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-indigo-400" />
                    </div>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari nama peserta, email, atau kode tiket..."
                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent text-slate-900 placeholder-slate-400 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 font-medium text-sm" />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-5 font-bold">Peserta</th>
                                <th className="px-6 py-5 font-bold">Kontak</th>
                                <th className="px-6 py-5 font-bold">Kode Tiket</th>
                                {eventData?.sertifikat_custom_type === 'per_peserta' && (
                                    <th className="px-6 py-5 font-bold">Predikat</th>
                                )}
                                <th className="px-6 py-5 font-bold text-center">Status Kehadiran</th>
                                <th className="px-6 py-5 font-bold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPendaftar.length > 0 ? (
                                filteredPendaftar.map((p) => (
                                    <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {p.nama_peserta.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm group-hover:text-indigo-700 transition-colors">{p.nama_peserta}</p>
                                                    <p className="text-[11px] text-gray-500">{p.prodi || p.nim || "Umum"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700 font-medium">{p.email_peserta}</p>
                                            <p className="text-xs text-gray-500">{p.telepon_peserta || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold tracking-wide">
                                                {p.kode_unik}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {p.status_kehadiran === 'hadir' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Hadir
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                                    <XCircle className="w-3.5 h-3.5" /> Belum Hadir
                                                </span>
                                            )}
                                        </td>
                                        {eventData?.sertifikat_custom_type === 'per_peserta' && (
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="text" 
                                                    defaultValue={p.sertifikat_predikat || ""}
                                                    onBlur={(e) => handleUpdatePredikat(p.id, e.target.value)}
                                                    placeholder="Isi Predikat..."
                                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:border-indigo-500 outline-none bg-white transition-colors focus:bg-indigo-50/10"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleDelete(p.id)}
                                                className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-100"
                                                title="Hapus Peserta"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <Users className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800">Tidak ada pendaftar</h3>
                                            <p className="text-gray-500 text-sm mt-1">Data tidak ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
