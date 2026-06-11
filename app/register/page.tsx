"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Loader2, UserPlus, Shield, Phone, Hash, Info } from "lucide-react";
import axios from "axios";
import api from "@/lib/axios"; // Changed to use standard axios instance if defined
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    email: "",
    password: "",
    nim: "",
    prodi: "",
    no_hp_mahasiswa: "",
    role: "mahasiswa", // 'mahasiswa' atau 'penyelenggara'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.role === 'mahasiswa') {
        const payload = {
          nim: formData.nim,
          email: formData.email,
          password: formData.password,
          nama_lengkap: formData.nama_lengkap,
          jenis_kelamin: 'Laki-laki', // default for now, can add to form
          prodi: formData.prodi || '-',
          no_hp_mahasiswa: formData.no_hp_mahasiswa || '-'
        };
        const response = await api.post("/auth/register/mahasiswa", payload);
        alert(response.data.message);
        router.push("/login");
      } else {
        const payload = {
          email: formData.email,
          password: formData.password,
          nama_lengkap: formData.nama_lengkap,
          no_whatsapp: formData.no_hp_mahasiswa || '-',
          jenis_kelamin: 'Laki-laki',
          role: 'penyelenggara'
        };
        const response = await api.post("/auth/register/user", payload);
        alert(response.data.message);
        router.push("/login/admin");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Terjadi kesalahan saat registrasi.");
      } else {
        setError("Terjadi kesalahan sistem yang tidak diketahui.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const { credential } = credentialResponse;
      const res = await api.post('/auth/google', { token: credential });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/mahasiswa/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal login via Google');
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy_client_id_for_now'}>
      <div className="min-h-screen bg-gray-50 font-sans relative flex flex-col justify-center items-center py-12 px-4">
        {/* Background Accent from Dashboard */}
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-indigo-900 rounded-b-[3rem] shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
        </div>

        <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-3xl border border-gray-100 shadow-2xl relative z-10 mt-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Buat Akun</h1>
            <p className="text-gray-500 text-sm font-medium">Bergabung dengan ekosistem CampusEvent</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                name="nama_lengkap"
                required
                value={formData.nama_lengkap}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm font-medium"
                placeholder="John Doe"
              />
            </div>

            {formData.role === 'mahasiswa' && (
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">NIM</label>
                <input
                  type="text"
                  name="nim"
                  required={formData.role === 'mahasiswa'}
                  value={formData.nim}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm font-medium"
                  placeholder="Contoh: 12345678"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm font-medium"
                placeholder="email@kampus.ac.id"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Daftar Sekarang</span>
              )}
            </button>
          </form>

          {formData.role === 'mahasiswa' && (
            <>
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400 font-medium">Atau daftar dengan</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 items-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Login Google dibatalkan atau gagal.')}
                  shape="pill"
                  text="signup_with"
                />
              </div>
            </>
          )}

          <div className="mt-8 text-center text-sm text-gray-500 font-medium">
            <p>
              Sudah punya akun?{" "}
              <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}