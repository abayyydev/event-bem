"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, CheckCircle, Clock, Gift, XCircle, CreditCard, Ticket, Loader2, AlertTriangle } from "lucide-react";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";

export default function RiwayatTransaksiPage() {
  const router = useRouter();
  const [transaksi, setTransaksi] = useState<any[]>([]);
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
        const res = await api.get("/mahasiswa/transaksi");
        const data = res.data;
        const grouped = data.reduce((acc: any, curr: any) => {
            if (!acc[curr.kode_unik]) {
                acc[curr.kode_unik] = { ...curr, tickets: [] };
            }
            acc[curr.kode_unik].tickets.push(curr);
            return acc;
        }, {});
        
        const groupedArr = Object.values(grouped).sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTransaksi(groupedArr);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const totalTrx = transaksi.length;
  const pendingTrx = transaksi.filter(t => t.status_pembayaran === "pending").length;
  const successTrx = transaksi.filter(t => t.status_pembayaran === "paid" || t.status_pembayaran === "free").length;

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string; icon: React.ReactNode }> = {
      paid: { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Lunas", icon: <CheckCircle className="w-3 h-3" /> },
      pending: { bg: "bg-amber-100 text-amber-700 border-amber-200", label: "Menunggu Pembayaran", icon: <Clock className="w-3 h-3" /> },
      failed: { bg: "bg-red-100 text-red-700 border-red-200", label: "Gagal / Expired", icon: <XCircle className="w-3 h-3" /> },
      free: { bg: "bg-blue-100 text-blue-700 border-blue-200", label: "Gratis", icon: <Gift className="w-3 h-3" /> },
    };
    return map[status] || { bg: "bg-gray-100 text-gray-600", label: status, icon: null };
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest border border-indigo-700/50 px-2 py-1 rounded-md">History</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mt-3">Riwayat Transaksi</h1>
                <p className="text-indigo-100/90 mt-2 text-sm md:text-base max-w-lg">Pantau status pendaftaran event dan lakukan pembayaran di sini.</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 px-5 flex flex-col items-center min-w-[90px]">
                  <span className="text-2xl font-bold text-white">{totalTrx}</span>
                  <span className="text-[10px] text-indigo-200 uppercase font-bold">Total</span>
                </div>
                <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-xl p-3 px-5 flex flex-col items-center min-w-[90px]">
                  <span className="text-2xl font-bold text-emerald-400">{successTrx}</span>
                  <span className="text-[10px] text-emerald-200 uppercase font-bold">Berhasil</span>
                </div>
                {pendingTrx > 0 && (
                  <div className="bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-xl p-3 px-5 flex flex-col items-center min-w-[90px]">
                    <span className="text-2xl font-bold text-amber-400 animate-pulse">{pendingTrx}</span>
                    <span className="text-[10px] text-amber-200 uppercase font-bold">Menunggu</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-20 space-y-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[400px]">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider">
                    <th className="px-6 py-5 font-bold w-2/5">Event Info</th>
                    <th className="px-6 py-5 font-bold">Waktu Transaksi</th>
                    <th className="px-6 py-5 font-bold text-center">Status</th>
                    <th className="px-6 py-5 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transaksi.length > 0 ? transaksi.map((row: any) => {
                    const badge = getStatusBadge(row.status_pembayaran);
                    return (
                      <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0 overflow-hidden">
                              {row.poster ? (
                                <img src={`http://localhost:5000/uploads/${row.poster}`} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <div className="w-full h-full bg-slate-300 flex items-center justify-center"><Calendar className="w-4 h-4 text-slate-500" /></div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm mb-0.5 group-hover:text-indigo-700 transition-colors line-clamp-1">
                                {row.judul} {row.tickets.length > 1 && <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-bold">{row.tickets.length} Tiket</span>}
                              </div>
                              <div className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-mono inline-block">#{row.kode_unik}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-500">
                          {new Date(row.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badge.bg}`}>
                            {badge.icon} {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2 items-center flex-wrap">
                            {row.status_pembayaran === "pending" && row.payment_url ? (
                              <>
                                <span className="font-bold text-slate-700 font-mono text-sm">Rp {(Number(row.harga) * row.tickets.length).toLocaleString("id-ID")}</span>
                                <a href={row.payment_url} target="_blank" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-lg shadow-md transition transform hover:-translate-y-0.5">
                                  <CreditCard className="w-3 h-3 mr-2" /> Bayar
                                </a>
                              </>
                            ) : (row.status_pembayaran === "paid" || row.status_pembayaran === "free") ? (
                                <Link href="/mahasiswa/tiket" className="inline-flex items-center px-4 py-2 bg-white border border-indigo-500 text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded-lg transition-colors">
                                  <Ticket className="w-3 h-3 mr-2" /> Lihat {row.tickets.length} Tiket
                                </Link>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Closed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-200">
                          <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Belum Ada Transaksi</h3>
                        <p className="text-sm text-slate-500 mt-1">Anda belum mendaftar event apapun.</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {transaksi.length > 0 ? transaksi.map((row: any) => {
                const badge = getStatusBadge(row.status_pembayaran);
                const borderColor = row.status_pembayaran === "paid" || row.status_pembayaran === "free" ? "bg-emerald-500" : row.status_pembayaran === "pending" ? "bg-amber-500" : "bg-slate-300";
                return (
                  <div key={row.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${borderColor}`} />
                    <div className="pl-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 pr-2">
                          {row.judul} {row.tickets.length > 1 && `(${row.tickets.length} Tiket)`}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide shrink-0 ${badge.bg}`}>{badge.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mb-3">ID: #{row.kode_unik}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Waktu</p>
                          <p className="font-medium">{new Date(row.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                          <p className="font-bold text-slate-800">
                            {row.tipe_event === "gratis" || row.harga <= 0 ? "Free" : `Rp ${(Number(row.harga) * row.tickets.length).toLocaleString("id-ID")}`}
                          </p>
                        </div>
                      </div>
                      {row.status_pembayaran === "pending" && row.payment_url && (
                        <a href={row.payment_url} target="_blank" className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors">
                          Bayar Sekarang
                        </a>
                      )}
                      {(row.status_pembayaran === "paid" || row.status_pembayaran === "free") && (
                        <Link href="/mahasiswa/tiket" className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors">
                          Lihat {row.tickets.length} Tiket
                        </Link>
                      )}
                      {row.status_denda === "kena_denda" && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-bold text-red-600">Denda</span>
                          </div>
                          <span className="font-bold text-red-700 font-mono text-sm">Rp {Number(row.nominal_denda).toLocaleString("id-ID")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12"><p className="text-slate-500 font-medium">Belum ada transaksi.</p></div>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm mb-1">Status Pending?</h3>
                <p className="text-xs text-amber-800/80 leading-relaxed">Segera selesaikan pembayaran Anda. Transaksi kadaluwarsa akan dibatalkan otomatis.</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-green-50 rounded-2xl border border-indigo-100 p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900 text-sm mb-1">Metode Check-in</h3>
                <p className="text-xs text-indigo-800/80 leading-relaxed">Gunakan <b>E-Ticket</b> untuk check-in pada hari H acara.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MahasiswaLayout>
  );
}
