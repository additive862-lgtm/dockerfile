import { ArrowRight, BookOpen, Heart, Upload } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-50" />

        <div className="relative z-20 text-center max-w-4xl px-4 space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            말씀, <span className="text-sky-400">삶이 되다</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 font-light max-w-2xl mx-auto">
            이석재 토마스 데 아퀴나스 신부와 함께하는<br />
            깊이 있는 성경 묵상과 교회사 여행
          </p>
          <div className="pt-8">
            <Link
              href="/about"
              className="inline-flex items-center px-8 py-3 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
            >
              두돌 소개 <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
        {[
          { icon: <BookOpen className="w-8 h-8 text-indigo-500" />, title: '매일의 강론', desc: '오늘을 살아가는 지혜와 영성을 전합니다.' },
          { icon: <Upload className="w-8 h-8 text-sky-500" />, title: '자료실', desc: '용량 제한 없이 모든 파일을 공유하세요.' },
          { icon: <Heart className="w-8 h-8 text-rose-500" />, title: '커뮤니티', desc: '신자들과 함께 나누는 따뜻한 이야기.' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="mb-4">{item.icon}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
            <p className="text-slate-600">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
