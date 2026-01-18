'use client';

import { useState, useEffect } from 'react';
import { createComment } from '@/lib/actions/board';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MessageSquare, User } from 'lucide-react';

interface Comment {
    id: number;
    author: string;
    content: string;
    createdAt: Date;
}

export function CommentSection({ postId, initialComments }: { postId: number, initialComments: Comment[] }) {
    const { data: session, status } = useSession();
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setAuthor(session.user.name);
        } else if (status === 'unauthenticated') {
            setAuthor('');
        }
    }, [session, status]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalAuthor = session?.user?.name || author;
        if (!finalAuthor || !content) {
            if (!finalAuthor) alert('작성자 이름을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        const result = await createComment(postId, finalAuthor, content, session?.user?.id);
        if (result.success) {
            setContent('');
            // Non-logged in users might want to keep the name for next comment, 
            // but for security/UX simplicity, we'll keep the author state as is (it's managed by useEffect for logged in anyway)
        } else {
            alert(result.error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="mt-12 space-y-8">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
                <MessageSquare size={20} className="text-slate-900" />
                <h3 className="text-lg font-bold text-slate-900">댓글 {initialComments.length}</h3>
            </div>

            {/* List */}
            <div className="space-y-6">
                {initialComments.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">첫 번째 댓글을 남겨보세요.</p>
                ) : (
                    initialComments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                <User size={20} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-900 text-sm">{comment.author}</span>
                                    <span className="text-xs text-slate-400">
                                        {format(new Date(comment.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                                    </span>
                                </div>
                                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                {status !== 'authenticated' && (
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="작성자"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-40 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                            required
                        />
                    </div>
                )}
                {status === 'authenticated' && (
                    <div className="flex items-center gap-2 px-1 text-slate-500 text-sm font-bold">
                        <User size={14} />
                        <span>{session?.user?.name} 님으로 댓글을 남깁니다.</span>
                    </div>
                )}
                <div className="relative">
                    <textarea
                        placeholder="댓글을 입력하세요..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none font-medium"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="absolute bottom-3 right-3 px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 disabled:bg-slate-300 transition-colors"
                    >
                        {isSubmitting ? '등록 중...' : '등록'}
                    </button>
                </div>
            </form>
        </div>
    );
}
