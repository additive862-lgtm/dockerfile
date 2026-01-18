'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TAB_CONFIG } from '@/lib/board-utils';

interface BoardTabsProps {
    category: string;
    settings?: any;
}

export function BoardTabs({ category, settings }: BoardTabsProps) {
    let tabs = TAB_CONFIG[category];

    // Priority: Settings from DB
    if (settings && settings.categories && settings.categories.length > 0) {
        const dynamicTabs = settings.categories.map((c: string) => {
            const [name, key] = c.split(':');
            return { name, key: key || name };
        });
        // Always add "전체" as the first tab for boards with sub-categories
        tabs = [{ name: '전체', key: 'all' }, ...dynamicTabs];
    }

    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || tabs?.[0]?.key;

    if (!tabs || tabs.length <= 1) return null;


    return (
        <div className="flex gap-4 mb-8 border-b-2 border-slate-100">
            {tabs.map((tab) => {
                const isActive = currentTab === tab.key;
                return (
                    <Link
                        key={tab.key}
                        href={`/board/${category}?tab=${tab.key}`}
                        scroll={false}
                        className={cn(
                            "relative pb-3 text-lg font-bold px-2 transition-colors",
                            isActive ? "text-[#001f3f]" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {tab.name}
                        {isActive && (
                            <motion.div
                                layoutId={`tab-underline-${category}`}
                                className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-[#001f3f]"
                            />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}

