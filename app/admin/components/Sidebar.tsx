"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    ChevronLeft,
    Menu,
    LayoutGrid,
    ListTodo,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useState } from "react";

const menuItems = [
    { name: "홈/통계", href: "/admin", icon: LayoutDashboard },
    { name: "회원 관리", href: "/admin/members", icon: Users },
    { name: "메뉴 관리", href: "/admin/menus", icon: ListTodo },
    { name: "게시판 관리", href: "/admin/boards", icon: LayoutGrid },
    { name: "게시글 관리", href: "/admin/posts", icon: FileText },
    { name: "시스템 설정", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                >
                    <Menu className="h-4 w-4" />
                </Button>
            </div>

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 bg-white border-r transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-20" : "w-64",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b">
                        <span className={cn("font-bold text-xl text-primary truncate", isCollapsed && "hidden")}>
                            Admin Panel
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                    pathname === item.href
                                        ? "bg-primary text-primary-foreground font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    isCollapsed && "justify-center px-2"
                                )}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                <span className={cn("truncate", isCollapsed && "hidden")}>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t text-xs text-center text-muted-foreground">
                        {!isCollapsed && <p>© 2026 CMS v1.0</p>}
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
