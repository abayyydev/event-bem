"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, PlusCircle, Search, Trash2, ShieldCheck, Mail, Phone, Loader2, MessageSquare } from "lucide-react";
import api from "../../../lib/api";
import DashboardLayout from "../../../components/DashboardLayout";
import Swal from "sweetalert2";

interface TimMember {
  id: number;
  nama_lengkap: string;
  email: string;
  no_whatsapp: string;
  role: string;
  created_at: string;
}

interface Mahasiswa {
  id: number;
  nim: string;
  nama_lengkap: string;
  email: string;
  no_hp_mahasiswa: string;
}

export default function KelolaTimPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [tim, setTim] = useState<TimMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search Mahasiswa states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Mahasiswa[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Add Member state
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const navLinks = [
    { href: "/organizer/dashboard", icon: <Calendar className="w-5 h-5" />, label: "Dashboard" },
    { href: "/organizer/events", icon: <Calendar className="w-5 h-5" />, label: "Kelola Event" },
    { href: "/organizer/pendaftar", icon: <Users className="w-5 h-5" />, label: "Kelola Pendaftar" },
    { href: "/organizer/tim", icon: <Users className="w-5 h-5" />, label: "Kelola Tim", active: true },
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

  const fetchTim = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tim');
      setTim(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal memuat data tim', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTim();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Debounce Search Mahasiswa
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setSearching(true);
        try {
          const res = await api.get(`/tim/search?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectMahasiswa = (mhs: Mahasiswa) => {
    setSelectedMahasiswa(mhs);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleAddTim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMahasiswa) return;

    if (password.length < 8) {
      Swal.fire('Error', 'Password minimal 8 karakter', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.post('/tim', {
        mahasiswa_id: selectedMahasiswa.id,
        password: password
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Anggota tim berhasil ditambahkan.',
        timer: 2000,
        showConfirmButton: false
      });
      
      setSelectedMahasiswa(null);
      setPassword("");
      fetchTim();
    } catch (err: any) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    const result = await Swal.fire({
      title: 'Hapus Anggota?',
      html: `Hapus <strong>${nama}</strong> dari tim?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/tim/${id}`);
        Swal.fire('Terhapus!', 'Anggota tim berhasil dihapus.', 'success');
        fetchTim();
      } catch (err: any) {
        Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus data', 'error');
      }
    }
  };

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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
                        <Users className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-semibold tracking-wide uppercase text-indigo-100">Manajemen User</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                        Kelola <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Tim</span>
                    </h1>
                    <p className="text-indigo-100/80 mt-2 text-sm md:text-base max-w-xl leading-relaxed">
                        Pilih data mahasiswa untuk ditambahkan sebagai panitia (tim penyelenggara) ke dashboard ini.
                    </p>
                </div>
                
                <div className="flex gap-3 justify-start md:justify-end shrink-0">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center min-w-[120px]">
                        <span className="text-3xl font-bold text-white">{tim.length}</span>
                        <span className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider mt-1">Total Anggota</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* KIRI: Form Tambah */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 sticky top-6">
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg shadow-sm">
                                <PlusCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Tambah Anggota</h2>
                                <p className="text-xs text-gray-500">Cari data dari mahasiswa</p>
                            </div>
                        </div>

                        {!selectedMahasiswa ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Cari Mahasiswa</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <Search className="w-4 h-4" />
                                        </span>
                                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                                            placeholder="Ketik NIM, Nama, atau Email (min 3 huruf)..." />
                                    </div>
                                    {searching && <p className="text-xs text-gray-400 mt-2 ml-1">Mencari...</p>}
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg max-h-60 overflow-y-auto">
                                        {searchResults.map(mhs => (
                                            <button key={mhs.id} onClick={() => handleSelectMahasiswa(mhs)}
                                                className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-gray-100 last:border-0 transition-colors">
                                                <div className="font-bold text-sm text-gray-800">{mhs.nama_lengkap}</div>
                                                <div className="text-xs text-gray-500">{mhs.nim || '-'} • {mhs.email}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleAddTim} className="space-y-5 animate-in fade-in duration-300">
                                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl relative">
                                    <button type="button" onClick={() => setSelectedMahasiswa(null)} className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-650">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Terpilih:</p>
                                    <p className="font-bold text-gray-800">{selectedMahasiswa.nama_lengkap}</p>
                                    <p className="text-xs text-gray-600">{selectedMahasiswa.email}</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password Default</label>
                                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                                        placeholder="Min 8 karakter untuk login" />
                                </div>

                                <button type="submit" disabled={saving}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Jadikan Panitia</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* KANAN: Daftar Anggota */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">
                        <div className="bg-gradient-to-r from-slate-900 to-slate-950 px-6 py-5 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300">
                                    <Users className="w-4 h-4" />
                                </span>
                                Daftar Anggota Tim
                            </h2>
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-6 py-4">Anggota</th>
                                        <th className="px-6 py-4">Kontak</th>
                                        <th className="px-6 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tim.length > 0 ? (
                                        tim.map((anggota) => (
                                            <tr key={anggota.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold shadow-sm shrink-0">
                                                            {anggota.nama_lengkap.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm group-hover:text-indigo-700 transition-colors">
                                                                {anggota.nama_lengkap}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400">
                                                                Bergabung: {new Date(anggota.created_at).toLocaleDateString('id-ID')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3.5 h-3.5 text-gray-400" /> {anggota.email}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {anggota.no_whatsapp || '-'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => handleDelete(anggota.id, anggota.nama_lengkap)}
                                                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center border border-red-100"
                                                            title="Hapus">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-16 text-center text-gray-500 font-medium">
                                                Belum ada anggota tim. Silakan tambahkan dari form di samping.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden p-4 space-y-4">
                            {tim.length > 0 ? (
                                tim.map((anggota) => (
                                    <div key={anggota.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col gap-3 relative">
                                        <button onClick={() => handleDelete(anggota.id, anggota.nama_lengkap)}
                                            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center border border-red-100 transition-colors"
                                            title="Hapus">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center gap-3 pr-10">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold shadow-sm shrink-0">
                                                {anggota.nama_lengkap.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{anggota.nama_lengkap}</p>
                                                <p className="text-[10px] text-gray-400">Bergabung: {new Date(anggota.created_at).toLocaleDateString('id-ID')}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 space-y-2 mt-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> <span className="truncate">{anggota.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" /> <span>{anggota.no_whatsapp || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-500 font-medium text-sm">
                                    Belum ada anggota tim. Silakan tambahkan dari form di atas.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
