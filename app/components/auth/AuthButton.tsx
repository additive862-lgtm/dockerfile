"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, Loader2, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AuthButton() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    if (status === "loading") {
        return <div className="p-2"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;
    }

    if (!session) {
        return (
            <div className="flex items-center gap-2 ml-4">
                {/* 로그인 버튼 */}
                <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-[#001f3f] hover:bg-slate-50 rounded-md transition-colors"
                >
                    로그인
                </Link>
                {/* 회원가입 버튼 */}
                <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-bold text-white bg-[#001f3f] hover:bg-[#003366] rounded-md transition-colors shadow-sm"
                >
                    회원가입
                </Link>
            </div>
        );
    }

    return (
        <div className="relative ml-4" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <button
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {session.user?.image ? (
                        <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                        <User size={18} className="text-slate-500" />
                    )}
                </div>
                <span className="font-semibold text-slate-700 text-sm hidden md:block">
                    {session.user?.name || "사용자"}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden py-1 z-50"
                    >
                        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                            <p className="text-sm font-bold text-[#001f3f] truncate">{session.user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
                        </div>

                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-[#001f3f] hover:bg-slate-50 transition-colors"
                        >
                            <User size={16} />
                            내 정보
                        </Link>

                        {session.user?.role === "ADMIN" && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors border-b border-slate-50"
                            >
                                <LayoutDashboard size={16} />
                                관리자 대시보드
                            </Link>
                        )}

                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={16} />
                            로그아웃
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
