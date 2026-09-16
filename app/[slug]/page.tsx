'use client';
import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MailOpen, Gift, RefreshCcw, Droplet, Ribbon, Flower2, Stamp, Key, Feather, Sparkles, Heart, Paperclip, Music, Smile, Star, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabase';

// TEMA DENGAN ACCENT COLOR
const themes = {
  dalkomBlue: { bg: '#FCF1DD', envelope: '#2945A8', text: 'text-white', accent: '#F78660' },
  matchaPink: { bg: '#FADADD', envelope: '#7C9D70', text: 'text-white', accent: '#FDF5C9' },
  lilacBubblegum: { bg: '#FFC0CB', envelope: '#C8A2C8', text: 'text-white', accent: '#FFF0F5' },
  scrapbookBlue: { bg: '#F2E8D9', envelope: '#5A80A6', text: 'text-white', accent: '#F29CB0' },
  dustyNavy: { bg: '#DDAEB2', envelope: '#1A2E46', text: 'text-white', accent: '#DDB24A' },
  oliveGold: { bg: '#DDB24A', envelope: '#595F37', text: 'text-white', accent: '#F3E6D6' },
  plumCream: { bg: '#F3E6D6', envelope: '#4F2C3A', text: 'text-white', accent: '#DDAEB2' },
  orangeTeal: { bg: '#245D63', envelope: '#CA5B31', text: 'text-white', accent: '#EAE1CC' },
  forestSand: { bg: '#EAE1CC', envelope: '#1D5139', text: 'text-white', accent: '#D3A95B' },
  burgundyGold: { bg: '#D3A95B', envelope: '#6C1226', text: 'text-white', accent: '#F2E8D9' },
  turquoiseCoral: { bg: '#F27E6A', envelope: '#007F86', text: 'text-white', accent: '#F2E8D9' },
  lavenderSlate: { bg: '#585966', envelope: '#C1A8C5', text: 'text-gray-900', accent: '#DDAEB2' },
  deepGreenBlush: { bg: '#F1CAD0', envelope: '#0B4A31', text: 'text-white', accent: '#F2E8D9' },
};

// DETEKSI URL MUSIK MULTI-PLATFORM
const getEmbedData = (url: string) => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) return { type: 'youtube', url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` };
  const spotMatch = url.match(/spotify\.com\/(track|playlist)\/([a-zA-Z0-9]+)/);
  if (spotMatch && spotMatch[1] && spotMatch[2]) return { type: 'spotify', url: `https://open.spotify.com/embed/${spotMatch[1]}/${spotMatch[2]}` };
  if (url.includes('music.apple.com')) {
    const embedUrl = url.replace('music.apple.com', 'embed.music.apple.com');
    return { type: 'apple', url: embedUrl };
  }
  return null;
};

// KOMPONEN ORNAMEN SCRAPBOOK
const WavyBottom = ({ accentColor }: { accentColor: string }) => (
  <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
    <svg className="relative block w-[calc(100%+1.3px)] h-[35px] md:h-[50px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.83,121.22,200.1,110.73,242.4,104.3,283.47,82.52,321.39,56.44Z" fill={accentColor} opacity="0.8"></path>
      <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" fill="#ffffff" opacity="0.95"></path>
    </svg>
  </div>
);

const CutoutText = ({ text }: { text: string }) => {
  const blockColors = ['bg-[#E67784]', 'bg-[#6D9F71]', 'bg-[#DFB063]', 'bg-[#6285A6]', 'bg-[#9878A3]', 'bg-[#D68A59]'];
  return (
    <div className="flex flex-wrap justify-center gap-1 mb-6 z-10 relative">
      {text.split('').map((char, i) => (
         char.trim() === '' ? <span key={i} className="w-3"></span> :
         <span key={i} className={`${blockColors[i % blockColors.length]} text-white font-black text-lg md:text-xl px-2.5 py-1 rounded-sm shadow-md transform ${i % 2 === 0 ? 'rotate-[4deg]' : '-rotate-[5deg]'}`}>
           {char.toUpperCase()}
         </span>
      ))}
    </div>
  )
};

