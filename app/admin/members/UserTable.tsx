"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, Trash2, UserCog } from "lucide-react";
import { toggleUserRole, deleteUser } from "@/app/actions/admin";


import { User } from "@prisma/client";

type SafeUser = Pick<User, "id" | "email" | "name" | "nickname" | "role" | "createdAt">;

export function UserTable({ users }: { users: SafeUser[] }) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleToggleRole = async (userId: string, currentRole: string) => {
        if (!confirm("권한을 변경하시겠습니까?")) return;
        setLoading(userId);
        try {
            const res = await toggleUserRole(userId, currentRole);
            if (res.success) {
                alert("권한이 변경되었습니다.");
            }
        } catch (error) {
            alert("오류가 발생했습니다.");
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
        setLoading(userId);
        try {
            const res = await deleteUser(userId);
            if (res.error) {
                alert(res.error);
            } else if (res.success) {
                alert("사용자가 삭제되었습니다.");
            }
        } catch (error) {
            alert("오류가 발생했습니다.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="rounded-md border bg-white overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>이름 (닉네임)</TableHead>
                            <TableHead>이메일</TableHead>
                            <TableHead>권한</TableHead>
                            <TableHead>가입일</TableHead>
                            <TableHead className="w-[100px]">작업</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    사용자가 없습니다.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.name} <span className="text-muted-foreground text-xs">({user.nickname || "N/A"})</span>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading === user.id}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>유저 관리</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleToggleRole(user.id, user.role)}>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    <span>권한 변경 ({user.role === "ADMIN" ? "USER" : "ADMIN"})</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>유저 삭제</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-100">
                {users.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground text-sm">
                        사용자가 없습니다.
                    </div>
                ) : (
                    users.map((user) => (
                        <div key={user.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-slate-900">
                                        {user.name} <span className="text-slate-400 text-xs font-normal">({user.nickname || "N/A"})</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">{user.email}</div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={loading === user.id}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>유저 관리</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleToggleRole(user.id, user.role)}>
                                            <Shield className="mr-2 h-4 w-4" />
                                            <span>권한 변경 ({user.role === "ADMIN" ? "USER" : "ADMIN"})</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>유저 삭제</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className={`px-2 py-0.5 rounded-full font-bold ${user.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                    }`}>
                                    {user.role}
                                </span>
                                <span className="text-slate-400 font-sans">
                                    가입일: {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
