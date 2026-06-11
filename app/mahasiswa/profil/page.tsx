"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Key, Camera, Save, Loader2, QrCode, Download } from "lucide-react";
import MahasiswaLayout from "../../../components/MahasiswaLayout";
import api from "../../../lib/api";
import Swal from "sweetalert2";

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nama_lengkap: "", nim: "", no_hp_mahasiswa: "", jenis_kelamin: "", prodi: "",
    password_baru: "", konfirmasi_password: ""
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (!stored || JSON.parse(stored).role !== "mahasiswa") router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/mahasiswa/profil");
        setProfile(res.data);
        setForm({
          nama_lengkap: res.data.nama_lengkap || "",
          nim: res.data.nim || "",
          no_hp_mahasiswa: res.data.no_hp_mahasiswa || "",
          jenis_kelamin: res.data.jenis_kelamin || "",
          prodi: res.data.prodi || "",
          password_baru: "",
          konfirmasi_password: ""
        });
        if (res.data.foto_mahasiswa) {
          setFotoPreview(`http://localhost:5000/uploads/${res.data.foto_mahasiswa}`);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_lengkap.trim()) {
      Swal.fire("Error", "Nama lengkap wajib diisi", "error"); return;
    }
    if (form.password_baru && form.password_baru !== form.konfirmasi_password) {
      Swal.fire("Error", "Konfirmasi password tidak cocok", "error"); return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nama_lengkap", form.nama_lengkap);
      fd.append("nim", form.nim);
      fd.append("no_hp_mahasiswa", form.no_hp_mahasiswa);
      fd.append("jenis_kelamin", form.jenis_kelamin);
      fd.append("prodi", form.prodi);
      if (form.password_baru) {
        fd.append("password_baru", form.password_baru);
        fd.append("konfirmasi_password", form.konfirmasi_password);
      }
      if (fotoFile) fd.append("foto_mahasiswa", fotoFile);

      const res = await api.put("/mahasiswa/profil", fd, { headers: { "Content-Type": "multipart/form-data" } });
      
      const newFoto = res.data.foto_mahasiswa;
      // Update profile state
      setProfile((prev: any) => ({ ...prev, nim: form.nim, nama_lengkap: form.nama_lengkap, foto_mahasiswa: newFoto }));
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        user.name = form.nama_lengkap;
        user.nim = form.nim;
        if (newFoto) {
          user.foto_mahasiswa = newFoto;
        }
        localStorage.setItem("user", JSON.stringify(user));
      }

      Swal.fire({ icon: "success", title: "Berhasil!", text: "Profil berhasil diperbarui.", timer: 1500, showConfirmButton: false });
      setForm(prev => ({ ...prev, password_baru: "", konfirmasi_password: "" }));
    } catch (err: any) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal memperbarui profil", "error");
    } finally { setSaving(false); }
  };

  if (loading) return <MahasiswaLayout><div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div></MahasiswaLayout>;

  return (
    <MahasiswaLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Profile Card + Member Card */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-800 to-indigo-600" />
              <div className="relative z-10 mt-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 mx-auto bg-white p-1 rounded-full shadow-md group relative cursor-pointer hover:ring-4 hover:ring-indigo-100 transition-all duration-300"
                  title="Klik untuk mengubah foto profil"
                >
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="Foto" className="w-full h-full rounded-full object-cover border-2 border-slate-100" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-indigo-400" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-amber-500 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-800">{profile?.nama_lengkap}</h2>
                <p className="text-sm text-indigo-600 font-medium bg-indigo-50 inline-block px-3 py-1 rounded-full mt-1 uppercase">Mahasiswa</p>
                <p className="text-xs text-slate-400 mt-2">NIM: {profile?.nim || "-"}</p>
              </div>
            </div>



          </div>

          {/* Right: Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Edit Data Diri</h3>
                <span className="text-xs text-slate-400"><Key className="w-3 h-3 inline mr-1" /> Data Aman</span>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Foto Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Update Foto Profil</label>
                  <input type="file" ref={fileInputRef} accept=".jpg,.jpeg,.png" onChange={handleFotoChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer border border-slate-200 rounded-xl" />
                  <p className="text-xs text-slate-400 mt-1 ml-1">Maksimal 5MB (JPG, PNG)</p>
                </div>

                {/* Name & NIM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input type="text" value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">NIM (Nomor Induk)</label>
                    <div className="relative">
                      <QrCode className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input type="text" value={form.nim} onChange={(e) => setForm({ ...form, nim: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" required />
                    </div>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input type="email" value={profile?.email || ""} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed" readOnly />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">No. HP / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input type="text" value={form.no_hp_mahasiswa} onChange={(e) => setForm({ ...form, no_hp_mahasiswa: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Prodi & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Program Studi</label>
                    <input type="text" value={form.prodi} onChange={(e) => setForm({ ...form, prodi: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select value={form.jenis_kelamin} onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none bg-white">
                      <option value="">- Pilih -</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                {/* Password Section */}
                <div className="border-t border-slate-100 pt-6 mt-2">
                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                    <Key className="w-4 h-4 text-amber-500 mr-2" /> Ganti Password
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="password" placeholder="Password Baru" value={form.password_baru}
                      onChange={(e) => setForm({ ...form, password_baru: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                    <input type="password" placeholder="Ulangi Password" value={form.konfirmasi_password}
                      onChange={(e) => setForm({ ...form, konfirmasi_password: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">* Kosongkan jika tidak ingin mengubah password.</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button type="submit" disabled={saving}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </MahasiswaLayout>
  );
}
