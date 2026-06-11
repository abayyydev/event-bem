"use client";
import { getBackendBaseUrl } from "@/lib/axios";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, QrCode, Award, MapPin, Clock, ArrowRight, Loader2, Ticket } from "lucide-react";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";

export default function MahasiswaDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (!stored || JSON.parse(stored).role !== "mahasiswa") {
        router.replace("/login");
        return;
      }
      setUser(JSON.parse(stored));
    }
  }, [router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/mahasiswa/dashboard");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <MahasiswaLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      </MahasiswaLayout>
    );
  }

  const stats = data?.stats || { event_diikuti: 0, tiket_aktif: 0, sertifikat: 0 };
  const tiketSaya = data?.tiket_saya || [];
  const agendas = data?.agendas || [];

  return (
    <MahasiswaLayout>
      <div className="pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden pb-28 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl -mx-4 md:-mx-8 -mt-8 mb-12">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-800 rounded-full opacity-40 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 rounded-full opacity-20 blur-3xl" />

          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 gap-8 items-center">
            <div className="w-full text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold tracking-wide uppercase text-green-100">Dashboard Mahasiswa</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
                Selamat Datang, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                  {user?.name || "Mahasiswa"}
                </span>
              </h1>
              <p className="text-indigo-100/80 text-sm md:text-base max-w-xl leading-relaxed">
                Pantau kegiatan, cek jadwal event, dan kelola pendaftaran Anda dengan mudah dalam satu aplikasi.
              </p>
            </div>


          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-20 space-y-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Event Diikuti */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
              <div>
                <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block mb-1">Event Diikuti</span>
                <span className="text-3xl font-black text-slate-800">{stats.event_diikuti}</span>
                <span className="text-[10px] text-slate-400 mt-2 block">Seluruh riwayat pendaftaran</span>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {/* Tiket Aktif */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
              <div>
                <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block mb-1">Tiket Aktif</span>
                <span className="text-3xl font-black text-slate-800">{stats.tiket_aktif}</span>
                <span className="text-[10px] text-slate-400 mt-2 block">Event terdekat yang akan datang</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <Ticket className="w-6 h-6" />
              </div>
            </div>

            {/* E-Sertifikat */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
              <div>
                <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block mb-1">E-Sertifikat</span>
                <span className="text-3xl font-black text-slate-800">{stats.sertifikat}</span>
                <span className="text-[10px] text-slate-400 mt-2 block">Klaim sertifikat Anda</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Event Saya */}
          <div>
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-500" /> Event Saya
              </h2>
              {tiketSaya.length > 0 && (
                <Link href="/mahasiswa/tiket" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                  Lihat Semua <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {tiketSaya.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiketSaya.map((row: any) => {
                  const isPaid = row.status_pembayaran === "paid" || row.status_pembayaran === "free";
                  return (
                    <div key={row.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-lg transition-all">
                      <div className="h-32 bg-gray-200 relative overflow-hidden">
                        {row.poster ? (
                          <img src={`${getBackendBaseUrl()}/uploads/${row.poster}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-200 to-indigo-300 flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-indigo-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold text-white backdrop-blur-md ${isPaid ? "bg-green-500/80" : "bg-amber-500/80"}`}>
                          {isPaid ? "TERDAFTAR" : "MENUNGGU"}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                          {row.ukm_penyelenggara || 'Event Kampus'}
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm mb-1 truncate">{row.judul}</h3>
                        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(row.tanggal_waktu).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {isPaid ? (
                          <div className="w-full py-2 bg-indigo-50 text-indigo-700 text-xs font-bold text-center rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
                            <QrCode className="w-3 h-3 inline mr-1" /> Buka E-Ticket
                          </div>
                        ) : (
                          <div className="w-full py-2 bg-amber-50 text-amber-700 text-xs font-bold text-center rounded-lg">
                            Menunggu Pembayaran
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Ticket className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">Belum ada event yang diikuti.</p>
                <Link href="/mahasiswa/katalog" className="mt-3 inline-block text-indigo-600 font-bold text-sm hover:underline">
                  Jelajahi Katalog Event →
                </Link>
              </div>
            )}
          </div>

          {/* Informasi & Agenda */}
          <div>
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" /> Informasi & Agenda
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agendas.map((agenda: any) => (
                <div key={agenda.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                  <div className="h-40 relative overflow-hidden">
                    {agenda.poster ? (
                      <img src={`${getBackendBaseUrl()}/uploads/${agenda.poster}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-800 to-indigo-900 flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-white/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur text-indigo-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        {agenda.visibilitas?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                      {agenda.ukm_penyelenggara || 'Event Kampus'}
                    </div>
                    <h3 className="font-bold text-slate-800 leading-snug line-clamp-2 mb-2">{agenda.judul}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> {new Date(agenda.tanggal_waktu).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                      <span className="flex items-center gap-1 truncate max-w-[100px]"><MapPin className="w-3 h-3 text-indigo-500" /> {agenda.lokasi}</span>
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">
                        {agenda.tipe_event === "gratis" ? "Gratis" : `Rp ${Number(agenda.harga).toLocaleString("id-ID")}`}
                      </span>
                      <Link href={`/mahasiswa/katalog/${agenda.id}`} className="text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors">
                        Detail
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MahasiswaLayout>
  );
}