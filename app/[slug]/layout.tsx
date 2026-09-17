import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

// Mengambil data secara dinamis dari Supabase untuk judul WhatsApp
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { data } = await supabase
    .from('letters')
    .select('receiver, theme')
    .eq('slug', resolvedParams.slug)
    .single();

  const receiverName = data?.receiver || 'Kamu';
  const isBox = data?.theme?.includes('Box');

  return {
    title: `Kejutan Spesial untuk ${receiverName} 🎁`,
    description: `Hai, Kau mendapatkan sebuah ${isBox ? 'Kotak Rahasia' : 'Surat Spesial'} Nih!`,
    openGraph: {
      title: `Kejutan Spesial untuk ${receiverName} 🎁`,
      description: `Ada ${isBox ? 'Kotak Rahasia' : 'Surat Spesial'} yang menunggumu. Buka sekarang!`,
      type: 'website',
    },
  };
}

export default function LetterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}