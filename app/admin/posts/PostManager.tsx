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
                <CardHeader>
                    <CardTitle>게시판 통합 관리</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedCategory}>
                            <TabsList className="bg-transparent h-auto p-2">
                                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    전체보기
                                </TabsTrigger>
                                {boardStats.map((board) => (
                                    <TabsTrigger
                                        key={board.category}
                                        value={board.category}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
                                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
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
                </CardContent>
            </Card>
        </div>
    );
}
