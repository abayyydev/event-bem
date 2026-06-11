"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Plus, Info, Calendar, MapPin, 
  List, Type, Mail, Phone, AlignLeft, CheckCircle, 
  Trash2, Edit3, X, Loader2, Save, Users, MessageSquare
} from "lucide-react";
import Link from "next/link";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";

interface FormField {
  id: number;
  label: string;
  field_type: string;
  is_required: boolean;
  options: string | null;
  placeholder: string | null;
}

export default function AturFormPage() {
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
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
    id: null,
    label: "",
    field_type: "text",
    is_required: true,
    placeholder: "",
    options: ""
  });

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

      const resFields = await api.get(`/form/${decoded_id}`);
      setFields(resFields.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decoded_id) fetchData();
  }, [decoded_id]);

  const handleOpenModal = (field: FormField | null = null) => {
    if (field) {
      setIsEditing(true);
      setFormData({
        id: field.id,
        label: field.label,
        field_type: field.field_type,
        is_required: !!field.is_required,
        placeholder: field.placeholder || "",
        options: field.options || ""
      });
    } else {
      setIsEditing(false);
      setFormData({
        id: null,
        label: "",
        field_type: "text",
        is_required: true,
        placeholder: "",
        options: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await api.post(`/form/${decoded_id}`, formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan field!");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteField = async (fieldId: number) => {
    if (confirm("Yakin ingin menghapus pertanyaan ini? Data yang sudah diisi peserta mungkin akan hilang.")) {
      try {
        await api.delete(`/form/${fieldId}`);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus field!");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'tel': return <Phone className="w-5 h-5" />;
      case 'textarea': return <AlignLeft className="w-5 h-5" />;
      case 'select': return <List className="w-5 h-5" />;
      case 'radio': return <CheckCircle className="w-5 h-5" />;
      default: return <Type className="w-5 h-5" />;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
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
        
        {/* Hero Header Section */}
        <div className="bg-slate-900 pb-20 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-slate-500 rounded-full opacity-20 blur-2xl"></div>

            <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <Link href="/organizer/events" className="text-indigo-200 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-sm group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest border border-indigo-700/50 px-3 py-1.5 rounded-md">Manajemen Form</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                        Kelola Form Pendaftaran
                    </h1>
                    <p className="text-indigo-100/80 mt-2 text-sm md:text-base max-w-xl">
                        Atur pertanyaan dan isian data yang dibutuhkan untuk event: <span className="font-bold text-white">{eventData?.judul}</span>
                    </p>
                </div>
                
                <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Tambah Pertanyaan
                </button>
            </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
            
            {/* Info Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col md:flex-row items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                    <Info className="w-7 h-7" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">Preview Event</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 font-medium">
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-primary" /> {formatDate(eventData?.tanggal_waktu)}</span>
                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-indigo-500" /> {eventData?.lokasi}</span>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                        <List className="w-5 h-5 text-indigo-600" /> Daftar Pertanyaan
                    </h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {fields.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-dashed border-gray-200">
                                <List className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Belum Ada Pertanyaan</h3>
                            <p className="text-gray-500 font-medium mt-2 max-w-md mx-auto">
                                Form pendaftaran masih kosong. Mulai tambahkan pertanyaan untuk calon peserta. (Nama dan Email akan otomatis ditanyakan sistem).
                            </p>
                        </div>
                    ) : (
                        fields.map((field) => (
                            <div key={field.id} className="px-6 py-5 hover:bg-indigo-50/40 transition-colors group">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                    <div className="md:col-span-5 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100 flex-shrink-0">
                                            {getIconForType(field.field_type)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-gray-800 text-sm md:text-base truncate group-hover:text-indigo-700 transition-colors">
                                                {field.label}
                                            </h4>
                                            {field.placeholder && (
                                                <p className="text-xs text-gray-400 truncate mt-1">Placeholder: {field.placeholder}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-3">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                            (field.field_type === 'select' || field.field_type === 'radio') 
                                            ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                                        }`}>
                                            {field.field_type}
                                        </span>
                                    </div>

                                    <div className="md:col-span-2 text-center md:text-left">
                                        {field.is_required ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Wajib
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                                Opsional
                                            </span>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 flex justify-end gap-2">
                                        <button onClick={() => handleOpenModal(field)} className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all flex items-center justify-center">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteField(field.id)} className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:shadow-md transition-all flex items-center justify-center">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* Modal form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-800">{isEditing ? 'Edit Pertanyaan' : 'Buat Pertanyaan Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveField} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Label Pertanyaan <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Contoh: Instansi asal / Motivasi" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Inputan <span className="text-red-500">*</span></label>
                  <select required value={formData.field_type} onChange={e => setFormData({...formData, field_type: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer">
                    <option value="text">Teks Singkat</option>
                    <option value="textarea">Area Teks Panjang</option>
                    <option value="email">Email</option>
                    <option value="tel">Nomor HP</option>
                    <option value="select">Dropdown Menu</option>
                    <option value="radio">Pilihan Ganda (Radio)</option>
                  </select>
                </div>

                {(formData.field_type === 'select' || formData.field_type === 'radio') && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Pilihan Opsi <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.options} onChange={e => setFormData({...formData, options: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Pisahkan dengan koma. Contoh: Sesi 1, Sesi 2" />
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">Pisahkan masing-masing pilihan menggunakan tanda koma (,).</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Placeholder Input</label>
                  <input type="text" value={formData.placeholder} onChange={e => setFormData({...formData, placeholder: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Teks bantuan (opsional)" />
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <input type="checkbox" id="req" checked={formData.is_required} onChange={e => setFormData({...formData, is_required: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                  <label htmlFor="req" className="text-sm font-bold text-gray-700 cursor-pointer select-none">Wajib diisi oleh peserta</label>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Batal
                  </button>
                  <button type="submit" disabled={saveLoading} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                    {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
