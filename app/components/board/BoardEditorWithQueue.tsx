'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Youtube from '@tiptap/extension-youtube';
import { HwpDropExtension } from './extensions/HwpDropExtension';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3, List, ListOrdered, Quote,
    Code, Image as ImageIcon, Table as TableIcon, Undo, Redo,
    Plus, Minus, Columns, Rows, X, Loader2, Upload, Youtube as YoutubeIcon, Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import imageCompression from 'browser-image-compression';

interface Attachment {
    id: number;
    url: string;
    name: string;
    status: 'uploading' | 'done';
}

interface BoardEditorWithQueueProps {
    content: string;
    onChange: (content: string) => void;
    settings: any;
    category: string;
    onAttachmentsChange?: (attachments: Attachment[]) => void;
    initialAttachments?: any[];
}

const MenuBar = ({ editor, onYoutubeClick }: { editor: Editor | null, onYoutubeClick: () => void }) => {
    if (!editor) return null;

    return (
        <div className="border-b border-slate-200 bg-white sticky top-0 z-10 p-2 flex flex-wrap gap-1 items-center rounded-t-[2rem]">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={cn("p-2 rounded hover:bg-slate-100", editor.isActive('bold') ? 'bg-slate-100 text-blue-600' : 'text-slate-600')}><Bold size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("p-2 rounded hover:bg-slate-100", editor.isActive('italic') ? 'bg-slate-100 text-blue-600' : 'text-slate-600')}><Italic size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={cn("p-2 rounded hover:bg-slate-100", editor.isActive('underline') ? 'bg-slate-100 text-blue-600' : 'text-slate-600')}><UnderlineIcon size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={cn("p-2 rounded hover:bg-slate-100", editor.isActive('strike') ? 'bg-slate-100 text-blue-600' : 'text-slate-600')}><Strikethrough size={18} /></button>
            <div className="relative flex items-center">
                <input
                    type="color"
                    onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <button type="button" className={cn("p-2 rounded hover:bg-slate-100", editor.getAttributes('textStyle').color ? 'text-blue-600' : 'text-slate-600')}>
                    <Palette size={18} style={{ color: editor.getAttributes('textStyle').color }} />
                </button>
            </div>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cn("p-2 rounded hover:bg-slate-100", editor.isActive('heading', { level: 1 }) ? 'bg-slate-100 text-blue-600' : 'text-slate-600')}><Heading1 size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn("p-2 rounded hover:bg-slate-100", editor.isActive('heading', { level: 2 }) ? 'bg-slate-100 text-blue-600' : 'text-slate-600')}><Heading2 size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={cn("p-2 rounded hover:bg-slate-100", editor.isActive('heading', { level: 3 }) ? 'bg-slate-100 text-blue-600' : 'text-slate-600')}><Heading3 size={18} /></button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn("p-2 rounded hover:bg-slate-100", editor.isActive('bulletList') ? 'bg-slate-100 text-blue-600' : 'text-slate-600')}><List size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn("p-2 rounded hover:bg-slate-100", editor.isActive('orderedList') ? 'bg-slate-100 text-blue-600' : 'text-slate-600')}><ListOrdered size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={cn("p-2 rounded hover:bg-slate-100", editor.isActive('blockquote') ? 'bg-slate-100 text-blue-600' : 'text-slate-600')}><Quote size={18} /></button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-2 rounded hover:bg-slate-100 text-slate-600"><TableIcon size={18} /></button>
            {editor.isActive('table') && (
                <div className="flex bg-slate-50 rounded border border-slate-200 p-0.5 ml-1">
                    <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1 hover:bg-slate-200 rounded"><Columns size={14} /></button>
                    <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1 hover:bg-slate-200 rounded text-red-500"><Minus size={14} /></button>
                    <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1 hover:bg-slate-200 rounded"><Rows size={14} /></button>
                    <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="p-1 hover:bg-slate-200 rounded text-red-500"><Minus size={14} className="rotate-90" /></button>
                </div>
            )}
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button type="button" onClick={onYoutubeClick} className="p-2 rounded hover:bg-slate-100 text-slate-600"><YoutubeIcon size={18} /></button>
            <div className="flex-grow" />
            <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className="p-2 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-50"><Undo size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className="p-2 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-50"><Redo size={18} /></button>
        </div>
    );
};

