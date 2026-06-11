"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Ticket, Clock, ArrowRight, Loader2, MapPin, QrCode } from "lucide-react";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";

export default function TiketSayaPage() {
  const router = useRouter();
  const [tikets, setTikets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (!stored || JSON.parse(stored).role !== "mahasiswa") router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/mahasiswa/tiket");
        setTikets(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <MahasiswaLayout><div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div></MahasiswaLayout>;

  return (
    <MahasiswaLayout>
      <div className="pb-20">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-10 pb-20 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden -mx-4 md:-mx-8 -mt-8 mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl -mr-16 -mt-16" />
          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <h1 className="text-3xl font-extrabold text-white mb-2">Akses Event Saya</h1>
            <p className="text-indigo-200 text-sm">Daftar kegiatan yang dapat Anda ikuti.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
          {tikets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tikets.map((row: any) => {
                const isUpcoming = new Date(row.tanggal_waktu) > new Date();
                return (
                  <div key={row.id} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                    <div className="h-40 bg-gray-200 relative overflow-hidden">
                      {row.poster ? (
                        <img src={`http://localhost:5000/uploads/${row.poster}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-indigo-900 flex items-center justify-center"><Calendar className="w-8 h-8 text-white/30" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className={`text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm ${isUpcoming ? "bg-blue-500" : "bg-gray-500"}`}>
                          {isUpcoming ? "AKAN DATANG" : "SELESAI"}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-slate-800 text-lg leading-snug mb-2 line-clamp-2">{row.judul}</h3>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-amber-500 mr-2 shrink-0" />
                          <span>{new Date(row.tanggal_waktu).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
                          <span className="truncate">{row.lokasi}</span>
                        </div>
                      </div>
                      <div className="mt-auto border-t-2 border-dashed border-slate-200 pt-4 relative">
                        <div className="absolute -left-7 -top-3 w-6 h-6 bg-slate-50 rounded-full" />
                        <div className="absolute -right-7 -top-3 w-6 h-6 bg-slate-50 rounded-full" />
                        <div className="flex justify-between items-center w-full">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Kode Tiket</p>
                            <p className="text-sm font-mono font-bold text-slate-800 tracking-wide">{row.kode_unik}</p>
                          </div>
                          <Link href={`/mahasiswa/tiket/${row.id}`} className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                            <QrCode className="w-4 h-4" /> Buka E-Ticket
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-200">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Belum Ada Jadwal</h3>
              <p className="text-slate-500 mt-2 mb-6">Anda belum terdaftar di event apapun.</p>
              <Link href="/mahasiswa/katalog" className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
                Lihat Katalog Event
              </Link>
            </div>
          )}
        </div>
      </div>
    </MahasiswaLayout>
  );
}
