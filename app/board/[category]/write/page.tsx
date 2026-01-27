import dynamic from 'next/dynamic';
import { getBoardSettingsByCategory, getBoardPostDetail } from '@/lib/actions/board';
import BoardHeader from '../../../components/board/BoardHeader';

const BoardWriteForm = dynamic(
    () => import('../../../components/board/BoardWriteForm').then(mod => mod.BoardWriteForm),
    { ssr: false }
);

interface PageProps {
    params: { category: string };
    searchParams: { tab?: string, id?: string };
}

const CATEGORY_MAP: Record<string, string> = {
    'daily-homily': '오늘의 강론',
    'sunday-homily': '주일/대축일 강론',
    'feast-homily': '축일/기념일 강론',
    'special-homily': '특별강론',
    'church': '교회사',
    'bible': '성경',
    'free-board': '자유게시판',
    'gallery': '갤러리',
    'qna': '질문과 답변',
};

export default async function BoardWritePage({ params, searchParams }: PageProps) {
    const { category } = params;
    const { id: editIdStr, tab } = searchParams;
    const editId = editIdStr ? parseInt(editIdStr) : undefined;

    const [settings, initialData] = await Promise.all([
        getBoardSettingsByCategory(category),
        editId ? getBoardPostDetail(editId) : Promise.resolve(null)
    ]);

    const title = editId ? '게시글 수정' : (settings?.name || CATEGORY_MAP[category] || '게시판');
    const subTitle = editId ? '내용을 수정하고 저장해주세요.' : '새로운 소중한 글을 들려주세요.';

    return (
        <div className="bg-white min-h-screen">
            <BoardHeader title={title} description={subTitle} category={category} />

            <div className="max-w-4xl mx-auto px-6 pb-24 min-h-[600px]">
                <BoardWriteForm
                    category={category}
                    initialTab={tab as string | undefined}
                    settings={settings as any}
                    editId={editId}
                    initialData={initialData}
                />
            </div>
        </div>
    );
}