const CardDoodles = () => (
  <>
    <Star className="absolute top-4 left-4 w-5 h-5 text-yellow-300 fill-yellow-300 opacity-90 rotate-12" />
    <Smile className="absolute top-6 right-6 w-6 h-6 text-yellow-400 fill-yellow-100 opacity-90 -rotate-12" />
    <div className="absolute bottom-16 right-6 text-xl opacity-70 text-white/50 font-bold rotate-12">#</div>
    <div className="absolute top-1/2 left-3 text-xl opacity-70 text-white/40 -rotate-90">〰️</div>
  </>
);

function TulipVector({ className }: { className?: string }) { return (<svg viewBox="0 0 100 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 180 C50 140 48 100 50 70" stroke="#4A7C39" strokeWidth="4" strokeLinecap="round" /><path d="M50 140 C30 130 10 110 5 90 C15 110 35 125 50 140 Z" fill="#5D9B47" /><path d="M50 120 C65 110 85 95 90 75 C80 95 65 110 50 120 Z" fill="#4A7C39" /><path d="M50 70 C30 65 25 35 40 20 C45 15 50 25 50 35 C50 25 55 15 60 20 C75 35 70 65 50 70 Z" fill="#FFB7C5" /><path d="M50 70 C38 60 35 38 45 25 C48 20 50 30 50 40 C50 30 52 20 55 25 C65 38 62 60 50 70 Z" fill="#FFA1B2" /></svg>); }
function BlossomVector({ className }: { className?: string }) { return (<svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M60 120 C60 100 58 80 60 70" stroke="#5D9B47" strokeWidth="4" strokeLinecap="round" /><circle cx="60" cy="45" r="22" fill="#FFC0CB" /><circle cx="40" cy="60" r="22" fill="#FFB6C1" /><circle cx="80" cy="60" r="22" fill="#FFB6C1" /><circle cx="48" cy="80" r="22" fill="#FFC0CB" /><circle cx="72" cy="80" r="22" fill="#FFC0CB" /><circle cx="60" cy="62" r="8" fill="#FFD700" /><circle cx="55" cy="58" r="2" fill="#FF69B4" /><circle cx="65" cy="58" r="2" fill="#FF69B4" /><circle cx="60" cy="68" r="2" fill="#FF69B4" /></svg>); }

export default function LetterPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [data, setData] = useState<any>(null);
  
  const [loadingScreen, setLoadingScreen] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [stage, setStage] = useState<'envelope' | 'letter' | 'gift'>('envelope');
  const [embed, setEmbed] = useState<{type: string, url: string} | null>(null);
  const [fallingFlowers, setFallingFlowers] = useState<{id: number, x: number, emoji: string}[]>([]);
  const [growingFlowers, setGrowingFlowers] = useState<{id: number, x: number, delay: number, type: 'tulip' | 'blossom', size: number}[]>([]);

  useEffect(() => {
    async function fetchLetter() {
      const { data: dbData, error } = await supabase.from('letters').select('*').eq('slug', slug).single();
      if (error || !dbData) {
        setData({ error: true });
        setLoadingScreen(false);
      } else {
        setData({
          sender: dbData.sender, receiver: dbData.receiver, content: dbData.content,
          theme: dbData.theme, accessory: dbData.accessory, giftType: dbData.gift_type,
          giftMessage: dbData.gift_message, photos: dbData.photos || [], photoLayout: dbData.photo_layout || 'polaroid',
          wallMessages: dbData.wall_messages || [], pin: dbData.pin, playlist: dbData.playlist,
          opened_at: dbData.opened_at // History buka
        });
        if (dbData.playlist && dbData.playlist.tracks && dbData.playlist.tracks.length > 0) {
          setEmbed(getEmbedData(dbData.playlist.tracks[0].url));
        }
        if (dbData.pin) setIsLocked(true);
        setTimeout(() => setLoadingScreen(false), 2000);
      }
    }
    fetchLetter();
  }, [slug]);

  const playTrack = (index: number) => {
    if (data?.playlist?.tracks?.[index]) {
      setCurrentTrackIndex(index);
      setEmbed(getEmbedData(data.playlist.tracks[index].url));
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === data.pin) {
      setIsLocked(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1000);
    }
  };

  // UPDATE READ RECEIPT KE SUPABASE
  const openEnvelope = async () => {
    setStage('letter');
    if (!data.opened_at) {
      await supabase.from('letters').update({ opened_at: new Date().toISOString() }).eq('slug', slug);
    }
  };

  const downloadSurat = async () => {
    setIsDownloading(true);
    const element = document.getElementById('surat-content');
    if (!element) {
      alert("Area surat tidak ditemukan.");
      setIsDownloading(false);
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 2, 
        backgroundColor: themes[data.theme as keyof typeof themes].bg
      });
      const link = document.createElement('a');
      link.download = `Surat-Kejutan-${data.receiver}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error(err);
      alert("Oops! Gagal menyimpan gambar.");
    }
    setIsDownloading(false);
  };

  const triggerGift = () => {
    setStage('gift');
    if (data?.giftType === 'kembangApi') {
      const duration = 5 * 1000; const animationEnd = Date.now() + duration; const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        confetti({ ...defaults, particleCount: 50 * (timeLeft / duration), origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount: 50 * (timeLeft / duration), origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 } });
      }, 250);
    } else if (data?.giftType === 'bintang') {
      const defaults = { spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, shapes: ['star'], colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'] };
      const shoot = () => { confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] }); confetti({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ['circle'] }); };
      setTimeout(shoot, 0); setTimeout(shoot, 100); setTimeout(shoot, 200);
    } else if (data?.giftType === 'bunga') {
      const emojis = ['🌸', '🌺', '🌻', '🌹', '🌷'];
      setFallingFlowers(Array.from({ length: 30 }).map((_, i) => ({ id: i, x: Math.random() * 100, emoji: emojis[Math.floor(Math.random() * emojis.length)] })));
    } else if (data?.giftType === 'bungaTumbuh') {
      setGrowingFlowers(Array.from({ length: 20 }).map((_, i) => ({ id: i, x: (i * 5) + (Math.random() * 3), delay: Math.random() * 1.2, type: i % 2 === 0 ? 'tulip' : 'blossom', size: Math.random() * 30 + 90 })));
    } else {
      const end = Date.now() + 3000; const frame = () => { confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } }); confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } }); if (Date.now() < end) requestAnimationFrame(frame); }; frame();
    }
  };

  const resetSurprise = () => { setStage('envelope'); setFallingFlowers([]); setGrowingFlowers([]); };

  if (data?.error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl font-serif">Surat tidak ditemukan.</div>;
  if (!data) return null;

  const activeTheme = themes[data.theme as keyof typeof themes] || themes.scrapbookBlue;
  const isDarkScene = stage === 'gift' && data.giftType === 'bungaTumbuh';
  const paragraphs = data.content ? data.content.split('\n').filter((p: string) => p.trim() !== '') : [];

  return (
    <main 
      className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-x-hidden transition-colors duration-1000 py-10 md:py-16 pb-32 md:pb-24 ${isDarkScene ? 'bg-black' : ''}`}
      style={!isDarkScene ? { backgroundColor: activeTheme.bg } : {}}
    >
      
      <AnimatePresence mode="wait">
        {/* LAYAR 1: LOADING SCREEN */}
        {loadingScreen && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center z-50">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
              <Heart className="w-16 h-16 text-pink-500 fill-pink-500" />
            </motion.div>
            <p className="font-serif text-gray-700 text-lg animate-pulse mt-4">Menyiapkan kejutan...</p>
          </motion.div>
        )}

        {/* LAYAR 2: PIN LOCK SCREEN */}
        {!loadingScreen && isLocked && (
          <motion.div key="lock" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border-2 border-white/50 z-40">
            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-pink-500" />
            </div>
            <h2 className="font-serif text-2xl text-gray-800 font-bold mb-2">Surat Terkunci</h2>
            <p className="text-gray-500 text-sm mb-6">Masukkan PIN rahasia untuk membuka.</p>
            <form onSubmit={handlePinSubmit}>
              <motion.input animate={pinError ? { x: [-10, 10, -10, 10, 0], borderColor: ['#fecaca', '#ef4444', '#fecaca'] } : {}} type="password" placeholder="••••" className="w-full text-center tracking-widest text-2xl p-4 bg-gray-50 border border-gray-200 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-pink-500" value={pinInput} onChange={e => setPinInput(e.target.value)} />
              <button type="submit" className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg">Buka Gembok</button>
            </form>
          </motion.div>
        )}

        {/* LAYAR UTAMA (SETELAH UNLOCK) */}
        {!loadingScreen && !isLocked && (
          <motion.div key="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center">
            
            {/* EFEK HADIAH */}
            {isDarkScene && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5, delay: 0.5 }} className="fixed bottom-0 left-0 w-full h-[85vh] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-yellow-100/35 via-amber-900/10 to-transparent pointer-events-none z-0" />}
            {stage === 'gift' && data.giftType === 'bunga' && (<div className="fixed inset-0 pointer-events-none z-50">{fallingFlowers.map((flower) => (<motion.div key={flower.id} className="absolute text-3xl md:text-4xl" initial={{ left: `${flower.x}%`, top: '-10%', opacity: 1, rotate: 0 }} animate={{ top: '110%', opacity: 0, rotate: 360 }} transition={{ duration: Math.random() * 3 + 3, delay: Math.random() * 2, repeat: Infinity }}>{flower.emoji}</motion.div>))}</div>)}
            {isDarkScene && (<div className="fixed bottom-0 left-0 w-full h-full pointer-events-none z-10">{growingFlowers.map((flower) => (<motion.div key={flower.id} className="absolute origin-bottom drop-shadow-2xl" style={{ left: `${flower.x}%`, bottom: '-15px', width: `${flower.size}px`, height: `${flower.size * 1.4}px` }} initial={{ y: 250, opacity: 0, scale: 0.2, filter: 'brightness(0.3)' }} animate={{ y: -(Math.random() * 30 + 10), opacity: 1, scale: 1, filter: 'brightness(1.15)' }} transition={{ duration: 2, delay: flower.delay, type: 'spring', bounce: 0.35 }}>{flower.type === 'tulip' ? <TulipVector className="w-full h-full" /> : <BlossomVector className="w-full h-full" />}</motion.div>))}</div>)}

            {/* TAHAP 1: AMPLOP */}
            <AnimatePresence>
              {stage === 'envelope' && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0, y: -50 }} className="flex flex-col items-center cursor-pointer z-20" onClick={openEnvelope}>
                  <div className="w-64 h-44 sm:w-72 sm:h-52 rounded-xl shadow-2xl relative flex items-center justify-center transition-transform hover:scale-105" style={{ backgroundColor: activeTheme.envelope }}>
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-white/60 drop-shadow-md z-10">
                      {data.accessory === 'waxseal' && <Droplet className="w-7 h-7 sm:w-9 sm:h-9 text-red-500/80" fill="currentColor" />}
                      {data.accessory === 'pita' && <Ribbon className="w-7 h-7 sm:w-9 sm:h-9" />}
                      {data.accessory === 'bunga' && <Flower2 className="w-7 h-7 sm:w-9 sm:h-9" />}
                      {data.accessory === 'prangko' && <Stamp className="w-7 h-7 sm:w-9 sm:h-9" />}
                      {data.accessory === 'kunci' && <Key className="w-7 h-7 sm:w-9 sm:h-9 text-yellow-600/80" />}
                      {data.accessory === 'feather' && <Feather className="w-7 h-7 sm:w-9 sm:h-9" />}
                      {data.accessory === 'sparkles' && <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 text-yellow-400" />}
                      {data.accessory === 'heart' && <Heart className="w-7 h-7 sm:w-9 sm:h-9 text-rose-500/80" fill="currentColor" />}
                      {data.accessory === 'paperclip' && <Paperclip className="w-7 h-7 sm:w-9 sm:h-9" />}
                    </div>
                    <WavyBottom accentColor={activeTheme.accent} />
                    <MailOpen className={`w-10 h-10 sm:w-14 sm:h-14 ${activeTheme.text} opacity-40 z-10 relative`} />
                  </div>
                  <p className={`mt-6 sm:mt-8 font-serif text-base sm:text-lg ${activeTheme.text} text-center font-bold animate-pulse mix-blend-difference`}>Ketuk untuk membuka</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAHAP 2: SCRAPBOOK CARDS */}
            <AnimatePresence>
              {stage === 'letter' && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="w-full max-w-2xl z-20 pb-10 flex flex-col items-center">
                  
                  {/* WRAPPER ID="surat-content" UNTUK DOWNLOAD */}
                  <div id="surat-content" className="w-full flex flex-col gap-6 md:gap-8 pb-4">
                    
                    {/* KARTU 1: ISI SURAT UTAMA */}
                    <div className="relative p-6 md:p-10 rounded-2xl shadow-xl overflow-hidden pb-16 md:pb-20 w-full" style={{ backgroundColor: activeTheme.envelope }}>
                      <CardDoodles />
                      <CutoutText text={`UNTUK ${data.receiver}`} />
                      <div className="relative z-10">
                        {paragraphs.map((para: string, i: number) => (
                          <div key={i} className="mb-4">
                            <p className={`font-serif text-base md:text-lg leading-relaxed ${activeTheme.text} opacity-95 text-center drop-shadow-sm`}>{para}</p>
                            {data.photoLayout === 'inline' && data.photos && data.photos[i] && (
                              <div className={`mt-4 mx-auto bg-white p-2 shadow-lg max-w-[200px] transform ${i % 2 === 0 ? 'rotate-2' : '-rotate-3'} z-20 relative`}>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/40 shadow-sm border border-black/10 -rotate-2"></div>
                                <img src={data.photos[i]} crossOrigin="anonymous" alt="Kenangan" className="w-full h-auto object-cover" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <WavyBottom accentColor={activeTheme.accent} />
                    </div>

                    {/* KARTU 2: GALERI FOTO */}
                    {data.photos && data.photos.length > 0 && data.photoLayout !== 'inline' && (
                      <div className="relative p-6 md:p-10 rounded-2xl shadow-xl overflow-hidden pb-16 md:pb-20 w-full" style={{ backgroundColor: activeTheme.envelope }}>
                        <CardDoodles />
                        <CutoutText text="MEMORIES" />
                        <div className="relative z-10 flex flex-col items-center mt-6">
                          {data.photoLayout === 'photobooth' && (
                            <div className="bg-white p-3 shadow-lg rounded-sm w-40 sm:w-48 flex flex-col gap-3 sm:gap-4 rotate-2">
                              {data.photos.map((src: string, i: number) => (<img key={i} src={src} crossOrigin="anonymous" className="w-full aspect-[3/4] object-cover grayscale-[20%] contrast-110" alt="Memori" />))}
                              <p className="font-serif text-center text-[10px] sm:text-xs text-gray-500 mt-2 font-bold tracking-widest uppercase">{data.sender}</p>
                            </div>
                          )}
                          {data.photoLayout === 'polaroid' && (
                            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                              {data.photos.map((src: string, i: number) => (
                                <div key={i} className={`bg-white p-3 pb-8 shadow-xl w-32 sm:w-40 ${i % 2 === 0 ? '-rotate-3' : 'rotate-3'} relative`}>
                                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-4 bg-white/50 shadow-sm border border-black/10 rotate-1"></div>
                                  <img src={src} crossOrigin="anonymous" className="w-full aspect-square object-cover" alt="Memori" />
                                </div>
                              ))}
                            </div>
                          )}
                          {data.photoLayout === 'elegant' && (
                            <div className="flex flex-col gap-5 w-full items-center">
                              {data.photos.map((src: string, i: number) => (
                                <div key={i} className="p-2 bg-[#fdfbf7] border-4 border-[#a89575] shadow-md w-full max-w-[240px] rounded-sm">
                                  <img src={src} crossOrigin="anonymous" className="w-full h-auto object-cover" alt="Memori" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <WavyBottom accentColor={activeTheme.accent} />
                      </div>
                    )}

                    {/* KARTU 3: PLAYLIST MUSIK */}
                    {data.playlist && data.playlist.tracks && data.playlist.tracks.length > 0 && (
                      <div className="relative p-6 md:p-8 rounded-2xl shadow-xl overflow-hidden pb-16 w-full" style={{ backgroundColor: activeTheme.envelope }}>
                        <CardDoodles />
                        <CutoutText text="PLAYLIST" />
                        <div className="relative z-10">
                          <div className="bg-black/10 p-4 rounded-xl flex flex-col gap-2">
                            {data.playlist.tracks.map((track: any, i: number) => (
                              <div key={i} onClick={() => playTrack(i)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${currentTrackIndex === i ? 'bg-black/20' : 'hover:bg-black/10'}`}>
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                  {currentTrackIndex === i ? <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span> : <Music className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-bold text-sm truncate">{track.title || "Lagu"}</p>
                                  {track.artist && <p className="text-white/70 text-xs truncate">{track.artist}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <WavyBottom accentColor={activeTheme.accent} />
                      </div>
                    )}

                    {/* KARTU 4: PESAN TEMAN */}
                    {data.wallMessages && data.wallMessages.length > 0 && (
                      <div className="relative p-6 md:p-10 rounded-2xl shadow-xl overflow-hidden pb-16 md:pb-20 w-full" style={{ backgroundColor: activeTheme.envelope }}>
                        <CardDoodles />
                        <CutoutText text="FACTS" />
                        <div className="relative z-10 flex flex-col gap-3 mt-4">
                          {data.wallMessages.map((msg: any, i: number) => (
                            <div key={i} className={`bg-white/95 p-4 rounded-xl shadow-md transform ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'} border border-white/50`}>
                              <p className="text-gray-700 font-serif italic mb-2 text-sm">"{msg.message}"</p>
                              <p className="font-bold text-xs text-right text-gray-500">✨ {msg.name}</p>
                            </div>
                          ))}
                        </div>
                        <WavyBottom accentColor={activeTheme.accent} />
                      </div>
                    )}

                    {/* KARTU 5: PENGIRIM */}
                    <div className="relative p-6 md:p-10 rounded-2xl shadow-xl overflow-hidden pb-16 md:pb-20 text-center w-full" style={{ backgroundColor: activeTheme.envelope }}>
                       <p className={`font-serif text-sm ${activeTheme.text} opacity-80 mb-1`}>Dari yang tersayang,</p>
                       <p className={`font-serif text-2xl font-black ${activeTheme.text} tracking-widest mb-4`}>{data.sender}</p>
                       <WavyBottom accentColor={activeTheme.accent} />
                    </div>
                  </div>

                  {/* TOMBOL AKSI LUAR KARTU */}
                  <div className="flex flex-col gap-3 w-full px-2 max-w-sm mx-auto">
                    <motion.button onClick={triggerGift} className="w-full px-8 py-4 bg-white text-gray-800 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
                      <Gift className="w-5 h-5 text-pink-500" /> Buka Kejutan
                    </motion.button>
                    <button onClick={downloadSurat} disabled={isDownloading} className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors bg-white/50 backdrop-blur-sm border border-gray-300 px-6 py-3 rounded-full font-bold shadow-sm">
                      {isDownloading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                      {isDownloading ? 'Menyimpan...' : 'Simpan Kenangan'}
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* TAHAP 3: KARTU HADIAH */}
            <AnimatePresence>
              {stage === 'gift' && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2 }} className="w-full max-w-md mx-4 md:mx-0 relative p-6 md:p-10 rounded-2xl shadow-xl overflow-hidden pb-16 md:pb-20 text-center z-30 mt-4 border-4 border-white/40" style={{ backgroundColor: activeTheme.envelope }}>
                  <CardDoodles />
                  <CutoutText text="SURPRISE" />
                  <div className="relative z-10 flex flex-col items-center">
                    <p className={`font-serif text-lg md:text-xl italic ${activeTheme.text} mb-8 drop-shadow-sm font-medium`}>"{data.giftMessage || "Kejutan manis untuk hari spesialmu!"}"</p>
                    <button onClick={resetSurprise} className="mx-auto flex items-center justify-center gap-2 text-sm text-gray-800 transition-transform bg-white px-6 py-3 rounded-full shadow-xl hover:scale-105 active:scale-95 font-bold"><RefreshCcw className="w-4 h-4" /> Ulangi Kejutan</button>
                  </div>
                  <WavyBottom accentColor={activeTheme.accent} />
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

      {/* PEMUTAR MUSIK MULTI-PLATFORM */}
      {embed && stage !== 'envelope' && !loadingScreen && !isLocked && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-50 shadow-2xl bg-white/90 backdrop-blur-md p-2 rounded-2xl flex items-center justify-center w-full max-w-[90vw] md:max-w-[320px] border border-gray-100">
          <Music className="w-4 h-4 text-gray-400 mr-2 absolute left-4 hidden md:block" />
          <iframe src={embed.url} width="100%" height={embed.type === 'apple' ? "150" : "80"} frameBorder="0" allow="autoplay; clipboard-write; encrypted-media" loading="lazy" className="rounded-xl w-full md:ml-6" />
        </motion.div>
      )}
    </main>
  );
}