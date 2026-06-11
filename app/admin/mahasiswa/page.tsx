"use client";
import { getBackendBaseUrl } from "@/lib/axios";


import { useEffect, useState } from "react";
import { 
  LogOut, Activity, Users, Building, AlertCircle, Loader2, Plus, Edit3, Trash2, 
  UserCheck, UserX, Search, Mail, Phone, BookOpen, Key, Check, X, ShieldAlert, Calendar
} from "lucide-react";
import Swal from "sweetalert2";
import api from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";

interface Mahasiswa {
  id: number;
  google_id: string | null;
  nim: string | null;
  nama_lengkap: string;
  email: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan' | null;
  prodi: string | null;
  no_hp_mahasiswa: string | null;
  foto_mahasiswa: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

interface UserData {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export default function ManageMahasiswaPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  
  const [mahasiswas, setMahasiswas] = useState<Mahasiswa[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    nim: "",
    nama_lengkap: "",
    email: "",
    password: "",
    jenis_kelamin: "Laki-laki",
    prodi: "",
    no_hp_mahasiswa: "",
    status: "active"
  });

  const [formLoading, setFormLoading] = useState(false);

  const fetchMahasiswa = async () => {
    try {
      setLoadingData(true);
      const res = await api.get("/admin/mahasiswa");
      setMahasiswas(res.data);
    } catch (err) {
      console.error("Gagal memuat data mahasiswa:", err);
      Swal.fire("Error", "Gagal mengambil data mahasiswa dari server.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
          setAuthMessage("Anda belum login. Silakan login terlebih dahulu.");
          setAuthError(true);
          setIsLoading(false);
          return;
        }

        const parsedUser: UserData = JSON.parse(storedUser);

        if (parsedUser.role?.toLowerCase() !== "superadmin") {
          setAuthMessage("Akses ditolak! Halaman ini khusus Administrator.");
          setAuthError(true);
          setIsLoading(false);
          return;
        }

        setUser(parsedUser);
        fetchMahasiswa();
      }
    } catch (e) {
      setAuthMessage("Sesi tidak valid. Silakan coba login kembali.");
      setAuthError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      nim: "",
      nama_lengkap: "",
      email: "",
      password: "",
      jenis_kelamin: "Laki-laki",
      prodi: "",
      no_hp_mahasiswa: "",
      status: "active"
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mhs: Mahasiswa) => {
    setIsEditing(true);
    setEditingId(mhs.id);
    setFormData({
      nim: mhs.nim || "",
      nama_lengkap: mhs.nama_lengkap,
      email: mhs.email,
      password: "", // Leave blank on edit
      jenis_kelamin: mhs.jenis_kelamin || "Laki-laki",
      prodi: mhs.prodi || "",
      no_hp_mahasiswa: mhs.no_hp_mahasiswa || "",
      status: mhs.status
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isEditing && editingId) {
        await api.put(`/admin/mahasiswa/${editingId}`, formData);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Data mahasiswa berhasil diperbarui.", timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/admin/mahasiswa", formData);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Mahasiswa berhasil ditambahkan.", timer: 1500, showConfirmButton: false });
      }
      setIsModalOpen(false);
      fetchMahasiswa();
    } catch (err: any) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Seluruh data pendaftaran dan keikutsertaan event mahasiswa ini akan ikut terhapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/mahasiswa/${id}`);
        Swal.fire({ icon: "success", title: "Terhapus!", text: "Mahasiswa telah berhasil dihapus.", timer: 1500, showConfirmButton: false });
        fetchMahasiswa();
      } catch (err: any) {
        console.error(err);
        Swal.fire("Gagal", err.response?.data?.message || "Gagal menghapus mahasiswa.", "error");
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: "active" | "inactive") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    try {
      await api.patch(`/admin/mahasiswa/${id}/status`, { status: newStatus });
      Swal.fire({
        icon: "success",
        title: "Status Diperbarui!",
        text: `Akun mahasiswa telah ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}.`,
        timer: 1500,
        showConfirmButton: false
      });
      setMahasiswas(prev => prev.map(mhs => mhs.id === id ? { ...mhs, status: newStatus } : mhs));
    } catch (err: any) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.message || "Gagal memperbarui status akun.", "error");
    }
  };

  const filteredMahasiswas = mahasiswas.filter(m => {
    const query = searchQuery.toLowerCase();
    return (
      m.nama_lengkap.toLowerCase().includes(query) ||
      (m.nim && m.nim.toLowerCase().includes(query)) ||
      m.email.toLowerCase().includes(query) ||
      (m.prodi && m.prodi.toLowerCase().includes(query))
    );
  });

  const navLinks = [
    { href: "/admin/dashboard", icon: <Activity className="w-5 h-5" />, label: "Statistik Global" },
    { href: "/admin/events", icon: <Calendar className="w-5 h-5" />, label: "Kelola & Persetujuan Event" },
    { href: "/admin/mahasiswa", icon: <Users className="w-5 h-5" />, label: "Kelola Mahasiswa", active: true },
    { href: "/admin/users", icon: <Building className="w-5 h-5" />, label: "Kelola Users" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">{authMessage}</p>
          <a href="/login" className="inline-block w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Ke Halaman Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      user={user} 
      title="Manajemen Mahasiswa" 
      subtitle="Kelola data pendaftaran mahasiswa dan atur status aktif akun mereka."
      links={navLinks}
      onLogout={handleLogout}
    >
      <div className="pb-16 -mx-4 md:-mx-8">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden pb-24 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl -mx-4 md:-mx-8 -mt-8 mb-12 text-white">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-800 rounded-full opacity-40 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 rounded-full opacity-20 blur-3xl" />

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Manajemen Akun Mahasiswa</h1>
              <p className="text-indigo-200 mt-2 text-sm max-w-xl">
                Tambah data mahasiswa baru, modifikasi informasi akademik, atau nonaktifkan akses akun yang melanggar aturan.
              </p>
            </div>
            <button 
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 self-start md:self-auto"
            >
              <Plus className="w-5 h-5 font-bold" /> Tambah Mahasiswa
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 mb-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mahasiswa berdasarkan Nama, NIM, Email, atau Program Studi..."
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent text-slate-900 placeholder-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Mahasiswa</th>
                    <th className="px-6 py-4">Informasi Akademik</th>
                    <th className="px-6 py-4">Kontak</th>
                    <th className="px-6 py-4 text-center">Metode Daftar</th>
                    <th className="px-6 py-4 text-center">Status Akun</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loadingData ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                          <span className="font-medium">Memuat data mahasiswa...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredMahasiswas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-500 font-medium">
                        Tidak ada data mahasiswa ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredMahasiswas.map((mhs) => (
                      <tr key={mhs.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Profile & Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 overflow-hidden shrink-0 text-sm uppercase">
                              {mhs.foto_mahasiswa ? (
                                <img src={mhs.foto_mahasiswa.startsWith('http') ? mhs.foto_mahasiswa : `${getBackendBaseUrl()}/uploads/${mhs.foto_mahasiswa}`} alt="" className="h-full w-full object-cover" />
                              ) : (
                                mhs.nama_lengkap.slice(0, 2)
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800">{mhs.nama_lengkap}</h4>
                              <p className="text-xs text-slate-400 capitalize">{mhs.jenis_kelamin || "Jenis Kelamin -"}</p>
                            </div>
                          </div>
                        </td>

                        {/* NIM & Prodi */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-fit">
                              {mhs.nim || "NIM - (Belum Diisi)"}
                            </span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> {mhs.prodi || "Program Studi -"}
                            </span>
                          </div>
                        </td>

                        {/* Email & Phone */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-xs text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {mhs.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {mhs.no_hp_mahasiswa || "-"}
                            </span>
                          </div>
                        </td>

                        {/* Signup Method */}
                        <td className="px-6 py-4 text-center">
                          {mhs.google_id ? (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                              Google OAuth
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100">
                              Lokal Email
                            </span>
                          )}
                        </td>

                        {/* Status (Active/Inactive Toggle Switch UI) */}
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleToggleStatus(mhs.id, mhs.status)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                              mhs.status === "active" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" 
                                : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                            }`}
                          >
                            {mhs.status === "active" ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" /> Aktif
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" /> Dinonaktifkan
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleOpenEditModal(mhs)}
                              className="p-2 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors border border-slate-100"
                              title="Edit Data"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(mhs.id)}
                              className="p-2 bg-slate-50 text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg transition-colors border border-slate-100"
                              title="Hapus Mahasiswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE & EDIT SLIDE-OVER / MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300">
                  <Users className="w-4 h-4" />
                </span>
                {isEditing ? "Edit Data Mahasiswa" : "Tambah Mahasiswa Baru"}
              </h3>
              <button onClick={handleCloseModal} type="button" className="p-1 text-slate-400 hover:text-white bg-white/10 border border-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* NIM */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">NIM (Nomor Induk Mahasiswa)</label>
                    <input 
                      type="text" 
                      name="nim" 
                      value={formData.nim} 
                      onChange={handleInputChange} 
                      placeholder="Contoh: NIM2026001" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-sm text-slate-800"
                    />
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="nama_lengkap" 
                      required 
                      value={formData.nama_lengkap} 
                      onChange={handleInputChange} 
                      placeholder="Nama Lengkap Mahasiswa" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Aktif <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="mahasiswa@kampus.ac.id" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-sm text-slate-800"
                    />
                  </div>

                  {/* Password (Required only on create) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Password {isEditing ? <span className="text-slate-400 font-normal">(Kosongkan jika tidak ingin diubah)</span> : <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="w-4 h-4 text-slate-400" />
                      </div>
                      <input 
                        type="password" 
                        name="password" 
                        required={!isEditing} 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        placeholder={isEditing ? "••••••••" : "Password akun baru"} 
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-sm text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Program Studi */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Program Studi</label>
                    <input 
                      type="text" 
                      name="prodi" 
                      value={formData.prodi} 
                      onChange={handleInputChange} 
                      placeholder="Contoh: Teknik Informatika" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-sm text-slate-800"
                    />
                  </div>

                  {/* No. WhatsApp / HP */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">No. WhatsApp / HP</label>
                    <input 
                      type="text" 
                      name="no_hp_mahasiswa" 
                      value={formData.no_hp_mahasiswa} 
                      onChange={handleInputChange} 
                      placeholder="Contoh: 0812XXXXXXXX" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Jenis Kelamin */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Jenis Kelamin</label>
                    <select 
                      name="jenis_kelamin" 
                      value={formData.jenis_kelamin} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold outline-none text-sm text-slate-800 cursor-pointer"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  {/* Status Akun */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Status Akun</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold outline-none text-sm text-slate-800 cursor-pointer"
                    >
                      <option value="active">Aktif (Dapat Login & Daftar Event)</option>
                      <option value="inactive">Dinonaktifkan (Blokir Akses Login)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-600 text-sm transition-all shadow-sm"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-75"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditing ? "Simpan Perubahan" : "Tambah Mahasiswa"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
