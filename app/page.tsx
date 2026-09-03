import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#e8dcc7] p-4 rounded-full mb-6">
        <Mail className="w-12 h-12 text-[#a89575]" />
      </div>
      <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">SuratKejutan</h1>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        Buat surat digital interaktif nan puitis untuk orang tersayang, lengkap dengan memori dan hadiah virtual.
      </p>
      <Link 
        href="/create" 
        className="bg-gray-800 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-700 transition-colors shadow-lg"
      >
        Buat Surat Sekarang - Gratis
      </Link>
    </main>
  );
}
