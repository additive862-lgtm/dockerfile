'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { deleteBoardPost } from '@/lib/actions/board';
import { Edit, Trash2 } from 'lucide-react';

interface PostTopActionsProps {
    postId: number;
    category: string;
    isOwner: boolean;
    isAdmin: boolean;
}

export function PostTopActions({ postId, category, isOwner, isAdmin }: PostTopActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOwner && !isAdmin) return null;

    const handleDelete = async () => {
        if (!confirm('정말로 이 게시물을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteBoardPost(postId);
            if (result.success) {
                alert('삭제되었습니다.');
                router.push(`/board/${category}`);
                router.refresh();
            } else {
                alert(result.error || '삭제 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('오류가 발생했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/board/${category}/write?id=${postId}`)}
                className="h-9 px-4 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-all font-bold"
            >
                <Edit size={16} />
                수정
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-9 px-4 gap-2 text-rose-500 border-rose-100 bg-rose-50/30 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold"
            >
                <Trash2 size={16} />
                {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
        </div>
    );
}
