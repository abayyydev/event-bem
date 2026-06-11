"use client";

import { useEffect, useState } from "react";
import {
  LogOut, Activity, Users, Building, AlertCircle, Loader2, Calendar, Check, X,
  Search, Trash2, Globe, Lock, ShieldCheck, MapPin, Eye, CheckCircle2, XCircle, HelpCircle
} from "lucide-react";
import Swal from "sweetalert2";
import api from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";

interface Event {
  id: number;
  judul: string;
  deskripsi: string;
  poster: string | null;
  tanggal_waktu: string;
  lokasi: string;
  visibilitas: 'public' | 'internal';
  tipe_event: 'gratis' | 'berbayar';
  harga: number;
  status: 'draft' | 'approved' | 'rejected';
  ukm_penyelenggara: string | null;
  nama_penyelenggara: string | null;
  created_at: string;
}

interface UserData {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export default function ManageEventsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchEvents = async () => {
    try {
      setLoadingData(true);
      // Fetch high limit to get all events for admin overview
      const res = await api.get("/events/manage?limit=1000");
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data event:", err);
      Swal.fire("Error", "Gagal memuat daftar event dari server.", "error");
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
        fetchEvents();
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

  const handleApprove = async (id: number) => {
    setActionLoadingId(id);
    try {
      await api.patch(`/events/${id}/status`, { status: "approved" });
      Swal.fire({ icon: "success", title: "Disetujui!", text: "Event berhasil disetujui dan telah dipublikasikan.", timer: 1500, showConfirmButton: false });
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "approved" as const } : e));
    } catch (err: any) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menyetujui event.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const confirmReject = await Swal.fire({
      title: "Tolak Event ini?",
      text: "Event akan ditolak dan tidak akan ditampilkan pada katalog mahasiswa.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Tolak!",
      cancelButtonText: "Batal"
    });

    if (!confirmReject.isConfirmed) return;

