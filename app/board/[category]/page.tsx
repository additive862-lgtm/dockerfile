import { getBoardPosts, getBoardSettingsByCategory } from '@/lib/actions/board';
import { Pagination } from '../../components/board/BoardComponents';
import { BoardList } from '../../components/board/BoardList';
import { BoardTabs } from '../../components/board/BoardTabs';
import { getMappedCategory } from '@/lib/board-utils';
import { auth } from '@/auth';

import Link from 'next/link';
import { PenSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: { category: string };
    searchParams: { page?: string; tab?: string };
}

const CATEGORY_MAP: Record<string, string> = {
    'daily-homily': '오늘의 강론',
    'sunday-homily': '주일/대축일 강론',
    'feast-homily': '축일/기념일 강론',
    'special-homily': '특별강론',
    'church-korea': '교회사-한국',
    'church-world': '교회사-세계',
    'bible-old': '성경-구약',
    'bible-new': '성경-신약',
    'mamdo-commentary': '맘도 성서 해설',
    'free-board': '자유게시판',
    'gallery': '갤러리',
    'story-spring': '이야기 샘',
    'qna': '질문과 답변',
};

// Titles for the main category page (when tabs exist)
const MAIN_TITLE_MAP: Record<string, string> = {
    'church': '교회사',
    'bible': '성경',
};



import BoardHeader from '../../components/board/BoardHeader';

export default async function BoardCategoryPage({ params, searchParams }: PageProps) {
    const { category } = params;
    const { page, tab } = searchParams;

    const session = await auth();
    const currentPage = parseInt(page || '1');

    // Fetch dynamic settings from CMS
    const settings = await getBoardSettingsByCategory(category);

    // Determine Page Size (CMS Setting > Default)
    const defaultPageSize = category === 'gallery' ? 9 : 10;
    const pageSize = settings?.postsPerPage || defaultPageSize;

    // Map route category + tab -> DB category key (or keys)
    const dbCategory = getMappedCategory(category, tab, settings);

    const { posts, totalCount } = await getBoardPosts(dbCategory, currentPage, pageSize);

    // Determine Display Title
    // If it's a main category with tabs, use MAIN_TITLE_MAP, otherwise use CATEGORY_MAP based on dbCategory
    // If settings has a name, use it as priority
    const title = settings?.name || MAIN_TITLE_MAP[category] || (typeof dbCategory === 'string' ? CATEGORY_MAP[dbCategory] : null) || '게시판';
    const description = "유익한 정보와 소식을 나누는 공간입니다.";

    // Permission Check
    const writePermission = settings?.writePermission || 'USER';
    const canWrite =
        writePermission === 'GUEST' ||
        (writePermission === 'USER' && !!session?.user) ||
        (writePermission === 'ADMIN' && session?.user?.role === 'ADMIN');

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <BoardHeader title={title} description={description} category={category} />

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-12 relative">

                {/* Tabs (Rendered if configured for this category) */}
                <BoardTabs category={category} settings={settings as any} />

                <BoardList
                    posts={posts}
                    totalCount={totalCount}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    category={category}
                    settings={settings}
                />

                <div className="relative mt-12">
                    <div className="flex justify-center">
                        <Pagination
                            totalCount={totalCount}
                            currentPage={currentPage}
                            pageSize={pageSize}
                        />
                    </div>
                    {/* Write Button: Centered below on mobile, Absolute right on desktop */}
                    {canWrite && (
                        <div className="mt-8 md:mt-0 md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 flex justify-center">
                            <Link
                                href={`/board/${category}/write?tab=${tab || ''}`}
                                className="flex items-center gap-2 px-8 py-3.5 bg-[#001f3f] text-white rounded-2xl hover:bg-blue-900 transition-all font-bold shadow-xl shadow-blue-100/50"
                            >
                                <PenSquare size={20} />
                                <span>글쓰기</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
