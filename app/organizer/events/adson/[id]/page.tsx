"use client";
import { getBackendBaseUrl } from "@/lib/axios";


import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Plus, Edit3, Trash2, Loader2, Image as ImageIcon, Box, DollarSign, Gift,
  Calendar, Users, MessageSquare
} from "lucide-react";
import Link from "next/link";
import api from "../../../../../lib/api";
import DashboardLayout from "../../../../../components/DashboardLayout";
import Swal from "sweetalert2";

interface Adson {
  id: number;
  nama_barang: string;
  deskripsi: string;
  harga: number;
  stok: number;
  gambar: string | null;
}

export default function KelolaAdsonPage() {
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
  const [adsons, setAdsons] = useState<Adson[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [fileGambar, setFileGambar] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    id: null as number | null,
    nama_barang: "",
    deskripsi: "",
    harga: 0,
    stok: 0,
    gambar: ""
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

      const resAdsons = await api.get(`/adson/${decoded_id}`);
      setAdsons(resAdsons.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Gagal mengambil data adson.',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decoded_id) fetchData();
  }, [decoded_id]);

  const handleOpenModal = (adson: Adson | null = null) => {
    if (adson) {
      setIsEditing(true);
      setFormData({
        id: adson.id,
        nama_barang: adson.nama_barang,
        deskripsi: adson.deskripsi || "",
        harga: adson.harga,
        stok: adson.stok,
        gambar: adson.gambar || ""
      });
    } else {
      setIsEditing(false);
      setFormData({
        id: null,
        nama_barang: "",
        deskripsi: "",
        harga: 0,
        stok: 0,
        gambar: ""
      });
    }
    setFileGambar(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          setFileGambar(file);
          // Preview local image
          setFormData({
              ...formData,
              gambar: URL.createObjectURL(file)
          });
      }
  };

  const handleSaveAdson = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('nama_barang', formData.nama_barang);
      submitData.append('deskripsi', formData.deskripsi);
      submitData.append('harga', String(formData.harga));
      submitData.append('stok', String(formData.stok));
      if (fileGambar) submitData.append('gambar', fileGambar);

      if (isEditing && formData.id) {
        await api.put(`/adson/${formData.id}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Barang adson berhasil diperbarui.',
          confirmButtonColor: '#4f46e5',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await api.post(`/adson/${decoded_id}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Barang adson berhasil ditambahkan.',
          confirmButtonColor: '#4f46e5',
          timer: 2000,
          showConfirmButton: false
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan data.',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAdson = async (adsonId: number) => {
    const result = await Swal.fire({
      title: 'Hapus Barang?',
      text: "Barang ini akan dihapus dari daftar adson Anda secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/adson/${adsonId}`);
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: 'Barang adson berhasil dihapus.',
          confirmButtonColor: '#4f46e5',
          timer: 2000,
          showConfirmButton: false
        });
        fetchData();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat menghapus data.',
          confirmButtonColor: '#4f46e5'
        });
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
        
        {/* Hero Header Section */}
        <div className="bg-indigo-900 pb-20 pt-10 px-6 md:px-12 rounded-b-[3rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>

            <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <Link href="/organizer/events" className="text-indigo-200 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-sm group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest border border-indigo-700/50 px-3 py-1.5 rounded-md">Manajemen Adson</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                        Kelola Souvenir & Penjualan
                    </h1>
                    <p className="text-indigo-100/80 mt-2 text-sm md:text-base max-w-xl">
                        Atur barang tambahan (Adson) yang bisa dibeli peserta untuk event: <span className="font-bold text-white">{eventData?.judul}</span>
                    </p>
                </div>
                
                <button onClick={() => handleOpenModal()} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Tambah Barang
                </button>
            </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
            
            {/* Grid List */}
            {adsons.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-dashed border-gray-200">
                        <Gift className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Belum Ada Adson</h3>
                    <p className="text-gray-500 font-medium mt-2 max-w-md mx-auto">
                        Anda belum menambahkan barang/souvenir apapun untuk event ini. Klik "Tambah Barang" untuk memulai.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adsons.map((adson) => (
                        <div key={adson.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group relative flex flex-col">
                            {/* Image Placeholder */}
                            <div className="h-48 bg-gray-100 relative">
                                {adson.gambar ? (
                                    <img src={adson.gambar.startsWith('blob:') ? adson.gambar : `${getBackendBaseUrl()}${adson.gambar}`} alt={adson.nama_barang} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                        <span className="text-xs font-bold uppercase tracking-wider">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(adson)} className="w-8 h-8 rounded-full bg-white text-indigo-600 shadow-md flex items-center justify-center hover:bg-indigo-50 transition-colors">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteAdson(adson.id)} className="w-8 h-8 rounded-full bg-white text-red-500 shadow-md flex items-center justify-center hover:bg-red-50 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 flex flex-col flex-grow">
                                <h4 className="font-extrabold text-gray-800 text-lg mb-1 line-clamp-1" title={adson.nama_barang}>{adson.nama_barang}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2 flex-grow mb-4">{adson.deskripsi || "Tidak ada deskripsi."}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                    <div className="flex items-center gap-1.5 text-indigo-700">
                                        <DollarSign className="w-5 h-5" />
                                        <span className="font-extrabold text-lg">Rp {adson.harga.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">
                                        <Box className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Stok: {adson.stok}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-indigo-600" /> {isEditing ? 'Edit Barang Adson' : 'Tambah Barang Baru'}
                </h3>
              </div>
              <form onSubmit={handleSaveAdson} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Barang <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.nama_barang} onChange={e => setFormData({...formData, nama_barang: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Contoh: T-Shirt Event, Tumbler" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Deskripsi Barang</label>
                  <textarea rows={3} value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Jelaskan detail barang ini..."></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Harga (Rp) <span className="text-red-500">*</span></label>
                        <input type="number" min="0" required value={formData.harga} onChange={e => setFormData({...formData, harga: Number(e.target.value)})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Stok Awal <span className="text-red-500">*</span></label>
                        <input type="number" min="0" required value={formData.stok} onChange={e => setFormData({...formData, stok: Number(e.target.value)})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Upload Gambar Barang (Opsional)</label>
                  <input type="file" accept="image/*" onChange={handleFileChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  {formData.gambar && (
                    <div className="mt-3">
                        <img src={formData.gambar.startsWith('blob:') ? formData.gambar : `${getBackendBaseUrl()}${formData.gambar}`} alt="Preview" className="h-24 w-auto rounded-lg object-cover border border-gray-200" />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-3 border-t border-gray-100 mt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Batal
                  </button>
                  <button type="submit" disabled={saveLoading} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                    {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Barang'}
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