    setActionLoadingId(id);
    try {
      await api.patch(`/events/${id}/status`, { status: "rejected" });
      Swal.fire({ icon: "info", title: "Ditolak", text: "Status event telah diubah menjadi ditolak.", timer: 1500, showConfirmButton: false });
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "rejected" as const } : e));
    } catch (err: any) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menolak event.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = await Swal.fire({
      title: "Hapus Event Permanen?",
      text: "Tindakan ini tidak dapat dibatalkan! Semua data pendaftaran terkait juga akan terhapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (confirmDelete.isConfirmed) {
      try {
        await api.delete(`/events/${id}`);
        Swal.fire({ icon: "success", title: "Terhapus!", text: "Event berhasil dihapus dari sistem.", timer: 1500, showConfirmButton: false });
        setEvents(prev => prev.filter(e => e.id !== id));
      } catch (err: any) {
        console.error(err);
        Swal.fire("Gagal", err.response?.data?.message || "Gagal menghapus event.", "error");
      }
    }
  };

  const formatTanggal = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatJam = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  // Filter events based on search query
  const searchedEvents = events.filter(e => {
    const query = searchQuery.toLowerCase();
    return (
      e.judul.toLowerCase().includes(query) ||
      (e.lokasi && e.lokasi.toLowerCase().includes(query)) ||
      (e.ukm_penyelenggara && e.ukm_penyelenggara.toLowerCase().includes(query)) ||
      (e.nama_penyelenggara && e.nama_penyelenggara.toLowerCase().includes(query))
    );
  });

  // Filter based on selected tab
  const pendingEvents = searchedEvents.filter(e => e.status === "draft");
  const displayEvents = activeTab === "pending" ? pendingEvents : searchedEvents;

  const navLinks = [
    { href: "/admin/dashboard", icon: <Activity className="w-5 h-5" />, label: "Statistik Global" },
    { href: "/admin/events", icon: <Calendar className="w-5 h-5" />, label: "Kelola & Persetujuan Event", active: true },
    { href: "/admin/mahasiswa", icon: <Users className="w-5 h-5" />, label: "Kelola Mahasiswa" },
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
      title="Kelola & Persetujuan Event"
      subtitle="Tinjau event berstatus draft atau kelola seluruh data event di platform."
      links={navLinks}
      onLogout={handleLogout}
    >
      <div className="pb-16 -mx-4 md:-mx-8">

        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden pb-24 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl -mx-4 md:-mx-8 -mt-8 mb-12 text-white">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-800 rounded-full opacity-40 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 rounded-full opacity-20 blur-3xl" />
          <div className="max-w-7xl mx-auto relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight">Manajemen & Verifikasi Event</h1>
            <p className="text-indigo-200 mt-2 text-sm max-w-xl">
              Setujui publikasi proposal event baru dari UKM/BEM, atau kelola kelayakan event yang sedang berjalan di dalam sistem.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 mb-6 gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === "pending"
                  ? "border-indigo-600 text-indigo-600 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Menunggu Persetujuan
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === "pending" ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-600"
                }`}>
                {events.filter(e => e.status === "draft").length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === "all"
                  ? "border-indigo-600 text-indigo-600 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
            >
              <Calendar className="w-4 h-4" />
              Semua Daftar Event
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600`}>
                {events.length}
              </span>
            </button>
          </div>

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
                placeholder="Cari event berdasarkan Judul, Penyelenggara UKM, atau Lokasi..."
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent text-slate-900 placeholder-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm"
              />
            </div>
          </div>

          {/* Data Presentation */}
          {loadingData ? (
            <div className="bg-white rounded-3xl shadow-md border border-slate-100 py-20 text-center text-slate-500">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="font-medium">Memuat data event...</span>
              </div>
            </div>
          ) : displayEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Tidak Ada Event</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                {activeTab === "pending"
                  ? "Semua event baru sudah disetujui! Tidak ada proposal pending saat ini."
                  : "Belum ada data event terdaftar di dalam sistem."
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-5">Event</th>
                      <th className="px-6 py-5">Penyelenggara / UKM</th>
                      <th className="px-6 py-5">Waktu & Tempat</th>
                      <th className="px-6 py-5 text-center">Visibilitas</th>
                      <th className="px-6 py-5 text-center">Biaya Masuk</th>
                      <th className="px-6 py-5 text-center">Status</th>
                      <th className="px-6 py-5 text-center">Kontrol Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {displayEvents.map((event) => {
                      const isFree = event.tipe_event === 'gratis' || event.harga <= 0;
                      return (
                        <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">

                          {/* Event Poster & Title */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-20 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-inner relative flex items-center justify-center">
                                {event.poster ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={`http://localhost:5000/uploads/${event.poster}`}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Calendar className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 max-w-xs line-clamp-1">{event.judul}</h4>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Dibuat: {new Date(event.created_at).toLocaleDateString("id-ID")}</span>
                              </div>
                            </div>
                          </td>

                          {/* UKM Penyelenggara */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                              <Building className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>{event.ukm_penyelenggara || event.nama_penyelenggara || 'BEM / UKM Kampus'}</span>
                            </div>
                          </td>

                          {/* Waktu & Lokasi */}
                          <td className="px-6 py-4 text-xs text-slate-600">
                            <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                {formatTanggal(event.tanggal_waktu)} ({formatJam(event.tanggal_waktu)})
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="truncate max-w-[150px]">{event.lokasi}</span>
                              </span>
                            </div>
                          </td>

                          {/* Visibilitas */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${event.visibilitas === 'public'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                              {event.visibilitas === 'public' ? (
                                <>
                                  <Globe className="w-3 h-3 mr-1" /> Public
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 mr-1" /> Internal
                                </>
                              )}
                            </span>
                          </td>

                          {/* Harga */}
                          <td className="px-6 py-4 text-center font-bold text-slate-700">
                            {isFree ? (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-100">GRATIS</span>
                            ) : (
                              <span className="text-slate-800 text-xs">Rp {Number(event.harga).toLocaleString("id-ID")}</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${event.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : event.status === 'rejected'
                                  ? 'bg-red-50 text-red-700 border-red-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                              {event.status === 'approved' ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
                                </>
                              ) : event.status === 'rejected' ? (
                                <>
                                  <XCircle className="w-3.5 h-3.5" /> Ditolak
                                </>
                              ) : (
                                <>
                                  <HelpCircle className="w-3.5 h-3.5" /> Draft
                                </>
                              )}
                            </span>
                          </td>

                          {/* Action Controls */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {event.status === 'draft' ? (
                                <>
                                  <button
                                    disabled={actionLoadingId === event.id}
                                    onClick={() => handleApprove(event.id)}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1 disabled:opacity-50"
                                    title="Setujui Event"
                                  >
                                    {actionLoadingId === event.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    Setujui
                                  </button>
                                  <button
                                    disabled={actionLoadingId === event.id}
                                    onClick={() => handleReject(event.id)}
                                    className="px-3 py-1.5 bg-red-50 text-red-650 hover:bg-red-100 border border-red-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                                    title="Tolak Event"
                                  >
                                    Tolak
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium">Telah Ditinjau</span>
                              )}
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="p-2 bg-slate-50 text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg transition-colors border border-slate-100"
                                title="Hapus Event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
