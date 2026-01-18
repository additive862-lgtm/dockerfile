import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MessageSquare, User } from 'lucide-react';
import Image from 'next/image';

interface BoardPost {
    id: number;
    title: string;
    author: string | null;
    thumbnail?: string | null;
    createdAt: Date;
    attachments: { fileUrl: string; fileType: string }[];
    _count: {
        comments: number;
    };
}

export function BoardGallery({ posts, category }: { posts: any[], category: string }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-500 text-lg font-medium">등록된 게시물이 없습니다.</p>
                </div>
            ) : (
                posts.map((post) => {
                    const thumbnail = post.thumbnail || post.attachments.find((a: any) => a.fileType === 'IMAGE')?.fileUrl || '/placeholder-img.png';

                    return (
                        <Link
                            key={post.id}
                            href={`/board/${category}/${post.id}`}
                            className="group flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                                <img
                                    src={thumbnail}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x450/f1f5f9/64748b?text=No+Image';
                                    }}
                                />
                                {post._count.comments > 0 && (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-rose-500 text-xs font-bold shadow-sm flex items-center gap-1">
                                        <MessageSquare size={12} />
                                        {post._count.comments}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {post.title}
                                </h3>

                                <div className="flex items-center justify-between text-slate-500 text-sm font-medium pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <User size={12} />
                                        </div>
                                        <span>{post.author || '익명'}</span>
                                    </div>
                                    <span>{format(new Date(post.createdAt), 'yyyy-MM-dd')}</span>
                                </div>
                            </div>
                        </Link>
                    );
                })
            )}
        </div>
    );
}
