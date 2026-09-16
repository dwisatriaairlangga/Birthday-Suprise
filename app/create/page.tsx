'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2, ExternalLink, ImagePlus, Plus, Eye, Music } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const themes = {
  secretBoxPurple: { name: 'Secret Box (Purple)', bg: '#F8E1E1', preview: '#6A417B' },
  sakuraPinkBox: { name: 'Sakura Anime (Kotak)', bg: '#FFF4F7', preview: '#E85D88' },
  oceanBlueBox: { name: 'Ocean Nature (Kotak)', bg: '#E3F2FD', preview: '#1565C0' },
  sakuraPink: { name: 'Sakura Anime (Surat)', bg: '#FFF4F7', preview: '#E85D88' },
  oceanBlue: { name: 'Ocean Nature (Surat)', bg: '#E3F2FD', preview: '#1565C0' },
  dalkomBlue: { name: 'Dalkom (Royal Blue)', bg: '#FCF1DD', preview: '#2945A8' },
  matchaPink: { name: 'Matcha (Green & Pink)', bg: '#FADADD', preview: '#7C9D70' },
  lilacBubblegum: { name: 'MiniMaisy (Lilac)', bg: '#FFC0CB', preview: '#C8A2C8' },
  scrapbookBlue: { name: 'Scrapbook Denim', bg: '#F2E8D9', preview: '#5A80A6' },
  dustyNavy: { name: 'Dusty Pink & Navy', bg: '#DDAEB2', preview: '#1A2E46' },
  oliveGold: { name: 'Olive & Gold', bg: '#DDB24A', preview: '#595F37' },
  plumCream: { name: 'Plum & Cream', bg: '#F3E6D6', preview: '#4F2C3A' },
  orangeTeal: { name: 'Burnt Orange & Teal', bg: '#245D63', preview: '#CA5B31' },
  forestSand: { name: 'Forest Green & Sand', bg: '#EAE1CC', preview: '#1D5139' },
  burgundyGold: { name: 'Burgundy & Gold', bg: '#D3A95B', preview: '#6C1226' },
  turquoiseCoral: { name: 'Turquoise & Coral', bg: '#F27E6A', preview: '#007F86' },
  lavenderSlate: { name: 'Lavender & Slate', bg: '#585966', preview: '#C1A8C5' },
  deepGreenBlush: { name: 'Deep Green & Blush', bg: '#F1CAD0', preview: '#0B4A31' }
};

const fontOptions = [
  { id: 'Playfair Display', name: 'Estetik Premium' },
  { id: 'Lora', name: 'Buku Novel' },
  { id: 'Caveat', name: 'Tulisan Tangan' },
  { id: 'Dancing Script', name: 'Elegan Bersambung' },
  { id: 'Pacifico', name: 'Tebal Klasik' },
  { id: 'Indie Flower', name: 'Buku Harian' },
  { id: 'Patrick Hand', name: 'Spidol Santai' },
  { id: 'Kalam', name: 'Doodle Lucu' },
];

