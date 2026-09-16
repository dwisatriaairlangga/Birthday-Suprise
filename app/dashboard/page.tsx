'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Clock, CheckCircle2, Trash2, ExternalLink, Send, Plus, Heart, MessageCircleHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLetters();
  }, []);

  const fetchMyLetters = async () => {
    setLoading(true);
    const savedSlugs = JSON.parse(localStorage.getItem('mySuratKejutan') || '[]');
    
    if (savedSlugs.length === 0) {
      setLetters([]);
      setLoading(false);
      return;
    }

    // Mengambil tambahan data reply_message dan is_liked dari DB
    const { data, error } = await supabase
      .from('letters')
      .select('slug, receiver, created_at, opened_at, theme, reply_message, is_liked')
      .in('slug', savedSlugs)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLetters(data);
    }
    setLoading(false);
  };

  const deleteLetter = async (slug: string) => {
    const confirmDelete = window.confirm("Yakin ingin menghapus surat ini selamanya?");
    if (!confirmDelete) return;

    await supabase.from('letters').delete().eq('slug', slug);
    
    const savedSlugs = JSON.parse(localStorage.getItem('mySuratKejutan') || '[]');
    const newSlugs = savedSlugs.filter((s: string) => s !== slug);
    localStorage.setItem('mySuratKejutan', JSON.stringify(newSlugs));
    
    setLetters(letters.filter(l => l.slug !== slug));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <main className="min-h-screen bg-[#fdfbf7] py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-serif font-black text-gray-800 flex items-center gap-3">
              <Mail className="w-8 h-8 text-pink-500" /> Riwayat Surat
            </h1>
            <p className="text-gray-500 mt-2">Kelola dan pantau status surat kejutan yang pernah kamu buat.</p>
          </div>
          <a href="/create" className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4"/> Buat Baru
          </a>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium animate-pulse">Memuat riwayat...</div>
        ) : letters.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200 text-center flex flex-col items-center">
            <Send className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-serif text-gray-700 font-bold mb-2">Belum Ada Surat</h3>
            <p className="text-gray-500 mb-6">Kamu belum membuat surat kejutan apa pun di perangkat ini.</p>
            <a href="/create" className="bg-pink-100 text-pink-600 px-6 py-3 rounded-full font-bold hover:bg-pink-200 transition-colors">
              Mulai Buat Surat Pertama
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {letters.map((letter) => (
                <motion.div 
                  key={letter.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-pink-50 to-transparent rounded-bl-3xl -z-0"></div>
                  
                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Untuk</p>
                      <h3 className="text-xl font-serif font-black text-gray-800 truncate pr-4">{letter.receiver}</h3>
                    </div>
                    {letter.opened_at ? (
                      <span className="bg-green-100 text-green-700 p-2 rounded-full flex-shrink-0" title="Sudah Dibaca">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 p-2 rounded-full flex-shrink-0" title="Belum Dibaca">
                        <Clock className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4 flex-1">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="w-20">Dibuat:</span> 
                      <span className="text-gray-800 font-medium">{formatDate(letter.created_at)}</span>
                    </div>
                    <div className="text-sm flex items-center gap-2">
                      <span className="w-20 text-gray-500">Status:</span> 
                      {letter.opened_at ? (
                        <span className="text-green-600 font-bold flex items-center gap-1">Terbaca pada {formatDate(letter.opened_at)}</span>
                      ) : (
                        <span className="text-amber-600 font-bold">Menunggu dibuka...</span>
                      )}
                    </div>
                  </div>

                  {/* MENAMPILKAN BALASAN DARI PENERIMA (REPLY & LIKE) */}
                  {(letter.is_liked || letter.reply_message) && (
                    <div className="mb-6 bg-pink-50/50 border border-pink-100 rounded-xl p-3 relative z-10">
                      {letter.is_liked && (
                        <div className="flex items-center gap-2 text-xs font-bold text-pink-600 mb-2 border-b border-pink-100 pb-2">
                          <Heart className="w-4 h-4 fill-pink-500" /> {letter.receiver} menyukai kejutan ini!
                        </div>
                      )}
                      {letter.reply_message && (
                        <div className="text-sm text-gray-700">
                          <div className="flex items-center gap-1 text-xs text-pink-400 font-bold mb-1"><MessageCircleHeart className="w-3 h-3" /> Balasan:</div>
                          <p className="italic font-medium text-gray-800">"{letter.reply_message}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-100 relative z-10 mt-auto">
                    <a href={`/${letter.slug}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm">
                      <ExternalLink className="w-4 h-4" /> Buka Tautan
                    </a>
                    <button onClick={() => deleteLetter(letter.slug)} className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-xl transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}