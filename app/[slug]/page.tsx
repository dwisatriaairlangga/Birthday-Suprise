'use client';
import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MailOpen, Gift, RefreshCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

const themes = {
  vintage: { bg: 'bg-[#fdfbf7]', envelope: 'bg-[#e8dcc7]' },
  romantis: { bg: 'bg-[#fff0f5]', envelope: 'bg-[#ffb6c1]' },
  ceria: { bg: 'bg-[#f0f8ff]', envelope: 'bg-[#add8e6]' },
  midnight: { bg: 'bg-[#0f172a]', envelope: 'bg-[#1e293b]' },
  forest: { bg: 'bg-[#f0fdf4]', envelope: 'bg-[#86efac]' },
};

// Komponen Grafis Vektor Bunga Tulip
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

// Komponen Grafis Vektor Bunga Sakura
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
  
  // State untuk animasi hadiah
  const [fallingFlowers, setFallingFlowers] = useState<{id: number, x: number, emoji: string}[]>([]);
  const [growingFlowers, setGrowingFlowers] = useState<{id: number, x: number, delay: number, type: 'tulip' | 'blossom', size: number}[]>([]);

  useEffect(() => {
    const letters = JSON.parse(localStorage.getItem('letters') || '{}');
    if (letters[slug]) {
      setData(letters[slug]);
    } else {
      setData({ error: true });
    }
  }, [slug]);

  const triggerGift = () => {
    setStage('gift');
    
    // 1. Kembang Api
    if (data?.giftType === 'kembangApi') {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
    // 2. Hujan Bintang
    else if (data?.giftType === 'bintang') {
      const defaults = { spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, shapes: ['star'], colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'] };
      const shoot = () => {
        confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] });
        confetti({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ['circle'] });
      };
      setTimeout(shoot, 0);
      setTimeout(shoot, 100);
      setTimeout(shoot, 200);
    }
    // 3. Bunga Berguguran (Dari Atas)
    else if (data?.giftType === 'bunga') {
      const emojis = ['🌸', '🌺', '🌻', '🌹', '🌷'];
      const newFlowers = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      }));
      setFallingFlowers(newFlowers);
    }
    // 4. Taman Bunga Vektor Tumbuh (Dari Bawah + Spotlight Gelap)
    else if (data?.giftType === 'bungaTumbuh') {
      const newFlowers = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: (i * 5) + (Math.random() * 3),
        delay: Math.random() * 1.2,
        type: i % 2 === 0 ? 'tulip' as const : 'blossom' as const,
        size: Math.random() * 40 + 110
      }));
      setGrowingFlowers(newFlowers);
    }
    // 5. Default Confetti
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

  return (
    <main className={`min-h-screen ${isDarkScene ? 'bg-black' : activeTheme.bg} flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-1000 py-12`}>
      
      {/* EFEK CAHAYA (SPOTLIGHT) KHUSUS BUNGA TUMBUH */}
      <AnimatePresence>
        {isDarkScene && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 2.5, delay: 0.5 }}
            className="fixed bottom-0 left-0 w-full h-[85vh] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-yellow-100/35 via-amber-900/10 to-transparent pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      {/* RENDER EFEK BUNGA BERGUGURAN DARI ATAS */}
      {stage === 'gift' && data.giftType === 'bunga' && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {fallingFlowers.map((flower) => (
            <motion.div key={flower.id} className="absolute text-4xl" initial={{ left: `${flower.x}%`, top: '-10%', opacity: 1, rotate: 0 }} animate={{ top: '110%', opacity: 0, rotate: 360 }} transition={{ duration: Math.random() * 3 + 3, delay: Math.random() * 2, repeat: Infinity }}>
              {flower.emoji}
            </motion.div>
          ))}
        </div>
      )}

      {/* RENDER GRAFIK BUNGA TUMBUH DARI BAWAH */}
      {isDarkScene && (
        <div className="fixed bottom-0 left-0 w-full h-full pointer-events-none z-10">
          {growingFlowers.map((flower) => (
            <motion.div 
              key={flower.id}
              className="absolute origin-bottom drop-shadow-2xl"
              style={{ 
                left: `${flower.x}%`, 
                bottom: '-15px', 
                width: `${flower.size}px`, 
                height: `${flower.size * 1.4}px` 
              }}
              initial={{ y: 250, opacity: 0, scale: 0.2, filter: 'brightness(0.3)' }} 
              animate={{ y: -(Math.random() * 30 + 10), opacity: 1, scale: 1, filter: 'brightness(1.15)' }} 
              transition={{ duration: 2, delay: flower.delay, type: 'spring', bounce: 0.35 }}
            >
              {flower.type === 'tulip' ? <TulipVector className="w-full h-full" /> : <BlossomVector className="w-full h-full" />}
            </motion.div>
          ))}
        </div>
      )}

      {/* TAHAP 1: AMPLOP */}
      <AnimatePresence>
        {stage === 'envelope' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0, y: -50 }} className="flex flex-col items-center cursor-pointer z-20" onClick={() => setStage('letter')}>
            <div className={`w-64 h-48 ${activeTheme.envelope} rounded-lg shadow-xl relative flex items-center justify-center`}>
              <MailOpen className="w-12 h-12 text-black/20" />
            </div>
            <p className="mt-8 font-serif text-lg text-gray-700 text-center">Buka Suratnya</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAHAP 2: SURAT */}
      <AnimatePresence>
        {stage === 'letter' && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="max-w-xl w-full bg-white p-8 rounded-lg shadow-2xl z-20">
            <h1 className="font-serif text-3xl italic mb-6">Untuk {data.receiver},</h1>
            <p className="font-serif text-lg leading-relaxed text-gray-700">{data.content}</p>
            <motion.button onClick={triggerGift} className="mt-10 w-full bg-[#f4ebd9] text-[#8a795d] py-3 rounded-md font-medium hover:bg-[#e8dcc7] transition-colors">
              <Gift className="w-5 h-5 mr-2 inline" /> Buka Hadiah Virtual
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAHAP 3: KARTU HADIAH & TOMBOL ULANGI */}
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
    </main>
  );
}