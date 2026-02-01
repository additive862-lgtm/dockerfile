import { getAdminStats, getRecentUsers, getBoardSettings, checkAdmin } from "@/app/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table";
import { Users, UserPlus, FileText, PenTool } from "lucide-react";
import HomeBoardSelector from "./HomeBoardSelector";

export default async function AdminDashboardPage() {
    // 1. Perform admin check sequentially before parallel data fetching
    await checkAdmin();

    const [stats, recentUsers, allBoards] = await Promise.all([
        getAdminStats(),
        getRecentUsers(),
        getBoardSettings()
    ]);

    const statCards = [
        { title: "총 회원 수", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600" },
        { title: "오늘 가입자", value: stats?.todayUsers ?? 0, icon: UserPlus, color: "text-green-600" },
        { title: "전체 게시글 수", value: stats?.totalPosts ?? 0, icon: FileText, color: "text-purple-600" },
        { title: "오늘 새 글", value: stats?.todayPosts ?? 0, icon: PenTool, color: "text-orange-600" },
    ];

    return (
        <div className="space-y-6 md:space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">대시보드 홈</h2>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Members */}
            <Card>
                <CardHeader>
                    <CardTitle>최근 가입한 회원</CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    {/* Desktop Table - Hidden on mobile */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>이름/닉네임</TableHead>
                                    <TableHead>이메일</TableHead>
                                    <TableHead>권한</TableHead>
                                    <TableHead className="text-right">가입일</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name} ({user.nickname || "N/A"})
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card List - Visible on mobile */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {recentUsers.map((user) => (
                            <div key={user.id} className="p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-slate-900">
                                        {user.name} <span className="text-slate-400 text-xs font-normal">({user.nickname || "N/A"})</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-600"
                                        }`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-500 truncate">{user.email}</div>
                                <div className="text-[11px] text-slate-400">가입일: {new Date(user.createdAt).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Main Page Board Selection */}
            <HomeBoardSelector initialBoards={allBoards} />
        </div>
    );
}
