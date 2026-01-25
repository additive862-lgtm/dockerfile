import { getBoardSettings, initializeBoardSettings, checkAdmin } from "@/app/actions/admin";
import { BoardManager } from "./BoardManager";
import { getCategoryDisplayName } from "@/lib/board-utils";

const INITIAL_BOARDS = [
    { category: 'church', name: '교회사', categories: ['한국교회사:church-korea', '세계교회사:church-world'] },
    { category: 'bible', name: '성경', categories: ['구약:bible-old', '신약:bible-new'] },
    { category: 'daily-homily', name: '강론', categories: [] },
    { category: 'mamdo-commentary', name: '맘도 성서 해설', categories: [] },
    { category: 'free-board', name: '자유게시판', categories: [] },
    { category: 'gallery', name: '갤러리', categories: [] },
    { category: 'qna', name: '질문과 답변', categories: [] },
    { category: 'story-spring', name: '이야기 샘', categories: [] }
];

export default async function BoardManagementPage() {
    await checkAdmin();
    let settings = await getBoardSettings();

    if (settings.length === 0) {
        await initializeBoardSettings(INITIAL_BOARDS);
        settings = await getBoardSettings();
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">게시판 관리</h2>
                <p className="text-muted-foreground">게시판별 권한, 기능, 카테고리 태그 등을 제어할 수 있습니다.</p>
            </div>

            <BoardManager initialSettings={settings as any} />
        </div>
    );
}
