"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { updateProfile, deleteAccount } from "@/app/actions/auth";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";

import { type Session } from "next-auth";

export default function ProfileForm({ initialUser }: { initialUser: Session["user"] }) {
    const { update } = useSession();
    const [nickname, setNickname] = useState(initialUser?.nickname || "");
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setMessage(null);

        const result = await updateProfile(nickname);

        if (result.success) {
            await update({ nickname });
            setMessage({ type: "success", text: "세례명이 성공적으로 수정되었습니다." });
        } else {
            setMessage({ type: "error", text: result.error || "수정 중 오류가 발생했습니다." });
        }
        setIsPending(false);
    };

    const handleDelete = async () => {
        if (confirm("정말로 회원 탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            const result = await deleteAccount();
            if (result.success) {
                alert("그동안 이용해 주셔서 감사합니다.");
                window.location.href = "/";
            } else {
                alert(result.error);
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">내 정보</CardTitle>
                <CardDescription>회원님의 정보를 확인하고 수정할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label className="text-slate-500">이메일</Label>
                        <p className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-700">
                            {initialUser?.email}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-500">이름</Label>
                        <p className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-700">
                            {initialUser?.name}
                        </p>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                            <Label htmlFor="nickname">세례명 (수정 가능)</Label>
                            <Input
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="세례명을 입력하세요"
                            />
                        </div>

                        {message && (
                            <p className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
                                {message.text}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-[#CA0F19] hover:bg-[#B10D16]"
                            disabled={isPending}
                        >
                            {isPending ? "저장 중..." : "세례명 저장하기"}
                        </Button>
                    </form>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t border-slate-100 pt-6">
                <div className="w-full flex justify-end">
                    <button
                        onClick={handleDelete}
                        className="text-sm text-slate-400 hover:text-red-500 underline transition-colors"
                    >
                        회원 탈퇴하기
                    </button>
                </div>
            </CardFooter>
        </Card>
    );
}
