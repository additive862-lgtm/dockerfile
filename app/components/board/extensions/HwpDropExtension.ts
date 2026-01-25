import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

interface HwpDropOptions {
    category: string;
    enabled: boolean;
    onLoading: (isLoading: boolean) => void;
    onError: (message: string) => void;
}

export const HwpDropExtension = Extension.create<HwpDropOptions>({
    name: 'hwpDrop',

    addOptions() {
        return {
            category: 'free',
            enabled: false,
            onLoading: () => { },
            onError: () => { },
        };
    },

    addProseMirrorPlugins() {
        const { category, enabled, onLoading, onError } = this.options;
        const { editor } = this;

        return [
            new Plugin({
                key: new PluginKey('hwpDrop'),
                props: {
                    handleDrop(view, event) {
                        if (!enabled) return false;

                        const files = event.dataTransfer?.files;
                        if (!files || files.length === 0) return false;

                        const file = files[0];
                        const extension = file.name.split('.').pop()?.toLowerCase();

                        if (extension !== 'hwp' && extension !== 'hwpx') {
                            return false;
                        }

                        event.preventDefault();

                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('category', category);

                        onLoading(true);

                        fetch('/api/convert/hwp', {
                            method: 'POST',
                            body: formData,
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                if (data.success && data.html) {
                                    // Insert content at drop position
                                    const coordinates = view.posAtCoords({
                                        left: event.clientX,
                                        top: event.clientY,
                                    });

                                    if (coordinates) {
                                        editor.commands.insertContentAt(coordinates.pos, data.html);
                                    } else {
                                        editor.commands.insertContent(data.html);
                                    }
                                } else {
                                    onError(data.error || 'HWP 변환에 실패했습니다.');
                                }
                            })
                            .catch((err) => {
                                console.error('HWP upload/convert failed:', err);
                                onError('서버 통신 중 오류가 발생했습니다.');
                            })
                            .finally(() => {
                                onLoading(false);
                            });

                        return true;
                    },
                },
            }),
        ];
    },
});
