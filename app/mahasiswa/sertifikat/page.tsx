"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, Calendar, Download, Edit, Clock, Loader2 } from "lucide-react";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";

export default function SertifikatPage() {
  const router = useRouter();
  const [sertifikats, setSertifikats] = useState<any[]>([]);
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
        const res = await api.get("/mahasiswa/sertifikat");
        setSertifikats(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDownload = async (id: number, judul: string) => {
    try {
      const res = await api.get(`/mahasiswa/sertifikat/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sertifikat-${judul.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Gagal mengunduh", err);
      alert("Gagal mengunduh sertifikat.");
    }
  };

  if (loading) return <MahasiswaLayout><div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div></MahasiswaLayout>;

  return (
    <MahasiswaLayout>
      <div className="pb-20">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pb-24 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden -mx-4 md:-mx-8 -mt-8 mb-12">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-amber-500 rounded-full opacity-20 blur-2xl" />
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">E-Sertifikat Saya</h1>
            <p className="text-indigo-100/80 mt-2 text-sm">Unduh sertifikat dari event yang telah Anda hadiri.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-20 space-y-8">
          {sertifikats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sertifikats.map((row: any) => {
                const isReady = !!row.sertifikat_template;
                const canDownload = row.is_kuesioner_active == 0 || row.is_filled > 0;
                return (
                  <div key={row.pendaftaran_id} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                    <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm z-10 text-amber-500 border-4 border-slate-50">
                        <Award className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col text-center">
                      <h3 className="font-bold text-slate-800 text-lg leading-snug mb-2 line-clamp-2">{row.judul}</h3>
                      <p className="text-xs text-slate-500 mb-4">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(row.tanggal_waktu).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <div className="mt-auto">
                        {!isReady ? (
                          <button disabled className="w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-xl cursor-not-allowed text-sm flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4" /> Belum Rilis
                          </button>
                        ) : canDownload ? (
                          <button 
                            onClick={() => handleDownload(row.pendaftaran_id, row.judul)}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 rounded-xl shadow-md transition-all text-sm"
                          >
                            <Download className="w-4 h-4" /> Unduh Sertifikat
                          </button>
                        ) : (
                          <div>
                            <Link href={`/mahasiswa/kuesioner/${row.workshop_id}`}
                              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-sm animate-pulse">
                              <Edit className="w-4 h-4" /> Isi Kuesioner
                            </Link>
                            <p className="text-[10px] text-slate-500 mt-2">Wajib isi kuesioner untuk unduh.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-200">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Belum Ada Sertifikat</h3>
              <p className="text-slate-500 mt-2">Pastikan status Anda "Hadir" di event yang diikuti.</p>
            </div>
          )}
        </div>
      </div>
    </MahasiswaLayout>
  );
}
