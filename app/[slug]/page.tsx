'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MailOpen, Gift, RefreshCcw, Droplet, Ribbon, Flower2, Stamp, Key, Feather, Sparkles, Heart, Paperclip, Star, Smile, Lock, Music, Play, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabase';

// TEMA DENGAN ACCENT COLOR
const themes = {
  dalkomBlue: { bg: '#FCF1DD', envelope: '#2945A8', text: 'text-[#2945A8]', accent: '#F08D75' },
  matchaPink: { bg: '#FADADD', envelope: '#7C9D70', text: 'text-[#7C9D70]', accent: '#F2D1C9' },
  lilacBubblegum: { bg: '#FFC0CB', envelope: '#C8A2C8', text: 'text-[#C8A2C8]', accent: '#87CEFA' },
  scrapbookBlue: { bg: '#F2E8D9', envelope: '#5A80A6', text: 'text-[#5A80A6]', accent: '#E67784' },
  dustyNavy: { bg: '#DDAEB2', envelope: '#1A2E46', text: 'text-[#1A2E46]', accent: '#E3C1B4' },
  oliveGold: { bg: '#DDB24A', envelope: '#595F37', text: 'text-[#595F37]', accent: '#F2E8D9' },
  plumCream: { bg: '#F3E6D6', envelope: '#4F2C3A', text: 'text-[#4F2C3A]', accent: '#DDAEB2' },
  orangeTeal: { bg: '#245D63', envelope: '#CA5B31', text: 'text-[#CA5B31]', accent: '#F3E6D6' },
  forestSand: { bg: '#EAE1CC', envelope: '#1D5139', text: 'text-[#1D5139]', accent: '#DDB24A' },
  burgundyGold: { bg: '#D3A95B', envelope: '#6C1226', text: 'text-[#6C1226]', accent: '#F2E8D9' },
  turquoiseCoral: { bg: '#F27E6A', envelope: '#007F86', text: 'text-[#007F86]', accent: '#F2E8D9' },
  lavenderSlate: { bg: '#585966', envelope: '#C1A8C5', text: 'text-[#C1A8C5]', accent: '#F3E6D6' },
  deepGreenBlush: { bg: '#F1CAD0', envelope: '#0B4A31', text: 'text-[#0B4A31]', accent: '#FFFFFF' },
};

