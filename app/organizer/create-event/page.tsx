"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, PenTool, Image as ImageIcon, CheckCircle, Loader2, Save, Plus, Trash2, Handshake,
  Calendar, Users, MessageSquare
} from "lucide-react";
import Link from "next/link";
import api from "../../../lib/api";
import DashboardLayout from "../../../components/DashboardLayout";

export default function CreateEventPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  const navLinks = [
    { href: "/organizer/dashboard", icon: <Calendar className="w-5 h-5" />, label: "Dashboard" },
    { href: "/organizer/events", icon: <Calendar className="w-5 h-5" />, label: "Kelola Event", active: true },
    { href: "/organizer/pendaftar", icon: <Users className="w-5 h-5" />, label: "Kelola Pendaftar" },
    { href: "/organizer/tim", icon: <Users className="w-5 h-5" />, label: "Kelola Tim" },
    { href: "/organizer/diskusi", icon: <MessageSquare className="w-5 h-5" />, label: "Diskusi Kelas" },
  ];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    type: "gratis",
    is_public: "public",
    price: 0,
    enable_penalty: false,
    penalty_fee: 0,
    maksimal_peserta: 0,
  });

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  interface SponsorInput {
    nama: string;
    logo: File | null;
    logoPreview: string | null;
  }
  const [sponsors, setSponsors] = useState<SponsorInput[]>([]);

  const handleAddSponsor = () => {
    setSponsors([...sponsors, { nama: "", logo: null, logoPreview: null }]);
  };

  const handleSponsorNameChange = (index: number, val: string) => {
    const newSponsors = [...sponsors];
    newSponsors[index].nama = val;
    setSponsors(newSponsors);
  };

  const handleSponsorLogoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newSponsors = [...sponsors];
      newSponsors[index].logo = file;
      newSponsors[index].logoPreview = URL.createObjectURL(file);
      setSponsors(newSponsors);
    }
  };

  const handleRemoveSponsor = (index: number) => {
    setSponsors(sponsors.filter((_, idx) => idx !== index));
  };

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

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setEventData({ ...eventData, [name]: target.checked });
    } else {
      setEventData({ ...eventData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("judul", eventData.title);
      formData.append("deskripsi", eventData.description);
      formData.append("tanggal_waktu", eventData.start_date.replace("T", " ") + ":00");
      if (eventData.enable_penalty && eventData.end_date) {
        formData.append("jam_selesai", eventData.end_date.replace("T", " ") + ":00");
      }
      formData.append("lokasi", eventData.location);
      formData.append("visibilitas", eventData.is_public);
      formData.append("tipe_event", eventData.type);
      formData.append("harga", eventData.type === 'berbayar' ? eventData.price.toString() : "0");
      formData.append("nominal_denda", eventData.enable_penalty ? eventData.penalty_fee.toString() : "0");
      formData.append("maksimal_peserta", eventData.maksimal_peserta.toString());

      if (posterFile) {
        formData.append("poster", posterFile);
      }

      // Map sponsors for JSON representation
      let logoFileIndex = 0;
      const sponsorsData = sponsors.map(s => {
        const hasNewLogo = !!s.logo;
        const logoIndex = hasNewLogo ? logoFileIndex++ : -1;
        return {
          nama: s.nama,
          has_new_logo: hasNewLogo,
          logo_index: logoIndex
        };
      });

      formData.append("sponsors", JSON.stringify(sponsorsData));

      // Append actual files
      sponsors.forEach(s => {
        if (s.logo) {
          formData.append("sponsor_logos", s.logo);
        }
      });

      await api.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSuccess(true);
      setTimeout(() => { window.location.href = "/organizer/events"; }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat menyimpan event.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (success) {
    return (
      <DashboardLayout user={user} title="" subtitle="" links={navLinks} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md w-full animate-in fade-in zoom-in duration-500">
            <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-3">Tersimpan!</h2>
            <p className="text-gray-500 font-medium">Event berhasil dipublikasikan. Mengarahkan ke halaman Kelola Event...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      user={user} 
      title="" 
      subtitle=""
      links={navLinks}
      onLogout={handleLogout}
    >
      <div className="min-h-screen bg-gray-50 font-sans -m-6 pb-32">
        {/* Emerald Header */}
        <div className="bg-slate-900 pb-20 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-slate-500 rounded-full opacity-20 blur-2xl"></div>

            <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/organizer/events" className="text-indigo-200 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-sm group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest border border-indigo-700/50 px-3 py-1.5 rounded-md">Manajemen Event</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">Buat Event Baru</h1>
                    <p className="text-indigo-100/80 mt-3 text-sm md:text-base max-w-xl font-medium">Lengkapi formulir di bawah ini untuk mempublikasikan event Anda ke publik.</p>
                </div>
            </div>
        </div>

        {/* Form Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 border border-red-100 font-bold shadow-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* SECTION 1: Informasi Utama */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center text-xl font-extrabold shadow-inner">1</div>
                        <h3 className="text-xl font-bold text-gray-800">Informasi Utama</h3>
                    </div>
                    
                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Judul Event <span className="text-red-500">*</span></label>
                            <input type="text" name="title" required value={eventData.title} onChange={handleEventChange}
                                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-800 outline-none" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Lengkap</label>
                            <textarea name="description" rows={5} required value={eventData.description} onChange={handleEventChange}
                                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-800 outline-none"></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Waktu Mulai <span className="text-red-500">*</span></label>
                                <input type="datetime-local" name="start_date" required value={eventData.start_date} onChange={handleEventChange}
                                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-800 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Lokasi / Link <span className="text-red-500">*</span></label>
                                <input type="text" name="location" required value={eventData.location} onChange={handleEventChange} placeholder="Gedung A / Link Zoom"
                                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-800 outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Visibilitas</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="cursor-pointer relative">
                                    <input type="radio" name="is_public" value="public" checked={eventData.is_public === 'public'} onChange={handleEventChange} className="peer sr-only" />
                                    <div className="p-5 rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 peer-checked:border-indigo-500 peer-checked:bg-indigo-50/50 transition-all">
                                        <span className="block text-sm font-bold text-gray-800 mb-1">🌍 Publik</span>
                                        <span className="block text-xs text-gray-500 font-medium">Ditampilkan ke semua orang di halaman depan.</span>
                                    </div>
                                </label>
                                <label className="cursor-pointer relative">
                                    <input type="radio" name="is_public" value="internal" checked={eventData.is_public === 'internal'} onChange={handleEventChange} className="peer sr-only" />
                                    <div className="p-5 rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50/50 transition-all">
                                        <span className="block text-sm font-bold text-gray-800 mb-1">🔒 Internal</span>
                                        <span className="block text-xs text-gray-500 font-medium">Hanya untuk orang yang memiliki akun dan login.</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Maksimal Peserta</label>
                            <input type="number" name="maksimal_peserta" min="0" value={eventData.maksimal_peserta} onChange={handleEventChange}
                                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-800 outline-none" placeholder="0 (Kosongkan atau isi 0 jika tidak ada batasan)" />
                            <p className="text-xs text-gray-500 mt-2 font-medium">Isi 0 jika tidak ada batasan kapasitas untuk event ini.</p>
                        </div>

                        <div className="border-t border-gray-100 my-4"></div>
                        
                        <div>
                            <label className="flex items-center cursor-pointer mb-5 w-fit group">
                                <div className="relative">
                                    <input type="checkbox" name="enable_penalty" checked={eventData.enable_penalty} onChange={handleEventChange} className="sr-only peer" />
                                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                </div>
                                <span className="ml-3 text-sm font-bold text-gray-700">Aktifkan Denda Absensi</span>
                            </label>
                            
                            {eventData.enable_penalty && (
                                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Batas Akhir (Jam Selesai) <span className="text-red-500">*</span></label>
                                            <input type="datetime-local" name="end_date" required={eventData.enable_penalty} value={eventData.end_date} onChange={handleEventChange}
                                                className="w-full px-5 py-3.5 rounded-xl border border-red-200 bg-white focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-gray-800 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Nominal Denda (Rp) <span className="text-red-500">*</span></label>
                                            <input type="number" name="penalty_fee" required={eventData.enable_penalty} min="0" value={eventData.penalty_fee} onChange={handleEventChange}
                                                className="w-full px-5 py-3.5 rounded-xl border border-red-200 bg-white focus:ring-4 focus:ring-red-500/10 transition-all font-medium text-gray-800 outline-none" placeholder="0" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Tiket & Harga */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 flex items-center justify-center text-xl font-extrabold shadow-inner">2</div>
                        <h3 className="text-xl font-bold text-gray-800">Tiket & Harga</h3>
                    </div>
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Event</label>
                                <select name="type" value={eventData.type} onChange={handleEventChange}
                                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-gray-800 outline-none cursor-pointer">
                                    <option value="gratis">Gratis</option>
                                    <option value="berbayar">Berbayar</option>
                                </select>
                            </div>
                            {eventData.type === 'berbayar' && (
                                <div className="animate-in fade-in slide-in-from-left-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Harga Tiket (Rp) <span className="text-red-500">*</span></label>
                                    <input type="number" name="price" required={eventData.type === 'berbayar'} min="0" value={eventData.price} onChange={handleEventChange}
                                        className="w-full px-5 py-3.5 rounded-xl border border-blue-300 bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-gray-800 outline-none" placeholder="Contoh: 50000" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION 3: Media & Sertifikat */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center text-xl font-extrabold shadow-inner">3</div>
                        <h3 className="text-xl font-bold text-gray-800">Media Poster</h3>
                    </div>
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Poster Event</label>
                                <p className="text-xs text-gray-500 font-medium">Format: JPG/PNG. Maks 2MB.</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${posterPreview ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {posterPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={posterPreview} alt="Preview" className="h-40 w-auto rounded-lg object-contain shadow-md" />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500 font-bold"><span className="text-indigo-600">Klik untuk upload</span> atau drag and drop</p>
                                                <p className="text-xs text-gray-400 font-medium">PNG, JPG or GIF</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: Sponsor Event */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center text-xl font-extrabold shadow-inner">4</div>
                            <h3 className="text-xl font-bold text-gray-800">Sponsor Event</h3>
                        </div>
                        <button type="button" onClick={handleAddSponsor} className="px-4 py-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Tambah Sponsor
                        </button>
                    </div>
                    
                    <div className="p-6 md:p-8 space-y-4">
                        {sponsors.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-bold text-gray-500">Belum ada sponsor event.</p>
                                <p className="text-xs text-gray-400 mt-1">Klik tombol &quot;Tambah Sponsor&quot; di atas untuk mulai menambahkan logo dan nama sponsor.</p>
                            </div>
                        ) : (
                            sponsors.map((sp, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-4 items-end bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative group hover:border-indigo-300 hover:shadow-md transition-all">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Sponsor <span className="text-red-500">*</span></label>
                                        <input type="text" required value={sp.nama} onChange={(e) => handleSponsorNameChange(idx, e.target.value)} placeholder="Contoh: PT. Sponsor Abadi"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-sm text-gray-800" />
                                    </div>
                                    <div className="flex-grow w-full md:max-w-md">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Logo Sponsor <span className="text-red-500">*</span></label>
                                        <div className="flex items-center gap-3">
                                            {sp.logoPreview ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={sp.logoPreview} alt="Logo preview" className="h-11 w-11 object-contain rounded-lg border border-gray-200 p-1 bg-gray-50" />
                                            ) : (
                                                <div className="h-11 w-11 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400"><ImageIcon className="w-5 h-5" /></div>
                                            )}
                                            <input type="file" required accept="image/*" onChange={(e) => handleSponsorLogoChange(idx, e)}
                                                className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 font-bold border border-gray-200 rounded-xl bg-gray-50 cursor-pointer" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveSponsor(idx)} className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl border border-red-100 transition-all shadow-sm self-end h-[46px] w-[46px] flex items-center justify-center" title="Hapus Sponsor">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-10">
                    <button type="submit" disabled={loading}
                        className="bg-primary text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-700 hover:-translate-y-1 hover:shadow-xl transition-all flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        {loading ? "Menyimpan Event..." : "Simpan & Publikasikan"}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </DashboardLayout>
  );
}