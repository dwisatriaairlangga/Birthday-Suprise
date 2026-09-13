'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2, ExternalLink, ImagePlus, Plus, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// PALET WARNA (Digunakan untuk merubah background form secara real-time)
const themes = {
  dustyNavy: { bg: 'bg-[#DDAEB2]' },
  oliveGold: { bg: 'bg-[#DDB24A]' },
  plumCream: { bg: 'bg-[#F3E6D6]' },
  orangeTeal: { bg: 'bg-[#245D63]' },
  forestSand: { bg: 'bg-[#EAE1CC]' },
  burgundyGold: { bg: 'bg-[#D3A95B]' },
  turquoiseCoral: { bg: 'bg-[#F27E6A]' },
  lavenderSlate: { bg: 'bg-[#585966]' },
  deepGreenBlush: { bg: 'bg-[#F1CAD0]' },
};

export default function CreateLetter() {
  const [formData, setFormData] = useState({
    sender: '', receiver: '', content: '', giftType: 'confetti',
    theme: 'plumCream', accessory: 'pita', musicLink: '', giftMessage: '',
    photos: [] as string[],
    photoLayout: 'photobooth',
    wallMessages: [] as { name: string, message: string }[]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = `untuk-${formData.receiver.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
    
    const { error } = await supabase.from('letters').insert([{
      slug: slug, sender: formData.sender, receiver: formData.receiver, content: formData.content,
      theme: formData.theme, accessory: formData.accessory, music_link: formData.musicLink,
      gift_type: formData.giftType, gift_message: formData.giftMessage, photos: formData.photos,
      photo_layout: formData.photoLayout, wall_messages: formData.wallMessages
    }]);

    if (error) { alert("Gagal menyimpan surat: " + error.message); return; }
    setShareUrl(`${window.location.origin}/${slug}`);
    setIsSubmitted(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea"); textArea.value = shareUrl;
      document.body.appendChild(textArea); textArea.select(); document.execCommand("copy");
      document.body.removeChild(textArea); setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeBg = themes[formData.theme as keyof typeof themes]?.bg || themes.plumCream.bg;

  return (
    // Background utama akan bereaksi terhadap pilihan tema
    <main className={`min-h-screen ${activeBg} py-8 px-4 md:py-12 flex justify-center items-center transition-colors duration-1000`}>
      {/* Box Form dengan efek Glassmorphism yang elegan */}
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-xl p-6 md:p-8 shadow-2xl rounded-3xl border border-white/40">
        {!isSubmitted ? (
          <>
            <h1 className="text-2xl md:text-3xl font-serif text-gray-800 mb-6 text-center">Bungkus Surat Kejutanmu</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dari (Pengirim)</label>
                  <input required type="text" className="w-full bg-white/80 border-gray-200 rounded-xl p-3 border focus:ring-2 focus:ring-[#a89575] outline-none transition-shadow" onChange={e => setFormData({...formData, sender: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Untuk (Penerima)</label>
                  <input required type="text" className="w-full bg-white/80 border-gray-200 rounded-xl p-3 border focus:ring-2 focus:ring-[#a89575] outline-none transition-shadow" onChange={e => setFormData({...formData, receiver: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Isi Surat Puitis</label>
                <textarea required rows={5} placeholder="Gunakan 'Enter' untuk paragraf baru..." className="w-full bg-white/80 border-gray-200 rounded-xl p-3 border focus:ring-2 focus:ring-[#a89575] outline-none transition-shadow" onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>

              {/* UPLOAD FOTO & PREVIEW LAYOUT */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-200 pb-3">
                  <h3 className="font-serif text-base md:text-lg text-gray-800 flex items-center gap-2">
                    <ImagePlus className="w-5 h-5"/> Galeri Foto
                  </h3>
                  <select className="border-gray-200 rounded-lg p-2 border text-sm font-medium bg-white text-gray-700 outline-none w-full sm:w-auto" onChange={e => setFormData({...formData, photoLayout: e.target.value})} defaultValue="photobooth">
                    <option value="photobooth">🎞️ Photobooth Strip</option>
                    <option value="polaroid">📸 Gaya Polaroid</option>
                    <option value="elegant">🖼️ Frame Elegan</option>
                    <option value="inline">📝 Sisip di Teks</option>
                  </select>
                </div>
                
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={formData.photos.length >= 4} className="text-sm w-full file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer transition-colors" />
                <p className="text-xs text-gray-500 mt-1">Maksimal 4 foto.</p>

                {/* LIVE PREVIEW AREA */}
                {formData.photos.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 bg-black/5 p-4 rounded-xl flex flex-col items-center overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm font-medium">
                      <Eye className="w-4 h-4"/> Preview Layout
                    </div>
                    
                    {formData.photoLayout === 'photobooth' && (
                      <div className="bg-white p-3 shadow-lg rounded-sm w-32 flex flex-col gap-2 rotate-2">
                        {formData.photos.map((src, i) => (
                          <div key={i} className="relative group">
                            <img src={src} className="w-full aspect-[3/4] object-cover bg-gray-100" alt="Preview"/>
                            <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.photoLayout === 'polaroid' && (
                      <div className="flex flex-wrap justify-center gap-4">
                        {formData.photos.map((src, i) => (
                          <div key={i} className={`bg-white p-2 pb-6 shadow-md w-28 relative group ${i % 2 === 0 ? '-rotate-3' : 'rotate-3'}`}>
                            <img src={src} className="w-full aspect-square object-cover bg-gray-100" alt="Preview"/>
                            <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.photoLayout === 'elegant' && (
                      <div className="flex flex-col gap-3">
                        {formData.photos.map((src, i) => (
                          <div key={i} className="p-1.5 bg-[#fdfbf7] border-2 border-[#a89575] shadow-sm w-36 relative group">
                            <img src={src} className="w-full aspect-auto object-cover" alt="Preview"/>
                            <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.photoLayout === 'inline' && (
                       <div className="flex gap-2 overflow-x-auto w-full pb-2">
                         {formData.photos.map((src, i) => (
                          <div key={i} className="relative group shrink-0">
                            <img src={src} className="h-16 w-16 object-cover rounded shadow" alt="Preview"/>
                            <button type="button" onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                          </div>
                        ))}
                       </div>
                    )}
                  </div>
                )}
              </div>

              {/* WALL OF MESSAGES */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-4">
                <h3 className="font-serif text-base md:text-lg text-gray-800 border-b border-gray-200 pb-2">Pesan Teman (Multi-Kontributor)</h3>
                {formData.wallMessages.map((msg, i) => (
                  <div key={i} className="flex gap-3 items-start bg-white p-3 rounded-xl border shadow-sm">
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="Nama Teman" value={msg.name} onChange={e => updateWallMessage(i, 'name', e.target.value)} className="w-full text-sm border-gray-200 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-gray-800" required />
                      <textarea placeholder="Pesan singkat..." value={msg.message} onChange={e => updateWallMessage(i, 'message', e.target.value)} className="w-full text-sm border-gray-200 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-gray-800" rows={2} required />
                    </div>
                    <button type="button" onClick={() => removeWallMessage(i)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
                  </div>
                ))}
                <button type="button" onClick={addWallMessage} className="text-sm flex items-center gap-1 text-gray-700 font-medium hover:text-gray-900 transition-colors bg-white px-3 py-2 border rounded-lg shadow-sm">
                  <Plus className="w-4 h-4"/> Tambah Pesan Teman
                </button>
              </div>

              {/* PERSONALISASI */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-4">
                <h3 className="font-serif text-base md:text-lg text-gray-800 border-b border-gray-200 pb-2">Kustomisasi Tampilan & Suara</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tema Warna</label>
                    <select className="w-full bg-white border-gray-200 rounded-xl p-3 border outline-none focus:ring-2 focus:ring-gray-800" onChange={e => setFormData({...formData, theme: e.target.value})} defaultValue="plumCream">
                      <option value="dustyNavy">Dusty Pink & Navy</option>
                      <option value="oliveGold">Olive & Gold</option>
                      <option value="plumCream">Plum & Cream</option>
                      <option value="orangeTeal">Burnt Orange & Teal</option>
                      <option value="forestSand">Forest Green & Sand</option>
                      <option value="burgundyGold">Burgundy & Gold</option>
                      <option value="turquoiseCoral">Turquoise & Coral</option>
                      <option value="lavenderSlate">Lavender & Slate</option>
                      <option value="deepGreenBlush">Deep Green & Blush</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aksesoris Amplop</label>
                    <select className="w-full bg-white border-gray-200 rounded-xl p-3 border outline-none focus:ring-2 focus:ring-gray-800" onChange={e => setFormData({...formData, accessory: e.target.value})}>
                      <option value="waxseal">Wax Seal 💧</option>
                      <option value="pita">Pita Elegan 🎀</option>
                      <option value="bunga">Bunga Kering 🌸</option>
                      <option value="prangko">Prangko Klasik 📮</option>
                      <option value="kunci">Kunci Vintage 🗝️</option>
                      <option value="feather">Bulu Pena 🪶</option>
                      <option value="sparkles">Taburan Kilau ✨</option>
                      <option value="heart">Stiker Hati ❤️</option>
                      <option value="paperclip">Klip Kertas 📎</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Musik (YouTube/Spotify) - Opsional</label>
                  <input type="text" placeholder="https://..." className="w-full bg-white border-gray-200 rounded-xl p-3 border outline-none focus:ring-2 focus:ring-gray-800" onChange={e => setFormData({...formData, musicLink: e.target.value})} />
                </div>
              </div>

              {/* HADIAH VIRTUAL */}
              <div className="bg-white/60 p-4 md:p-5 rounded-2xl border border-gray-200 space-y-4">
                <h3 className="font-serif text-base md:text-lg text-gray-800 border-b border-gray-200 pb-2">Hadiah Virtual Akhir</h3>
                <select className="w-full bg-white border-gray-200 rounded-xl p-3 border outline-none focus:ring-2 focus:ring-gray-800" onChange={e => setFormData({...formData, giftType: e.target.value})}>
                  <option value="kembangApi">Kembang Api 🎆</option>
                  <option value="bintang">Hujan Bintang ⭐</option>
                  <option value="bunga">Bunga Berguguran 🌸</option>
                  <option value="bungaTumbuh">Taman Bunga Mekar 🌷</option>
                </select>
                <textarea rows={2} placeholder="Pesan Khusus Hadiah (Opsional)" className="w-full bg-white border-gray-200 rounded-xl p-3 border outline-none focus:ring-2 focus:ring-gray-800" onChange={e => setFormData({...formData, giftMessage: e.target.value})} />
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
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent p-4 text-sm outline-none text-gray-600 overflow-hidden text-ellipsis" />
              <button onClick={copyToClipboard} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-4 hover:bg-gray-800 transition-colors font-medium">
                <Copy className="w-4 h-4"/> <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
            
            <a href={shareUrl} target="_blank" className="text-gray-500 hover:text-gray-800 hover:underline flex items-center gap-2 font-medium transition-colors">
              Lihat Hasil Surat <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </main>
  );
}