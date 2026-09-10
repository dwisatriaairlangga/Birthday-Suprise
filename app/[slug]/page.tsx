'use client';
import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MailOpen, Gift, RefreshCcw, Droplet, Ribbon, Flower2, Stamp, Key, Feather, Sparkles, Heart, Paperclip, Music } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';

const themes = {
  vintage: { bg: 'bg-[#fdfbf7]', envelope: 'bg-[#e8dcc7]' },
  romantis: { bg: 'bg-[#fff0f5]', envelope: 'bg-[#ffb6c1]' },
  ceria: { bg: 'bg-[#f0f8ff]', envelope: 'bg-[#add8e6]' },
  midnight: { bg: 'bg-[#0f172a]', envelope: 'bg-[#1e293b]' },
  forest: { bg: 'bg-[#f0fdf4]', envelope: 'bg-[#86efac]' },
};

const getEmbedData = (url: string) => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) return { type: 'youtube', url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` };
  const spotMatch = url.match(/spotify\.com\/(track|playlist)\/([a-zA-Z0-9]+)/);
  if (spotMatch && spotMatch[1] && spotMatch[2]) return { type: 'spotify', url: `https://open.spotify.com/embed/${spotMatch[1]}/${spotMatch[2]}` };
  return null;
};

// --- KOMPONEN VEKTOR BUNGA ---
function TulipVector({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 180 C50 140 48 100 50 70" stroke="#4A7C39" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 140 C30 130 10 110 5 90 C15 110 35 125 50 140 Z" fill="#5D9B47" />
      <path d="M50 120 C65 110 85 95 90 75 C80 95 65 110 50 120 Z" fill="#4A7C39" />
      <path d="M50 70 C30 65 25 35 40 20 C45 15 50 25 50 35 C50 25 55 15 60 20 C75 35 70 65 50 70 Z" fill="#FFB7C5" />
      <path d="M50 70 C38 60 35 38 45 25 C48 20 50 30 50 40 C50 30 52 20 55 25 C65 38 62 60 50 70 Z" fill="#FFA1B2" />
    </svg>
  );
}

function BlossomVector({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 120 C60 100 58 80 60 70" stroke="#5D9B47" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="45" r="22" fill="#FFC0CB" />
      <circle cx="40" cy="60" r="22" fill="#FFB6C1" />
      <circle cx="80" cy="60" r="22" fill="#FFB6C1" />
      <circle cx="48" cy="80" r="22" fill="#FFC0CB" />
      <circle cx="72" cy="80" r="22" fill="#FFC0CB" />
      <circle cx="60" cy="62" r="8" fill="#FFD700" />
      <circle cx="55" cy="58" r="2" fill="#FF69B4" />
      <circle cx="65" cy="58" r="2" fill="#FF69B4" />
      <circle cx="60" cy="68" r="2" fill="#FF69B4" />
    </svg>
  );
}

