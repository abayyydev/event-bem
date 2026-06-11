"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Plus, Power, ClipboardList, Trash2, Loader2, Save,
  Calendar, Users, MessageSquare
} from "lucide-react";
import Link from "next/link";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string | null;
}

export default function KelolaKuesionerPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  let decoded_id = id as string;
  if (id) {
    try { decoded_id = atob(decodeURIComponent(id as string)); } catch (e) {}
  }

  const navLinks = [
    { href: "/organizer/dashboard", icon: <Calendar className="w-5 h-5" />, label: "Dashboard" },
    { href: "/organizer/events", icon: <Calendar className="w-5 h-5" />, label: "Kelola Event", active: true },
    { href: "/organizer/pendaftar", icon: <Users className="w-5 h-5" />, label: "Kelola Pendaftar" },
    { href: "/organizer/tim", icon: <Users className="w-5 h-5" />, label: "Kelola Tim" },
    { href: "/organizer/diskusi", icon: <MessageSquare className="w-5 h-5" />, label: "Diskusi Kelas" },
  ];

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isKuesionerActive, setIsKuesionerActive] = useState(false);

  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "text",
    options: ""
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (!storedUser || JSON.parse(storedUser).role?.toLowerCase() !== "penyelenggara") {
        router.replace("/login");
      } else {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resEvent = await api.get(`/events/${decoded_id}`);
      setEventData(resEvent.data);
      setIsKuesionerActive(!!resEvent.data.is_kuesioner_active);

      const resQ = await api.get(`/kuesioner/${decoded_id}`);
      setQuestions(resQ.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decoded_id) fetchData();
  }, [decoded_id]);

  const handleToggleStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setToggleLoading(true);
    try {
      await api.put(`/kuesioner/${decoded_id}/toggle`, { is_active: isKuesionerActive });
      alert("Status kuesioner diperbarui!");
    } catch (err) {
      alert("Gagal mengubah status.");
    } finally {
      setToggleLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await api.post(`/kuesioner/${decoded_id}`, formData);
      setFormData({ question_text: "", question_type: "text", options: "" });
      fetchData();
    } catch (err) {
      alert("Gagal menambahkan pertanyaan!");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    if (confirm("Yakin ingin menghapus pertanyaan ini?")) {
      try {
        await api.delete(`/kuesioner/${qId}`);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus!");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <DashboardLayout user={user} title="" subtitle="" links={navLinks} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} title="" subtitle="" links={navLinks} onLogout={handleLogout}>
      <div className="min-h-screen bg-gray-50 font-sans -m-6 pb-32">
        
        {/* Hero Header */}
        <div className="bg-indigo-900 pb-24 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>

            <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <Link href="/organizer/events" className="text-indigo-200 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-sm group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest border border-indigo-700/50 px-3 py-1.5 rounded-md">Manajemen Kuesioner</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Atur Kuesioner
                    </h1>
                    <p className="text-indigo-100/80 mt-3 text-sm md:text-base max-w-2xl font-medium">
                        Event: <span className="font-bold text-white">{eventData?.judul}</span>
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 px-6 flex items-center gap-5">
                    <div className="text-right">
                        <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Total Pertanyaan</p>
                        <p className="text-white font-extrabold text-3xl">{questions.length}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 text-2xl">
                        <ClipboardList className="w-7 h-7" />
                    </div>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Controls & Add Form */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Status Card */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative group transition-all">
                        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                                <Power className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">Status Kuesioner</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 mb-5 leading-relaxed font-medium">
                                Jika aktif, peserta <span className="text-red-500 font-bold">wajib</span> mengisi kuesioner ini sebelum bisa mengunduh sertifikat mereka.
                            </p>
                            <form onSubmit={handleToggleStatus}>
                                <label className="flex items-center justify-between cursor-pointer group/toggle p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all bg-white mb-5">
                                    <span className="text-sm font-bold text-gray-800">Aktifkan Kuesioner</span>
                                    <div className="relative">
                                        <input type="checkbox" checked={isKuesionerActive} onChange={e => setIsKuesionerActive(e.target.checked)} className="sr-only peer" />
                                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                    </div>
                                </label>
                                <button type="submit" disabled={toggleLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2">
                                    {toggleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Simpan Status
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Add Question Card */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative group transition-all sticky top-6">
                        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">Buat Pertanyaan</h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddQuestion} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Pertanyaan <span className="text-red-500">*</span></label>
                                    <textarea required rows={3} value={formData.question_text} onChange={e => setFormData({...formData, question_text: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all resize-none font-medium"
                                        placeholder="Tulis pertanyaan Anda di sini..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Tipe Jawaban</label>
                                    <select value={formData.question_type} onChange={e => setFormData({...formData, question_type: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all cursor-pointer font-bold text-gray-700">
                                        <option value="text">✍️ Teks Singkat</option>
                                        <option value="textarea">📝 Paragraf Panjang</option>
                                        <option value="rating">⭐ Rating Bintang (1-5)</option>
                                        <option value="radio">🔘 Pilihan Ganda (Radio)</option>
                                        <option value="dropdown">🔽 Dropdown Menu</option>
                                    </select>
                                </div>
                                {(formData.question_type === 'radio' || formData.question_type === 'dropdown') && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Opsi Jawaban <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.options} onChange={e => setFormData({...formData, options: e.target.value})}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all font-medium"
                                            placeholder="Pisahkan dengan koma (Misal: Ya, Tidak)" />
                                    </div>
                                )}
                                <button type="submit" disabled={saveLoading} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 mt-4">
                                    {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Tambahkan
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">
                        <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center text-xl font-bold shadow-inner">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Daftar Pertanyaan Kuesioner</h3>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Preview bagaimana kuesioner akan terlihat oleh peserta.</p>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-5">
                            {questions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-gray-200">
                                        <ClipboardList className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Belum Ada Pertanyaan</h3>
                                    <p className="text-gray-500 text-sm max-w-sm mt-2 leading-relaxed font-medium">
                                        Kuesioner ini masih kosong. Gunakan form di sebelah kiri untuk mulai menambahkan pertanyaan.
                                    </p>
                                </div>
                            ) : (
                                questions.map((q, idx) => (
                                    <div key={q.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-extrabold">
                                                    {idx + 1}
                                                </span>
                                                <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
                                                    {q.question_type}
                                                </span>
                                            </div>
                                            <button onClick={() => handleDeleteQuestion(q.id)} className="text-gray-400 hover:text-red-500 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 transition-all" title="Hapus">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        
                                        <h4 className="text-lg font-bold text-gray-800 mb-5 leading-snug pl-11">
                                            {q.question_text}
                                        </h4>

                                        <div className="pl-11">
                                            {(q.question_type === 'radio' || q.question_type === 'dropdown') ? (
                                                <div className="space-y-3">
                                                    {q.options?.split(',').map((opt, oIdx) => (
                                                        <div key={oIdx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/80">
                                                            <div className={`w-4 h-4 border-2 border-indigo-400 ${q.question_type === 'radio' ? 'rounded-full' : 'rounded'}`}></div>
                                                            <span className="text-sm text-gray-700 font-medium">{opt.trim()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : q.question_type === 'rating' ? (
                                                <div className="flex gap-2 text-blue-400 text-2xl">
                                                    {[1,2,3,4,5].map(star => <span key={star}>⭐</span>)}
                                                </div>
                                            ) : q.question_type === 'textarea' ? (
                                                <div className="w-full h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium">
                                                    Area Teks Panjang
                                                </div>
                                            ) : (
                                                <div className="w-full h-12 bg-gray-50 border-b-2 border-gray-200 rounded-t-xl flex items-center px-4 text-gray-400 text-sm font-medium">
                                                    Input Teks Singkat
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
