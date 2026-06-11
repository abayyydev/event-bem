"use client";
import { getBackendBaseUrl } from "@/lib/axios";


import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Save, Loader2, Image as ImageIcon, Type, LayoutTemplate, MapPin, Hash, Settings,
  Calendar, Users, MessageSquare
} from "lucide-react";
import Link from "next/link";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";
import Swal from "sweetalert2";

export default function SertifikatSettingPage() {
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
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    sertifikat_template: "",
    sertifikat_orientasi: "portrait",
    sertifikat_prefix: "",
    sertifikat_nomor_awal: 1,
    sertifikat_nama_fs: 120,
    sertifikat_nama_x_percent: 50.00,
    sertifikat_nama_y_percent: 50.00,
    sertifikat_nomor_fs: 40,
    sertifikat_nomor_x_percent: 50.00,
    sertifikat_nomor_y_percent: 60.00,
    sertifikat_font: "Poppins-SemiBold.ttf",
    sertifikat_custom_type: "none",
    sertifikat_custom_global_text: "",
    sertifikat_custom_fs: 30,
    sertifikat_custom_x_percent: 50.00,
    sertifikat_custom_y_percent: 70.00
  });

  const [fileSertifikat, setFileSertifikat] = useState<File | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'nama' | 'nomor' | 'custom' | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    if (dragging === 'nama') setFormData(prev => ({...prev, sertifikat_nama_x_percent: parseFloat(x.toFixed(2)), sertifikat_nama_y_percent: parseFloat(y.toFixed(2))}));
    else if (dragging === 'nomor') setFormData(prev => ({...prev, sertifikat_nomor_x_percent: parseFloat(x.toFixed(2)), sertifikat_nomor_y_percent: parseFloat(y.toFixed(2))}));
    else if (dragging === 'custom') setFormData(prev => ({...prev, sertifikat_custom_x_percent: parseFloat(x.toFixed(2)), sertifikat_custom_y_percent: parseFloat(y.toFixed(2))}));
  };

  const stopDrag = () => setDragging(null);

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
        const ev = resEvent.data;
        
        setFormData({
            sertifikat_template: ev.sertifikat_template || "",
            sertifikat_orientasi: ev.sertifikat_orientasi || "portrait",
            sertifikat_prefix: ev.sertifikat_prefix || "",
            sertifikat_nomor_awal: ev.sertifikat_nomor_awal || 1,
            sertifikat_nama_fs: ev.sertifikat_nama_fs || 120,
            sertifikat_nama_x_percent: Number(ev.sertifikat_nama_x_percent) || 50.00,
            sertifikat_nama_y_percent: Number(ev.sertifikat_nama_y_percent) || 50.00,
            sertifikat_nomor_fs: ev.sertifikat_nomor_fs || 40,
            sertifikat_nomor_x_percent: Number(ev.sertifikat_nomor_x_percent) || 50.00,
            sertifikat_nomor_y_percent: Number(ev.sertifikat_nomor_y_percent) || 60.00,
            sertifikat_font: ev.sertifikat_font || "Poppins-SemiBold.ttf",
            sertifikat_custom_type: ev.sertifikat_custom_type || "none",
            sertifikat_custom_global_text: ev.sertifikat_custom_global_text || "",
            sertifikat_custom_fs: ev.sertifikat_custom_fs || 30,
            sertifikat_custom_x_percent: Number(ev.sertifikat_custom_x_percent) || 50.00,
            sertifikat_custom_y_percent: Number(ev.sertifikat_custom_y_percent) || 70.00
        });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          setFileSertifikat(file);
          // Buat URL untuk preview
          setFormData({
              ...formData,
              sertifikat_template: URL.createObjectURL(file)
          });
      }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaveLoading(true);
      try {
          const submitData = new FormData();
          if (fileSertifikat) submitData.append('sertifikat_template', fileSertifikat);
          submitData.append('sertifikat_orientasi', formData.sertifikat_orientasi);
          submitData.append('sertifikat_prefix', formData.sertifikat_prefix);
          submitData.append('sertifikat_nomor_awal', String(formData.sertifikat_nomor_awal));
          submitData.append('sertifikat_nama_fs', String(formData.sertifikat_nama_fs));
          submitData.append('sertifikat_nama_x_percent', String(formData.sertifikat_nama_x_percent));
          submitData.append('sertifikat_nama_y_percent', String(formData.sertifikat_nama_y_percent));
          submitData.append('sertifikat_nomor_fs', String(formData.sertifikat_nomor_fs));
          submitData.append('sertifikat_nomor_x_percent', String(formData.sertifikat_nomor_x_percent));
          submitData.append('sertifikat_nomor_y_percent', String(formData.sertifikat_nomor_y_percent));
          submitData.append('sertifikat_font', formData.sertifikat_font);
          submitData.append('sertifikat_custom_type', formData.sertifikat_custom_type);
          submitData.append('sertifikat_custom_global_text', formData.sertifikat_custom_global_text);
          submitData.append('sertifikat_custom_fs', String(formData.sertifikat_custom_fs));
          submitData.append('sertifikat_custom_x_percent', String(formData.sertifikat_custom_x_percent));
          submitData.append('sertifikat_custom_y_percent', String(formData.sertifikat_custom_y_percent));

          await api.put(`/events/${decoded_id}/sertifikat`, submitData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          Swal.fire({
              icon: 'success',
              title: 'Tersimpan!',
              text: 'Konfigurasi sertifikat berhasil diperbarui.',
              confirmButtonColor: '#4f46e5',
              timer: 2000,
              showConfirmButton: false
          });
      } catch (error) {
          Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Gagal menyimpan pengaturan.',
              confirmButtonColor: '#4f46e5'
          });
      } finally {
          setSaveLoading(false);
      }
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
                        <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest border border-indigo-700/50 px-3 py-1.5 rounded-md">Setting E-Sertifikat</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Desain Sertifikat
                    </h1>
                    <p className="text-indigo-100/80 mt-3 text-sm md:text-base max-w-2xl font-medium">
                        Atur letak nama, nomor, dan template untuk sertifikat event: <span className="font-bold text-white">{eventData?.judul}</span>
                    </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 px-6 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 text-2xl">
                        <LayoutTemplate className="w-7 h-7" />
                    </div>
                </div>
            </div>
        </div>

        {/* Content Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* KIRI: Upload & Preview Simulasi */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                                <ImageIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">Template Sertifikat</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Gambar Template (A4)</label>
                                <input type="file" accept="image/*" onChange={handleFileChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all font-medium" />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Orientasi Kertas</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all ${formData.sertifikat_orientasi === 'landscape' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300'}`}>
                                        <input type="radio" name="orientasi" value="landscape" checked={formData.sertifikat_orientasi === 'landscape'} onChange={e => setFormData({...formData, sertifikat_orientasi: e.target.value})} className="sr-only" />
                                        <div className="w-12 h-8 border-2 border-current rounded bg-white"></div>
                                        <span className="text-sm font-bold text-gray-700">Landscape</span>
                                    </label>
                                    <label className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all ${formData.sertifikat_orientasi === 'portrait' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300'}`}>
                                        <input type="radio" name="orientasi" value="portrait" checked={formData.sertifikat_orientasi === 'portrait'} onChange={e => setFormData({...formData, sertifikat_orientasi: e.target.value})} className="sr-only" />
                                        <div className="w-8 h-12 border-2 border-current rounded bg-white"></div>
                                        <span className="text-sm font-bold text-gray-700">Portrait</span>
                                    </label>
                                </div>
                            </div>

                            <div 
                                className="border border-dashed border-gray-300 rounded-2xl h-64 bg-gray-50 relative flex items-center justify-center overflow-hidden"
                                ref={containerRef}
                                onMouseMove={handleMouseMove}
                                onMouseUp={stopDrag}
                                onMouseLeave={stopDrag}
                            >
                                {formData.sertifikat_template ? (
                                    <img src={formData.sertifikat_template.startsWith('blob:') ? formData.sertifikat_template : `${getBackendBaseUrl()}${formData.sertifikat_template}`} alt="Preview" className="object-contain w-full h-full opacity-50 select-none pointer-events-none" />
                                ) : (
                                    <span className="text-gray-400 font-bold text-sm">Pratinjau Gambar</span>
                                )}
                                {/* Titik Koordinat Kasar Simulasi */}
                                <div 
                                    onMouseDown={() => setDragging('nama')}
                                    className="absolute flex items-center justify-center w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full cursor-move shadow-lg shadow-red-500/50 transition-transform hover:scale-125 z-10" 
                                    style={{ left: `calc(${formData.sertifikat_nama_x_percent}% - 12px)`, top: `calc(${formData.sertifikat_nama_y_percent}% - 12px)` }}
                                >N</div>
                                <div 
                                    onMouseDown={() => setDragging('nomor')}
                                    className="absolute flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-[10px] font-bold rounded-full cursor-move shadow-lg shadow-blue-500/50 transition-transform hover:scale-125 z-10" 
                                    style={{ left: `calc(${formData.sertifikat_nomor_x_percent}% - 12px)`, top: `calc(${formData.sertifikat_nomor_y_percent}% - 12px)` }}
                                >#</div>
                                {formData.sertifikat_custom_type !== 'none' && (
                                    <div 
                                        onMouseDown={() => setDragging('custom')}
                                        className="absolute flex items-center justify-center w-6 h-6 bg-green-500 text-white text-[10px] font-bold rounded-full cursor-move shadow-lg shadow-green-500/50 transition-transform hover:scale-125 z-10" 
                                        style={{ left: `calc(${formData.sertifikat_custom_x_percent}% - 12px)`, top: `calc(${formData.sertifikat_custom_y_percent}% - 12px)` }}
                                    >C</div>
                                )}
                            </div>
                            <div className="flex justify-between px-2 text-xs font-bold">
                                <span className="text-red-500 flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Nama</span>
                                <span className="text-blue-500 flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Nomor</span>
                                {formData.sertifikat_custom_type !== 'none' && <span className="text-green-500 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Custom</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* KANAN: Koordinat & Angka */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Penomoran */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                                <Hash className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">Format Penomoran</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Awalan (Prefix)</label>
                                <input type="text" value={formData.sertifikat_prefix} onChange={e => setFormData({...formData, sertifikat_prefix: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all font-medium"
                                    placeholder="Misal: EVT-001-" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nomor Urut Awal</label>
                                <input type="number" value={formData.sertifikat_nomor_awal} onChange={e => setFormData({...formData, sertifikat_nomor_awal: Number(e.target.value)})}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all font-medium" />
                            </div>
                        </div>
                    </div>

                    {/* Posisi Nama & Nomor */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">Koordinat Teks (Persentase)</h3>
                        </div>
                        <div className="p-6 space-y-8">
                            {/* NAMA */}
                            <div className="p-5 rounded-2xl bg-red-50 border border-red-100 relative">
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POSISI NAMA</span>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-red-600 mb-2">Ukuran Font (px)</label>
                                        <input type="number" value={formData.sertifikat_nama_fs} onChange={e => setFormData({...formData, sertifikat_nama_fs: Number(e.target.value)})}
                                            className="w-full px-4 py-2 border border-red-200 rounded-lg outline-none text-sm focus:border-red-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-red-600 mb-2">Sumbu X (%)</label>
                                        <input type="number" step="0.01" value={formData.sertifikat_nama_x_percent} onChange={e => setFormData({...formData, sertifikat_nama_x_percent: Number(e.target.value)})}
                                            className="w-full px-4 py-2 border border-red-200 rounded-lg outline-none text-sm focus:border-red-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-red-600 mb-2">Sumbu Y (%)</label>
                                        <input type="number" step="0.01" value={formData.sertifikat_nama_y_percent} onChange={e => setFormData({...formData, sertifikat_nama_y_percent: Number(e.target.value)})}
                                            className="w-full px-4 py-2 border border-red-200 rounded-lg outline-none text-sm focus:border-red-500" />
                                    </div>
                                </div>
                            </div>

                            {/* NOMOR */}
                            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 relative">
                                <span className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POSISI NOMOR</span>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-blue-600 mb-2">Ukuran Font (px)</label>
                                        <input type="number" value={formData.sertifikat_nomor_fs} onChange={e => setFormData({...formData, sertifikat_nomor_fs: Number(e.target.value)})}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg outline-none text-sm focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-blue-600 mb-2">Sumbu X (%)</label>
                                        <input type="number" step="0.01" value={formData.sertifikat_nomor_x_percent} onChange={e => setFormData({...formData, sertifikat_nomor_x_percent: Number(e.target.value)})}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg outline-none text-sm focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-blue-600 mb-2">Sumbu Y (%)</label>
                                        <input type="number" step="0.01" value={formData.sertifikat_nomor_y_percent} onChange={e => setFormData({...formData, sertifikat_nomor_y_percent: Number(e.target.value)})}
                                            className="w-full px-4 py-2 border border-blue-200 rounded-lg outline-none text-sm focus:border-blue-500" />
                                    </div>
                                </div>
                            </div>

                            {/* CUSTOM TEXT */}
                            <div className="p-5 rounded-2xl bg-green-50 border border-green-100 relative">
                                <span className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">TEKS KUSTOM (PREDIKAT)</span>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-green-700 mb-2">Tipe Teks Kustom</label>
                                        <select value={formData.sertifikat_custom_type} onChange={e => setFormData({...formData, sertifikat_custom_type: e.target.value})} className="w-full px-4 py-2 border border-green-200 rounded-lg outline-none text-sm focus:border-green-500">
                                            <option value="none">Tidak Ada</option>
                                            <option value="global">Sama Untuk Semua Peserta</option>
                                            <option value="per_peserta">Berbeda Tiap Peserta (Predikat)</option>
                                        </select>
                                    </div>
                                    {formData.sertifikat_custom_type === 'global' && (
                                        <div>
                                            <label className="block text-xs font-bold text-green-700 mb-2">Teks</label>
                                            <input type="text" value={formData.sertifikat_custom_global_text} onChange={e => setFormData({...formData, sertifikat_custom_global_text: e.target.value})} placeholder="Misal: Peserta Terbaik" className="w-full px-4 py-2 border border-green-200 rounded-lg outline-none text-sm focus:border-green-500" />
                                        </div>
                                    )}
                                    {formData.sertifikat_custom_type !== 'none' && (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-green-700 mb-2">Font Size (px)</label>
                                                <input type="number" value={formData.sertifikat_custom_fs} onChange={e => setFormData({...formData, sertifikat_custom_fs: Number(e.target.value)})} className="w-full px-4 py-2 border border-green-200 rounded-lg outline-none text-sm focus:border-green-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-green-700 mb-2">Sumbu X (%)</label>
                                                <input type="number" step="0.01" value={formData.sertifikat_custom_x_percent} onChange={e => setFormData({...formData, sertifikat_custom_x_percent: Number(e.target.value)})} className="w-full px-4 py-2 border border-green-200 rounded-lg outline-none text-sm focus:border-green-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-green-700 mb-2">Sumbu Y (%)</label>
                                                <input type="number" step="0.01" value={formData.sertifikat_custom_y_percent} onChange={e => setFormData({...formData, sertifikat_custom_y_percent: Number(e.target.value)})} className="w-full px-4 py-2 border border-green-200 rounded-lg outline-none text-sm focus:border-green-500" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    <button type="submit" disabled={saveLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1">
                        {saveLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />} Simpan Konfigurasi
                    </button>
                </div>
            </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
