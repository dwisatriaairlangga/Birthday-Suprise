'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2, ExternalLink, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CreateLetter() {
  const [formData, setFormData] = useState({
    sender: '', receiver: '', content: '', giftType: 'confetti',
    theme: 'vintage', accessory: 'pita', musicLink: '', giftMessage: '',
    photos: [] as string[],
    wallMessages: [] as { name: string, message: string }[]
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 3 - formData.photos.length);
    
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

  const addWallMessage = () => {
    setFormData(prev => ({ ...prev, wallMessages: [...prev.wallMessages, { name: '', message: '' }] }));
  };
  const updateWallMessage = (index: number, field: 'name' | 'message', value: string) => {
    const newMsgs = [...formData.wallMessages];
    newMsgs[index][field] = value;
    setFormData(prev => ({ ...prev, wallMessages: newMsgs }));
  };
  const removeWallMessage = (index: number) => {
    const newMsgs = formData.wallMessages.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, wallMessages: newMsgs }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = `untuk-${formData.receiver.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
    
    // SIMPAN KE SUPABASE
    const { error } = await supabase.from('letters').insert([
      {
        slug: slug,
        sender: formData.sender,
        receiver: formData.receiver,
        content: formData.content,
        theme: formData.theme,
        accessory: formData.accessory,
        music_link: formData.musicLink,
        gift_type: formData.giftType,
        gift_message: formData.giftMessage,
        photos: formData.photos,
        wall_messages: formData.wallMessages
      }
    ]);

    if (error) {
      alert("Gagal menyimpan surat: " + error.message);
      return;
    }

    const url = `${window.location.origin}/${slug}`;
    setShareUrl(url);
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

  return (
    <main className="min-h-screen bg-[#fdfbf7] py-12 px-4 flex justify-center items-center">
      <div className="max-w-2xl w-full bg-white p-8 shadow-xl rounded-2xl">
        {!isSubmitted ? (
          <>
            <h1 className="text-3xl font-serif text-gray-800 mb-8 text-center">Bungkus Surat Kejutanmu</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dari (Pengirim)</label>
                  <input required type="text" className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, sender: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Untuk (Penerima)</label>
                  <input required type="text" className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, receiver: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Isi Surat Puitis</label>
                <textarea required rows={5} placeholder="Gunakan 'Enter' untuk paragraf baru..." className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>

              {/* UPLOAD FOTO */}
              <div className="bg-[#f0f8ff] p-4 rounded-lg border border-[#add8e6] space-y-4">
                <h3 className="font-serif text-lg text-gray-800 border-b border-[#add8e6] pb-2 flex items-center gap-2">
                  <ImagePlus className="w-5 h-5"/> Galeri Kenangan
                </h3>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={formData.photos.length >= 3} className="text-sm" />
                {formData.photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pt-2">
                    {formData.photos.map((src, i) => (
                      <img key={i} src={src} alt="Preview" className="h-16 w-16 object-cover rounded shadow" />
                    ))}
                  </div>
                )}
              </div>

              {/* WALL OF MESSAGES */}
              <div className="bg-[#f0fdf4] p-4 rounded-lg border border-[#86efac] space-y-4">
                <h3 className="font-serif text-lg text-gray-800 border-b border-[#86efac] pb-2">Pesan Teman (Multi-Kontributor)</h3>
                {formData.wallMessages.map((msg, i) => (
                  <div key={i} className="flex gap-2 items-start bg-white p-2 rounded border">
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="Nama Teman" value={msg.name} onChange={e => updateWallMessage(i, 'name', e.target.value)} className="w-full text-sm border p-1 rounded" required />
                      <textarea placeholder="Pesan singkat..." value={msg.message} onChange={e => updateWallMessage(i, 'message', e.target.value)} className="w-full text-sm border p-1 rounded" rows={2} required />
                    </div>
                    <button type="button" onClick={() => removeWallMessage(i)} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
                <button type="button" onClick={addWallMessage} className="text-sm flex items-center gap-1 text-green-700 font-medium hover:underline">
                  <Plus className="w-4 h-4"/> Tambah Pesan Teman
                </button>
              </div>

              {/* PERSONALISASI */}
              <div className="bg-[#fdfbf7] p-4 rounded-lg border border-[#e8dcc7] space-y-4">
                <h3 className="font-serif text-lg text-gray-800 border-b pb-2">Kustomisasi Tampilan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tema Warna</label>
                    <select className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, theme: e.target.value})}>
                      <option value="vintage">Kertas Vintage</option>
                      <option value="romantis">Romantis</option>
                      <option value="midnight">Midnight (Biru Gelap)</option>
                      <option value="forest">Forest</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aksesoris Amplop</label>
                    <select className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, accessory: e.target.value})}>
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
                  <input type="text" className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, musicLink: e.target.value})} />
                </div>
              </div>

              {/* HADIAH VIRTUAL */}
              <div className="bg-[#f9f5f0] p-4 rounded-lg border border-[#e8dcc7] space-y-4">
                <h3 className="font-serif text-lg text-gray-800 border-b pb-2">Hadiah Virtual Akhir</h3>
                <select className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, giftType: e.target.value})}>
                  <option value="kembangApi">Kembang Api 🎆</option>
                  <option value="bintang">Hujan Bintang ⭐</option>
                  <option value="bunga">Bunga Berguguran 🌸</option>
                  <option value="bungaTumbuh">Taman Bunga Mekar 🌷</option>
                </select>
                <textarea rows={2} placeholder="Pesan Khusus Hadiah (Opsional)" className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, giftMessage: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-gray-800 text-white font-medium py-3 rounded-md hover:bg-gray-700">
                Bungkus & Buat Link Kejutan
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-3xl font-serif text-gray-800 mb-2">Surat Siap Dikirim!</h2>
            
            <div className="bg-white p-4 rounded-xl shadow-md border mb-6 inline-block mt-4">
              <QRCodeSVG value={shareUrl} size={180} level={"H"} />
            </div>

            <div className="flex items-center w-full max-w-md bg-gray-50 border rounded-lg overflow-hidden mb-6">
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent p-3 text-sm outline-none text-gray-600" />
              <button onClick={copyToClipboard} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-3 hover:bg-gray-700 transition-colors">
                <Copy className="w-4 h-4"/> {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>
            
            <a href={shareUrl} target="_blank" className="text-[#a89575] hover:underline flex items-center gap-2 font-medium">
              Lihat Hasil Surat <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </main>
  );
}