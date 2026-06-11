"use client";

import { useEffect, useState } from "react";
import { LogOut, Calendar, Users, Activity, PlusCircle, Award, Ticket, ArrowRight, MessageSquare, Clock } from "lucide-react";
import api from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

interface UserData {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export default function OrganizerDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

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

        if (parsedUser.role?.toLowerCase() !== "penyelenggara") {
          setAuthMessage("Akses ditolak! Halaman ini khusus Penyelenggara (Organizer).");
          setAuthError(true);
          setIsLoading(false);
          return;
        }

        setUser(parsedUser);
        fetchStats();
      }
    } catch (e) {
      setAuthMessage("Sesi tidak valid. Silakan coba login kembali.");
      setAuthError(true);
      setIsLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/events/organizer/stats");
      setStats(res.data.stats);
      setRecentEvents(res.data.recent_events || []);
    } catch (err) {
      console.error("Gagal memuat stats penyelenggara:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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

  // UPDATE: Menu Sidebar Disesuaikan
  const navLinks = [
    { href: "/organizer/dashboard", icon: <Activity className="w-5 h-5" />, label: "Dashboard", active: true },
    { href: "/organizer/events", icon: <Calendar className="w-5 h-5" />, label: "Kelola Event" },
    { href: "/organizer/pendaftar", icon: <Users className="w-5 h-5" />, label: "Kelola Pendaftar" },
    { href: "/organizer/tim", icon: <Users className="w-5 h-5" />, label: "Kelola Tim" },
    { href: "/organizer/diskusi", icon: <MessageSquare className="w-5 h-5" />, label: "Diskusi Kelas" },
  ];

  return (
    <DashboardLayout
      user={user}
      title={`Dashboard Penyelenggara`}
      subtitle={`${user?.name} - Kelola semua event Anda di sini.`}
      links={navLinks}
      onLogout={handleLogout}
    >

      <div className="pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden pb-28 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl -mx-4 md:-mx-8 -mt-8">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-800 rounded-full opacity-40 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 rounded-full opacity-20 blur-3xl" />

          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="w-full text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold tracking-wide uppercase text-green-100">Dashboard Penyelenggara</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
                Selamat Datang, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                  {user?.name || "Organizer"}
                </span>
              </h1>
              <p className="text-indigo-100/80 text-sm md:text-base max-w-xl leading-relaxed">
                Kelola semua event Anda, pantau pendaftar, dan maksimalkan penjualan tiket dalam satu platform modern.
              </p>
            </div>

            <div className="flex justify-start md:justify-end">
              <Link href="/organizer/create-event" className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-extrabold px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-105">
                <PlusCircle className="w-6 h-6" />
                <span>Buat Event Baru</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-20 space-y-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Event Aktif */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-slate-800 mb-1">{stats?.active_events ?? 0}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Aktif</span>
            </div>

            {/* Event Draft */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-slate-800 mb-1">{stats?.draft_events ?? 0}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Draft</span>
            </div>

            {/* Tiket Terjual */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-slate-800 mb-1">{stats?.tickets_sold ?? 0}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiket Terjual</span>
            </div>

            {/* Estimasi Pendapatan */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl -mt-10 -mr-10"></div>
              <div className="w-12 h-12 bg-white/10 text-amber-400 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm border border-white/10 relative z-10">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-xl md:text-2xl font-black text-amber-400 mb-1 relative z-10 truncate max-w-full">
                {formatRupiah(stats?.estimated_revenue ?? 0)}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider relative z-10">Estimasi Pendapatan</span>
            </div>
          </div>

          {/* TABEL EVENT TERBARU (SEBAGAI RINGKASAN) */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Event Terbaru Anda
              </h3>
              <Link href="/organizer/events" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
                    <th className="p-5 w-2/5">Nama Event</th>
                    <th className="p-5">Tanggal</th>
                    <th className="p-5">Peserta</th>
                    <th className="p-5 text-center">Status</th>
                    <th className="p-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentEvents.length > 0 ? (
                    recentEvents.map((ev: any) => (
                      <tr key={ev.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="p-5 font-bold text-slate-800 truncate max-w-[200px]" title={ev.judul}>{ev.judul}</td>
                        <td className="p-5 text-sm text-slate-600 font-medium">
                          {new Date(ev.tanggal_waktu).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="p-5 text-sm text-slate-600 font-bold">{ev.total_registrants}</td>
                        <td className="p-5 text-center">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md tracking-wider ${ev.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}>
                            {ev.status === "approved" ? "PUBLISHED" : "DRAFT"}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <Link href={`/organizer/pendaftar/${ev.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">
                            Kelola
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                        Belum ada event yang Anda buat.
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