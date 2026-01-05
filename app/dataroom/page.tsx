'use client';

import { Upload, File, Film, X } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

export default function DataRoom() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [files] = useState([
        { name: '2026_주보_1월_1주.pdf', size: '2.4 MB', type: 'doc' },
        { name: '성가대_특송_영상.mp4', size: '154 MB', type: 'video' }
    ]);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">자료실</h1>
                <p className="mt-2 text-slate-600">
                    모든 형식의 파일을 자유롭게 공유하고 안전하게 보관하세요.
                </p>
            </div>

            {/* Upload Area */}
            <div
                className={clsx(
                    "relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ease-in-out cursor-pointer",
                    isDragOver ? "border-sky-500 bg-sky-50 scale-[1.01]" : "border-slate-300 hover:border-sky-400 hover:bg-slate-50/50"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    alert("Next.js 환경에서의 파일 업로드 데모입니다.");
                }}
            >
                <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                    여기에 파일을 드래그하세요
                </h3>
                <p className="text-slate-500 mt-2">
                    또는 <span className="text-sky-600 font-medium hover:underline">파일 선택하기</span>
                </p>
            </div>

            {/* File List Mockup */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">최근 업로드</h3>
                </div>
                <ul>
                    {files.map((file, i) => (
                        <li key={i} className="px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    {file.type === 'video' ? <Film size={20} /> : <File size={20} />}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-700">{file.name}</p>
                                    <p className="text-xs text-slate-400">{file.size} • Just now</p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={18} />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
