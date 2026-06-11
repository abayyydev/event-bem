"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Loader2, Send } from "lucide-react";
import Link from "next/link";
import MahasiswaLayout from "../../../../components/MahasiswaLayout";
import api from "../../../../lib/api";
import Swal from "sweetalert2";

export default function IsiKuesionerPage() {
  const router = useRouter();
  const params = useParams();
  
  let workshop_id = params.id as string;
  if (params.id) {
    try { workshop_id = atob(decodeURIComponent(params.id as string)); } catch (e) {}
  }

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (!stored || JSON.parse(stored).role !== "mahasiswa") router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/mahasiswa/kuesioner/${workshop_id}`);
        setData(res.data);
      } catch (err: any) {
        Swal.fire("Error", err.response?.data?.message || "Gagal memuat kuesioner", "error").then(() => router.push("/mahasiswa/sertifikat"));
      } finally { setLoading(false); }
    };
    if (workshop_id) fetch();
  }, [workshop_id]);

  const handleChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.questions) return;

    // Validate required
    const requiredMissing = data.questions.filter((q: any) => q.is_required && !answers[q.id]?.trim());
    if (requiredMissing.length > 0) {
      Swal.fire("Belum Lengkap", "Silakan isi semua pertanyaan wajib.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const payload = data.questions.map((q: any) => ({
        question_id: q.id,
        answer_text: answers[q.id] || ""
      }));
      await api.post(`/mahasiswa/kuesioner/${workshop_id}`, { answers: payload });
      
      Swal.fire({ icon: "success", title: "Terima Kasih!", text: "Kuesioner berhasil disubmit. Anda kini dapat mengunduh sertifikat.", timer: 3000, showConfirmButton: false })
        .then(() => router.push("/mahasiswa/sertifikat"));
    } catch (err: any) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal mengirim jawaban", "error");
    } finally { setSubmitting(false); }
  };

  if (loading) return <MahasiswaLayout><div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div></MahasiswaLayout>;

  if (data?.already_filled) {
    return (
      <MahasiswaLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Anda Sudah Mengisi Kuesioner</h2>
          <p className="text-slate-500 mb-6">Kuesioner untuk event <b>{data.event_title}</b> telah Anda isi sebelumnya.</p>
          <Link href="/mahasiswa/sertifikat" className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition">
            Kembali ke Sertifikat
          </Link>
        </div>
      </MahasiswaLayout>
    );
  }

  return (
    <MahasiswaLayout>
      <div className="pb-20">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 pb-20 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden -mx-4 md:-mx-8 -mt-8 mb-12">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-800 rounded-full opacity-50 blur-3xl" />
          <div className="max-w-3xl mx-auto relative z-10">
            <Link href="/mahasiswa/sertifikat" className="inline-flex items-center gap-2 text-indigo-200 hover:text-white transition mb-4 text-sm">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>
            <h1 className="text-3xl font-extrabold text-white mb-2">Isi Kuesioner</h1>
            <p className="text-indigo-100/80 text-sm">{data?.event_title}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
              {data?.questions?.map((q: any, i: number) => (
                <div key={q.id} className="space-y-2">
                  <label className="block text-sm font-bold text-slate-800">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mr-2">{i + 1}</span>
                    {q.question_text}
                    {q.is_required ? <span className="text-red-500 ml-1">*</span> : null}
                  </label>

                  {q.question_type === "textarea" ? (
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm resize-none"
                      placeholder="Tulis jawaban Anda..."
                      required={!!q.is_required}
                    />
                  ) : q.question_type === "rating" ? (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleChange(q.id, String(val))}
                          className={`w-12 h-12 rounded-xl font-bold text-sm border-2 transition-all ${answers[q.id] === String(val) ? "bg-amber-400 border-amber-500 text-white shadow-lg" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300"}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  ) : q.question_type === "radio" || q.question_type === "dropdown" ? (
                    <div className="space-y-2">
                      {q.options?.split(",").map((opt: string) => (
                        <label key={opt.trim()} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all">
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt.trim()}
                            checked={answers[q.id] === opt.trim()}
                            onChange={(e) => handleChange(q.id, e.target.value)}
                            className="w-4 h-4 text-indigo-600"
                            required={!!q.is_required}
                          />
                          <span className="text-sm text-slate-700 font-medium">{opt.trim()}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={answers[q.id] || ""}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                      placeholder="Tulis jawaban Anda..."
                      required={!!q.is_required}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 md:px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting ? "Mengirim..." : "Kirim Jawaban"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MahasiswaLayout>
  );
}
