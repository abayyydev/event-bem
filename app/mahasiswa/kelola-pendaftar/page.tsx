"use client";
import { getBackendBaseUrl } from "@/lib/axios";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, Eye, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "../../../lib/api";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import Swal from "sweetalert2";

interface EventPanitia {
  id: number;
  judul: string;
  lokasi: string;
  tanggal_waktu: string;
  poster: string | null;
  jumlah_pendaftar: number;
  jumlah_hadir: number;
  tipe_event: string;
  role: string;
}

export default function KelolaPendaftarMahasiswaPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventPanitia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.replace("/login");
      }
    }
  }, [router]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mahasiswa/panitia-events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Gagal memuat data event kepanitiaan.',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => 
    e.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendaftar = events.reduce((acc, curr) => acc + curr.jumlah_pendaftar, 0);

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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
                        <Users className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-semibold tracking-wide uppercase text-indigo-100">Kepanitiaan</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                        Kelola <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Pendaftar</span>
                    </h1>
                    <p className="text-indigo-100/80 mt-2 text-sm md:text-base max-w-xl leading-relaxed">
                        Anda ditunjuk sebagai panitia untuk event-event di bawah ini. Silakan kelola pendaftar, absensi, dan validasi tiket.
                    </p>
                </div>
                
                <div className="flex gap-3 justify-start md:justify-end shrink-0">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center min-w-[110px]">
                        <span className="text-3xl font-bold text-white">{events.length}</span>
                        <span className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider mt-1">Total Event</span>
                    </div>
                    <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center min-w-[110px]">
                        <span className="text-3xl font-bold text-amber-400">{totalPendaftar}</span>
                        <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider mt-1">Pendaftar</span>
                    </div>
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
                        placeholder="Cari event kepanitiaan..."
                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent text-slate-900 placeholder-slate-400 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 font-medium" />
                </div>
            </div>

            {/* List */}
            {filteredEvents.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
                    <h3 className="text-xl font-bold text-gray-800">Tidak ada event</h3>
                    <p className="text-gray-500 font-medium mt-2">Anda belum menjadi panitia aktif di event manapun atau pencarian tidak cocok.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all">
                            {/* Image Placeholder */}
                            <div className="w-full md:w-64 h-48 md:h-auto bg-gray-100 relative shrink-0">
                                {event.poster ? (
                                    <img src={`${getBackendBaseUrl()}/uploads/${event.poster}`} alt={event.judul} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <span className="text-xs font-bold uppercase tracking-wider">No Image</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex-grow flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="w-full md:w-auto">
                                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-full mb-2 border border-indigo-200">
                                        Peran: {event.role}
                                    </span>
                                    <h3 className="font-extrabold text-gray-800 text-xl mb-1 line-clamp-2">{event.judul}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-3">
                                        <Calendar className="w-4 h-4 text-emerald-500" /> 
                                        {new Date(event.tanggal_waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="flex w-full md:w-auto justify-between md:justify-end items-center gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 shrink-0">
                                    <div className="text-center">
                                        <span className="block text-2xl font-black text-gray-800">{event.jumlah_pendaftar}</span>
                                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Pendaftar</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-2xl font-black text-emerald-600">{event.jumlah_hadir}</span>
                                        <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-widest">Hadir</span>
                                    </div>
                                    
                                    <Link href={`/mahasiswa/kelola-pendaftar/${btoa(event.id.toString())}`} className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center hover:bg-amber-200 hover:-translate-y-1 transition-all shadow-sm" title="Detail Pendaftar">
                                        <Eye className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </MahasiswaLayout>
  );
}
