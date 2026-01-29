import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getCategoryDisplayName, TAB_CONFIG } from '@/lib/board-utils';

interface BoardPost {
    id: number;
    title: string;
    author: string | null;
    category: string;
    createdAt: Date;
    _count: {
        comments: number;
    };
}

export function BoardTable({ posts, totalCount, currentPage, pageSize, category, settings }: { posts: BoardPost[], totalCount: number, currentPage: number, pageSize: number, category: string, settings?: any }) {
    const hasCategories = (settings?.categories?.length > 0) || !!TAB_CONFIG[category];


    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
                <thead>
                    <tr className="border-y border-slate-200 bg-slate-50 font-semibold text-slate-700">
                        <th className="px-4 py-3 w-16 text-center">No</th>
                        {hasCategories && <th className="px-4 py-3 w-28 text-center">구분</th>}
                        <th className="px-4 py-3">제목</th>
                        <th className="px-4 py-3 w-32 text-center">작성자</th>
                        <th className="px-4 py-3 w-32 text-center">등록일</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {posts.length === 0 ? (
                        <tr>
                            <td colSpan={hasCategories ? 5 : 4} className="px-4 py-10 text-center text-slate-500">
                                등록된 게시글이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        posts.map((post, index) => (
                            <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-4 py-4 text-center text-slate-500 font-medium">
                                    {totalCount - (currentPage - 1) * pageSize - index}
                                </td>
                                {hasCategories && (
                                    <td className="px-4 py-4 text-center text-slate-500">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                                            {getCategoryDisplayName(post.category, settings)}
                                        </span>
                                    </td>
                                )}
                                <td className="px-4 py-4">
                                    <Link href={`/board/${category}/${post.id}`} className="flex items-center gap-2 hover:underline decoration-slate-300 underline-offset-4">
                                        <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-md">
                                            {post.title}
                                        </span>
                                        {post._count.comments > 0 && (
                                            <span className="text-rose-500 font-bold text-xs bg-rose-50 px-1.5 py-0.5 rounded">
                                                {post._count.comments}
                                            </span>
                                        )}
                                    </Link>
                                </td>
                                <td className="px-4 py-4 text-center text-slate-600">
                                    {post.author || '익명'}
                                </td>
                                <td className="px-4 py-4 text-center text-slate-500">
                                    {format(new Date(post.createdAt), 'yyyy-MM-dd', { locale: ko })}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ totalCount, currentPage, pageSize }: { totalCount: number, currentPage: number, pageSize: number }) {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <Link
                href={`?page=${Math.max(1, currentPage - 1)}`}
                className={`p-2 rounded-lg border transition-all ${currentPage === 1 ? 'text-slate-300 pointer-events-none' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <ChevronLeft size={20} />
            </Link>

            {getPageNumbers().map(page => (
                <Link
                    key={page}
                    href={`?page=${page}`}
                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition-all ${page === currentPage
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:border-slate-400'
                        }`}
                >
                    {page}
                </Link>
            ))}

            <Link
                href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                className={`p-2 rounded-lg border transition-all ${currentPage === totalPages ? 'text-slate-300 pointer-events-none' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <ChevronRight size={20} />
            </Link>
        </div>
    );
}

// AttachmentList.tsx
import { FileIcon, ImageIcon, LinkIcon, DownloadIcon } from 'lucide-react';

interface Attachment {
    id: number;
    fileUrl: string;
    fileName: string;
    fileType: 'IMAGE' | 'FILE' | 'LINK';
}

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
    const visibleAttachments = attachments.filter(a => !(a as any).isEmbedded);
    if (visibleAttachments.length === 0) return null;

    return (
        <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                첨부파일 & 링크 <span className="text-slate-400 font-normal">({visibleAttachments.length})</span>
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibleAttachments.map((att) => (
                    <li key={att.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 transition-all group">
                        <div className="text-slate-400">
                            {att.fileType === 'IMAGE' && <ImageIcon size={20} />}
                            {att.fileType === 'FILE' && <FileIcon size={20} />}
                            {att.fileType === 'LINK' && <LinkIcon size={20} />}
                        </div>
                        <a
                            href={att.fileType === 'LINK' ? att.fileUrl : `/api/download/${att.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-sm font-medium text-slate-700 truncate hover:text-blue-600"
                            download={att.fileType !== 'LINK'}
                        >
                            {att.fileName}
                        </a>
                        {att.fileType !== 'LINK' && (
                            <DownloadIcon size={16} className="text-slate-300 group-hover:text-slate-600" />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
