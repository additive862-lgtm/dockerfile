"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { updateBoardSettings } from "@/app/actions/admin";
import { X, Plus, Trash2, Save, RotateCcw } from "lucide-react";

export interface BoardSettings {
    id?: number;
    category: string;
    name: string;
    layoutType: 'LIST' | 'CARD' | 'GALLERY';
    commentEnabled: boolean;
    secretPostEnabled: boolean;
    noticeEnabled: boolean;
    categories: string[];
    writePermission: string;
    commentPermission: string;
    attachPermission: string;
    maxAttachmentCount: number;
    maxAttachmentSize: number;
    postsPerPage: number;
    totalSizeLimit: number;
    searchFilter: string;
    sortOrder: string;
    turnstileEnabled: boolean;
    mediaEnabled: boolean;
    defaultImageAlign: 'left' | 'center' | 'right';
    defaultImageSize: 'original' | 'full';
    forbiddenWords: string[];
    hwpImportEnabled: boolean;
    showOnHome: boolean;
}

export function BoardSettingsForm({ settings, onSave, onCancel }: { settings: BoardSettings, onSave: (s: BoardSettings) => void, onCancel: () => void }) {
    const [formData, setFormData] = useState<BoardSettings>({ ...settings });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTag, setNewTag] = useState("");
    const [newBadWord, setNewBadWord] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await updateBoardSettings(formData.category, formData);
            if (res.success) {
                onSave(formData);
                alert("설정이 저장되었습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const addTag = () => {
        if (!newTag || formData.categories.includes(newTag)) return;
        setFormData({ ...formData, categories: [...formData.categories, newTag] });
        setNewTag("");
    };

    const removeTag = (tag: string) => {
        setFormData({ ...formData, categories: formData.categories.filter(t => t !== tag) });
    };

    const addBadWord = () => {
        if (!newBadWord || formData.forbiddenWords.includes(newBadWord)) return;
        setFormData({ ...formData, forbiddenWords: [...formData.forbiddenWords, newBadWord] });
        setNewBadWord("");
    };

    const removeBadWord = (word: string) => {
        setFormData({ ...formData, forbiddenWords: formData.forbiddenWords.filter(w => w !== word) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info & Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">게시판 식별자 {settings.category ? "(변경 불가)" : "(영문/숫자 필수)"}</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                            readOnly={!!settings.category}
                            placeholder="e.g. free-board"
                            className={`w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary ${settings.category ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">게시판 이름</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700">게시판 레이아웃 유형</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'LIST', name: '일반형', desc: '테이블 리스트' },
                            { id: 'CARD', name: '카드형', desc: '이미지 + 요약' },
                            { id: 'GALLERY', name: '갤러리', desc: '이미지 격자' },
                        ].map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, layoutType: type.id as any })}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${formData.layoutType === type.id
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                <span className="font-bold text-sm mb-1">{type.name}</span>
                                <span className="text-[10px] opacity-70">{type.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Switches */}
            <div className="bg-slate-50 p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.commentEnabled}
                        onChange={(e) => setFormData({ ...formData, commentEnabled: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-bold">댓글 활성화</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.secretPostEnabled}
                        onChange={(e) => setFormData({ ...formData, secretPostEnabled: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-bold">비밀글 사용</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.noticeEnabled}
                        onChange={(e) => setFormData({ ...formData, noticeEnabled: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-bold">공지사항 사용</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.turnstileEnabled}
                        onChange={(e) => setFormData({ ...formData, turnstileEnabled: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-bold">Turnstile (봇방지)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.showOnHome}
                        onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-bold">메인 화면에 표시</span>
                </label>
            </div>

            {/* Permissions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">쓰기 권한</label>
                    <select
                        value={formData.writePermission}
                        onChange={(e) => setFormData({ ...formData, writePermission: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    >
                        <option value="GUEST">비회원</option>
                        <option value="USER">일반회원</option>
                        <option value="ADMIN">관리자</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">댓글 권한</label>
                    <select
                        value={formData.commentPermission}
                        onChange={(e) => setFormData({ ...formData, commentPermission: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    >
                        <option value="GUEST">비회원</option>
                        <option value="USER">일반회원</option>
                        <option value="ADMIN">관리자</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">첨부 권한</label>
                    <select
                        value={formData.attachPermission}
                        onChange={(e) => setFormData({ ...formData, attachPermission: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    >
                        <option value="GUEST">비회원</option>
                        <option value="USER">일반회원</option>
                        <option value="ADMIN">관리자</option>
                    </select>
                </div>
            </div>

            {/* Caps & Limits */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">페이지당 글 수</label>
                    <input
                        type="number"
                        value={formData.postsPerPage}
                        onChange={(e) => setFormData({ ...formData, postsPerPage: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">최대 첨부 수</label>
                    <input
                        type="number"
                        value={formData.maxAttachmentCount}
                        onChange={(e) => setFormData({ ...formData, maxAttachmentCount: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">파일 용량 (MB)</label>
                    <input
                        type="number"
                        value={formData.maxAttachmentSize}
                        onChange={(e) => setFormData({ ...formData, maxAttachmentSize: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">총 용량 (MB)</label>
                    <input
                        type="number"
                        value={formData.totalSizeLimit}
                        onChange={(e) => setFormData({ ...formData, totalSizeLimit: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    />
                </div>
            </div>

            {/* Search & Sort */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">기본 검색 필터</label>
                    <select
                        value={formData.searchFilter}
                        onChange={(e) => setFormData({ ...formData, searchFilter: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    >
                        <option value="title">제목만</option>
                        <option value="title_content">제목 + 본문</option>
                        <option value="title_content_author">제목 + 본문 + 작성자</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">기본 정렬 순서</label>
                    <select
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    >
                        <option value="latest">최신순</option>
                        <option value="views">조회수순</option>
                        <option value="likes">추천순</option>
                    </select>
                </div>
            </div>

            {/* Media Handling Options */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-slate-900 leading-none mb-1">미디어 핸들링 옵션</h4>
                        <p className="text-xs text-slate-500 font-medium">이미지 썸네일 큐 및 본문 삽입 설정을 제어합니다.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.mediaEnabled}
                            onChange={(e) => setFormData({ ...formData, mediaEnabled: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-bold text-slate-900">기능 활성화</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">본문 삽입 시 기본 정렬</label>
                        <select
                            value={formData.defaultImageAlign}
                            onChange={(e) => setFormData({ ...formData, defaultImageAlign: e.target.value as any })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                        >
                            <option value="left">왼쪽 정렬</option>
                            <option value="center">중앙 정렬</option>
                            <option value="right">오른쪽 정렬</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">본문 삽입 시 기본 크기</label>
                        <select
                            value={formData.defaultImageSize}
                            onChange={(e) => setFormData({ ...formData, defaultImageSize: e.target.value as any })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                        >
                            <option value="original">원본 크기</option>
                            <option value="full">가로 폭 맞춤 (100%)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* HWP Import Options */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-bold text-slate-900 leading-none mb-1">한글(HWP) 문서 임포트</h4>
                        <p className="text-xs text-slate-500 font-medium">에디터에 HWP 파일을 드래그하여 내용을 즉시 삽입할 수 있습니다.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.hwpImportEnabled}
                            onChange={(e) => setFormData({ ...formData, hwpImportEnabled: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-3 text-sm font-bold text-slate-900">기능 활성화</span>
                    </label>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                        • <strong>주의:</strong> hwp5html 도구를 사용하여 변환하므로 복잡한 레이아웃이나 표는 100% 일치하지 않을 수 있습니다.<br />
                        • 문서 내 이미지는 서버에 자동으로 업로드되어 본문에 삽입됩니다.
                    </p>
                </div>
            </div>

            {/* Category Tags */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700">카테고리 태그 관리</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="새 태그 입력"
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl"
                    />
                    <Button type="button" onClick={addTag} className="gap-2">
                        <Plus className="h-4 w-4" /> 추가
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.categories.map(tag => (
                        <span key={tag} className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg group">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500 transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    {formData.categories.length === 0 && <span className="text-xs text-slate-400">등록된 태그가 없습니다.</span>}
                </div>
            </div>

            {/* Bad Words */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700">금지어(Bad Words) 관리</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newBadWord}
                        onChange={(e) => setNewBadWord(e.target.value)}
                        placeholder="차단할 단어 입력"
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl"
                    />
                    <Button type="button" onClick={addBadWord} variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" /> 추가
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.forbiddenWords.map(word => (
                        <span key={word} className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 italic">
                            {word}
                            <button type="button" onClick={() => removeBadWord(word)} className="hover:text-red-800 transition-colors">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    {formData.forbiddenWords.length === 0 && <span className="text-xs text-slate-400">등록된 금지어가 없습니다.</span>}
                </div>
            </div >

            {/* Action Buttons */}
            < div className="flex justify-end gap-3 pt-6 border-t" >
                <Button type="button" variant="ghost" onClick={onCancel} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> 취소
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8">
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "저장 중..." : "설정 저장"}
                </Button>
            </div >
        </form >
    );
}
