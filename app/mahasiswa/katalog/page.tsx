"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Calendar, MapPin, Loader2, CheckCircle } from "lucide-react";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";

export default function KatalogEventPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipe, setFilterTipe] = useState("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (!stored || JSON.parse(stored).role !== "mahasiswa") router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.set("q", searchTerm);
        if (filterTipe !== "all") params.set("tipe", filterTipe);
        const res = await api.get(`/mahasiswa/katalog?${params.toString()}`);
        setEvents(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };

    const debounce = setTimeout(fetchEvents, 400);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterTipe]);

  return (
    <MahasiswaLayout>
      <div className="pb-20">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pb-28 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden -mx-4 md:-mx-8 -mt-8 mb-12">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-amber-500 rounded-full opacity-20 blur-2xl" />
          <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
            <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest border border-indigo-700/50 px-3 py-1 rounded-full bg-indigo-800/50 backdrop-blur-md">
              Agenda Kampus
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-4 leading-tight mb-4">Jelajahi Event Seru</h1>
            <p className="text-indigo-100/90 text-sm md:text-base max-w-xl mx-auto">
              Temukan berbagai kegiatan bermanfaat, workshop, dan seminar untuk meningkatkan kapasitas diri.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-20 space-y-8">
          {/* Search & Filter */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  placeholder="Cari judul event, topik, atau lokasi..." />
              </div>
              <select value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)}
                className="min-w-[180px] px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium appearance-none cursor-pointer">
                <option value="all">Semua Tipe</option>
                <option value="gratis">Gratis (Free)</option>
                <option value="berbayar">Berbayar (Paid)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((row: any) => {
                const isFree = row.tipe_event === "gratis" || row.harga <= 0;
                const isRegistered = row.is_registered > 0;
                return (
                  <div key={row.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full hover:-translate-y-1 relative">
                    <div className="h-48 bg-slate-200 relative overflow-hidden">
                      {row.poster ? (
                        <img src={`http://localhost:5000/uploads/${row.poster}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-indigo-900 flex items-center justify-center">
                          <Calendar className="w-10 h-10 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-white/90 backdrop-blur text-indigo-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                          {row.visibilitas?.toUpperCase()}
                        </span>
                        {isRegistered && (
                          <span className="bg-emerald-500/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Terdaftar
                          </span>
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-white/20 ${isFree ? "bg-blue-500 text-white" : "bg-amber-400 text-amber-900"}`}>
                          {isFree ? "FREE" : `Rp ${Number(row.harga).toLocaleString("id-ID")}`}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 font-medium">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                          <Calendar className="w-3 h-3 text-amber-500" />
                          {new Date(row.tanggal_waktu).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md truncate max-w-[120px]">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          <span className="truncate">{row.lokasi}</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                        {row.ukm_penyelenggara || 'Event Kampus'}
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg leading-snug mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">{row.judul}</h3>
                      <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{row.deskripsi?.substring(0, 100)}...</p>
                      <div className="mt-auto pt-4 border-t border-slate-50">
                        <Link href={`/mahasiswa/katalog/${row.id}`}
                          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-sm">
                          Daftar Sekarang
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Event Tidak Ditemukan</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">Maaf, kami tidak menemukan event yang sesuai dengan pencarian Anda.</p>
              <button onClick={() => { setSearchTerm(""); setFilterTipe("all"); }}
                className="mt-6 inline-block px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700 transition text-sm">
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </div>
    </MahasiswaLayout>
  );
}
