"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Loader2, QrCode as QrIcon, Printer, Download } from "lucide-react";
import QRCode from "react-qr-code";
import api from "../../../../lib/api";
import Swal from "sweetalert2";

export default function DetailTiketPage() {
  const router = useRouter();
  const params = useParams();
  
  let pendaftaran_id = params.id as string;
  if (params.id) {
    try { pendaftaran_id = atob(decodeURIComponent(params.id as string)); } catch (e) {}
  }

  const [tiket, setTiket] = useState<any>(null);
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
        // We can fetch from tiket endpoint by filtering, or create a specific endpoint
        // Let's use the list endpoint and filter
        const res = await api.get("/mahasiswa/tiket");
        const found = res.data.find((t: any) => t.id.toString() === pendaftaran_id);
        if (found) {
          setTiket(found);
        } else {
          Swal.fire("Error", "Tiket tidak ditemukan", "error").then(() => router.push("/mahasiswa/tiket"));
        }
      } catch (err: any) {
        Swal.fire("Error", "Gagal memuat tiket", "error").then(() => router.push("/mahasiswa/tiket"));
      } finally { setLoading(false); }
    };
    if (pendaftaran_id) fetch();
  }, [pendaftaran_id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );

  if (!tiket) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/mahasiswa/tiket" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Tiket Saya
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6 justify-end">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition">
            <Printer className="w-4 h-4" /> Cetak Tiket
          </button>
        </div>

        {/* Ticket Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row relative print:shadow-none print:border print:border-slate-200">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mt-10 -mr-10 print:hidden" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-50 rounded-full blur-xl -mb-8 -ml-8 print:hidden" />

          {/* Left Side: Event Info */}
          <div className="md:w-2/3 p-8 border-b md:border-b-0 md:border-r border-slate-200 border-dashed relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">E-Ticket Valid</span>
              <span className="text-slate-400 text-xs font-mono">BEM EVENT</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-800 leading-tight mb-6">{tiket.judul}</h1>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">{new Date(tiket.tanggal_waktu).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(tiket.tanggal_waktu).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB - Selesai</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">Lokasi Event</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug pr-4">{tiket.lokasi}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Data Peserta</p>
              <h2 className="text-lg font-bold text-slate-800 mb-1">{tiket.nama_peserta}</h2>
              <p className="text-xs text-slate-500 mb-0.5">{tiket.email_peserta}</p>
              <p className="text-xs text-slate-500">{tiket.telepon_peserta}</p>
            </div>
          </div>

          {/* Right Side: QR Code */}
          <div className="md:w-1/3 bg-slate-50 p-8 flex flex-col items-center justify-center relative z-10">
            {/* Cutouts for dashed line */}
            <div className="hidden md:block absolute -left-4 top-1/2 -mt-4 w-8 h-8 bg-slate-50 rounded-full border-r border-slate-200 print:hidden" style={{ zIndex: 0 }} />

            <div className="text-center mb-6 w-full">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Kode Registrasi</p>
              <p className="text-xl font-mono font-bold text-slate-800 tracking-widest">{tiket.kode_unik}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 w-full aspect-square flex items-center justify-center mb-6">
              <QRCode 
                value={tiket.kode_unik} 
                size={180}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>

            <p className="text-center text-[10px] text-slate-500 px-4 leading-relaxed">
              Tunjukkan QR Code ini kepada panitia saat registrasi ulang di lokasi acara.
            </p>
          </div>
        </div>
      </div>
      
      {/* Print CSS to hide unnecessary elements */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:border { border: 1px solid #e2e8f0; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}} />
    </div>
  );
}