export default function CreateLetter() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    sender: '', receiver: '', content: '', giftType: 'kembangApi',
    theme: 'sakuraPinkBox', accessory: 'pita', giftMessage: '',
    fontFamily: 'Playfair Display',
    photos: [] as string[],
    photoLayout: 'polaroid',
    wallMessages: [] as { name: string, message: string }[],
    usePin: false,
    pin: '',
  });

  const [playlist, setPlaylist] = useState<{ id: string, title: string, artist: string, embedUrl: string, cover: string }[]>([]);
  const [songInput, setSongInput] = useState({ title: '', artist: '', embedUrl: '', cover: '' });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 4 - formData.photos.length);
    Promise.all(files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
    })).then(base64Images => {
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...base64Images] }));
    });
  };

  const removePhoto = (index: number) => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  
  const addWallMessage = () => setFormData(prev => ({ ...prev, wallMessages: [...prev.wallMessages, { name: '', message: '' }] }));
  const updateWallMessage = (index: number, field: 'name' | 'message', value: string) => {
    const newMsgs = [...formData.wallMessages];
    newMsgs[index][field] = value;
    setFormData(prev => ({ ...prev, wallMessages: newMsgs }));
  };
  const removeWallMessage = (index: number) => setFormData(prev => ({ ...prev, wallMessages: prev.wallMessages.filter((_, i) => i !== index) }));

  const handleAddSong = () => {
    if (!songInput.embedUrl) return alert("Link Embed lagu wajib diisi!");
    setPlaylist([...playlist, { ...songInput, id: Date.now().toString() }]);
    setSongInput({ title: '', artist: '', embedUrl: '', cover: '' });
  };

  const handleRemoveSong = (id: string) => {
    setPlaylist(playlist.filter(song => song.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = `untuk-${formData.receiver.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    const { error } = await supabase.from('letters').insert([{
      slug, sender: formData.sender, receiver: formData.receiver,
      content: formData.content, theme: formData.theme, accessory: formData.accessory,
      gift_type: formData.giftType, gift_message: formData.giftMessage,
      font_family: formData.fontFamily, photo_layout: formData.photoLayout,
      wall_messages: formData.wallMessages, playlist: playlist,
      pin: formData.usePin && formData.pin ? formData.pin : null,
      is_liked: false
    }]);

    if (error) {
      alert("Gagal menyimpan surat: " + error.message);
      return;
    }

    const existingLetters = JSON.parse(localStorage.getItem('mySuratKejutan') || '[]');
    existingLetters.push(slug);
    localStorage.setItem('mySuratKejutan', JSON.stringify(existingLetters));

    setShareUrl(`${window.location.origin}/${slug}`);
    setIsSubmitted(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };

  const activePreviewColor = themes[formData.theme as keyof typeof themes]?.preview || '#E85D88';

  return (
    <main className="min-h-screen py-8 px-4 md:py-12 flex justify-center items-center bg-[#fdfbf7]">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-xl border border-black/5">
        {!isSubmitted ? (
          <>
            <h1 className="text-2xl md:text-3xl font-serif font-black text-gray-800 text-center mb-8">Buat Surat Kejutan 💌</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengirim</label>
                  <input required type="text" value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-gray-400" placeholder="Namamu" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label>
                  <input required type="text" value={formData.receiver} onChange={e => setFormData({...formData, receiver: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-gray-400" placeholder="Nama si dia" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Isi Surat / Pesan Utama</label>
                <textarea required rows={5} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-gray-400" placeholder="Tulis ungkapan hatimu..." />
              </div>

              {/* FONT SELECTOR */}
              <div className="bg-white/60 p-4 rounded-2xl border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Gaya Font Tulisan</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {fontOptions.map(font => (
                    <div key={font.id} onClick={() => setFormData({...formData, fontFamily: font.id})} className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${formData.fontFamily === font.id ? 'border-gray-900 bg-white shadow-sm font-bold' : 'border-gray-200 bg-white/50'}`}>
                      <p className="text-xs text-gray-800">{font.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* UPLOAD FOTO & PREVIEW */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <h3 className="font-serif text-base font-bold text-gray-800 flex items-center gap-2"><ImagePlus className="w-5 h-5"/> Galeri Foto (Maks 4)</h3>
                  <select value={formData.photoLayout} onChange={e => setFormData({...formData, photoLayout: e.target.value})} className="border border-gray-200 rounded-xl p-2 text-sm bg-white focus:outline-none">
                    <option value="polaroid">Gaya Polaroid</option>
                    <option value="photobooth">Photobooth Strip</option>
                    <option value="elegant">Frame Elegan</option>
                    <option value="inline">Sisip di Teks</option>
                  </select>
                </div>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer" />
                
                {formData.photos.length > 0 && (
                  <div className="mt-6 p-6 rounded-2xl flex flex-col items-center gap-4 transition-colors" style={{ backgroundColor: activePreviewColor }}>
                    <div className="flex items-center gap-2 text-white font-medium text-xs bg-black/20 px-3 py-1 rounded-full"><Eye className="w-4 h-4"/> Preview Tampilan</div>
                    <div className="flex flex-wrap justify-center gap-3">
                      {formData.photos.map((src, i) => (
                        <div key={i} className="relative group bg-white p-2 pb-6 shadow-md w-32">
                          <img src={src} className="w-full aspect-square object-cover" alt="preview" />
                          <button type="button" onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold shadow">X</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* WALL OF MESSAGES */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-3">
                <h3 className="font-serif text-base font-bold text-gray-800">Pesan Tambahan dari Teman</h3>
                {formData.wallMessages.map((msg, i) => (
                  <div key={i} className="flex gap-2 items-start bg-white p-3 rounded-xl border border-gray-100">
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="Nama pemberi pesan" value={msg.name} onChange={e => updateWallMessage(i, 'name', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm" />
                      <textarea placeholder="Pesan singkat..." value={msg.message} onChange={e => updateWallMessage(i, 'message', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm" rows={2} />
                    </div>
                    <button type="button" onClick={() => removeWallMessage(i)} className="text-red-500 font-bold p-2">X</button>
                  </div>
                ))}
                <button type="button" onClick={addWallMessage} className="w-full border border-dashed border-gray-300 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-white flex items-center justify-center gap-2"><Plus className="w-4 h-4"/> Tambah Pesan</button>
              </div>

              {/* CUSTOM PLAYLIST MUSIK */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-3">
                <h3 className="font-serif text-base font-bold text-gray-800 flex items-center gap-2"><Music className="w-5 h-5"/> Playlist Musik Custom</h3>
                <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100">
                  <input type="text" placeholder="Judul Lagu" value={songInput.title} onChange={e => setSongInput({...songInput, title: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm" />
                  <input type="text" placeholder="Nama Artis" value={songInput.artist} onChange={e => setSongInput({...songInput, artist: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm" />
                  <input type="text" placeholder="Link Embed (Youtube/Spotify/Apple)" value={songInput.embedUrl} onChange={e => setSongInput({...songInput, embedUrl: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm" />
                  <input type="text" placeholder="Link Cover Album (Opsional)" value={songInput.cover} onChange={e => setSongInput({...songInput, cover: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm" />
                  <button type="button" onClick={handleAddSong} className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-bold">+ Tambah Lagu</button>
                </div>
                {playlist.length > 0 && (
                  <ul className="space-y-2">
                    {playlist.map((song) => (
                      <li key={song.id} className="bg-white p-2 px-3 border rounded-xl text-sm flex justify-between items-center shadow-sm">
                        <span className="font-medium truncate pr-2">{song.title} - {song.artist}</span>
                        <button type="button" onClick={() => handleRemoveSong(song.id)} className="text-red-500 font-bold">X</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* PERSONALISASI & PIN */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Tema Kartu & Kotak</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {Object.entries(themes).map(([key, t]) => (
                      <div key={key} onClick={() => setFormData({...formData, theme: key})} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.theme === key ? 'border-gray-900 bg-white shadow-sm' : 'border-gray-200 bg-white/50'}`}>
                        <div className="w-6 h-6 rounded-full border shadow-inner shrink-0" style={{ backgroundColor: t.preview }}></div>
                        <p className="text-xs font-medium text-gray-800 truncate">{t.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aksesoris Hiasan</label>
                    <select value={formData.accessory} onChange={e => setFormData({...formData, accessory: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none">
                      <option value="pita">Pita Elegan 🎀</option>
                      <option value="waxseal">Wax Seal 💧</option>
                      <option value="bunga">Bunga Kering 🌸</option>
                      <option value="prangko">Prangko Klasik 🏣</option>
                      <option value="kunci">Kunci Vintage 🗝️</option>
                      <option value="feather">Bulu Pena 🪶</option>
                      <option value="sparkles">Taburan Kilau ✨</option>
                      <option value="heart">Stiker Hati ❤️</option>
                      <option value="paperclip">Klip Kertas 📎</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keamanan PIN Rahasia</label>
                    <div className="flex gap-2 items-center">
                      <input type="checkbox" checked={formData.usePin} onChange={e => setFormData({...formData, usePin: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-pink-600" />
                      <input type="text" maxLength={6} disabled={!formData.usePin} placeholder="PIN (cth: 1234)" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm disabled:opacity-40" />
                    </div>
                  </div>
                </div>
              </div>

              {/* HADIAH VIRTUAL */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-3">
                <label className="block text-sm font-medium text-gray-700">Jenis Kejutan Akhir</label>
                <select value={formData.giftType} onChange={e => setFormData({...formData, giftType: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none">
                  <option value="kembangApi">Kembang Api 🎆</option>
                  <option value="bintang">Hujan Bintang ⭐</option>
                  <option value="bunga">Bunga Berguguran 🌸</option>
                  <option value="bungaTumbuh">Taman Bunga Mekar 🌷</option>
                </select>
                <textarea rows={2} value={formData.giftMessage} onChange={e => setFormData({...formData, giftMessage: e.target.value})} placeholder="Pesan khusus saat kotak hadiah terbuka..." className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none" />
              </div>

              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition">
                Bungkus & Buat Link Kejutan 🎁
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-serif font-bold text-gray-800">Surat Berhasil Dibuat!</h2>
            <div className="bg-gray-50 p-4 rounded-2xl inline-block border"><QRCodeSVG value={shareUrl} size={160} /></div>
            <div className="flex items-center w-full max-w-sm mx-auto bg-gray-100 rounded-xl p-2 border">
              <input type="text" readOnly value={shareUrl} className="bg-transparent flex-1 px-2 text-sm text-gray-600 outline-none truncate" />
              <button onClick={copyToClipboard} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"><Copy className="w-4 h-4"/> {copied ? 'Disalin!' : 'Salin'}</button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href={shareUrl} target="_blank" className="text-pink-600 font-bold hover:underline flex items-center gap-1">Lihat Hasil <ExternalLink className="w-4 h-4"/></a>
              <span className="hidden sm:inline text-gray-300">|</span>
              <a href="/dashboard" className="text-gray-800 font-bold hover:underline flex items-center gap-1">Ke Dashboard Saya <ExternalLink className="w-4 h-4"/></a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}