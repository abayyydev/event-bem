"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { QrCode, ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import api from "../../../../../lib/api";
import { Html5QrcodeScanner } from "html5-qrcode";
import Swal from "sweetalert2";

export default function ScanCheckinPage() {
  const router = useRouter();
  const params = useParams();
  const { event_id } = params;

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isProcessing = useRef(false);

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
        let decoded_id = event_id as string;
        try { decoded_id = atob(decodeURIComponent(event_id as string)); } catch (e) {}
        const res = await api.get(`/events/${decoded_id}`);
        setEventData(res.data);
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Event tidak ditemukan', 'error').then(() => router.push('/organizer/pendaftar'));
      } finally {
        setLoading(false);
      }
    };
    if (event_id) fetchData();
  }, [event_id]);

  useEffect(() => {
    if (!loading) {
      // Initialize scanner
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [0] }, // 0 = QR_CODE
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [loading]);

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      let decoded_id = event_id as string;
      try { decoded_id = atob(decodeURIComponent(event_id as string)); } catch (e) {}
      const res = await api.post(`/pendaftar/${decoded_id}/scan`, { kode_unik: decodedText });
      
      setScanResult({
        success: true,
        message: res.data.message,
        data: res.data.peserta
      });
      
      // Auto close result
      setTimeout(() => {
        setScanResult(null);
        isProcessing.current = false;
      }, 3000);

    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || 'Gagal memproses QR Code'
      });

      setTimeout(() => {
        setScanResult(null);
        isProcessing.current = false;
      }, 3000);
    }
  };

  const onScanFailure = (error: any) => {
    // ignore
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex flex-col items-center p-4">
      
      <div className="w-full max-w-md flex justify-between items-center mb-8 mt-4">
        <Link href={`/organizer/pendaftar/${event_id}`} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-white font-bold text-lg">Scan Check-in</h1>
        <div className="w-10"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-6 bg-indigo-50 border-b border-indigo-100 text-center">
            <h2 className="font-extrabold text-indigo-900 text-lg line-clamp-1">{eventData?.judul}</h2>
            <p className="text-xs text-indigo-500 mt-1 uppercase tracking-wider font-bold">Arahkan kamera ke QR Tiket</p>
        </div>

        <div className="p-6 relative">
            <div id="reader" className="w-full bg-black rounded-xl overflow-hidden border-2 border-dashed border-gray-300"></div>
            
            {/* Overlay Result */}
            {scanResult && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-white/95 backdrop-blur-sm animate-in fade-in duration-200">
                  {scanResult.success ? (
                    <>
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-lg shadow-emerald-200">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-black text-gray-800 mb-1">{scanResult.message}</h3>
                      <p className="text-gray-500 font-medium mb-6">{scanResult.data?.nama_peserta}</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 shadow-lg shadow-red-200">
                        <XCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-black text-gray-800 mb-1">Check-in Gagal</h3>
                      <p className="text-red-500 font-medium mb-6 text-center">{scanResult.message}</p>
                    </>
                  )}
                  <button onClick={() => { setScanResult(null); isProcessing.current = false; }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-full transition-colors text-sm">
                    Lanjut Scan
                  </button>
              </div>
            )}
        </div>
      </div>
      
      <div className="mt-8 text-center max-w-sm">
        <QrCode className="w-8 h-8 text-white/30 mx-auto mb-3" />
        <p className="text-white/50 text-xs">Sistem check-in otomatis. Proses pemindaian membutuhkan izin akses kamera.</p>
      </div>

    </div>
  );
}
