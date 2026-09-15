'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2, ExternalLink, ImagePlus, Plus, Eye, Trash2, Lock, Music } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// DAFTAR TEMA DENGAN DETAIL WARNA UNTUK VISUAL CARD
const themes = {
  dalkomBlue: { name: 'Dalkom (Royal Blue)', bg: '#FCF1DD', preview: '#2945A8', badge: 'Baru ✨' },
  matchaPink: { name: 'Matcha (Green & Pink)', bg: '#FADADD', preview: '#7C9D70', badge: 'Baru ✨' },
  lilacBubblegum: { name: 'MiniMaisy (Lilac)', bg: '#FFC0CB', preview: '#C8A2C8', badge: 'Baru ✨' },
  scrapbookBlue: { name: 'Scrapbook Denim', bg: '#F2E8D9', preview: '#5A80A6', badge: 'Populer 🔥' },
  dustyNavy: { name: 'Dusty Pink & Navy', bg: '#DDAEB2', preview: '#1A2E46', badge: '' },
  oliveGold: { name: 'Olive & Gold', bg: '#DDB24A', preview: '#595F37', badge: '' },
  plumCream: { name: 'Plum & Cream', bg: '#F3E6D6', preview: '#4F2C3A', badge: '' },
  orangeTeal: { name: 'Burnt Orange & Teal', bg: '#245D63', preview: '#CA5B31', badge: '' },
  forestSand: { name: 'Forest Green & Sand', bg: '#EAE1CC', preview: '#1D5139', badge: '' },
  burgundyGold: { name: 'Burgundy & Gold', bg: '#D3A95B', preview: '#6C1226', badge: '' },
  turquoiseCoral: { name: 'Turquoise & Coral', bg: '#F27E6A', preview: '#007F86', badge: '' },
  lavenderSlate: { name: 'Lavender & Slate', bg: '#585966', preview: '#C1A8C5', badge: '' },
  deepGreenBlush: { name: 'Deep Green & Blush', bg: '#F1CAD0', preview: '#0B4A31', badge: '' },
};

