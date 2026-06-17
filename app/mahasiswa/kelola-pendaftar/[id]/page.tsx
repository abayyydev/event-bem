"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Calendar, Users, QrCode, ArrowLeft, Loader2, Search, CheckCircle, XCircle, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import api from "../../../../lib/api";
import MahasiswaLayout from "../../../../components/MahasiswaLayout";
import Swal from "sweetalert2";

interface Pendaftar {
  id: number;
  nama_peserta: string;
  email_peserta: string;
  telepon_peserta: string;
  kode_unik: string;
  status_kehadiran: string;
  status_pembayaran: string;
  nim: string | null;
  prodi: string | null;
}

export default function DetailPendaftarMahasiswaPage() {
  const router = useRouter();
  const params = useParams();
  const { id: event_id } = params;

  const [pendaftar, setPendaftar] = useState<Pendaftar[]>([]);
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      let decoded_id = event_id;
      try {
        decoded_id = atob(decodeURIComponent(event_id as string));
      } catch (e) {}

      const resEvent = await api.get(`/events/${decoded_id}`);
      setEventData(resEvent.data);

      const resPendaftar = await api.get(`/mahasiswa/panitia-events/${decoded_id}/pendaftar`);
      setPendaftar(resPendaftar.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: 'Anda bukan panitia untuk event ini atau event tidak ditemukan.',
        confirmButtonColor: '#4f46e5'
      }).then(() => {
        router.push('/mahasiswa/kelola-pendaftar');
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (event_id) fetchData();
  }, [event_id]);

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
          let decoded_id = event_id;
          try {
            decoded_id = atob(decodeURIComponent(event_id as string));
          } catch (e) {}

          await api.delete(`/mahasiswa/panitia-events/${decoded_id}/pendaftar/${id}`);
          Swal.fire('Terhapus!', 'Peserta berhasil dihapus.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Gagal menghapus peserta.', 'error');
        }
      }
    });
  };

  const handleUpdateStatus = async (pendaftar_id: number, current_kehadiran: string, current_pembayaran: string) => {
    Swal.fire({
      title: 'Update Status Peserta',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Status Kehadiran</label>
            <select id="status_kehadiran" class="w-full p-2 border rounded">
              <option value="belum_hadir" ${current_kehadiran === 'belum_hadir' ? 'selected' : ''}>Belum Hadir</option>
              <option value="hadir" ${current_kehadiran === 'hadir' ? 'selected' : ''}>Hadir</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Status Pembayaran</label>
            <select id="status_pembayaran" class="w-full p-2 border rounded">
              <option value="pending" ${current_pembayaran === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="paid" ${current_pembayaran === 'paid' ? 'selected' : ''}>Paid (Lunas)</option>
              <option value="failed" ${current_pembayaran === 'failed' ? 'selected' : ''}>Failed</option>
              <option value="free" ${current_pembayaran === 'free' ? 'selected' : ''}>Free</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      preConfirm: () => {
        const kehadiran = (document.getElementById('status_kehadiran') as HTMLSelectElement).value;
        const pembayaran = (document.getElementById('status_pembayaran') as HTMLSelectElement).value;
        return { kehadiran, pembayaran };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          let decoded_id = event_id;
          try {
            decoded_id = atob(decodeURIComponent(event_id as string));
          } catch (e) {}

          await api.put(`/mahasiswa/panitia-events/${decoded_id}/pendaftar/${pendaftar_id}/status`, {
            status_kehadiran: result.value.kehadiran,
            status_pembayaran: result.value.pembayaran
          });
          Swal.fire('Berhasil!', 'Status berhasil diupdate.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Gagal update status.', 'error');
        }
      }
    });
  };

  const filteredPendaftar = pendaftar.filter(p => 
    p.nama_peserta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email_peserta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kode_unik.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hadirCount = pendaftar.filter(p => p.status_kehadiran === 'hadir').length;

  if (loading) {
    return (
      <MahasiswaLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      </MahasiswaLayout>
    );
  }

  return (
    <MahasiswaLayout>
      <div className="min-h-screen bg-gray-50 font-sans -m-4 md:-m-8 pb-32">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pb-24 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-800 rounded-full opacity-40 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 rounded-full opacity-20 blur-3xl"></div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="w-full text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/mahasiswa/kelola-pendaftar" className="text-indigo-200 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-sm group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                            <span className="text-xs font-semibold tracking-wide uppercase text-indigo-100">Detail Pendaftar Kepanitiaan</span>
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 tracking-tight leading-tight line-clamp-2 mb-3">
                        {eventData?.judul || "Loading..."}
                    </h1>
                    <p className="text-indigo-100/80 mt-2 text-sm md:text-base max-w-xl leading-relaxed">
                        Kelola data pendaftar, edit status pembayaran/kehadiran, dan lakukan check-in menggunakan Scanner QR.
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
                    <Link href={`/mahasiswa/kelola-pendaftar/${event_id}/scan`} 
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
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-5 font-bold">Peserta</th>
                                <th className="px-6 py-5 font-bold">Kontak</th>
                                <th className="px-6 py-5 font-bold">Kode Tiket</th>
                                <th className="px-6 py-5 font-bold text-center">Status Pembayaran</th>
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
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                              p.status_pembayaran === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                              p.status_pembayaran === 'free' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                              p.status_pembayaran === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                              'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                                {p.status_pembayaran.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {p.status_kehadiran === 'hadir' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Hadir
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                                    <XCircle className="w-3.5 h-3.5" /> Belum
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => handleUpdateStatus(p.id, p.status_kehadiran, p.status_pembayaran)}
                                                    className="p-2 bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-lg transition-all border border-indigo-100"
                                                    title="Update Status"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-100"
                                                    title="Hapus Peserta"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
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

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-4">
                    {filteredPendaftar.length > 0 ? (
                        filteredPendaftar.map((p) => (
                            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm relative flex flex-col gap-3 overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${p.status_kehadiran === 'hadir' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => handleUpdateStatus(p.id, p.status_kehadiran, p.status_pembayaran)}
                                        className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center border border-indigo-100 transition-colors"
                                        title="Update Status">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)}
                                        className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center border border-red-100 transition-colors"
                                        title="Hapus">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 pr-20 pl-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                        {p.nama_peserta.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm leading-tight">{p.nama_peserta}</p>
                                        <p className="text-[10px] text-gray-400">{p.prodi || p.nim || "Umum"}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg ml-2">
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Email</span>
                                        <span className="text-gray-700 truncate block">{p.email_peserta}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">No HP</span>
                                        <span className="text-gray-700 block">{p.telepon_peserta || '-'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pl-2">
                                    <div>
                                        <span className="font-mono text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold tracking-widest border border-gray-200">
                                            #{p.kode_unik}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${
                                              p.status_pembayaran === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                              p.status_pembayaran === 'free' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                              p.status_pembayaran === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                              'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                            {p.status_pembayaran.toUpperCase()}
                                        </span>
                                        {p.status_kehadiran === 'hadir' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                <CheckCircle className="w-3 h-3" /> Hadir
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                                <XCircle className="w-3 h-3" /> Belum
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500 font-medium text-sm">
                            Tidak ada pendaftar yang cocok.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </MahasiswaLayout>
  );
}