export default function LetterPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [data, setData] = useState<any>(null);
  const [stage, setStage] = useState<'envelope' | 'letter' | 'gift'>('envelope');
  const [embed, setEmbed] = useState<{type: string, url: string} | null>(null);
  const [fallingFlowers, setFallingFlowers] = useState<{id: number, x: number, emoji: string}[]>([]);
  const [growingFlowers, setGrowingFlowers] = useState<{id: number, x: number, delay: number, type: 'tulip' | 'blossom', size: number}[]>([]);

  // MENGAMBIL DATA DARI SUPABASE
  useEffect(() => {
    async function fetchLetter() {
      const { data: dbData, error } = await supabase
        .from('letters')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !dbData) {
        setData({ error: true });
      } else {
        setData({
          sender: dbData.sender,
          receiver: dbData.receiver,
          content: dbData.content,
          theme: dbData.theme,
          accessory: dbData.accessory,
          musicLink: dbData.music_link,
          giftType: dbData.gift_type,
          giftMessage: dbData.gift_message,
          photos: dbData.photos || [],
          wallMessages: dbData.wall_messages || []
        });
        if (dbData.music_link) setEmbed(getEmbedData(dbData.music_link));
      }
    }
    fetchLetter();
  }, [slug]);

  const triggerGift = () => {
    setStage('gift');
    
    if (data?.giftType === 'kembangApi') {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        confetti({ ...defaults, particleCount: 50 * (timeLeft / duration), origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount: 50 * (timeLeft / duration), origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 } });
      }, 250);
    }
    else if (data?.giftType === 'bintang') {
      const defaults = { spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, shapes: ['star'], colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'] };
      const shoot = () => {
        confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] });
        confetti({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ['circle'] });
      };
      setTimeout(shoot, 0); setTimeout(shoot, 100); setTimeout(shoot, 200);
    }
    else if (data?.giftType === 'bunga') {
      const emojis = ['🌸', '🌺', '🌻', '🌹', '🌷'];
      setFallingFlowers(Array.from({ length: 30 }).map((_, i) => ({ id: i, x: Math.random() * 100, emoji: emojis[Math.floor(Math.random() * emojis.length)] })));
    }
    else if (data?.giftType === 'bungaTumbuh') {
      setGrowingFlowers(Array.from({ length: 20 }).map((_, i) => ({
        id: i, x: (i * 5) + (Math.random() * 3), delay: Math.random() * 1.2,
        type: i % 2 === 0 ? 'tulip' : 'blossom', size: Math.random() * 40 + 110
      })));
    }
    else {
      const end = Date.now() + 3000;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  };

  const resetSurprise = () => {
    setStage('envelope');
    setFallingFlowers([]);
    setGrowingFlowers([]);
  };

  if (!data) return <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">Memuat...</div>;
  if (data.error) return <div className="min-h-screen flex items-center justify-center text-xl">Surat tidak ditemukan.</div>;

  const activeTheme = themes[data.theme as keyof typeof themes] || themes.vintage;
  const isDarkScene = stage === 'gift' && data.giftType === 'bungaTumbuh';
  const paragraphs = data.content ? data.content.split('\n').filter((p: string) => p.trim() !== '') : [];

  return (
    <main className={`min-h-screen ${isDarkScene ? 'bg-black' : activeTheme.bg} flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-1000 py-12`}>
      
      {/* SPOTLIGHT GELAP */}
      <AnimatePresence>
        {isDarkScene && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5, delay: 0.5 }} className="fixed bottom-0 left-0 w-full h-[85vh] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-yellow-100/35 via-amber-900/10 to-transparent pointer-events-none z-0" />
        )}
      </AnimatePresence>

      {/* BUNGA JATUH */}
      {stage === 'gift' && data.giftType === 'bunga' && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {fallingFlowers.map((flower) => (
            <motion.div key={flower.id} className="absolute text-4xl" initial={{ left: `${flower.x}%`, top: '-10%', opacity: 1, rotate: 0 }} animate={{ top: '110%', opacity: 0, rotate: 360 }} transition={{ duration: Math.random() * 3 + 3, delay: Math.random() * 2, repeat: Infinity }}>
              {flower.emoji}
            </motion.div>
          ))}
        </div>
      )}

      {/* BUNGA TUMBUH (VEKTOR) */}
      {isDarkScene && (
        <div className="fixed bottom-0 left-0 w-full h-full pointer-events-none z-10">
          {growingFlowers.map((flower) => (
            <motion.div key={flower.id} className="absolute origin-bottom drop-shadow-2xl" style={{ left: `${flower.x}%`, bottom: '-15px', width: `${flower.size}px`, height: `${flower.size * 1.4}px` }} initial={{ y: 250, opacity: 0, scale: 0.2, filter: 'brightness(0.3)' }} animate={{ y: -(Math.random() * 30 + 10), opacity: 1, scale: 1, filter: 'brightness(1.15)' }} transition={{ duration: 2, delay: flower.delay, type: 'spring', bounce: 0.35 }}>
              {flower.type === 'tulip' ? <TulipVector className="w-full h-full" /> : <BlossomVector className="w-full h-full" />}
            </motion.div>
          ))}
        </div>
      )}

      {/* TAHAP 1: AMPLOP BESERTA AKSESORIS */}
      <AnimatePresence>
        {stage === 'envelope' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0, y: -50 }} className="flex flex-col items-center cursor-pointer z-20" onClick={() => setStage('letter')}>
            <div className={`w-64 h-48 ${activeTheme.envelope} rounded-lg shadow-xl relative flex items-center justify-center`}>
              <div className="absolute top-2 right-2 text-white/60 drop-shadow-md">
                {data.accessory === 'waxseal' && <Droplet className="w-8 h-8 text-red-500/80" fill="currentColor" />}
                {data.accessory === 'pita' && <Ribbon className="w-8 h-8" />}
                {data.accessory === 'bunga' && <Flower2 className="w-8 h-8" />}
                {data.accessory === 'prangko' && <Stamp className="w-8 h-8" />}
                {data.accessory === 'kunci' && <Key className="w-8 h-8 text-yellow-600/80" />}
                {data.accessory === 'feather' && <Feather className="w-8 h-8" />}
                {data.accessory === 'sparkles' && <Sparkles className="w-8 h-8 text-yellow-400" />}
                {data.accessory === 'heart' && <Heart className="w-8 h-8 text-rose-500/80" fill="currentColor" />}
                {data.accessory === 'paperclip' && <Paperclip className="w-8 h-8" />}
              </div>
              <MailOpen className="w-12 h-12 text-black/20" />
            </div>
            <p className="mt-8 font-serif text-lg text-gray-700 text-center">Buka Suratnya</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAHAP 2: SURAT (FOTO DAN WALL OF MESSAGES) */}
      <AnimatePresence>
        {stage === 'letter' && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="max-w-xl w-full bg-white p-8 md:p-12 rounded-lg shadow-2xl z-20 overflow-y-auto max-h-[80vh]">
            <h1 className="font-serif text-3xl italic text-gray-800 mb-6">Untuk {data.receiver},</h1>
            
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.02 } } }}>
              {paragraphs.map((para: string, i: number) => (
                <div key={i} className="mb-6">
                  <p className="font-serif text-lg leading-relaxed text-gray-700">
                    {para.split('').map((char: string, j: number) => (
                      <motion.span key={j} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>{char}</motion.span>
                    ))}
                  </p>
                  
                  {/* FOTO KENANGAN */}
                  {data.photos && data.photos[i] && (
                    <motion.div variants={{ hidden: { opacity: 0, y: 20, rotate: 0 }, visible: { opacity: 1, y: 0, rotate: i % 2 === 0 ? 3 : -3 } }} className="mt-6 mx-auto bg-white p-3 shadow-md border border-gray-100 max-w-sm rounded-sm">
                      <img src={data.photos[i]} alt="Kenangan" className="w-full h-auto object-cover rounded-sm" />
                      <p className="font-serif text-center text-sm mt-3 text-gray-500 italic">Sebuah Kenangan</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="font-serif text-lg text-gray-800">Dengan segenap hati,</p>
              <p className="font-serif text-2xl italic font-bold text-gray-800">{data.sender}</p>
            </div>

            {/* WALL OF MESSAGES */}
            {data.wallMessages && data.wallMessages.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-12 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="font-serif text-xl text-gray-800 mb-4 text-center">Pesan dari Teman-teman</h3>
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
                  {data.wallMessages.map((msg: any, i: number) => (
                    <div key={i} className="min-w-[240px] bg-white p-4 rounded-lg shadow-sm border snap-center shrink-0">
                      <p className="text-gray-600 italic mb-3 text-sm">"{msg.message}"</p>
                      <p className="font-bold text-sm text-right text-[#a89575]">- {msg.name}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.button onClick={triggerGift} className="mt-10 w-full bg-[#f4ebd9] text-[#8a795d] py-3 rounded-md font-medium hover:bg-[#e8dcc7] transition-colors">
              <Gift className="w-5 h-5 mr-2 inline" /> Buka Hadiah Virtual
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAHAP 3: KARTU HADIAH */}
      <AnimatePresence>
        {stage === 'gift' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2 }} className="max-w-md w-full bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-center z-30 relative mt-12">
            <h2 className="font-serif text-3xl text-gray-800 mb-4">Kejutan Khusus Untukmu!</h2>
            <p className="text-gray-600 mb-6">{data.giftMessage || "Kejutan manis untuk hari spesialmu!"}</p>
            <button onClick={resetSurprise} className="mx-auto flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 px-4 py-2 rounded-full cursor-pointer">
              <RefreshCcw className="w-4 h-4" /> Ulangi Kejutan
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PEMUTAR MUSIK YOUTUBE/SPOTIFY */}
      {embed && stage !== 'envelope' && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-4 right-4 z-50 shadow-2xl bg-white p-2 rounded-xl flex items-center">
          <Music className="w-4 h-4 text-gray-500 mr-2 absolute left-4" />
          <iframe src={embed.url} width={embed.type === 'spotify' ? "300" : "250"} height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media" loading="lazy" className="rounded-lg ml-6" />
        </motion.div>
      )}
    </main>
  );
}