"use client";

import { BoardTable } from "./BoardComponents";
import { BoardGallery } from "./BoardGallery";
import { BoardCardList } from "./BoardCardList";

interface BoardPost {
    id: number;
    title: string;
    content?: string;
    author: string | null;
    category: string;
    thumbnail?: string | null;
    createdAt: Date;
    attachments: { fileUrl: string; fileType: string }[];
    _count: {
        comments: number;
    };
}

interface BoardListProps {
    posts: any[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    category: string;
    settings: any;
}

export function BoardList({
    posts,
    totalCount,
    currentPage,
    pageSize,
    category,
    settings
}: BoardListProps) {
    const layoutType = settings?.layoutType || 'LIST';

    switch (layoutType) {
        case 'CARD':
            return (
                <BoardCardList
                    posts={posts}
                    category={category}
                />
            );
        case 'GALLERY':
            return (
                <BoardGallery
                    posts={posts}
                    category={category}
                />
            );
        case 'LIST':
        default:
            return (
                <div className="bg-white border-y md:border border-slate-100 md:rounded-3xl overflow-hidden shadow-sm md:shadow-md transition-all">
                    <BoardTable
                        posts={posts}
                        totalCount={totalCount}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        category={category}
                        settings={settings}
                    />
                </div>
            );
    }
}
