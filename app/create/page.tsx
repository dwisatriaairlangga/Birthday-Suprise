'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2, ExternalLink, ImagePlus, Plus, Trash2, Eye, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const themes = {
  secretBoxPurple: { name: 'Secret Box (Purple)', bg: '#F8E1E1', preview: '#6A417B', badge: 'Kotak 🎁' },
  sakuraPinkBox: { name: 'Sakura Anime (Kotak)', bg: '#FFF4F7', preview: '#E85D88', badge: 'Kotak 🎁' },
  oceanBlueBox: { name: 'Ocean Nature (Kotak)', bg: '#E3F2FD', preview: '#1565C0', badge: 'Kotak 🎁' },
  sakuraPink: { name: 'Sakura Anime (Surat)', bg: '#FFF4F7', preview: '#E85D88', badge: 'Surat ✉️' },
  oceanBlue: { name: 'Ocean Nature (Surat)', bg: '#E3F2FD', preview: '#1565C0', badge: 'Surat ✉️' },
  dalkomBlue: { name: 'Dalkom (Royal Blue)', bg: '#FCF1DD', preview: '#2945A8', badge: 'Baru ✨' },
  matchaPink: { name: 'Matcha (Green & Pink)', bg: '#FADADD', preview: '#7C9D70', badge: 'Baru ✨' },
  lilacBubblegum: { name: 'MiniMaisy (Lilac)', bg: '#FFC0CB', preview: '#C8A2C8', badge: 'Baru ✨' },
  scrapbookBlue: { name: 'Scrapbook Denim', bg: '#F2E8D9', preview: '#5A80A6', badge: 'Klasik' },
  dustyNavy: { name: 'Dusty Pink & Navy', bg: '#DDAEB2', preview: '#1A2E46', badge: 'Klasik' },
  oliveGold: { name: 'Olive & Gold', bg: '#DDB24A', preview: '#595F37', badge: 'Klasik' },
  plumCream: { name: 'Plum & Cream', bg: '#F3E6D6', preview: '#4F2C3A', badge: 'Klasik' },
  orangeTeal: { name: 'Burnt Orange & Teal', bg: '#245D63', preview: '#CA5B31', badge: 'Klasik' },
  forestSand: { name: 'Forest Green & Sand', bg: '#EAE1CC', preview: '#1D5139', badge: 'Klasik' },
  burgundyGold: { name: 'Burgundy & Gold', bg: '#D3A95B', preview: '#6C1226', badge: 'Klasik' },
  turquoiseCoral: { name: 'Turquoise & Coral', bg: '#F27E6A', preview: '#007F86', badge: 'Klasik' },
  lavenderSlate: { name: 'Lavender & Slate', bg: '#585966', preview: '#C1A8C5', badge: 'Klasik' },
  deepGreenBlush: { name: 'Deep Green & Blush', bg: '#F1CAD0', preview: '#0B4A31', badge: 'Klasik' },
};

const fontOptions = [
  { id: 'Playfair Display', name: 'Estetik Premium', type: 'serif' },
  { id: 'Lora', name: 'Buku Novel', type: 'serif' },
  { id: 'Caveat', name: 'Tulisan Tangan', type: 'cursive' },
  { id: 'Dancing Script', name: 'Elegan Bersambung', type: 'cursive' },
  { id: 'Pacifico', name: 'Tebal Klasik', type: 'cursive' },
  { id: 'Indie Flower', name: 'Buku Harian', type: 'cursive' },
  { id: 'Patrick Hand', name: 'Spidol Santai', type: 'cursive' },
  { id: 'Kalam', name: 'Doodle Lucu', type: 'cursive' },
];

