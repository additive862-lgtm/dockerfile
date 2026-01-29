'use client';

import { useState, useEffect, useRef } from 'react';
import { createComment, deleteComment, updateComment } from '@/lib/actions/board';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MessageSquare, User, Reply, MoreVertical, Edit2, Trash2, X, CornerDownRight } from 'lucide-react';
import { Button } from '../ui/button';

interface Comment {
    id: number;
    author: string;
    authorId: string | null;
    content: string;
    createdAt: Date;
    parentId: number | null;
    isDeleted: boolean;
}

export function CommentSection({ postId, initialComments }: { postId: number, initialComments: any[] }) {
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

    // Build comment tree (Flattened to 1-level as per user request)
    // 1. Root comments
    const rootComments = initialComments.filter(c => !c.parentId);

    // 2. Map children to their top-level root
    const rootMap: Record<number, any[]> = {};
    rootComments.forEach(root => rootMap[root.id] = []);

    // Function to find top-level parent ID
    const findRootId = (parentId: number): number | null => {
        const parent = initialComments.find(c => c.id === parentId);
        if (!parent) return null;
        if (!parent.parentId) return parent.id;
        return findRootId(parent.parentId);
    };

    initialComments.forEach(comment => {
        if (comment.parentId) {
            const rootId = findRootId(comment.parentId);
            if (rootId && rootMap[rootId]) {
                rootMap[rootId].push(comment);
            }
        }
    });

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
        } else {
            alert(result.error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="mt-12 space-y-8">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
                <MessageSquare size={20} className="text-slate-900" />
                <h3 className="text-lg font-bold text-slate-900">댓글 {initialComments.filter(c => !c.isDeleted || (c.isDeleted && initialComments.some(r => r.parentId === c.id))).length}</h3>
            </div>

            {/* List */}
            <div className="space-y-1">
                {rootComments.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">첫 번째 댓글을 남겨보세요.</p>
                ) : (
                    rootComments.map((comment) => (
                        <div key={comment.id} className="space-y-1">
                            {/* If it's deleted and has no actual visible replies, we might hide it, 
                                but the user said "있을 경우 '삭제된 댓글입니다'를 나오게 하고", 
                                and we already filter replies in the count and logic. */}
                            <CommentItem
                                comment={comment}
                                postId={postId}
                                session={session}
                                depth={0}
                            />
                            {/* Render all flattened replies for this root */}
                            {rootMap[comment.id].map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    postId={postId}
                                    session={session}
                                    depth={1}
                                />
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* Root Form */}
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

function CommentItem({ comment, postId, session, depth }: { comment: Comment, postId: number, session: any, depth: number }) {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const actionsRef = useRef<HTMLDivElement>(null);

    const isOwner = session?.user?.id === comment.authorId;
    const isAdmin = session?.user?.role === 'ADMIN';

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        setIsSubmitting(true);
        const name = session?.user?.name || 'Anonymous';
        const result = await createComment(postId, name, replyContent, session?.user?.id, comment.id);
        if (result.success) {
            setReplyContent('');
            setIsReplying(false);
        } else {
            alert(result.error);
        }
        setIsSubmitting(false);
    };

    const handleUpdate = async () => {
        if (!editContent.trim()) return;
        setIsSubmitting(true);
        const result = await updateComment(comment.id, editContent);
        if (result.success) {
            setIsEditing(false);
        } else {
            alert(result.error);
        }
        setIsSubmitting(false);
    };

    const handleDelete = async () => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;
        const result = await deleteComment(comment.id);
        if (!result.success) {
            alert(result.error);
        }
    };

    if (comment.isDeleted) {
        return (
            <div className={`flex gap-4 py-4 px-2 ${depth > 0 ? 'ml-12 italic text-slate-400 bg-slate-50/30 rounded-xl' : ''}`}>
                <div className="flex-1 text-sm bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                    삭제된 댓글입니다.
                </div>
            </div>
        );
    }

    return (
        <div className={`group relative flex gap-4 p-4 rounded-2xl transition-all hover:bg-slate-50/50 ${depth > 0 ? 'ml-12 border-l-2 border-slate-100 pl-6' : ''}`}>
            {depth > 0 && <CornerDownRight size={16} className="text-slate-300 absolute -left-1 top-6" />}

            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                <User size={20} />
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-sm">{comment.author}</span>
                        <span className="text-[11px] text-slate-400">
                            {format(new Date(comment.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                        </span>
                    </div>

                    {(isOwner || isAdmin) && !isEditing && (
                        <div className="relative" ref={actionsRef}>
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                            >
                                <MoreVertical size={16} />
                            </button>
                            {showActions && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 shadow-xl rounded-xl py-1 z-20 min-w-[100px]">
                                    <button
                                        onClick={() => { setIsEditing(true); setShowActions(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                        <Edit2 size={12} /> 수정
                                    </button>
                                    <button
                                        onClick={() => { handleDelete(); setShowActions(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                                    >
                                        <Trash2 size={12} /> 삭제
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none min-h-[80px]"
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>취소</Button>
                            <Button size="sm" className="bg-slate-900" onClick={handleUpdate} disabled={isSubmitting}>
                                {isSubmitting ? '수정 중...' : '수정 완료'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed font-medium">
                            {comment.content}
                        </p>
                        {!isReplying && (
                            <button
                                onClick={() => setIsReplying(true)}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <Reply size={12} className="rotate-180" /> 답글 달기
                            </button>
                        )}
                    </div>
                )}

                {isReplying && (
                    <form onSubmit={handleReply} className="mt-4 p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
                        <textarea
                            placeholder="답글을 남겨보세요..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full p-3 text-sm outline-none resize-none bg-slate-50 rounded-lg h-20"
                            required
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" size="sm" variant="ghost" onClick={() => setIsReplying(false)}>취소</Button>
                            <Button type="submit" size="sm" className="bg-slate-900" disabled={isSubmitting}>
                                {isSubmitting ? '등록 중...' : '답글 등록'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