export default function CreateLetter() {
  const [formData, setFormData] = useState({
    sender: '', receiver: '', content: '', giftType: 'confetti', giftMessage: '',
    theme: 'scrapbookBlue', accessory: 'pita',
    photos: [] as string[],
    photoLayout: 'polaroid',
    wallMessages: [] as { name: string, message: string }[],
    usePin: false,
    pin: '',
    playlistName: 'Mix Spesial 🎵',
    playlistTracks: [{ title: '', artist: '', url: '' }]
  });

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

  const removePhoto = (index: number) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const addWallMessage = () => {
    setFormData(prev => ({ ...prev, wallMessages: [...prev.wallMessages, { name: '', message: '' }] }));
  };

  const updateWallMessage = (index: number, field: 'name' | 'message', value: string) => {
    const newMsgs = [...formData.wallMessages];
    newMsgs[index][field] = value;
    setFormData(prev => ({ ...prev, wallMessages: newMsgs }));
  };

  const removeWallMessage = (index: number) => {
    setFormData(prev => ({ ...prev, wallMessages: prev.wallMessages.filter((_, i) => i !== index) }));
  };

  const addTrack = () => setFormData(prev => ({ ...prev, playlistTracks: [...prev.playlistTracks, { title: '', artist: '', url: '' }] }));
  const updateTrack = (index: number, field: 'title' | 'artist' | 'url', value: string) => {
    const newTracks = [...formData.playlistTracks];
    newTracks[index][field] = value;
    setFormData(prev => ({ ...prev, playlistTracks: newTracks }));
  };
  const removeTrack = (index: number) => setFormData(prev => ({ ...prev, playlistTracks: prev.playlistTracks.filter((_, i) => i !== index) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = `untuk-${formData.receiver.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    
    const filteredTracks = formData.playlistTracks.filter(t => t.url.trim() !== '');
    const playlistData = filteredTracks.length > 0 ? { name: formData.playlistName, tracks: filteredTracks } : null;

    const { error } = await supabase.from('letters').insert([{
      slug: slug, 
      sender: formData.sender, 
      receiver: formData.receiver, 
      content: formData.content,
      theme: formData.theme, 
      accessory: formData.accessory, 
      gift_type: formData.giftType, 
      gift_message: formData.giftMessage,
      photo_layout: formData.photoLayout, 
      wall_messages: formData.wallMessages,
      photos: formData.photos,
      pin: formData.usePin && formData.pin ? formData.pin : null,
      playlist: playlistData
    }]);

    if (error) { 
      alert("Gagal menyimpan surat: " + error.message); 
      return; 
    }
    
    setShareUrl(`${window.location.origin}/${slug}`);
    setIsSubmitted(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true); 
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea"); 
      textArea.value = shareUrl;
      document.body.appendChild(textArea); 
      textArea.select();
      document.execCommand("copy"); 
      document.body.removeChild(textArea); 
      setCopied(true); 
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeBg = themes[formData.theme as keyof typeof themes].bg;

  return (
    <main className="min-h-screen py-8 px-4 md:py-12 flex justify-center transition-colors duration-500" style={{ backgroundColor: activeBg }}>
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-sm p-6 md:p-8 shadow-xl rounded-3xl border border-white/50">
        
        {!isSubmitted ? (
          <>
            <h1 className="text-2xl md:text-3xl font-serif text-gray-800 text-center mb-8">Buat Surat Kejutan 💌</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengirim (Kamu)</label>
                  <input required type="text" className="w-full border-gray-300 rounded-xl p-2.5 bg-white/50 focus:bg-white" value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} placeholder="Nama/Panggilanmu" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penerima</label>
                  <input required type="text" className="w-full border-gray-300 rounded-xl p-2.5 bg-white/50 focus:bg-white" value={formData.receiver} onChange={e => setFormData({...formData, receiver: e.target.value})} placeholder="Nama dia" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Isi Surat</label>
                <textarea required rows={5} placeholder="Gunakan Enter untuk membuat paragraf baru..." className="w-full border-gray-300 rounded-xl p-3 bg-white/50 focus:bg-white" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>

              {/* UPLOAD FOTO & PREVIEW LAYOUT */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-white">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                  <h3 className="font-serif text-base md:text-lg text-gray-800 flex items-center gap-2"><ImagePlus className="w-5 h-5"/> Galeri Kenangan</h3>
                  <select className="border-gray-200 rounded-lg text-sm bg-white p-1" value={formData.photoLayout} onChange={e => setFormData({...formData, photoLayout: e.target.value})}>
                    <option value="polaroid">📸 Gaya Polaroid</option>
                    <option value="photobooth">🎞️ Photobooth</option>
                    <option value="elegant">🖼️ Frame Elegan</option>
                    <option value="inline">📝 Sisip di Teks</option>
                  </select>
                </div>
                
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <p className="text-xs text-gray-500 mt-1">Maksimal 4 foto.</p>

                {formData.photos.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200/50">
                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-600">
                      <Eye className="w-4 h-4"/> Preview Layout Sementara
                    </div>
                    
                    {formData.photoLayout === 'photobooth' && (
                      <div className="bg-white p-3 shadow-lg rounded max-w-[200px] mx-auto border border-gray-100">
                        {formData.photos.map((src, i) => (
                          <div key={i} className="relative group mb-2 last:mb-0">
                            <img src={src} className="w-full aspect-square object-cover bg-gray-100 rounded-sm" />
                            <button type="button" onClick={() => removePhoto(i)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {formData.photoLayout === 'polaroid' && (
                      <div className="flex flex-wrap justify-center gap-4">
                        {formData.photos.map((src, i) => (
                          <div key={i} className={`bg-white p-2 pb-8 shadow-md border border-gray-100 w-32 relative group transform ${i%2===0 ? '-rotate-2' : 'rotate-3'}`}>
                            <img src={src} className="w-full aspect-square object-cover" />
                            <button type="button" onClick={() => removePhoto(i)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {formData.photoLayout === 'elegant' && (
                      <div className="flex flex-col gap-3">
                        {formData.photos.map((src, i) => (
                          <div key={i} className="p-1.5 bg-[#fdfbf7] border border-gray-300 shadow-sm relative group w-full max-w-xs mx-auto">
                            <img src={src} className="w-full h-auto object-cover border border-gray-200" />
                            <button type="button" onClick={() => removePhoto(i)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {formData.photoLayout === 'inline' && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {formData.photos.map((src, i) => (
                          <div key={i} className="relative group shrink-0">
                            <img src={src} className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                            <button type="button" onClick={() => removePhoto(i)} className="absolute inset-0 bg-black/50 rounded-lg text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* WALL OF MESSAGES */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-white">
                <h3 className="font-serif text-base md:text-lg text-gray-800 mb-3 flex items-center gap-2">Pesan Teman-Teman</h3>
                {formData.wallMessages.map((msg, i) => (
                  <div key={i} className="flex gap-3 items-start mb-3 bg-white/50 p-3 rounded-xl">
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="Nama Teman" className="w-full border-gray-300 rounded text-sm p-2" value={msg.name} onChange={e => updateWallMessage(i, 'name', e.target.value)} />
                      <textarea placeholder="Pesan singkat..." className="w-full border-gray-300 rounded text-sm p-2" rows={2} value={msg.message} onChange={e => updateWallMessage(i, 'message', e.target.value)} />
                    </div>
                    <button type="button" onClick={() => removeWallMessage(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={addWallMessage} className="text-sm flex items-center text-blue-600 hover:text-blue-700 font-medium"><Plus className="w-4 h-4"/> Tambah Pesan Teman</button>
              </div>

              {/* PLAYLIST MUSIK KESUKAAN */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-white">
                <h3 className="font-serif text-base md:text-lg text-gray-800 mb-3 flex items-center gap-2"><Music className="w-5 h-5"/> Playlist Musik Custom</h3>
                
                <input type="text" placeholder="Nama Playlist (Misal: Lagu Kita 🎧)" className="w-full border-gray-300 rounded-xl p-2.5 bg-white mb-4 font-bold" value={formData.playlistName} onChange={e => setFormData({...formData, playlistName: e.target.value})} />
                
                {formData.playlistTracks.map((track, i) => (
                  <div key={i} className="flex gap-3 items-start mb-3 bg-white/50 p-3 rounded-xl border border-gray-100">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input type="text" placeholder="Judul Lagu" className="w-1/2 border-gray-300 rounded text-sm p-2" value={track.title} onChange={e => updateTrack(i, 'title', e.target.value)} />
                        <input type="text" placeholder="Penyanyi" className="w-1/2 border-gray-300 rounded text-sm p-2" value={track.artist} onChange={e => updateTrack(i, 'artist', e.target.value)} />
                      </div>
                      <input type="text" placeholder="Link YouTube/Spotify/Apple Music..." className="w-full border-gray-300 rounded text-sm p-2" value={track.url} onChange={e => updateTrack(i, 'url', e.target.value)} />
                    </div>
                    <button type="button" onClick={() => removeTrack(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={addTrack} className="text-sm flex items-center text-blue-600 hover:text-blue-700 font-medium"><Plus className="w-4 h-4"/> Tambah Lagu</button>
              </div>

              {/* PERSONALISASI & KEAMANAN PIN */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif text-base md:text-lg text-gray-800">Personalisasi Tema</h3>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Tema & Warna Latar</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white/30 rounded-xl border border-gray-100">
                    {Object.entries(themes).map(([key, t]) => (
                      <div 
                        key={key} 
                        onClick={() => setFormData({...formData, theme: key})}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border
                        ${formData.theme === key ? 'border-gray-900 bg-white shadow-md scale-[1.02]' : 'border-white/80 bg-white/70 hover:bg-white'} `}
                      >
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center" style={{ backgroundColor: t.preview }}>
                           <div className="w-3 h-3 rounded-full bg-white/50 mix-blend-overlay"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                          {t.badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold">{t.badge}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aksesoris Amplop</label>
                    <select className="w-full bg-white border-gray-300 rounded-xl p-2.5" value={formData.accessory} onChange={e => setFormData({...formData, accessory: e.target.value})}>
                      <option value="waxseal">Wax Seal 💧</option>
                      <option value="pita">Pita Elegan 🎀</option>
                      <option value="bunga">Bunga Kering 🌸</option>
                      <option value="prangko">Prangko Klasik 💌</option>
                      <option value="kunci">Kunci Vintage 🗝️</option>
                      <option value="feather">Bulu Pena 🪶</option>
                      <option value="sparkles">Taburan Kilau ✨</option>
                      <option value="heart">Stiker Hati ❤️</option>
                      <option value="paperclip">Klip Kertas 📎</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Lock className="w-3 h-3"/> Keamanan PIN (Opsional)</label>
                    <div className="flex gap-2 items-center">
                       <input type="checkbox" checked={formData.usePin} onChange={e => setFormData({...formData, usePin: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                       <input type="text" placeholder={formData.usePin ? "Masukkan 4-6 digit PIN" : "Centang untuk aktifkan"} disabled={!formData.usePin} className="w-full border-gray-300 rounded-xl p-2.5 bg-white disabled:bg-gray-100 text-sm" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} maxLength={10} />
                    </div>
                  </div>
                </div>
              </div>

              {/* HADIAH VIRTUAL */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-white">
                <h3 className="font-serif text-base md:text-lg text-gray-800 mb-3 flex items-center gap-2">Kejutan Terakhir (Hadiah)</h3>
                <select className="w-full bg-white border-gray-300 rounded-xl p-2.5 mb-3" value={formData.giftType} onChange={e => setFormData({...formData, giftType: e.target.value})}>
                  <option value="kembangApi">Kembang Api 🎆</option>
                  <option value="bintang">Hujan Bintang ⭐</option>
                  <option value="bunga">Bunga Berguguran 🌸</option>
                  <option value="bungaTumbuh">Taman Bunga Mekar 🌷</option>
                </select>
                <textarea rows={2} placeholder="Pesan Khusus di Kartu Hadiah (Opsional)" className="w-full border-gray-300 rounded-xl p-3 bg-white" value={formData.giftMessage} onChange={e => setFormData({...formData, giftMessage: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium py-3.5 px-4 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all flex justify-center items-center gap-2">
                Bungkus & Buat Link Kejutan ✨
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 md:py-10 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-bounce"/>
            <h2 className="text-2xl md:text-3xl font-serif text-gray-800 mb-2">Surat Siap Dikirim!</h2>
            <p className="text-gray-600 mb-6">Scan QR atau Salin Link di bawah ini.</p>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 inline-block">
              <QRCodeSVG value={shareUrl} size={180} level={"H"} />
            </div>

            <div className="flex items-center w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-1 mb-6">
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent px-3 text-sm text-gray-600 outline-none" />
              <button onClick={copyToClipboard} className="flex items-center gap-1 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <Copy className="w-4 h-4"/> <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
            
            <a href={shareUrl} target="_blank" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Lihat Hasil Surat <ExternalLink className="w-4 h-4"/>
            </a>
          </div>
        )}
      </div>
    </main>
  );
}