export function BoardEditorWithQueue({ content, onChange, settings, category, onAttachmentsChange, initialAttachments = [] }: BoardEditorWithQueueProps) {
    const [attachments, setAttachments] = useState<Attachment[]>(() =>
        initialAttachments.map(a => ({
            id: a.id,
            url: a.fileUrl || a.url,
            name: a.fileName || a.name,
            status: 'done'
        }))
    );
    const [isDragging, setIsDragging] = useState(false);
    const [isHwpConverting, setIsHwpConverting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [youtubePreviewId, setYoutubePreviewId] = useState<string | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Image.configure({ inline: true, allowBase64: true }),
            Link.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: '여기에 내용을 입력하거나 문서를 붙여넣으세요...' }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            // Rich Text Extensions
            Underline,
            TextStyle,
            Color.configure({
                types: ['textStyle'],
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
                allowFullscreen: true,
            }),
            HwpDropExtension.configure({
                category: category,
                enabled: settings?.hwpImportEnabled || false,
                onLoading: (loading) => setIsHwpConverting(loading),
                onError: (msg) => alert(msg),
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none min-h-[400px] p-8',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    const handleFileUpload = async (files: File[]) => {
        if (!settings?.mediaEnabled) {
            alert('이 게시판은 이미지 첨부가 비활성화되어 있습니다.');
            return;
        }

        const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

        for (const file of validFiles) {
            // Duplicate check (by name and size is safer, but name is a good start)
            if (attachments.some(a => a.name === file.name)) {
                continue;
            }

            if (attachments.length >= (settings?.maxAttachmentCount || 10)) {
                alert(`최대 ${settings?.maxAttachmentCount || 10}개까지만 첨부할 수 있습니다.`);
                break;
            }

            const tempId = Math.random();
            setAttachments(prev => [...prev, { id: tempId, url: '', name: file.name, status: 'uploading' }]);

            try {
                // Compression
                const options = {
                    maxSizeMB: settings?.maxAttachmentSize || 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                };
                const compressedFile = await imageCompression(file, options);

                const formData = new FormData();
                formData.append('file', compressedFile);

                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.id) {
                    setAttachments(prev => prev.map(a => a.id === tempId ? { ...a, id: data.id, url: data.url, status: 'done' } : a));
                } else {
                    setAttachments(prev => prev.filter(a => a.id !== tempId));
                }
            } catch (error) {
                console.error('Upload failed', error);
                setAttachments(prev => prev.filter(a => a.id !== tempId));
            }
        }
    };

    const insertImage = (url: string) => {
        if (!editor) return;
        editor.chain().focus().setImage({ src: url }).run();
    };

    const insertAllImages = () => {
        if (!editor || attachments.length === 0) return;

        let chain = editor.chain().focus();
        attachments.forEach((file) => {
            if (file.status === 'done') {
                chain = chain.setImage({ src: file.url }).enter();
            }
        });
        chain.run();

        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const handleYoutubeUrlChange = (url: string) => {
        setYoutubeUrl(url);
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
        setYoutubePreviewId(match ? match[1] : null);
    };

    const insertYoutube = () => {
        if (youtubePreviewId && editor) {
            editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
            setIsYoutubeModalOpen(false);
            setYoutubeUrl('');
            setYoutubePreviewId(null);
        }
    };

    const removeAttachment = async (id: number, url: string) => {
        try {
            await fetch(`/api/upload?id=${id}`, { method: 'DELETE' });
            setAttachments(prev => prev.filter(a => a.id !== id));

            // Remove from editor content
            if (editor) {
                const { state, dispatch } = editor.view;
                const { tr } = state;
                state.doc.descendants((node, pos) => {
                    if (node.type.name === 'image' && node.attrs.src === url) {
                        tr.delete(pos, pos + node.nodeSize);
                    }
                });
                dispatch(tr);
            }
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    useEffect(() => {
        if (onAttachmentsChange) onAttachmentsChange(attachments);
    }, [attachments, onAttachmentsChange]);

    return (
        <div
            className={cn(
                "bg-white rounded-[2rem] overflow-hidden shadow-sm transition-all border-2 flex flex-col",
                isDragging ? "border-blue-500 bg-blue-50/30" : "border-slate-100"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                const files = Array.from(e.dataTransfer.files);
                const hasHwp = files.some(f => {
                    const ext = f.name.split('.').pop()?.toLowerCase();
                    return ext === 'hwp' || ext === 'hwpx';
                });

                if (hasHwp && settings?.hwpImportEnabled) {
                    // Let HwpDropExtension handle it
                    setIsDragging(false);
                    return;
                }

                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(files);
            }}
        >
            <MenuBar editor={editor} onYoutubeClick={() => setIsYoutubeModalOpen(true)} />

            {isYoutubeModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xl font-extrabold text-slate-900">유튜브 영상 삽입</h4>
                                <button type="button" onClick={() => setIsYoutubeModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">유튜브 링크 (URL)</label>
                                    <input
                                        type="text"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={youtubeUrl}
                                        onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        autoFocus
                                    />
                                </div>

                                {youtubePreviewId ? (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-inner group bg-slate-50">
                                        <img
                                            src={`https://img.youtube.com/vi/${youtubePreviewId}/maxresdefault.jpg`}
                                            className="w-full h-full object-cover"
                                            alt="유튜브 미리보기"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubePreviewId}/hqdefault.jpg`;
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                                <YoutubeIcon size={32} className="text-white fill-white" />
                                            </div>
                                        </div>
                                    </div>
                                ) : youtubeUrl && (
                                    <div className="py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
                                        <YoutubeIcon size={32} className="opacity-20" />
                                        <p className="text-xs font-bold">올바른 유튜브 링크를 입력해주세요</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsYoutubeModalOpen(false)}
                                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-extrabold rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    취소
                                </button>
                                <button
                                    type="button"
                                    onClick={insertYoutube}
                                    disabled={!youtubePreviewId}
                                    className="flex-[2] px-6 py-4 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    본문에 삽입하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative">
                <EditorContent editor={editor} />

                {attachments.length === 0 && !isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="flex flex-col items-center gap-2">
                            <Upload size={48} />
                            <p className="font-bold">이미지를 드래그하여 업로드하세요</p>
                        </div>
                    </div>
                )}
                {isHwpConverting && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                            <Upload className="absolute inset-0 m-auto text-blue-600 w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-slate-800">HWP 문서 변환 중...</p>
                            <p className="text-sm font-bold text-slate-400">잠시만 기다려 주세요.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Media Queue Section */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                        <ImageIcon size={16} />
                        미디어 레이아웃 큐 ({attachments.length}/{settings?.maxAttachmentCount || 10})
                        <span className="text-[10px] text-slate-400 font-normal ml-2 hidden sm:inline">
                            * 본문에 삽입된 이미지는 하단 첨부파일 목록에서 제외됩니다.
                        </span>
                    </h5>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={insertAllImages}
                            disabled={attachments.filter(a => a.status === 'done').length === 0}
                            className="text-xs font-bold text-slate-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            본문에 모두 삽입
                        </button>
                        <div className="w-px h-3 bg-slate-200" />
                        <label className="cursor-pointer text-xs font-bold text-blue-600 hover:underline">
                            이미지 추가
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {attachments.map((file) => (
                        <div key={file.id} className="group relative w-[60px] h-[60px] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:ring-2 hover:ring-blue-500 transition-all">
                            <img
                                src={file.url || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
                                className={cn("w-full h-full object-cover cursor-pointer", file.status === 'uploading' && "opacity-50 blur-sm")}
                                alt={file.name}
                                onClick={() => file.status === 'done' && insertImage(file.url)}
                            />

                            {file.status === 'uploading' ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(file.id, file.url)}
                                        className="absolute top-0.5 right-0.5 p-0.5 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={10} />
                                    </button>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/40 text-[8px] text-white px-1 truncate opacity-0 group-hover:opacity-100">
                                        클릭하여 삽입
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {attachments.length === 0 && (
                        <div className="w-full py-4 text-center text-slate-300 text-xs font-bold border-2 border-dashed border-slate-200 rounded-xl">
                            업로드된 이미지가 없습니다.
                        </div>
                    )}
                </div>
            </div>
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 font-bold text-sm">
                    모든 이미지가 본문에 삽입되었습니다.
                </div>
            )}
        </div>
    );
}
