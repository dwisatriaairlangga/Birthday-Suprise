'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2, ExternalLink, ImagePlus, Plus, Trash2 } from 'lucide-react';

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

  // Handle Upload Foto ke Base64 (Maksimal 3 foto untuk mencegah limit localStorage)
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

  // Handle Multi-kontributor
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = `untuk-${formData.receiver.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
    const letters = JSON.parse(localStorage.getItem('letters') || '{}');
    letters[slug] = formData;
    localStorage.setItem('letters', JSON.stringify(letters));

    const url = `${window.location.origin}/${slug}`;
    setShareUrl(url);
    setIsSubmitted(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Isi Surat Puitis (Gunakan 'Enter' untuk paragraf baru)</label>
                <textarea required rows={5} placeholder="Paragraf 1...&#10;&#10;Paragraf 2..." className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>

              {/* FITUR BARU: UPLOAD FOTO */}
              <div className="bg-[#f0f8ff] p-4 rounded-lg border border-[#add8e6] space-y-4">
                <h3 className="font-serif text-lg text-gray-800 border-b border-[#add8e6] pb-2 flex items-center gap-2">
                  <ImagePlus className="w-5 h-5"/> Galeri Kenangan
                </h3>
                <p className="text-xs text-gray-600">Foto akan disisipkan di sela-sela paragraf surat. (Maksimal 3 foto untuk versi prototipe ini).</p>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={formData.photos.length >= 3} className="text-sm" />
                {formData.photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pt-2">
                    {formData.photos.map((src, i) => (
                      <img key={i} src={src} alt="Preview" className="h-16 w-16 object-cover rounded shadow" />
                    ))}
                  </div>
                )}
              </div>

              {/* FITUR BARU: WALL OF MESSAGES */}
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

              {/* Panel Personalisasi Tampilan (Sama seperti sebelumnya) */}
              <div className="bg-[#fdfbf7] p-4 rounded-lg border border-[#e8dcc7] space-y-4">
                <h3 className="font-serif text-lg text-gray-800 border-b pb-2">Kustomisasi Tampilan & Suara</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tema Warna</label>
                    <select className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, theme: e.target.value})}>
                      <option value="vintage">Kertas Vintage (Coklat Lembut)</option>
                      <option value="romantis">Romantis (Pink Blush)</option>
                      <option value="midnight">Midnight (Biru Dongker)</option>
                      <option value="forest">Forest (Hijau Pinus)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aksesoris Amplop</label>
                    <select className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, accessory: e.target.value})}>
                      <option value="waxseal">Wax Seal (Stempel Lilin) 💧</option>
                      <option value="pita">Pita Elegan 🎀</option>
                      <option value="bunga">Bunga Kering 🌸</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Musik (YouTube/Spotify)</label>
                  <input type="text" className="w-full border-gray-300 rounded-md p-2 border" onChange={e => setFormData({...formData, musicLink: e.target.value})} />
                </div>
              </div>

              {/* Panel Hadiah */}
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
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent p-3 text-sm outline-none" />
              <button onClick={copyToClipboard} className="bg-gray-800 text-white px-4 py-3"><Copy className="w-4 h-4"/></button>
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