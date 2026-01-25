"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";

import { Settings2, MessageSquare, Shield, Info, Plus, Trash2, AlertCircle, Download } from "lucide-react";
import { BoardSettingsForm, type BoardSettings } from "./BoardSettingsForm";
import { deleteBoard, initializeBoardSettings } from "@/app/actions/admin";



const DEFAULT_BOARD: BoardSettings = {
    category: "",
    name: "",
    layoutType: "LIST",
    commentEnabled: true,
    secretPostEnabled: false,
    noticeEnabled: true,
    categories: [],
    writePermission: "USER",
    commentPermission: "USER",
    attachPermission: "USER",
    maxAttachmentCount: 5,
    maxAttachmentSize: 10,
    postsPerPage: 10,
    totalSizeLimit: 50,
    searchFilter: "title_content",
    sortOrder: "latest",
    turnstileEnabled: false,
    mediaEnabled: true,
    defaultImageAlign: 'center',
    defaultImageSize: 'original',
    forbiddenWords: [],
    hwpImportEnabled: false,
    showOnHome: false,
};



export function BoardManager({ initialSettings, initialBoards }: { initialSettings: BoardSettings[], initialBoards?: any[] }) {
    const [settingsList, setSettingsList] = useState<BoardSettings[]>(initialSettings);
    const [editingBoard, setEditingBoard] = useState<BoardSettings | null>(null);
    const [deletingBoard, setDeletingBoard] = useState<BoardSettings | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = (updated: BoardSettings) => {
        setSettingsList(prev => {
            const exists = prev.find(b => b.category === updated.category);
            if (exists) {
                return prev.map(b => b.category === updated.category ? updated : b);
            }
            return [...prev, updated];
        });
        setEditingBoard(null);
    };

    const handleDelete = async () => {
        if (!deletingBoard) return;
        try {
            const res = await deleteBoard(deletingBoard.category);
            if (res.success) {
                setSettingsList(prev => prev.filter(b => b.category !== deletingBoard.category));
                alert("게시판이 삭제되었습니다.");
            }
        } catch (error) {
            alert("삭제 중 오류가 발생했습니다.");
        } finally {
            setDeletingBoard(null);
        }
    };


    const handleInitializeDefaults = async () => {
        if (!initialBoards) return;
        if (!confirm("기본(초기) 게시판 구성을 DB로 가져오시겠습니까? 기존 설정은 유지됩니다.")) return;

        setIsSubmitting(true);
        try {
            const res = await initializeBoardSettings(initialBoards);
            if (res.success) {
                alert("기본 게시판이 생성되었습니다. 페이지를 새로고침합니다.");
                window.location.reload();
            } else {
                alert(res.error || "초기화 실패");
            }
        } catch (error) {
            alert("오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    {initialBoards && settingsList.length < initialBoards.length && (
                        <Button
                            variant="outline"
                            onClick={handleInitializeDefaults}
                            disabled={isSubmitting}
                            className="gap-2 border-slate-200"
                        >
                            <Download className="h-4 w-4" /> 기본 게시판 가져오기
                        </Button>
                    )}
                </div>
                <Button onClick={() => setEditingBoard(DEFAULT_BOARD)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4" /> 게시판 추가
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>등록된 게시판 목록</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>게시판명</TableHead>
                                <TableHead>식별자(Category)</TableHead>
                                <TableHead>주요 기능</TableHead>
                                <TableHead>권한 (쓰기/댓글)</TableHead>
                                <TableHead className="text-right">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {settingsList.map((board) => (
                                <TableRow key={board.category}>
                                    <TableCell className="font-bold text-lg">{board.name}</TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{board.category}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {board.commentEnabled && <span title="댓글 활성"><MessageSquare className="h-4 w-4 text-blue-500" /></span>}
                                            {board.secretPostEnabled && <span title="비밀글 지원"><Shield className="h-4 w-4 text-amber-500" /></span>}
                                            {board.turnstileEnabled && <span title="Turnstile 활성"><Info className="h-4 w-4 text-green-500" /></span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs space-y-1">
                                            <div>쓰기: <span className="font-semibold">{board.writePermission}</span></div>
                                            <div>댓글: <span className="font-semibold">{board.commentPermission}</span></div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => setEditingBoard(board)}
                                            >
                                                <Settings2 className="h-4 w-4" />
                                                설정
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                                                onClick={() => setDeletingBoard(board)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                삭제
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {editingBoard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {editingBoard.category ? `[${editingBoard.name}] 게시판 설정` : "새 게시판 생성"}
                                </h3>
                                <Button variant="ghost" onClick={() => setEditingBoard(null)}>닫기</Button>
                            </div>
                            <BoardSettingsForm
                                settings={editingBoard}
                                onSave={handleUpdate}
                                onCancel={() => setEditingBoard(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingBoard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">게시판 삭제 확인</h3>
                            <p className="text-slate-500 mb-6 leading-relaxed">
                                정말로 <span className="font-bold text-slate-900">[{deletingBoard.name}]</span> 게시판을 삭제하시겠습니까?<br />
                                해당 게시판의 <span className="text-rose-500 font-bold">모든 게시글과 댓글이</span> 영구 삭제됩니다.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="ghost" className="flex-1" onClick={() => setDeletingBoard(null)}>취소</Button>
                                <Button variant="destructive" className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={handleDelete}>삭제하기</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

