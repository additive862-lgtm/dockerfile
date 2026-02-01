import { getAllUsers, checkAdmin } from "@/app/actions/admin";
import { UserTable } from "./UserTable";

export default async function MemberManagementPage() {
    await checkAdmin();
    const users = await getAllUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">회원 관리</h2>
                    <p className="text-sm md:text-base text-muted-foreground">사이트의 모든 사용자를 관리하고 권한을 설정할 수 있습니다.</p>
                </div>
            </div>

            <UserTable users={users} />
        </div>
    );
}
