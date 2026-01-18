"use client";

import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MessageSquare, User, Calendar, ArrowRight } from 'lucide-react';

interface BoardPost {
    id: number;
    title: string;
    content: string;
    author: string | null;
    thumbnail: string | null;
    createdAt: Date;
    attachments: { fileUrl: string; fileType: string }[];
    _count: {
        comments: number;
    };
}

export function BoardCardList({ posts, category }: { posts: any[], category: string }) {
    // Helper to strip HTML tags for summary
    const getSummary = (html: string) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <p className="text-slate-500 text-lg font-medium">등록된 게시물이 없습니다.</p>
                </div>
            ) : (
                posts.map((post) => {
                    const thumbnail = post.thumbnail || post.attachments.find((a: any) => a.fileType === 'IMAGE')?.fileUrl || '/placeholder-img.png';
                    const summary = getSummary(post.content || "").substring(0, 100);

                    return (
                        <Link
                            key={post.id}
                            href={`/board/${category}/${post.id}`}
                            className="group flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-500"
                        >
                            {/* Image Section */}
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <img
                                    src={thumbnail}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/800x500/f8fafc/64748b?text=No+Image';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                    <span className="text-white text-sm font-bold flex items-center gap-2">
                                        자세히 보기 <ArrowRight size={16} />
                                    </span>
                                </div>
                                {post._count.comments > 0 && (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-rose-500 text-xs font-bold shadow-sm flex items-center gap-1.5">
                                        <MessageSquare size={14} />
                                        {post._count.comments}
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-8 flex-1 flex flex-col space-y-4">
                                <h3 className="text-xl font-extrabold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                    {post.title}
                                </h3>

                                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                                    {summary}
                                    {summary.length >= 100 && "..."}
                                </p>

                                <div className="flex items-center justify-between text-slate-400 text-xs font-bold pt-4 border-t border-slate-50 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                            <User size={14} />
                                        </div>
                                        <span className="text-slate-600">{post.author || '익명'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        <span>{format(new Date(post.createdAt), 'yyyy.MM.dd')}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })
            )}
        </div>
    );
}
