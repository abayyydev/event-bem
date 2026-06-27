"use client";

import { useEffect, useState } from "react";
import { 
  LogOut, Activity, Users, Building, AlertCircle, Loader2, Plus, Edit3, Trash2, 
  UserCheck, UserX, Search, Mail, Phone, Shield, ShieldAlert, Key, Check, X, Building2, Calendar
} from "lucide-react";
import Swal from "sweetalert2";
import api from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";

interface User {
  id: number;
  nama_lengkap: string;
  email: string;
  no_whatsapp: string | null;
  jenis_kelamin: 'Laki-laki' | 'Perempuan' | null;
  role: 'superadmin' | 'penyelenggara' | 'peserta';
  status: 'active' | 'inactive';
  ukm: string | null;
  created_at: string;
}

interface UserData {
  id: number; // current logged in user id
  name: string;
  email: string;
  role: string;
}

export default function ManageUsersPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    email: "",
    no_whatsapp: "",
    jenis_kelamin: "Laki-laki",
    role: "penyelenggara",
    status: "active",
    password: "",
    ukm: ""
  });

  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoadingData(true);
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Gagal memuat data user:", err);
      Swal.fire("Error", "Gagal mengambil data user dari server.", "error");
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
        fetchUsers();
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
      nama_lengkap: "",
      email: "",
      no_whatsapp: "",
      jenis_kelamin: "Laki-laki",
      role: "penyelenggara",
      status: "active",
      password: "",
      ukm: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setIsEditing(true);
    setEditingId(u.id);
    setFormData({
      nama_lengkap: u.nama_lengkap,
      email: u.email,
      no_whatsapp: u.no_whatsapp || "",
      jenis_kelamin: u.jenis_kelamin || "Laki-laki",
      role: u.role,
      status: u.status,
      password: "", // Leave blank on edit
      ukm: u.ukm || ""
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
        await api.put(`/admin/users/${editingId}`, formData);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Data user berhasil diperbarui.", timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/admin/users", formData);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "User berhasil ditambahkan.", timer: 1500, showConfirmButton: false });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (user && id === user.id) {
      Swal.fire("Peringatan", "Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan!", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "User yang dihapus tidak akan dapat mengakses dashboard ini lagi!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/users/${id}`);
        Swal.fire({ icon: "success", title: "Terhapus!", text: "User telah berhasil dihapus.", timer: 1500, showConfirmButton: false });
        fetchUsers();
      } catch (err: any) {
        console.error(err);
        Swal.fire("Gagal", err.response?.data?.message || "Gagal menghapus user.", "error");
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: "active" | "inactive") => {
    if (user && id === user.id && currentStatus === "active") {
      Swal.fire("Peringatan", "Anda tidak dapat menonaktifkan akun Anda sendiri!", "warning");
      return;
    }

    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    try {
      await api.patch(`/admin/users/${id}/status`, { status: newStatus });
      Swal.fire({
        icon: "success",
        title: "Status Diperbarui!",
        text: `Akun user telah ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}.`,
        timer: 1500,
        showConfirmButton: false
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (err: any) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.message || "Gagal memperbarui status akun.", "error");
    }
  };

  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    return (
      u.nama_lengkap.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query) ||
      (u.ukm && u.ukm.toLowerCase().includes(query))
    );
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const navLinks = [
    { href: "/admin/dashboard", icon: <Activity className="w-5 h-5" />, label: "Statistik Global" },
    { href: "/admin/events", icon: <Calendar className="w-5 h-5" />, label: "Kelola & Persetujuan Event" },
    { href: "/admin/mahasiswa", icon: <Users className="w-5 h-5" />, label: "Kelola Mahasiswa" },
    { href: "/admin/users", icon: <Building className="w-5 h-5" />, label: "Kelola Users", active: true },
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
      title="Manajemen User" 
      subtitle="Kelola akun Penyelenggara Event (UKM) dan Superadmin."
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
              <h1 className="text-3xl font-extrabold tracking-tight">Manajemen Akun Internal</h1>
              <p className="text-indigo-200 mt-2 text-sm max-w-xl">
                Daftarkan penyelenggara event (BEM/UKM) baru atau administrator sistem untuk membantu mengelola sistem BEM Event Management.
              </p>
            </div>
            <button 
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 self-start md:self-auto"
            >
              <Plus className="w-5 h-5 font-bold" /> Tambah User Baru
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
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Cari user berdasarkan Nama, Email, UKM, atau Peran (Role)..."
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent text-slate-900 placeholder-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Organisasi / UKM</th>
                    <th className="px-6 py-4">Kontak WhatsApp</th>
                    <th className="px-6 py-4 text-center">Peran (Role)</th>
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
                          <span className="font-medium">Memuat data user...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-500 font-medium">
                        Tidak ada data user ditemukan.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Profile & Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 overflow-hidden shrink-0 text-sm uppercase">
                              {u.nama_lengkap.slice(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800">{u.nama_lengkap}</h4>
                              <span className="text-[10px] text-slate-400 capitalize">{u.jenis_kelamin || "Jenis Kelamin -"}</span>
                            </div>
                          </div>
                        </td>

                        {/* UKM */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-700">
                              {u.ukm || "Superadmin Team"}
                            </span>
                          </div>
                        </td>

                        {/* Email & Phone */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-xs text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {u.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {u.no_whatsapp || "-"}
                            </span>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-6 py-4 text-center">
                          {u.role === 'superadmin' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                              <Shield className="w-3 h-3" /> Superadmin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                              <Building className="w-3 h-3" /> Penyelenggara
                            </span>
                          )}
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                              u.status === "active" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" 
                                : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                            }`}
                          >
                            {u.status === "active" ? (
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
                              onClick={() => handleOpenEditModal(u)}
                              className="p-2 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors border border-slate-100"
                              title="Edit User"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(u.id)}
                              disabled={!!(user && u.id === user.id)}
                              className="p-2 bg-slate-50 text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg transition-colors border border-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Hapus User"
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

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4">
              {loadingData ? (
                <div className="py-20 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <span className="font-medium text-sm">Memuat data user...</span>
                  </div>
                </div>
              ) : paginatedUsers.length === 0 ? (
                <div className="py-16 text-center text-slate-500 font-medium text-sm">
                  Tidak ada data user ditemukan.
                </div>
              ) : (
                paginatedUsers.map((u) => (
                  <div key={u.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col gap-3">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div className="flex justify-between items-start pl-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 overflow-hidden shrink-0 text-sm uppercase">
                          {u.nama_lengkap.slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{u.nama_lengkap}</h4>
                          <span className="text-[10px] text-slate-400 capitalize">{u.jenis_kelamin || "Jenis Kelamin -"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {u.role === 'superadmin' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[9px] font-bold border border-red-100 uppercase tracking-wider">
                            <Shield className="w-3 h-3" /> Superadmin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-100 uppercase tracking-wider">
                            <Building className="w-3 h-3" /> Penyelenggara
                          </span>
                        )}
                        <button 
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold transition-all border uppercase tracking-wider ${
                            u.status === "active" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          {u.status === "active" ? (
                            <>Aktif</>
                          ) : (
                            <>Nonaktif</>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 ml-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">{u.ukm || "Superadmin Team"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-600 truncate">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-600">{u.no_whatsapp || "-"}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 ml-2 mt-1">
                      <button 
                        onClick={() => handleOpenEditModal(u)}
                        className="px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors border border-slate-200 text-xs font-bold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        disabled={!!(user && u.id === user.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-200 rounded-lg transition-colors border border-red-100 text-xs font-bold disabled:opacity-40 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 rounded-b-3xl mt-auto">
                <span className="text-sm text-slate-500 font-medium">
                  Halaman {currentPage} dari {totalPages} (Total {filteredUsers.length} Data)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-40 transition-all shadow-sm bg-white text-slate-600"
                  >
                    &lt;
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-40 transition-all shadow-sm bg-white text-slate-600"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE & EDIT SLIDE-OVER / MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                {isEditing ? "Edit Data User" : "Tambah User Baru"}
              </h3>
              <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="nama_lengkap" 
                      required 
                      value={formData.nama_lengkap} 
                      onChange={handleInputChange} 
                      placeholder="Nama Lengkap User" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-sm text-slate-800"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Aktif <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="user@gmail.com" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-sm text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* No. WhatsApp */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nomor WhatsApp</label>
                    <input 
                      type="text" 
                      name="no_whatsapp" 
                      value={formData.no_whatsapp} 
                      onChange={handleInputChange} 
                      placeholder="Contoh: 0812XXXXXXXX" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-sm text-slate-800"
                    />
                  </div>

                  {/* Password */}
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
                  {/* Role */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Peran (Role) <span className="text-red-500">*</span></label>
                    <select 
                      name="role" 
                      value={formData.role} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold outline-none text-sm text-slate-800 cursor-pointer"
                    >
                      <option value="penyelenggara">Penyelenggara (UKM / Organisasi)</option>
                      <option value="superadmin">Superadmin (Pengelola Sistem)</option>
                    </select>
                  </div>

                  {/* UKM / Nama Lembaga (Only active or shown when role is penyelenggara) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nama UKM / Organisasi</label>
                    <input 
                      type="text" 
                      name="ukm" 
                      value={formData.ukm} 
                      disabled={formData.role !== "penyelenggara"}
                      onChange={handleInputChange} 
                      placeholder={formData.role !== "penyelenggara" ? "Hanya untuk peran Penyelenggara" : "Contoh: BEM Teknik / UKM Musik"} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-sm text-slate-800 disabled:opacity-50 disabled:bg-slate-100"
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
                      <option value="active">Aktif</option>
                      <option value="inactive">Dinonaktifkan</option>
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
                  {isEditing ? "Simpan Perubahan" : "Tambah User"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
