"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Download, Users, Calendar, BarChart2, Star, Loader2, MessageSquare
} from "lucide-react";
import Link from "next/link";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";

interface Answer {
  question: string;
  type: string;
  answer: string | null;
  rating: number | null;
}

interface ParticipantResult {
  participant_name: string;
  date: string;
  answers: Answer[];
}

export default function HasilKuesionerPage() {
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
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resEvent = await api.get(`/events/${decoded_id}`);
        setEventData(resEvent.data);

        const resHasil = await api.get(`/kuesioner/${decoded_id}/hasil`);
        setResults(resHasil.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (decoded_id) fetchData();
  }, [decoded_id]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString('id-ID', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
    });
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
                        <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest border border-indigo-700/50 px-3 py-1.5 rounded-md">Laporan Kuesioner</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Hasil & Tanggapan
                    </h1>
                    <p className="text-indigo-100/80 mt-3 text-sm md:text-base max-w-2xl font-medium">
                        Evaluasi event: <span className="font-bold text-white">{eventData?.judul}</span>
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-3 px-5 rounded-xl transition-all flex items-center gap-2">
                        <Download className="w-5 h-5" /> Export Excel
                    </button>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 flex items-center gap-5 transform hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Responden</p>
                        <p className="text-3xl font-extrabold text-gray-800">{results.length}</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 flex items-center gap-5 transform hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                        <MessageSquare className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tanggapan Diterima</p>
                        <p className="text-3xl font-extrabold text-gray-800">{results.length > 0 ? results.reduce((acc, curr) => acc + curr.answers.length, 0) : 0}</p>
                    </div>
                </div>
            </div>

            {/* List Responses */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-600" /> Detail Tanggapan Peserta
                    </h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {results.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-dashed border-gray-200">
                                <BarChart2 className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Belum Ada Tanggapan</h3>
                            <p className="text-gray-500 font-medium mt-2 max-w-md mx-auto">
                                Kuesioner belum diisi oleh peserta manapun. Peserta wajib mengisi kuesioner sebelum mendownload sertifikat.
                            </p>
                        </div>
                    ) : (
                        results.map((res, idx) => (
                            <div key={idx} className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors">
                                {/* Header Responden */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-dashed border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">
                                            {res.participant_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-lg">{res.participant_name}</h4>
                                            <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                                <Calendar className="w-3.5 h-3.5 mr-1" /> {formatDate(res.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                                        {res.answers.length} Jawaban
                                    </span>
                                </div>

                                {/* Jawaban */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-16">
                                    {res.answers.map((ans, aIdx) => (
                                        <div key={aIdx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 line-clamp-2" title={ans.question}>
                                                {aIdx + 1}. {ans.question}
                                            </p>
                                            
                                            {ans.type === 'rating' ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex text-blue-400 text-lg">
                                                        {[1,2,3,4,5].map(star => (
                                                            <span key={star} className={star <= (ans.rating || 0) ? "" : "opacity-30 grayscale"}>⭐</span>
                                                        ))}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700">({ans.rating}/5)</span>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
                                                    {ans.answer || <span className="text-gray-400 italic">Tidak ada jawaban</span>}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
