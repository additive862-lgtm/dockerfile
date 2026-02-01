"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/app/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table";

import { MessageSquare, Eye, Calendar, User } from "lucide-react";

import { Post } from "@prisma/client";
import { getCategoryDisplayName } from "@/lib/board-utils";

interface BoardStat {
    category: string;
    count: number;
}

type PostWithCount = Post & {
    _count: { comments: number };
};

export function PostManager({ boardStats, initialPosts, allSettings }: { boardStats: BoardStat[], initialPosts: PostWithCount[], allSettings?: any[] }) {
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Dynamic display map from CMS settings
    const dynamicMap: Record<string, string> = {};
    if (allSettings) {
        allSettings.forEach(board => {
            // Map the main board
            dynamicMap[board.category] = board.name;
            // Map sub-categories
            if (board.categories) {
                board.categories.forEach((c: string) => {
                    const [name, key] = c.split(':');
                    dynamicMap[key || name] = name;
                });
            }
        });
    }

    const getDisplayName = (cat: string) => {
        return dynamicMap[cat] || getCategoryDisplayName(cat);
    };


    const filteredPosts = selectedCategory === "all"
        ? initialPosts
        : initialPosts.filter(p => p.category === selectedCategory);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold">게시판 별 요약</CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:p-6 overflow-hidden">
                    <ScrollArea className="w-full whitespace-nowrap md:border md:rounded-md">
                        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedCategory}>
                            <TabsList className="bg-transparent h-auto p-4 flex gap-2">
                                <TabsTrigger
                                    value="all"
                                    className="data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2 rounded-lg transition-all"
                                >
                                    전체보기
                                </TabsTrigger>
                                {boardStats.map((board) => (
                                    <TabsTrigger
                                        key={board.category}
                                        value={board.category}
                                        className="data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 py-2 rounded-lg transition-all border border-slate-100"
                                    >
                                        {getDisplayName(board.category)} ({board.count})
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">선택된 게시판 글</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredPosts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">미답변 게시글</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {filteredPosts.filter(p => p._count?.comments === 0).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    {/* Desktop Table - Hidden on mobile */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[400px]">제목</TableHead>
                                    <TableHead>작성자</TableHead>
                                    <TableHead>카테고리</TableHead>
                                    <TableHead>조회수</TableHead>
                                    <TableHead>댓글</TableHead>
                                    <TableHead className="text-right">작성일</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPosts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                            게시글이 없습니다.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPosts.map((post) => (
                                        <TableRow key={post.id}>
                                            <TableCell className="font-medium truncate max-w-[400px]">
                                                <a href={`/board/${post.category}/${post.id}`} className="hover:underline">
                                                    {post.title}
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {post.author || "Anonymous"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
                                                    {getDisplayName(post.category)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {post.views}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="h-3 w-3" />
                                                    {post._count?.comments || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card List - Visible on mobile */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {filteredPosts.length === 0 ? (
                            <div className="p-10 text-center text-muted-foreground text-sm">
                                게시글이 없습니다.
                            </div>
                        ) : (
                            filteredPosts.map((post) => (
                                <div key={post.id} className="p-4 space-y-3">
                                    <h4 className="font-bold text-slate-900 leading-snug break-all tracking-tight text-[17px]">
                                        <a href={`/board/${post.category}/${post.id}`} className="hover:text-blue-600">
                                            {post.title}
                                        </a>
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                            {getDisplayName(post.category)}
                                        </span>
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <User className="h-3 w-3" />
                                            {post.author || "Anonymous"}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" /> {post.views}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" /> {post._count?.comments || 0}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
