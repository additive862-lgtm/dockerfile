import { getAdminStats, getRecentUsers, getBoardSettings } from "@/app/actions/admin";
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
    const [stats, recentUsers, allBoards] = await Promise.all([
        getAdminStats(),
        getRecentUsers(),
        getBoardSettings()
    ]);

    const statCards = [
        { title: "총 회원 수", value: stats.totalUsers, icon: Users, color: "text-blue-600" },
        { title: "오늘 가입자", value: stats.todayUsers, icon: UserPlus, color: "text-green-600" },
        { title: "전체 게시글 수", value: stats.totalPosts, icon: FileText, color: "text-purple-600" },
        { title: "오늘 새 글", value: stats.todayPosts, icon: PenTool, color: "text-orange-600" },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">대시보드 홈</h2>

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
                <CardContent>
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
                </CardContent>
            </Card>

            {/* Main Page Board Selection */}
            <HomeBoardSelector initialBoards={allBoards} />
        </div>
    );
}
