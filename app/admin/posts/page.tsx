import { getBoardSettings, getPostsStats, getPostsWithComments } from "@/app/actions/admin";
import { PostManager } from "./PostManager";

export default async function PostManagementPage() {
    const [boardStats, posts, allSettings] = await Promise.all([
        getPostsStats(),
        getPostsWithComments(),
        getBoardSettings()
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">게시글 통합 관리</h2>
                <p className="text-muted-foreground">사이트 내 모든 게시판의 글을 한눈에 관리하고 카테고리별로 필터링할 수 있습니다.</p>
            </div>

            <PostManager boardStats={boardStats} initialPosts={posts} allSettings={allSettings as any} />
        </div>
    );
}
