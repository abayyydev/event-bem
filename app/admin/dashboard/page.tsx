"use client";

import { useEffect, useState } from "react";
import { LogOut, Activity, Users, Building, AlertCircle, Calendar, Loader2, Clock, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";

interface UserData {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [stats, setStats] = useState<any>(null);

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
      const res = await api.get("/admin/dashboard/stats");
      setStats(res.data.stats);
    } catch (err) {
      console.error("Gagal memuat stats:", err);
    } finally {
      setIsLoading(false);
    }
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

  const navLinks = [
    { href: "/admin/dashboard", icon: <Activity className="w-5 h-5" />, label: "Statistik Global", active: true },
    { href: "/admin/events", icon: <Calendar className="w-5 h-5" />, label: "Kelola & Persetujuan Event" },
    { href: "/admin/mahasiswa", icon: <Users className="w-5 h-5" />, label: "Kelola Mahasiswa" },
    { href: "/admin/users", icon: <Building className="w-5 h-5" />, label: "Kelola Users" },
  ];

  return (
    <DashboardLayout 
      user={user} 
      title={`Dashboard Superadmin`} 
      subtitle={`Selamat bertugas, Administrator.`}
      links={navLinks}
      onLogout={handleLogout}
    >
      
      <div className="pb-10">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden pb-24 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl -mx-4 md:-mx-8 -mt-8 mb-12">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-800 rounded-full opacity-40 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 rounded-full opacity-20 blur-3xl" />

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase text-blue-100">Portal Administrator</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
              Selamat Datang, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
                {user?.name || "Administrator"}
              </span>
            </h1>
            <p className="text-indigo-100/80 text-sm md:text-base max-w-xl leading-relaxed">
              Pantau statistik global, kelola akun penyelenggara, dan awasi seluruh aktivitas sistem dalam satu tampilan pusat kontrol.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-20 relative z-20">
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Active Students */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg flex items-center justify-between hover:-translate-y-1 transition-transform group">
              <div>
                <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider mb-1">Mahasiswa Aktif</p>
                <h3 className="text-3xl font-black text-slate-800">{stats?.active_students ?? 0}</h3>
                <span className="text-[10px] text-slate-400 mt-2 block">Total akun aktif</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Active BEM/UKM */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg flex items-center justify-between hover:-translate-y-1 transition-transform group">
              <div>
                <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider mb-1">Organisasi UKM</p>
                <h3 className="text-3xl font-black text-slate-800">{stats?.active_organizers ?? 0}</h3>
                <span className="text-[10px] text-slate-400 mt-2 block">Akun Penyelenggara</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Building className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Published Events */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg flex items-center justify-between hover:-translate-y-1 transition-transform group">
              <div>
                <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider mb-1">Event Publikasi</p>
                <h3 className="text-3xl font-black text-slate-800">{stats?.published_events ?? 0}</h3>
                <span className="text-[10px] text-slate-400 mt-2 block">Telah disetujui</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Pending Approvals */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg flex items-center justify-between hover:-translate-y-1 transition-transform group">
              <div>
                <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider mb-1">Menunggu Persetujuan</p>
                <h3 className="text-3xl font-black text-amber-500">{stats?.pending_events ?? 0}</h3>
                <span className="text-[10px] text-slate-400 mt-2 block">Event draft/pengajuan</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}