export default function CreateLetter() {
  const [formData, setFormData] = useState({
    sender: '', receiver: '', content: '', giftType: 'confetti',
    theme: 'sakuraPinkBox', accessory: 'pita', giftMessage: '',
    fontFamily: 'Playfair Display', photos: [] as string[],
    photoLayout: 'polaroid', wallMessages: [] as { name: string, message: string }[],
    usePin: false, pin: '', playlistTracks: [{ title: '', artist: '', url: '' }]
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 4 - formData.photos.length);
    Promise.all(files.map(file => { return new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = (event) => resolve(event.target?.result as string); reader.readAsDataURL(file); });
    })).then(base64Images => { setFormData(prev => ({ ...prev, photos: [...prev.photos, ...base64Images] })); });
  };
  const removePhoto = (index: number) => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  const addWallMessage = () => setFormData(prev => ({ ...prev, wallMessages: [...prev.wallMessages, { name: '', message: '' }] }));
  const updateWallMessage = (index: number, field: 'name' | 'message', value: string) => { const newMsgs = [...formData.wallMessages]; newMsgs[index][field] = value; setFormData(prev => ({ ...prev, wallMessages: newMsgs })); };
  const removeWallMessage = (index: number) => setFormData(prev => ({ ...prev, wallMessages: prev.wallMessages.filter((_, i) => i !== index) }));
  const addTrack = () => setFormData(prev => ({ ...prev, playlistTracks: [...prev.playlistTracks, { title: '', artist: '', url: '' }] }));
  const updateTrack = (index: number, field: 'title' | 'artist' | 'url', value: string) => { const newTracks = [...formData.playlistTracks]; newTracks[index][field] = value; setFormData(prev => ({ ...prev, playlistTracks: newTracks })); };
  const removeTrack = (index: number) => setFormData(prev => ({ ...prev, playlistTracks: prev.playlistTracks.filter((_, i) => i !== index) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = `untuk-${formData.receiver.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
    const filteredTracks = formData.playlistTracks.filter(t => t.url.trim() !== '');
    const playlistData = filteredTracks.length > 0 ? { tracks: filteredTracks } : null;

    const { error } = await supabase.from('letters').insert([{
      slug: slug, sender: formData.sender, receiver: formData.receiver, content: formData.content,
      theme: formData.theme, accessory: formData.accessory, gift_type: formData.giftType, gift_message: formData.giftMessage,
      font_family: formData.fontFamily, photo_layout: formData.photoLayout, wall_messages: formData.wallMessages, photos: formData.photos,
      pin: formData.usePin && formData.pin ? formData.pin : null, playlist: playlistData
    }]);

    if (error) { alert("Gagal menyimpan surat: " + error.message); return; }
    
    const existingLetters = JSON.parse(localStorage.getItem('mySuratKejutan') || '[]'); existingLetters.push(slug);
    localStorage.setItem('mySuratKejutan', JSON.stringify(existingLetters));
    setShareUrl(`${window.location.origin}/${slug}`); setIsSubmitted(true);
  };

  const copyToClipboard = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch (err) { const textArea = document.createElement("textarea"); textArea.value = shareUrl; document.body.appendChild(textArea); textArea.select(); document.execCommand("copy"); document.body.removeChild(textArea); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const activeBg = themes[formData.theme as keyof typeof themes]?.bg || themes.sakuraPinkBox.bg;
  const activePreviewColor = themes[formData.theme as keyof typeof themes]?.preview || '#E85D88';

  return (
    <main className="min-h-screen py-8 px-4 md:py-12 flex justify-center items-center transition-colors duration-1000" style={{ backgroundColor: activeBg }}>
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Caveat&family=Dancing+Script&family=Indie+Flower&family=Kalam&family=Lora&family=Pacifico&family=Patrick+Hand&family=Playfair+Display&display=swap');`}</style>

      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-xl p-6 md:p-8 shadow-2xl rounded-3xl border border-white/40">
        {!isSubmitted ? (
          <>
            <h1 className="text-2xl md:text-3xl font-serif text-gray-800 mb-6 text-center">Bungkus Surat Kejutanmu</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Dari (Pengirim)</label><input required type="text" className="w-full text-gray-900 bg-white/80 border-gray-200 rounded-xl p-3 border focus:ring-2 focus:ring-[#a89575] outline-none transition-shadow" onChange={e => setFormData({...formData, sender: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Untuk (Penerima)</label><input required type="text" className="w-full text-gray-900 bg-white/80 border-gray-200 rounded-xl p-3 border focus:ring-2 focus:ring-[#a89575] outline-none transition-shadow" onChange={e => setFormData({...formData, receiver: e.target.value})} /></div>
              </div>

              <div className="bg-white/60 p-4 rounded-2xl border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><Eye className="w-4 h-4"/> Pilih Jenis Tulisan</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                  {fontOptions.map(font => (
                    <div key={font.id} onClick={() => setFormData({...formData, fontFamily: font.id})} className={`p-2 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${formData.fontFamily === font.id ? 'border-gray-900 bg-gray-50 shadow-md scale-105' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                      <span className="text-2xl text-gray-800 mb-1" style={{ fontFamily: font.id }}>Aa</span>
                      <span className="text-[10px] text-gray-500 font-sans leading-tight">{font.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div><label className="block text-sm font-medium text-gray-700 mb-1">Isi Surat Puitis</label><textarea required rows={5} placeholder="Gunakan 'Enter' untuk paragraf baru..." className="w-full text-gray-900 bg-white/80 border-gray-200 rounded-xl p-3 border focus:ring-2 focus:ring-[#a89575] outline-none transition-shadow" style={{ fontFamily: formData.fontFamily }} onChange={e => setFormData({...formData, content: e.target.value})} /></div>

              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-200 pb-3">
                  <h3 className="font-serif text-base md:text-lg text-gray-800 flex items-center gap-2"><ImagePlus className="w-5 h-5"/> Galeri Foto</h3>
                  <select className="border-gray-200 rounded-lg p-2 border text-sm font-medium bg-white text-gray-900 outline-none w-full sm:w-auto" onChange={e => setFormData({...formData, photoLayout: e.target.value})} defaultValue="polaroid">
                    <option value="polaroid">📸 Gaya Polaroid</option><option value="photobooth">🎞️ Photobooth Strip</option><option value="elegant">🖼️ Frame Elegan</option><option value="inline">📝 Sisip di Teks</option>
                  </select>
                </div>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={formData.photos.length >= 4} className="text-sm w-full file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer transition-colors" />
                <p className="text-xs text-gray-500 mt-1">Maksimal 4 foto.</p>

                {formData.photos.length > 0 && (
                  <div className="mt-6 p-6 rounded-2xl flex flex-col items-center overflow-hidden transition-colors shadow-xl border border-white/20 relative" style={{ backgroundColor: activePreviewColor }}>
                    <div className="flex items-center gap-2 mb-6 text-white/95 text-xs sm:text-sm font-bold tracking-widest uppercase bg-black/20 px-4 py-1.5 rounded-full z-10"><Eye className="w-4 h-4"/> Preview Tema: {themes[formData.theme as keyof typeof themes]?.name.split(' ')[0]}</div>
                    {formData.photoLayout === 'photobooth' && (<div className="bg-white p-3 shadow-xl rounded-sm w-32 flex flex-col gap-2 rotate-2 relative z-10">{formData.photos.map((src, i) => (<div key={i} className="relative group"><img src={src} className="w-full aspect-[3/4] object-cover bg-gray-100" alt="Preview"/><button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button></div>))}</div>)}
                    {formData.photoLayout === 'polaroid' && (<div className="flex flex-wrap justify-center gap-4 relative z-10">{formData.photos.map((src, i) => (<div key={i} className={`bg-white p-2 pb-6 shadow-xl w-28 relative group ${i % 2 === 0 ? '-rotate-3' : 'rotate-3'}`}><div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/50 shadow-sm border border-black/10 rotate-1"></div><img src={src} className="w-full aspect-square object-cover bg-gray-100" alt="Preview"/><button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button></div>))}</div>)}
                    {formData.photoLayout === 'elegant' && (<div className="flex flex-col gap-4 relative z-10">{formData.photos.map((src, i) => (<div key={i} className="p-1.5 bg-[#fdfbf7] border-2 border-[#a89575] shadow-xl w-36 relative group"><img src={src} className="w-full aspect-auto object-cover" alt="Preview"/><button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button></div>))}</div>)}
                    {formData.photoLayout === 'inline' && (<div className="flex gap-3 overflow-x-auto w-full pb-2 relative z-10">{formData.photos.map((src, i) => (<div key={i} className={`relative group shrink-0 transform ${i % 2 === 0 ? 'rotate-2' : '-rotate-2'}`}><div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-white/50 shadow-sm border border-black/10 -rotate-1 z-20"></div><img src={src} className="h-20 w-20 object-cover rounded-sm shadow-xl p-1 bg-white" alt="Preview"/><button type="button" onClick={() => removePhoto(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-30"><Trash2 className="w-3 h-3"/></button></div>))}</div>)}
                  </div>
                )}
              </div>

              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-4">
                <h3 className="font-serif text-base md:text-lg text-gray-800 border-b border-gray-200 pb-2">Pesan Teman (Multi-Kontributor)</h3>
                {formData.wallMessages.map((msg, i) => (
                  <div key={i} className="flex gap-3 items-start bg-white p-3 rounded-xl border shadow-sm">
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="Nama Teman" value={msg.name} onChange={e => updateWallMessage(i, 'name', e.target.value)} className="w-full text-gray-900 text-sm border-gray-200 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-gray-800" required />
                      <textarea placeholder="Pesan singkat..." value={msg.message} onChange={e => updateWallMessage(i, 'message', e.target.value)} className="w-full text-gray-900 text-sm border-gray-200 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-gray-800" rows={2} required />
                    </div>
                    <button type="button" onClick={() => removeWallMessage(i)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
                  </div>
                ))}
                <button type="button" onClick={addWallMessage} className="text-sm flex items-center gap-1 text-gray-700 font-medium hover:text-gray-900 transition-colors bg-white px-3 py-2 border rounded-lg shadow-sm"><Plus className="w-4 h-4"/> Tambah Pesan Teman</button>
              </div>

              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-4">
                <h3 className="font-serif text-base md:text-lg text-gray-800 border-b border-gray-200 pb-2">Playlist Musik Custom</h3>
                {formData.playlistTracks.map((track, i) => (
                  <div key={i} className="flex gap-3 items-start bg-white p-3 rounded-xl border shadow-sm">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input type="text" placeholder="Judul Lagu" value={track.title} onChange={e => updateTrack(i, 'title', e.target.value)} className="w-full text-gray-900 text-sm border-gray-200 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-gray-800" required />
                        <input type="text" placeholder="Penyanyi" value={track.artist} onChange={e => updateTrack(i, 'artist', e.target.value)} className="w-full text-gray-900 text-sm border-gray-200 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-gray-800" required />
                      </div>
                      <input type="text" placeholder="Link YouTube/Spotify/Apple Music" value={track.url} onChange={e => updateTrack(i, 'url', e.target.value)} className="w-full text-gray-900 text-sm border-gray-200 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-gray-800" required />
                    </div>
                    <button type="button" onClick={() => removeTrack(i)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
                  </div>
                ))}
                <button type="button" onClick={addTrack} className="text-sm flex items-center gap-1 text-gray-700 font-medium hover:text-gray-900 transition-colors bg-white px-3 py-2 border rounded-lg shadow-sm"><Plus className="w-4 h-4"/> Tambah Lagu</button>
              </div>

              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-4">
                <div className="border-b border-gray-200 pb-2"><h3 className="font-serif text-base md:text-lg text-gray-800">Personalisasi Tema</h3></div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Tema & Warna Latar</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                    {Object.entries(themes).map(([key, t]) => (
                      <div key={key} onClick={() => setFormData({...formData, theme: key})} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.theme === key ? 'border-gray-900 bg-white shadow-md scale-[1.02]' : 'border-white/80 bg-white/70 hover:bg-white hover:border-gray-300'}`}>
                        <div className="w-8 h-8 rounded-full border border-black/10 shrink-0 shadow-inner flex items-center justify-center" style={{ backgroundColor: t.preview }}><div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.bg }}></div></div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>{t.badge && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${t.badge.includes('Kotak') ? 'bg-purple-100 text-purple-700' : t.badge.includes('Baru') ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>{t.badge}</span>}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aksesoris Amplop/Kotak</label>
                    <select className="w-full text-gray-900 bg-white border-gray-200 rounded-xl p-3 border outline-none focus:ring-2 focus:ring-gray-800" onChange={e => setFormData({...formData, accessory: e.target.value})}>
                      <option value="waxseal">Wax Seal 💧</option><option value="pita">Pita Elegan 🎀</option><option value="bunga">Bunga Kering 🌸</option><option value="prangko">Prangko Klasik 📮</option><option value="kunci">Kunci Vintage 🗝️</option><option value="feather">Bulu Pena 🪶</option><option value="sparkles">Taburan Kilau ✨</option><option value="heart">Stiker Hati ❤️</option><option value="paperclip">Klip Kertas 📎</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keamanan PIN (Opsional)</label>
                    <div className="flex gap-2 items-center">
                      <input type="checkbox" checked={formData.usePin} onChange={e => setFormData({...formData, usePin: e.target.checked})} className="w-5 h-5 accent-gray-800 rounded cursor-pointer"/>
                      <input type="text" placeholder={formData.usePin ? "Masukkan PIN..." : "Tidak terkunci"} disabled={!formData.usePin} value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} className="w-full text-gray-900 bg-white border-gray-200 rounded-xl p-3 border outline-none focus:ring-2 focus:ring-gray-800 disabled:opacity-50" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-4">
                <h3 className="font-serif text-base md:text-lg text-gray-800 border-b border-gray-200 pb-2">Hadiah Virtual Akhir</h3>
                <select className="w-full text-gray-900 bg-white border-gray-200 rounded-xl p-3 border outline-none focus:ring-2 focus:ring-gray-800" onChange={e => setFormData({...formData, giftType: e.target.value})}>
                  <option value="kembangApi">Kembang Api 🎆</option><option value="bintang">Hujan Bintang ⭐</option><option value="bunga">Bunga Berguguran 🌸</option><option value="bungaTumbuh">Taman Bunga Mekar 🌷</option>
                </select>
                <textarea rows={2} placeholder="Pesan Khusus Hadiah (Opsional)" className="w-full text-gray-900 bg-white border-gray-200 rounded-xl p-3 border outline-none focus:ring-2 focus:ring-gray-800" onChange={e => setFormData({...formData, giftMessage: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-gray-900 text-white font-medium py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98]">
                Bungkus & Buat Link Kejutan
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 md:py-10 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
            <h2 className="text-2xl md:text-3xl font-serif text-gray-800 mb-2">Surat Siap Dikirim!</h2>
            <p className="text-gray-600 mb-6">Scan QR atau Salin link di bawah ini.</p>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 inline-block">
              <QRCodeSVG value={shareUrl} size={180} level={"H"} className="md:w-[200px] md:h-[200px]" />
            </div>
            <div className="flex items-center w-full max-w-md bg-gray-50 border rounded-xl overflow-hidden mb-6 shadow-inner">
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent p-4 text-sm text-gray-900 outline-none overflow-hidden text-ellipsis" />
              <button onClick={copyToClipboard} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-4 hover:bg-gray-800 transition-colors font-medium"><Copy className="w-4 h-4"/> <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Salin'}</span></button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 w-full max-w-md pt-4 border-t border-gray-100">
              <a href={shareUrl} target="_blank" className="text-gray-500 hover:text-gray-800 hover:underline flex items-center gap-2 font-medium transition-colors">Lihat Hasil <ExternalLink className="w-4 h-4" /></a>
              <span className="hidden sm:inline text-gray-300">|</span>
              <a href="/dashboard" className="text-pink-500 hover:text-pink-600 hover:underline flex items-center gap-2 font-bold transition-colors">Ke Dashboard Saya <ExternalLink className="w-4 h-4" /></a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}