// DETEKSI URL MUSIK MULTI-PLATFORM
const getEmbedData = (url: string) => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|music\.youtube\.com\/(?:watch\?v=|embed\/))([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) return { type: 'youtube', url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` };
  
  const spotMatch = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
  if (spotMatch && spotMatch[1] && spotMatch[2]) return { type: 'spotify', url: `https://open.spotify.com/embed/${spotMatch[1]}/${spotMatch[2]}?utm_source=generator` };
  
  if (url.includes('music.apple.com')) {
    const embedUrl = url.replace('music.apple.com', 'embed.music.apple.com');
    return { type: 'apple', url: embedUrl };
  }
  return null;
};

// KOMPONEN ORNAMEN SCRAPBOOK
const WavyBottom = ({ accentColor }: { accentColor: string }) => (
  <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
    <svg className="relative block w-[calc(100%+1.3px)] h-[35px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill={accentColor}></path>
    </svg>
  </div>
);

const CutoutText = ({ text }: { text: string }) => {
  const blockColors = ['bg-[#E67784]', 'bg-[#6D9F71]', 'bg-[#F0C05A]', 'bg-[#5A80A6]', 'bg-[#CA5B31]'];
  return (
    <div className="flex flex-wrap justify-center gap-1 mb-6">
      {text.split('').map((char, i) => (
        char.trim() === '' ? <span key={i} className="w-3"></span> :
        <span key={i} className={`${blockColors[i % blockColors.length]} text-white font-bold text-xl px-2 py-0.5 transform ${i%2===0 ? 'rotate-3' : '-rotate-6'} shadow-sm`}>
          {char.toUpperCase()}
        </span>
      ))}
    </div>
  )
};

const CardDoodles = () => (
  <>
    <Star className="absolute top-4 left-4 w-5 h-5 text-yellow-400 rotate-12 opacity-80" />
    <Smile className="absolute top-6 right-6 w-6 h-6 text-yellow-500 -rotate-12 opacity-70" />
  </>
);

function TulipVector({ className }: { className?: string }) { return (<svg viewBox="0 0 100 180" className={className} fill="none"><path d="M50 180 C50 140 48 100 50 70" stroke="#4A7C39" strokeWidth="4" strokeLinecap="round"/><path d="M50 140 C30 130 10 110 5 90 C15 110 35 125 50 140" fill="#5D9B47"/><path d="M50 120 C65 110 85 95 90 75 C80 95 65 110 50 120" fill="#7C9D70"/><path d="M50 70 C30 65 25 35 40 20 C45 15 50 25 50 35 C50 45 45 60 50 70" fill="#FFB6C1"/></svg>); }
function BlossomVector({ className }: { className?: string }) { return (<svg viewBox="0 0 120 120" className={className} fill="none"><path d="M60 120 C60 100 58 80 60 70" stroke="#5D9B47" strokeWidth="3" strokeLinecap="round"/><circle cx="60" cy="45" r="22" fill="#FFC0CB" /><circle cx="40" cy="60" r="22" fill="#FFB6C1" /><circle cx="80" cy="60" r="22" fill="#FFB6C1" /><circle cx="48" cy="80" r="22" fill="#FFC0CB" /><circle cx="72" cy="80" r="22" fill="#FFC0CB" /><circle cx="60" cy="62" r="8" fill="#FFD700" /></svg>); }

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
  const [fallingFlowers, setFallingFlowers] = useState<{id: number, emoji: string, x: number, delay: number}[]>([]);
  const [growingFlowers, setGrowingFlowers] = useState<{id: number, type: string, x: number, delay: number, size: number}[]>([]);

  useEffect(() => {
    async function fetchLetter() {
      const { data: dbData, error } = await supabase.from('letters').select('*').eq('slug', slug).single();
      if (error || !dbData) {
        setData({ error: true });
        setLoadingScreen(false);
      } else {
        setData({
          sender: dbData.sender, receiver: dbData.receiver, 
          content: dbData.content, theme: dbData.theme, accessory: dbData.accessory, 
          giftType: dbData.gift_type, giftMessage: dbData.gift_message,
          photos: dbData.photos || [], photoLayout: dbData.photo_layout || 'polaroid',
          wallMessages: dbData.wall_messages || [],
          pin: dbData.pin,
          playlist: dbData.playlist
        });

        if (dbData.playlist && dbData.playlist.tracks && dbData.playlist.tracks.length > 0) {
          setEmbed(getEmbedData(dbData.playlist.tracks[0].url));
        } else if (dbData.music_link) {
          setEmbed(getEmbedData(dbData.music_link));
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
      const duration = 5 * 1000; const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        confetti({ ...defaults, particleCount: 50 * (timeLeft / duration), origin: { x: Math.random(), y: Math.random() - 0.2 } });
      }, 250);
    } else if (data?.giftType === 'bintang') {
      const defaults = { spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'] };
      const shoot = () => { confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] }); };
      setTimeout(shoot, 0); setTimeout(shoot, 100); setTimeout(shoot, 200);
    } else if (data?.giftType === 'bunga') {
      const emojis = ['🌸', '🌺', '🌻', '🌹', '🌷'];
      setFallingFlowers(Array.from({ length: 30 }).map((_, i) => ({ id: i, emoji: emojis[Math.floor(Math.random() * emojis.length)], x: Math.random() * 100, delay: Math.random() * 5 })));
    } else if (data?.giftType === 'bungaTumbuh') {
      setGrowingFlowers(Array.from({ length: 20 }).map((_, i) => ({ id: i, x: (i * 5) + (Math.random() * 3), type: i % 2 === 0 ? 'tulip' : 'blossom', delay: Math.random() * 2, size: Math.random() * 0.5 + 0.5 })));
    } else {
      const end = Date.now() + 3000; const frame = () => { confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff0000', '#00ff00', '#0000ff'] }); confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff0000', '#00ff00', '#0000ff'] }); if (Date.now() < end) requestAnimationFrame(frame); }; frame();
    }
  };

  const resetSurprise = () => { setStage('envelope'); setFallingFlowers([]); setGrowingFlowers([]); };

  if (data?.error) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl font-serif text-gray-500">Ups, surat tidak ditemukan 🥀</p></div>;
  if (!data) return null;

  const activeTheme = themes[data.theme as keyof typeof themes];
  const isDarkScene = stage === 'gift' && data.giftType === 'kembangApi';
  const paragraphs = data.content ? data.content.split('\n') : [];

  return (
    <main 
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-700 pb-32`}
      style={!isDarkScene ? { backgroundColor: activeTheme.bg } : undefined}
    >
      <AnimatePresence mode="wait">
        
        {loadingScreen && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ backgroundColor: activeTheme.bg }}>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
               <Heart className="w-16 h-16 text-pink-500 fill-pink-500 mb-4" />
            </motion.div>
            <p className="font-serif text-gray-700 text-lg animate-pulse">Merangkai kenangan...</p>
          </motion.div>
        )}

        {!loadingScreen && isLocked && (
          <motion.div key="lock" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="z-40 p-6 max-w-sm w-full mx-4 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl text-center relative overflow-hidden border border-white">
             <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-pink-500" />
             </div>
             <h2 className="font-serif text-2xl text-gray-800 mb-2">Surat Terkunci</h2>
             <p className="text-gray-500 text-sm mb-6">Masukkan PIN rahasia dari pengirim untuk membuka surat ini.</p>
             <form onSubmit={handlePinSubmit}>
               <motion.input animate={pinError ? { x: [-10, 10, -10, 10, 0] } : {}} type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} placeholder="• • • • •" className={`w-full text-center tracking-[1em] font-bold text-xl p-4 rounded-xl border-2 mb-4 focus:outline-none ${pinError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-pink-400'}`} />
               <button type="submit" className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition-colors">Buka Kunci</button>
             </form>
          </motion.div>
        )}

        {!loadingScreen && !isLocked && (
          <motion.div key="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col items-center justify-center">
            
            {isDarkScene && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,1) 80%)' }} />}
            {stage === 'gift' && data.giftType === 'bunga' && (<div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">{fallingFlowers.map((flower) => (<motion.div key={flower.id} className="absolute text-3xl" initial={{ top: -50, left: `${flower.x}%`, rotate: 0 }} animate={{ top: '120vh', rotate: 360 }} transition={{ duration: 5 + Math.random() * 5, delay: flower.delay, repeat: Infinity, ease: 'linear' }}>{flower.emoji}</motion.div>))}</div>)}
            {isDarkScene && (<div className="fixed bottom-0 left-0 w-full h-full pointer-events-none z-10 overflow-hidden flex items-end">{growingFlowers.map((flower) => (<motion.div key={flower.id} className="absolute bottom-0 origin-bottom" style={{ left: `${flower.x}%` }} initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: flower.size, opacity: 1 }} transition={{ duration: 3, delay: flower.delay, ease: 'easeOut' }}>{flower.type === 'tulip' ? <TulipVector className="w-16 h-32 md:w-20 md:h-40" /> : <BlossomVector className="w-20 h-20 md:w-24 md:h-24" />}</motion.div>))}</div>)}

            {/* TAHAP 1: AMPLOP */}
            <AnimatePresence>
              {stage === 'envelope' && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ y: -100, opacity: 0, scale: 0.8 }} className="cursor-pointer text-center relative z-20 flex flex-col items-center group" onClick={() => setStage('letter')}>
                  <div className="w-64 h-44 sm:w-72 sm:h-52 rounded-xl shadow-2xl relative overflow-hidden flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300" style={{ backgroundColor: activeTheme.envelope }}>
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white/40">
                      {data.accessory === 'waxseal' && <Droplet className="w-6 h-6 fill-red-800 text-red-900" />}
                      {data.accessory === 'pita' && <Ribbon className="w-8 h-8 text-pink-300" />}
                      {data.accessory === 'bunga' && <Flower2 className="w-8 h-8 text-yellow-100" />}
                      {data.accessory === 'prangko' && <Stamp className="w-8 h-8 text-white/50" />}
                      {data.accessory === 'kunci' && <Key className="w-8 h-8 text-yellow-600" />}
                      {data.accessory === 'feather' && <Feather className="w-8 h-8 text-white" />}
                      {data.accessory === 'sparkles' && <Sparkles className="w-8 h-8 text-yellow-300" />}
                      {data.accessory === 'heart' && <Heart className="w-8 h-8 fill-red-500 text-red-500" />}
                      {data.accessory === 'paperclip' && <Paperclip className="w-8 h-8 text-gray-300" />}
                    </div>
                    <WavyBottom accentColor={activeTheme.accent} />
                    <MailOpen className={`w-10 h-10 sm:w-14 sm:h-14 ${activeTheme.text} opacity-50 relative z-10`} />
                  </div>
                  <p className={`mt-6 sm:mt-8 font-serif text-base sm:text-lg animate-pulse ${activeTheme.text} font-medium tracking-wide`}>Ketuk amplop untuk membuka 💌</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAHAP 2: SCRAPBOOK CARDS (LENGKAP DENGAN PLAYLIST) */}
            <AnimatePresence>
              {stage === 'letter' && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-lg mx-4 md:mx-0 space-y-6 relative z-20">
                  
                  <div id="surat-content" className="space-y-6 pb-6 pt-4 px-3 rounded-3xl" style={{ backgroundColor: activeTheme.bg }}>
                      
                      {/* KARTU 1: ISI SURAT UTAMA */}
                      <div className="relative p-6 md:p-10 rounded-2xl shadow-xl overflow-hidden border border-black/5" style={{ backgroundColor: activeTheme.envelope }}>
                        <CardDoodles />
                        <CutoutText text={`UNTUK ${data.receiver}`} />
                        
                        <div className="relative z-10 space-y-4">
                          {paragraphs.map((para: string, i: number) => (
                            <div key={i}>
                              <p className="font-serif text-base md:text-lg leading-relaxed whitespace-pre-wrap text-white font-medium drop-shadow-md">{para}</p>
                              {data.photoLayout === 'inline' && data.photos[i] && (
                                <div className="mt-4 mx-auto bg-white p-2 pb-6 shadow-md border border-gray-100 w-48 text-center">
                                  <img src={data.photos[i]} alt="Kenangan" crossOrigin="anonymous" className="w-full h-auto aspect-square object-cover" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <WavyBottom accentColor={activeTheme.accent} />
                      </div>

                      {/* KARTU 2: GALERI FOTO */}
                      {data.photos && data.photos.length > 0 && data.photoLayout !== 'inline' && (
                        <div className="relative p-6 md:p-10 rounded-2xl shadow-xl overflow-hidden border border-black/5 text-center" style={{ backgroundColor: activeTheme.envelope }}>
                          <CardDoodles />
                          <CutoutText text="MEMORIES" />
                          <div className="relative z-10 flex flex-col items-center gap-4">
                            {data.photos.map((src: string, i: number) => (
                              <div key={i} className="bg-white p-2 pb-6 shadow-md border border-gray-100 w-40 sm:w-48">
                                <img src={src} alt="Foto" crossOrigin="anonymous" className="w-full aspect-square object-cover" />
                              </div>
                            ))}
                          </div>
                          <WavyBottom accentColor={activeTheme.accent} />
                        </div>
                      )}

                      {/* KARTU 3: PLAYLIST MUSIK (YANG SEBELUMNYA KETINGGALAN) */}
                      {data.playlist && data.playlist.tracks && data.playlist.tracks.length > 0 && (
                        <div className="relative p-6 md:p-8 rounded-2xl shadow-xl overflow-hidden border border-black/5" style={{ backgroundColor: activeTheme.envelope }}>
                          <CardDoodles />
                          <CutoutText text="PLAYLIST" />
                          <div className="relative z-10">
                            <h4 className="text-white text-center font-serif text-xl mb-4 opacity-90">{data.playlist.name}</h4>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 space-y-2">
                              {data.playlist.tracks.map((track: any, i: number) => (
                                <div key={i} onClick={() => playTrack(i)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${currentTrackIndex === i ? 'bg-white/30 shadow-sm scale-[1.02]' : 'hover:bg-white/20'}`}>
                                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    {currentTrackIndex === i ? <Music className="w-4 h-4 text-white animate-bounce" /> : <Play className="w-4 h-4 text-white opacity-70" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-sm truncate">{track.title || `Track ${i+1}`}</p>
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
                        <div className="relative p-6 md:p-10 rounded-2xl shadow-xl overflow-hidden border border-black/5" style={{ backgroundColor: activeTheme.envelope }}>
                          <CardDoodles />
                          <CutoutText text="FACTS" />
                          <div className="relative z-10 space-y-4">
                            {data.wallMessages.map((msg: any, i: number) => (
                              <div key={i} className="bg-white p-4 shadow-sm border border-gray-100 rounded-xl">
                                <p className="text-gray-700 font-serif text-sm md:text-base leading-relaxed mb-1">"{msg.message}"</p>
                                <p className="font-bold text-xs text-right text-gray-500">— {msg.name}</p>
                              </div>
                            ))}
                          </div>
                          <WavyBottom accentColor={activeTheme.accent} />
                        </div>
                      )}

                      {/* KARTU 5: PENGIRIM */}
                      <div className="relative p-6 md:p-8 rounded-2xl shadow-xl overflow-hidden text-center border border-black/5" style={{ backgroundColor: activeTheme.envelope }}>
                        <p className="font-serif text-sm text-white/80 uppercase tracking-widest mb-1">Tertanda,</p>
                        <p className="font-serif text-2xl font-black text-white tracking-wide drop-shadow-md">{data.sender}</p>
                        <WavyBottom accentColor={activeTheme.accent} />
                      </div>
                  </div>
                  
                  {/* TOMBOL AKSI LUAR KARTU */}
                  <div className="flex flex-col gap-3 px-2">
                    <motion.button onClick={triggerGift} className="w-full bg-white/90 backdrop-blur text-gray-800 font-bold py-4 rounded-xl shadow-lg border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 hover:bg-white transition-all">
                      <Gift className="w-5 h-5 text-pink-500 mr-2 inline" /> Buka Kejutan Hadiah!
                    </motion.button>

                    <button onClick={downloadSurat} disabled={isDownloading} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-white/50 hover:bg-white/80 py-3 rounded-xl transition-colors">
                      {isDownloading ? <RefreshCcw className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
                      {isDownloading ? 'Menyimpan...' : 'Simpan Kenangan (Gambar)'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAHAP 3: KARTU HADIAH */}
            <AnimatePresence>
              {stage === 'gift' && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2 }} className="w-full max-w-md mx-4 md:mx-0 relative p-8 md:p-12 rounded-3xl shadow-2xl text-center border border-black/10 overflow-hidden z-20" style={{ backgroundColor: activeTheme.envelope }}>
                  <CardDoodles />
                  <CutoutText text="SURPRISE" />
                  <div className="relative z-10 flex flex-col items-center mt-4">
                    <p className="font-serif text-lg md:text-xl italic text-white drop-shadow-md font-medium mb-12">
                      "{data.giftMessage || "Kejutan manis untuk hari spesialmu!"}"
                    </p>
                    <button onClick={resetSurprise} className="mx-auto flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full font-medium transition-colors text-sm backdrop-blur-sm border border-white/20">
                      <RefreshCcw className="w-4 h-4" /> Ulangi Kejutan
                    </button>
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
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white p-2 rounded-2xl shadow-2xl z-50 flex items-center border border-gray-100">
          <Music className="w-4 h-4 text-gray-400 mx-2 shrink-0 hidden sm:block" />
          <iframe 
            src={embed.url} 
            width="100%"
            height={embed.type === 'apple' ? "150" : "80"} 
            frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy" 
            className="rounded-xl w-full" 
          />
        </motion.div>
      )}
    </main>
  );
}