"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  MessageSquare, Calendar, Loader2, Send, ArrowLeft, Search, Users, 
  FileText, Upload, Trash2, Plus, X, Download, HelpCircle, FileDown
} from "lucide-react";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";

interface Event {
  id: number;
  judul: string;
  poster: string | null;
  tanggal_waktu: string;
}

interface Material {
  id: number;
  workshop_id: number;
  judul_materi: string;
  deskripsi: string | null;
  nama_file: string;
  uploaded_at: string;
}

export default function OrganizerDiskusiPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Chat state
  const [chats, setChats] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Materials state
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Upload Form Fields
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (!stored || JSON.parse(stored).role?.toLowerCase() === "mahasiswa") {
        router.replace("/login");
      } else {
        setUser(JSON.parse(stored));
      }
    }
  }, [router]);

  // Load organizer events
  const fetchEvents = async () => {
    try {
      const res = await api.get("/discussion/organizer/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Gagal memuat event diskusi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch chats and materials
  const fetchChatsAndMaterials = async (eventId: string) => {
    try {
      const chatRes = await api.get(`/discussion/messages/${eventId}`);
      setChats(chatRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaterials = async (eventId: string) => {
    try {
      setLoadingMaterials(true);
      const matRes = await api.get(`/discussion/materials/${eventId}`);
      setMaterials(matRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      setLoadingChat(true);
      fetchChatsAndMaterials(selectedEventId);
      fetchMaterials(selectedEventId);
      setLoadingChat(false);

      const interval = setInterval(() => {
        fetchChatsAndMaterials(selectedEventId);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedEventId]);

  // Scroll to bottom when new chat arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedEventId) return;

    setSendingChat(true);
    try {
      await api.post(`/discussion/messages/${selectedEventId}`, { message: chatMessage });
      setChatMessage("");
      const res = await api.get(`/discussion/messages/${selectedEventId}`);
      setChats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingChat(false);
    }
  };

  // Upload Material
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !uploadTitle || !uploadFile) {
      Swal.fire("Peringatan", "Mohon lengkapi judul materi dan pilih berkas file!", "warning");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("judul_materi", uploadTitle);
      formData.append("deskripsi", uploadDesc);
      formData.append("materi_file", uploadFile);

      await api.post(`/discussion/materials/${selectedEventId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      Swal.fire({ icon: "success", title: "Berhasil!", text: "Materi event berhasil diunggah.", timer: 1500, showConfirmButton: false });
      
      // Reset Form
      setUploadTitle("");
      setUploadDesc("");
      setUploadFile(null);
      setIsUploadOpen(false);
      
      // Refresh Materials
      fetchMaterials(selectedEventId);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.message || "Terjadi kesalahan saat mengunggah materi.", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete Material
  const handleDeleteMaterial = async (id: number) => {
    const confirmDelete = await Swal.fire({
      title: "Hapus materi ini?",
      text: "Materi akan dihapus permanen dari server dan tidak dapat diakses mahasiswa lagi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await api.delete(`/discussion/materials/${id}`);
      Swal.fire({ icon: "success", title: "Terhapus!", text: "Materi berhasil dihapus.", timer: 1500, showConfirmButton: false });
      if (selectedEventId) fetchMaterials(selectedEventId);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.message || "Gagal menghapus materi.", "error");
    }
  };

  const selectedEvent = events.find(e => e.id.toString() === selectedEventId);

  const navLinks = [
    { href: "/organizer/dashboard", icon: <Calendar className="w-5 h-5" />, label: "Dashboard" },
    { href: "/organizer/events", icon: <Calendar className="w-5 h-5" />, label: "Kelola Event" },
    { href: "/organizer/pendaftar", icon: <Users className="w-5 h-5" />, label: "Kelola Pendaftar" },
    { href: "/organizer/tim", icon: <Users className="w-5 h-5" />, label: "Kelola Tim" },
    { href: "/organizer/diskusi", icon: <MessageSquare className="w-5 h-5" />, label: "Diskusi Kelas", active: true },
  ];

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
    <DashboardLayout 
      user={user} 
      title="Diskusi Kelas & Materi" 
      subtitle="Interact with class attendees and distribute event resources."
      links={navLinks}
      onLogout={handleLogout}
    >
      <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-xl -mx-4 md:-mx-8">
        
        {/* Left Sidebar: Event List */}
        <div className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 flex flex-col ${selectedEventId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" /> Ruang Diskusi UKM
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {events.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {events.map((e: Event) => (
                  <button 
                    key={e.id}
                    onClick={() => setSelectedEventId(e.id.toString())}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-all flex items-center gap-3 ${selectedEventId === e.id.toString() ? 'bg-indigo-50/70 border-r-4 border-indigo-600' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
                      {e.poster ? (
                        <img src={`http://localhost:5000/uploads/${e.poster}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Calendar className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-xs truncate ${selectedEventId === e.id.toString() ? 'text-indigo-800' : 'text-slate-700'}`}>{e.judul}</h3>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(e.tanggal_waktu).toLocaleDateString("id-ID")}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-xs font-bold">Belum ada event diskusi aktif.</p>
              </div>
            )}
          </div>
        </div>

        {/* Center Content: Chat Room */}
        <div className={`flex-grow flex flex-col bg-[#F8FAFC] ${!selectedEventId ? 'hidden md:flex' : 'flex'}`}>
          {!selectedEventId ? (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400 p-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <MessageSquare className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-600 mb-1">Pilih Kelas Diskusi</h3>
              <p className="text-xs max-w-xs text-center text-slate-400">Pilih salah satu event yang Anda kelola untuk memulai diskusi dan mengunggah materi.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedEventId(null)} className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
                    {selectedEvent?.poster ? (
                      <img src={`http://localhost:5000/uploads/${selectedEvent.poster}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Calendar className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm text-slate-800 leading-snug line-clamp-1">{selectedEvent?.judul}</h2>
                    <p className="text-[10px] text-slate-400">Interaksi Publik & Mahasiswa Terdaftar</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingChat ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
                ) : chats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-xs">Belum ada obrolan di kelas ini. Sapa mahasiswa Anda!</p>
                  </div>
                ) : (
                  chats.map((c: any) => {
                    const isMe = c.user_id === user?.id && c.user_type === "admin";
                    const isMhs = c.user_type === "mahasiswa";
                    return (
                      <div key={c.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] text-slate-400 font-bold mb-1 ml-1 mr-1">
                          {isMe ? "Anda (Penyelenggara)" : c.nama_pengirim} 
                          {!isMhs && !isMe && <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ml-1.5 font-bold">Admin/Panitia</span>}
                        </span>
                        <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] md:max-w-[70%] text-xs shadow-sm leading-relaxed ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-900 rounded-bl-none"}`}>
                          {c.message}
                        </div>
                        <span className="text-[9px] text-slate-450 mt-1 ml-1 mr-1">{new Date(c.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={sendChat} className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-end gap-2">
                  <input 
                    type="text" 
                    value={chatMessage} 
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Tulis instruksi atau sapa forum..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-150 outline-none text-xs" 
                  />
                  <button type="submit" disabled={sendingChat || !chatMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 transition-all shrink-0 shadow">
                    {sendingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Right Sidebar: Materials Upload & List (Only displayed when event is selected) */}
        {selectedEventId && (
          <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h3 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-indigo-600" /> Materi & File
              </h3>
              <button 
                onClick={() => setIsUploadOpen(!isUploadOpen)}
                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-100"
                title="Unggah Materi"
              >
                {isUploadOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Upload Materials Panel */}
            {isUploadOpen ? (
              <form onSubmit={handleUploadMaterial} className="p-4 border-b border-slate-100 bg-indigo-50/10 space-y-3.5 animate-in slide-in-from-top-2 duration-200">
                <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> Unggah Berkas Baru
                </h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Judul Materi *</label>
                  <input 
                    type="text" 
                    required 
                    value={uploadTitle} 
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Contoh: PDF Slide Modul 1" 
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Deskripsi Singkat</label>
                  <textarea 
                    value={uploadDesc} 
                    onChange={(e) => setUploadDesc(e.target.value)}
                    rows={2}
                    placeholder="Penjelasan materi (opsional)..." 
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Berkas File *</label>
                  <input 
                    type="file" 
                    required 
                    onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 font-bold border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsUploadOpen(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-[10px] font-bold rounded-lg text-slate-650"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={uploadLoading}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow disabled:opacity-75"
                  >
                    {uploadLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Simpan & Kirim
                  </button>
                </div>
              </form>
            ) : null}

            {/* Materials List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingMaterials ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
              ) : materials.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-15" />
                  <p className="text-[11px] font-bold">Belum ada materi dibagikan.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Gunakan tombol + di atas untuk mengunggah PDF/file.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((m: Material) => (
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
                            href={`http://localhost:5000/uploads/${m.nama_file}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            <Download className="w-3 h-3" /> Unduh
                          </a>
                          
                          <button 
                            onClick={() => handleDeleteMaterial(m.id)}
                            className="text-[9px] font-bold text-red-500 hover:underline flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> Hapus
                          </button>
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
    </DashboardLayout>
  );
}
