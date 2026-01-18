'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { deleteBoardPost } from '@/lib/actions/board';
import { List, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostActionsProps {
    postId: number;
    category: string;
    isOwner: boolean;
    isAdmin: boolean;
}

export function PostActions({ postId, category, isOwner, isAdmin }: PostActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('정말로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteBoardPost(postId);
            if (result.success) {
                alert('게시글이 삭제되었습니다.');
                router.push(`/board/${category}`);
                router.refresh();
            } else {
                alert(result.error || '삭제 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('삭제 장 오류가 발생했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center justify-between py-6 border-t border-slate-100">
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={() => router.push(`/board/${category}`)}
                    className="gap-2 text-slate-600 hover:text-[#001f3f] border-slate-200"
                >
                    <List size={16} />
                    목록
                </Button>
            </div>

            {(isOwner || isAdmin) && (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/board/${category}/write?id=${postId}`)}
                        className="gap-2 text-slate-600 hover:text-blue-600 border-slate-200"
                    >
                        <Edit size={16} />
                        수정
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="gap-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                    >
                        <Trash2 size={16} />
                        {isDeleting ? '삭제 중...' : '삭제'}
                    </Button>
                </div>
            )}
        </div>
    );
}
