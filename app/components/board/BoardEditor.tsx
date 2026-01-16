'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface BoardEditorProps {
    content: string;
    onChange: (content: string) => void;
}

interface FileLoader {
    file: Promise<File>;
}

/**
 * Custom Upload Adapter for CKEditor 5
 * Bypasses local resource restrictions by dealing with binary data
 */
class MyUploadAdapter {
    loader: FileLoader;
    constructor(loader: FileLoader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file.then((file: File) => new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);

            fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
                .then(response => response.json())
                .then(result => {
                    if (result.uploaded) {
                        resolve({
                            default: result.url
                        });
                    } else {
                        reject(result.error || 'Upload failed');
                    }
                })
                .catch(error => {
                    reject(error);
                });
        }));
    }

    abort() {
        // Handle abort
    }
}

function MyCustomUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: FileLoader) => {
        return new MyUploadAdapter(loader);
    };
}

export function BoardEditor({ content, onChange }: BoardEditorProps) {
    const [mounted, setMounted] = useState(false);
    const editorRef = useRef<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Navy/White theme custom CSS for CKEditor
    const customEditorStyles = `
        .ck-editor__editable_inline {
            min-height: 500px;
            padding: 2.5rem !important;
            font-size: 1.15rem;
            line-height: 1.8;
            color: #1e293b;
        }
        .ck.ck-editor__main>.ck-editor__editable {
            background: #fff;
            border-bottom-left-radius: 2rem !important;
            border-bottom-right-radius: 2rem !important;
            border-color: #e2e8f0 !important;
            border-top: none !important;
        }
        .ck.ck-toolbar {
            background: #f8fafc !important;
            border-top-left-radius: 2rem !important;
            border-top-right-radius: 2rem !important;
            border-color: #e2e8f0 !important;
            padding: 0.6rem 1rem !important;
        }
        .ck.ck-editor__editable.ck-focused {
            border-color: #001f3f !important;
            box-shadow: 0 0 0 4px rgba(0, 31, 63, 0.05) !important;
        }
        .ck-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
        }
        .ck-content table td, .ck-content table th {
            border: 1px solid #e2e8f0;
            padding: 0.8rem;
        }
        .ck-content table th {
            background: #f1f5f9;
            font-weight: 700;
        }
        .ck-content img {
            border-radius: 1rem;
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
            border: 1px solid #f1f5f9;
            margin: 2.5rem auto;
            display: block;
        }
    `;

    if (!mounted) {
        return <div className="min-h-[600px] bg-slate-50/50 animate-pulse rounded-[2rem] border border-slate-100" />;
    }

    return (
        <div className="ck-editor-container bg-white rounded-[2rem] overflow-hidden shadow-sm transition-all border border-slate-100">
            <style>{customEditorStyles}</style>
            <CKEditor
                editor={ClassicEditor}
                config={{
                    licenseKey: 'GPL', // Required for CKEditor 5 v42+
                    language: 'ko',
                    placeholder: '여기에 내용을 입력하거나 문서를 붙여넣으세요...',
                    toolbar: {
                        items: [
                            'heading',
                            '|',
                            'bold',
                            'italic',
                            'link',
                            '|',
                            'bulletedList',
                            'numberedList',
                            'blockQuote',
                            '|',
                            'imageUpload',
                            'insertTable',
                            'mediaEmbed',
                            '|',
                            'undo',
                            'redo'
                        ]
                    },
                    extraPlugins: [MyCustomUploadAdapterPlugin],
                    table: {
                        contentToolbar: [
                            'tableColumn',
                            'tableRow',
                            'mergeTableCells'
                        ]
                    },
                    image: {
                        toolbar: [
                            'imageStyle:inline',
                            'imageStyle:block',
                            'imageStyle:side',
                            '|',
                            'toggleImageCaption',
                            'imageTextAlternative'
                        ]
                    }
                }}
                data={content}
                onReady={editor => {
                    editorRef.current = editor;

                    const viewDocument = editor.editing.view.document;

                    // 1. Clean HWP/Word artifacts from the HTML paste
                    editor.plugins.get('ClipboardPipeline').on('inputTransformation', (evt: unknown, data: any) => {
                        let html = data.dataTransfer.getData('text/html');

                        if (html) {
                            // Purge broken file:// img tags and HWP placeholders
                            let cleanedHtml = html.replace(/<img[^>]+src=["']file:\/\/[^"']+["'][^>]*>/gi, '');
                            cleanedHtml = cleanedHtml.replace(/그림입니다\.\s+원본\s+그림의\s+이름:[^<]+/gi, '');
                            cleanedHtml = cleanedHtml.replace(/\[그림\s+\d+[^\]]*\]/gi, '');
                            cleanedHtml = cleanedHtml.replace(/그림\s+원본\s+그림의\s+크기:[^<]+/gi, '');
                            cleanedHtml = cleanedHtml.replace(/그림\s+원본\s+그림의\s+이름:[^<]+/gi, '');

                            if (cleanedHtml !== html) {
                                data.content = editor.data.htmlProcessor.toView(cleanedHtml);
                            }
                        }
                    });

                    // 2. Binary Image Extraction & Immediate Base64 Insertion
                    viewDocument.on('paste', (evt: unknown, data: any) => {
                        const clipboardData = data.domEvent.clipboardData;
                        if (!clipboardData) return;

                        const items = Array.from(clipboardData.items);
                        const imageItems = items.filter((item: any) => item.type.startsWith('image/'));

                        if (imageItems.length > 0) {
                            imageItems.forEach((item: any) => {
                                const file = item.getAsFile();
                                if (!file) return;

                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const base64Data = e.target?.result as string;

                                    // Insert Base64 to editor model IMMEDIATELY
                                    editor.model.change((writer: any) => {
                                        const imageElement = writer.createElement('imageBlock', {
                                            src: base64Data
                                        });
                                        editor.model.insertContent(imageElement, editor.model.document.selection);
                                    });

                                    // Background Upload to Server for persistence
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    fetch('/api/upload', { method: 'POST', body: formData })
                                        .then(res => res.json())
                                        .then(result => {
                                            if (result.uploaded && result.url) {
                                                console.log('Background upload success:', result.url);
                                                // Historically we would replace base64 with URL here, 
                                                // but for now, we ensure the image is at least visible.
                                            }
                                        })
                                        .catch(err => console.error('Background upload error:', err));
                                };
                                reader.readAsDataURL(file);
                            });
                        }
                    });
                }}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    onChange(data);
                }}
            />
        </div>
    );
}
