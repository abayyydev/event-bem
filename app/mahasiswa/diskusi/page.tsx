"use client";
import { getBackendBaseUrl } from "@/lib/axios";


import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Calendar, Loader2, Send, ArrowLeft, Search, Users, FileText, Download, FileDown } from "lucide-react";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";

import AktivitasTabs from "../../../components/AktivitasTabs";

export default function DiskusiPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tikets, setTikets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Chat state
  const [chats, setChats] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Materials state
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (!stored || JSON.parse(stored).role !== "mahasiswa") router.replace("/login");
      else setUser(JSON.parse(stored));
    }
  }, [router]);

  // Load events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/mahasiswa/tiket");
        setTikets(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  const fetchMaterials = async (eventId: string) => {
    try {
      setLoadingMaterials(true);
      const res = await api.get(`/mahasiswa/materials/${eventId}`);
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  // Polling Chats
  useEffect(() => {
    if (selectedEventId) {
      setLoadingChat(true);
      const fetchChats = async () => {
        try {
          const res = await api.get(`/mahasiswa/diskusi/${selectedEventId}`);
          setChats(res.data);
          setLoadingChat(false);
        } catch (err) { console.error(err); }
      };
      fetchChats();
      fetchMaterials(selectedEventId);
      const interval = setInterval(fetchChats, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedEventId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedEventId) return;

    setSendingChat(true);
    try {
      await api.post(`/mahasiswa/diskusi/${selectedEventId}`, { message: chatMessage });
      setChatMessage("");
      const res = await api.get(`/mahasiswa/diskusi/${selectedEventId}`);
      setChats(res.data);
    } catch (err) { console.error(err); }
    finally { setSendingChat(false); }
  };

  if (loading) return <MahasiswaLayout><div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div></MahasiswaLayout>;

  const selectedEvent = tikets.find(t => t.workshop_id.toString() === selectedEventId);

  return (
    <MahasiswaLayout>
      <div className="bg-white px-6 pt-4 pb-0">
        <div className="max-w-7xl mx-auto">
           <AktivitasTabs />
        </div>
      </div>
      <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] flex flex-col md:flex-row bg-slate-50 border-t border-slate-200">
        
        {/* Left Sidebar: Event List */}
        <div className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 flex flex-col ${selectedEventId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-600" /> Ruang Diskusi
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Cari kelas..." className="w-full bg-slate-100 border-none rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {tikets.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {tikets.map((t: any) => (
                  <button 
                    key={t.id}
                    onClick={() => setSelectedEventId(t.workshop_id.toString())}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 ${selectedEventId === t.workshop_id.toString() ? 'bg-indigo-50 hover:bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0 overflow-hidden">
                      {t.poster ? (
                        <img src={`${getBackendBaseUrl()}/uploads/${t.poster}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center"><Calendar className="w-5 h-5 text-indigo-400" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-sm truncate ${selectedEventId === t.workshop_id.toString() ? 'text-indigo-800' : 'text-slate-700'}`}>{t.judul}</h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">{new Date(t.tanggal_waktu).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Belum ada kelas yang Anda ikuti.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Chat Room */}
        <div className={`flex-1 flex flex-col bg-[#F8FAFC] ${!selectedEventId ? 'hidden md:flex' : 'flex'}`}>
          {!selectedEventId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">Pilih Kelas</h3>
              <p className="text-sm max-w-sm text-center">Pilih salah satu event/kelas di sebelah kiri untuk mulai berdiskusi dengan peserta lain dan instruktur.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center gap-4 shadow-sm z-10">
                <button onClick={() => setSelectedEventId(null)} className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0 overflow-hidden">
                  {selectedEvent?.poster ? (
                    <img src={`${getBackendBaseUrl()}/uploads/${selectedEvent.poster}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center"><Calendar className="w-4 h-4 text-indigo-400" /></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 leading-snug line-clamp-1">{selectedEvent?.judul}</h2>
                  <p className="text-xs text-slate-500">Ruang Diskusi Resmi</p>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingChat ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
                ) : chats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Belum ada obrolan. Jadilah yang pertama menyapa!</p>
                  </div>
                ) : (
                  chats.map((c: any) => {
                    const isMe = c.user_id === user.id && c.user_type === "mahasiswa";
                    const isAdmin = c.user_type !== "mahasiswa";
                    return (
                      <div key={c.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] text-slate-400 font-bold mb-1 ml-1 mr-1">
                          {isMe ? "Anda" : c.nama_pengirim} 
                          {isAdmin && <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider ml-2">Admin / Instruktur</span>}
                        </span>
                        <div className={`px-4 py-3 rounded-2xl max-w-[85%] md:max-w-[70%] text-sm shadow-sm ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-900 rounded-bl-none"}`}>
                          {c.message}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1">{new Date(c.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={sendChat} className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-end gap-2 max-w-4xl mx-auto">
                  <div className="flex-1 relative">
                    <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Tulis pesan ke forum..."
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm pr-12" />
                  </div>
                  <button type="submit" disabled={sendingChat || !chatMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-12 h-12 rounded-2xl flex items-center justify-center disabled:opacity-50 transition-all shrink-0 shadow-md">
                    {sendingChat ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Right Sidebar: Materials (Only displayed when event is selected) */}
        {selectedEventId && (
          <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h3 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-indigo-600" /> Materi & Berkas Event
              </h3>
            </div>

            {/* Materials List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingMaterials ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
              ) : materials.length === 0 ? (
                <div className="text-center py-12 text-slate-450">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-15" />
                  <p className="text-[11px] font-bold">Belum ada materi dibagikan.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Penyelenggara belum mengunggah berkas untuk event ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((m: any) => (
                    <div key={m.id} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-300 transition-all group flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                        <FileDown className="w-4 h-4 text-indigo-600" />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate" title={m.judul_materi}>{m.judul_materi}</h4>
                        {m.deskripsi ? (
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{m.deskripsi}</p>
                        ) : null}
                        
                        <div className="flex items-center gap-3 mt-2">
                          <a 
                            href={`${getBackendBaseUrl()}/uploads/${m.nama_file}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            <Download className="w-3 h-3" /> Unduh Materi
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MahasiswaLayout>
  );
}
