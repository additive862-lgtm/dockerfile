import { getBoardPosts, getBoardSettingsByCategory } from '@/lib/actions/board';
import { Pagination } from '../../components/board/BoardComponents';
import { BoardList } from '../../components/board/BoardList';
import { BoardTabs } from '../../components/board/BoardTabs';
import { getMappedCategory } from '@/lib/board-utils';

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



export default async function BoardCategoryPage({ params, searchParams }: PageProps) {
    const { category } = params;
    const { page, tab } = searchParams;

    const currentPage = parseInt(page || '1');
    const pageSize = category === 'gallery' ? 9 : 10;

    // Fetch dynamic settings from CMS
    const settings = await getBoardSettingsByCategory(category);

    // Map route category + tab -> DB category key (or keys)
    const dbCategory = getMappedCategory(category, tab, settings);

    const { posts, totalCount } = await getBoardPosts(dbCategory, currentPage, pageSize);

    // Determine Display Title
    // If it's a main category with tabs, use MAIN_TITLE_MAP, otherwise use CATEGORY_MAP based on dbCategory
    // If settings has a name, use it as priority
    const title = settings?.name || MAIN_TITLE_MAP[category] || (typeof dbCategory === 'string' ? CATEGORY_MAP[dbCategory] : null) || '게시판';

    const isGallery = category === 'gallery';

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-slate-50 py-16 border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-between items-end">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-extrabold text-[#001f3f] tracking-tight">{title}</h1>
                            <p className="text-lg text-slate-500 font-medium">유익한 정보와 소식을 나누는 공간입니다.</p>
                        </div>
                        <Link
                            href={`/board/${category}/write?tab=${tab || ''}`} // Pass current tab to write page
                            className="flex items-center gap-2 px-6 py-3.5 bg-[#001f3f] text-white rounded-2xl hover:bg-blue-900 transition-all font-bold shadow-xl shadow-slate-200"
                        >
                            <PenSquare size={20} />
                            <span>글쓰기</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">

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

                <Pagination
                    totalCount={totalCount}
                    currentPage={currentPage}
                    pageSize={pageSize}
                />
            </div>
        </div>
    );
}
