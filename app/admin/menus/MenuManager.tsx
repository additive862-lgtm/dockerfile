"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
    Plus,
    Trash2,
    Edit2,
    ChevronUp,
    ChevronDown,
    Link as LinkIcon,
    ListTree,
    Save,
    X,
    FolderPlus,
    Download
} from "lucide-react";
import { updateMenu, deleteMenu, reorderMenus, seedDefaultMenus } from "@/app/actions/admin";


interface MenuItem {
    id: number;
    name: string;
    path: string | null;
    icon: string | null;
    order: number;
    parentId: number | null;
    subMenus?: MenuItem[];
}

export function MenuManager({ initialMenus }: { initialMenus: any[] }) {
    const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
    const [editingMenu, setEditingMenu] = useState<Partial<MenuItem> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMenu?.name) return;
        setIsSubmitting(true);
        try {
            const res = await updateMenu(editingMenu.id || null, editingMenu);
            if (res.success) {
                window.location.reload(); // Refresh to get updated state easily
            }
        } catch (error) {
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("정말로 이 메뉴를 삭제하시겠습니까? 하위 메뉴가 있는 경우 함께 삭제됩니다.")) return;
        try {
            const res = await deleteMenu(id);
            if (res.success) {
                window.location.reload();
            }
        } catch (error) {
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const moveMenu = async (index: number, direction: 'up' | 'down', list: MenuItem[], parentId: number | null) => {
        const newList = [...list];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newList.length) return;

        const temp = newList[index];
        newList[index] = newList[targetIndex];
        newList[targetIndex] = temp;

        // Update orders
        const updates = newList.map((item, i) => ({ id: item.id, order: i }));
        await reorderMenus(updates);
        window.location.reload();
    };

    const handleSeed = async () => {
        if (!confirm("현재 사용 중인 기본 메뉴 구성을 DB로 가져오시겠습니까?")) return;
        setIsSubmitting(true);
        try {
            const res = await seedDefaultMenus();
            if (res.success) {
                window.location.reload();
            } else {
                alert(res.error || "가져오기 실패");
            }
        } catch (error) {
            alert("오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderMenuItem = (menu: MenuItem, index: number, total: number) => (
        <div key={menu.id} className="space-y-2">
            <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all group">
                <div className="flex flex-col gap-1">
                    <button
                        disabled={index === 0}
                        onClick={() => moveMenu(index, 'up', menus, null)}
                        className="text-slate-400 hover:text-primary disabled:opacity-30"
                    >
                        <ChevronUp size={16} />
                    </button>
                    <button
                        disabled={index === total - 1}
                        onClick={() => moveMenu(index, 'down', menus, null)}
                        className="text-slate-400 hover:text-primary disabled:opacity-30"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>

                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                    <ListTree size={20} />
                </div>

                <div className="flex-1">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                        {menu.name}
                        {menu.subMenus && menu.subMenus.length > 0 && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                서브 {menu.subMenus.length}
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <LinkIcon size={12} /> {menu.path || "(대메뉴)"}
                    </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingMenu({ parentId: menu.id, order: menu.subMenus?.length || 0 })}
                        title="하위 메뉴 추가"
                    >
                        <FolderPlus size={16} className="text-blue-500" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingMenu(menu)}
                    >
                        <Edit2 size={16} className="text-slate-400" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(menu.id)}
                    >
                        <Trash2 size={16} className="text-rose-400" />
                    </Button>
                </div>
            </div>

            {/* Sub Menus */}
            {menu.subMenus && menu.subMenus.length > 0 && (
                <div className="pl-12 space-y-2 border-l-2 border-slate-100 ml-6">
                    {menu.subMenus.map((sub, subIdx) => (
                        <div key={sub.id} className="flex items-center gap-4 p-3 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-sm transition-all group/sub">
                            <div className="flex-1">
                                <div className="font-semibold text-sm text-slate-700">{sub.name}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                    <LinkIcon size={10} /> {sub.path}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setEditingMenu(sub)}
                                >
                                    <Edit2 size={14} className="text-slate-400" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => handleDelete(sub.id)}
                                >
                                    <Trash2 size={14} className="text-rose-400" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">네비게이션 메뉴 관리</h2>
                    <p className="text-slate-500">사용자 홈페이지 상단 GNB 메뉴를 커스터마이징합니다.</p>
                </div>
                <div className="flex gap-3">
                    {menus.length === 0 && (
                        <Button
                            variant="outline"
                            onClick={handleSeed}
                            disabled={isSubmitting}
                            className="gap-2 border-slate-200 rounded-xl h-12 px-6"
                        >
                            <Download size={18} /> 기본 메뉴 가져오기
                        </Button>
                    )}
                    <Button onClick={() => setEditingMenu({ order: menus.length, parentId: null })} className="gap-2 bg-[#001f3f] hover:bg-[#002f5f] text-white rounded-xl h-12 px-6">
                        <Plus size={20} /> 대메뉴 추가
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-slate-50/30">
                <CardContent className="p-8">
                    <div className="space-y-4">
                        {menus.map((menu, idx) => renderMenuItem(menu, idx, menus.length))}
                        {menus.length === 0 && (
                            <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ListTree size={32} />
                                </div>
                                <p className="text-slate-400 font-medium mb-6">등록된 메뉴가 없습니다.</p>
                                <Button
                                    onClick={handleSeed}
                                    disabled={isSubmitting}
                                    variant="outline"
                                    className="gap-2 rounded-xl"
                                >
                                    <Download size={18} /> 현재 기본 메뉴 구성을 DB로 가져오기
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>


            {/* Edit Modal */}
            {editingMenu && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <form onSubmit={handleSave} className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">
                                    {editingMenu.id ? "메뉴 수정" : editingMenu.parentId ? "서브 메뉴 추가" : "대메뉴 추가"}
                                </h3>
                                <button type="button" onClick={() => setEditingMenu(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">메뉴 이름</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingMenu.name || ""}
                                        onChange={(e) => setEditingMenu({ ...editingMenu, name: e.target.value })}
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                        placeholder="홈페이지에 표시될 이름"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">연결 경로 (ID 또는 URL)</label>
                                    <input
                                        type="text"
                                        value={editingMenu.path || ""}
                                        onChange={(e) => setEditingMenu({ ...editingMenu, path: e.target.value })}
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                        placeholder="예: /board/free-board 또는 https://..."
                                    />
                                    <p className="text-[10px] text-slate-400 ml-1">대메뉴를 서브 메뉴 그룹으로 쓰려면 비워두세요.</p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setEditingMenu(null)}>취소</Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white gap-2">
                                    <Save size={18} /> {isSubmitting ? "저장 중..." : "저장하기"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
