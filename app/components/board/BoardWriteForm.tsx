'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Paperclip, Plus, X, Globe, Save, RotateCcw } from 'lucide-react';
import { getMappedCategory, TAB_CONFIG } from '@/lib/board-utils';
import { BoardTabs } from './BoardTabs';

// ... (other imports)

const BoardEditor = dynamic(() => import('./BoardEditorWithQueue').then(mod => mod.BoardEditorWithQueue), {
    ssr: false,
    loading: () => <div className="min-h-[500px] bg-slate-50 animate-pulse rounded-[2rem]" />
});

interface FileAttachment {
    fileUrl: string;
    fileName: string;
    fileType: 'IMAGE' | 'FILE';
    isEmbedded?: boolean;
}

interface ExternalLink {
    fileUrl: string;
    fileName: string;
    fileType: 'LINK';
}

interface BoardSettings {
    mediaEnabled: boolean;
    defaultImageAlign: string;
    defaultImageSize: string;
    maxAttachmentCount: number;
    maxAttachmentSize: number;
    [key: string]: any;
}

interface BoardWriteFormProps {
    category: string;
    initialTab?: string;
    settings: BoardSettings;
    editId?: number;
    initialData?: any;
}

export function BoardWriteForm({ category, initialTab, settings, editId, initialData }: BoardWriteFormProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Determine available tabs for this category
    let availableTabs = TAB_CONFIG[category];

    if (settings && settings.categories && settings.categories.length > 0) {
        availableTabs = settings.categories.map((c: string) => {
            const [name, key] = c.split(':');
            return { name, key: key || name };
        });
    }

    // State for selected tab
    const [selectedTab, setSelectedTab] = useState(() => {
        if (initialData?.category) {
            // Find which tab key maps to this DB category
            const foundTab = availableTabs?.find(tab => {
                const mapped = getMappedCategory(category, tab.key, settings);
                return Array.isArray(mapped) ? mapped.includes(initialData.category) : mapped === initialData.category;
            });
            if (foundTab) return foundTab.key;
        }
        return initialTab || availableTabs?.[0]?.key || '';
    });


    const [title, setTitle] = useState(initialData?.title || '');
    const [author, setAuthor] = useState(initialData?.author || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [thumbnail, setThumbnail] = useState<string | null>(initialData?.thumbnail || null);
    const [attachments, setAttachments] = useState<FileAttachment[]>(() => {
        // Only include non-embedded files and non-links
        return initialData?.attachments?.filter((a: any) => !a.isEmbedded && a.fileType !== 'LINK') || [];
    });
    const [editorAttachments, setEditorAttachments] = useState<any[]>([]);
    const [links, setLinks] = useState<ExternalLink[]>(() => {
        return initialData?.attachments?.filter((a: any) => a.fileType === 'LINK') || [];
    });
    const [linkUrl, setLinkUrl] = useState('');
    const [linkName, setLinkName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!editId && session?.user?.name) {
            setAuthor(session.user.name);
        } else if (status === 'unauthenticated' && !editId) {
            setAuthor('');
        }
    }, [session, status, editId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        for (const file of Array.from(files)) {
            // Duplicate check
            if (attachments.some(a => a.fileName === file.name)) {
                continue;
            }

            if (settings?.maxAttachmentCount && attachments.length >= settings.maxAttachmentCount) {
                alert(`최대 ${settings.maxAttachmentCount}개까지만 첨부할 수 있습니다.`);
                break;
            }
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                if (data.url) {
                    setAttachments(prev => [...prev, {
                        fileUrl: data.url,
                        fileName: data.originalName,
                        fileType: data.type as 'IMAGE' | 'FILE',
                    }]);
                }
            } catch (error) {
                console.error('File upload failed:', error);
            }
        }
    };

    const addLink = () => {
        if (!linkUrl || !linkName) return;
        setLinks(prev => [...prev, {
            fileUrl: linkUrl,
            fileName: linkName,
            fileType: 'LINK'
        }]);
        setLinkUrl('');
        setLinkName('');
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const removeLink = (index: number) => {
        setLinks(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !author) {
            alert('제목과 작성자를 입력해주세요.');
            return;
        }

        if (settings?.maxAttachmentCount && editorAttachments.length > settings.maxAttachmentCount) {
            alert(`이미지 개수가 ${settings.maxAttachmentCount}개를 초과하였습니다.`);
            return;
        }

        setIsSubmitting(true);

        const dbCategory = getMappedCategory(category, selectedTab, settings);

        try {
            const finalThumbnail = thumbnail || (editorAttachments.length > 0 ? editorAttachments[0].url : null);

            const res = await fetch('/api/board', {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editId,
                    title,
                    author,
                    content,
                    thumbnail: finalThumbnail,
                    category: dbCategory,
                    attachments: [
                        ...attachments.map(a => ({ ...a, isEmbedded: false })),
                        ...links.map(l => ({ ...l, isEmbedded: false })),
                        ...editorAttachments.map(a => ({
                            fileUrl: a.url,
                            fileName: a.name,
                            fileType: 'IMAGE',
                            isEmbedded: true
                        }))
                    ],
                }),
            });

            if (res.ok) {
                if (editId) {
                    router.push(`/board/${category}/${editId}`);
                } else {
                    const redirectUrl = selectedTab
                        ? `/board/${category}?tab=${selectedTab}`
                        : `/board/${category}`;
                    router.push(redirectUrl);
                }
                router.refresh();
            } else {
                throw new Error('Failed to save post');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('글 저장에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... JSX return
    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* Category Selection (Only if tabs exist) */}
            {availableTabs && (
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">카테고리 선택</label>
                    <div className="flex gap-4">
                        {availableTabs.map((tab) => (
                            <label key={tab.key} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="categoryTab"
                                    value={tab.key}
                                    checked={selectedTab === tab.key}
                                    onChange={(e) => setSelectedTab(e.target.value)}
                                    className="w-4 h-4 text-[#001f3f] border-slate-300 focus:ring-[#001f3f]"
                                />
                                <span className={`text-lg font-bold ${selectedTab === tab.key ? 'text-[#001f3f]' : 'text-slate-500'}`}>
                                    {tab.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Title & Author */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                <div className="md:col-span-3 space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="글 제목을 입력하세요"
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">작성자</label>
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder={status === 'unauthenticated' ? '로그인이 필요합니다' : '작성자 명'}
                        className={`w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all ${status === 'authenticated' ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                        required
                        readOnly={status === 'authenticated'}
                    />
                </div>
            </div>

            {/* Editor */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">본문</label>
                <BoardEditor
                    category={category}
                    content={content}
                    onChange={setContent}
                    settings={settings}
                    onAttachmentsChange={(items: any[]) => setEditorAttachments(items)}
                    initialAttachments={initialData?.attachments?.filter((a: any) => a.fileType === 'IMAGE') || []}
                />
            </div>

            {/* Representative Image (Thumbnail) - Hidden by default, auto-selected from content
            <div className="space-y-4 pt-4">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                    <Paperclip size={18} />
                    대표 이미지 (카드형/갤러리형 노출)
                </label>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div
                        onClick={() => document.getElementById('thumb-upload')?.click()}
                        className="w-full md:w-64 aspect-[16/10] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative group"
                    >
                        {thumbnail ? (
                            <>
                                <img src={thumbnail} className="w-full h-full object-cover" alt="Thumbnail Preview" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white text-xs font-bold">이미지 변경</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <Plus size={32} className="text-slate-300 mb-2" />
                                <span className="text-xs text-slate-400 font-bold">대표 이미지 업로드</span>
                            </>
                        )}
                    </div>
                    {thumbnail && (
                        <button
                            type="button"
                            onClick={() => setThumbnail(null)}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                        >
                            <X size={14} /> 대표 이미지 삭제
                        </button>
                    )}
                    <input
                        id="thumb-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const data = await res.json();
                            if (data.url) setThumbnail(data.url);
                        }}
                    />
                    <div className="flex-1 space-y-2">
                        <p className="text-xs text-slate-500 leading-relaxed">
                            • 카드형이나 갤러리형 레이아웃 선택 시 메인 목록에 노출될 썸네일입니다.<br />
                            • 등록하지 않을 경우 본문의 첫 번째 이미지가 자동으로 사용됩니다.<br />
                            • 권장 해상도: 800x500 (16:10 비율)
                        </p>
                    </div>
                </div>
            </div>
            */}

            {/* Files & Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                {/* File Upload */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Paperclip size={18} />
                            파일 첨부
                        </label>
                        <button
                            type="button"
                            onClick={() => document.getElementById('file-upload')?.click()}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            <Plus size={14} />
                            파일 추가
                        </button>
                    </div>
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    <div className="min-h-[100px] border-2 border-dashed border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                        {attachments.length === 0 ? (
                            <p className="text-slate-400 text-xs text-center py-8">첨부된 파일이 없습니다.</p>
                        ) : (
                            <div className="space-y-2">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                        <span className="truncate max-w-[200px] text-slate-700 font-medium">{file.fileName}</span>
                                        <button type="button" onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-rose-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* External Links */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Globe size={18} />
                        외부 링크
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="링크 제목"
                            value={linkName}
                            onChange={(e) => setLinkName(e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <input
                            type="url"
                            placeholder="https://..."
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <button
                            type="button"
                            onClick={addLink}
                            className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="min-h-[100px] border-2 border-dashed border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                        {links.length === 0 ? (
                            <p className="text-slate-400 text-xs text-center py-8">등록된 링크가 없습니다.</p>
                        ) : (
                            <div className="space-y-2">
                                {links.map((link, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{link.fileName}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[150px]">{link.fileUrl}</span>
                                        </div>
                                        <button type="button" onClick={() => removeLink(idx)} className="text-slate-400 hover:text-rose-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-10">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-8 py-4 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-bold"
                >
                    <RotateCcw size={20} />
                    취소
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:bg-slate-300 transition-all font-bold shadow-xl shadow-slate-200"
                >
                    <Save size={20} />
                    {isSubmitting ? '저장 중...' : (editId ? '수정 완료' : '게시글 등록')}
                </button>
            </div>
        </form>
    );
}
