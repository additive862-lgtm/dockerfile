'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const BACKGROUND_IMAGES = [
    '/images/church-bg-1.jpg',
    '/images/church-bg-2.jpg'
];

const HOMILY_IMAGES = [
    '/images/homily-bg-1.jpg',
    '/images/homily-bg-2.jpg',
    '/images/homily-bg-3.jpg',
    '/images/homily-bg-4.jpg'
];

const BIBLE_IMAGES = [
    '/images/bible-bg-1.jpg',
    '/images/bible-bg-2.jpg',
    '/images/bible-bg-3.jpg'
];

const STORY_IMAGES = [
    '/images/story-bg-1.jpg',
    '/images/story-bg-2.jpg',
    '/images/story-bg-3.jpg',
    '/images/story-bg-4.jpg'
];

const BOARD_IMAGES = [
    '/images/board-bg-1.jpg',
    '/images/board-bg-2.jpg',
    '/images/board-bg-3.jpg',
    '/images/board-bg-4.jpg'
];

interface BoardHeaderProps {
    title: string;
    description: string;
    category: string;
}

export default function BoardHeader({ title, description, category }: BoardHeaderProps) {
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        // Only apply image background for specific category groups
        if (category === 'church' || category.startsWith('church-')) {
            const randomBg = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
            setBgImage(randomBg);
        } else if (category === 'homily' || category.includes('homily')) {
            const randomBg = HOMILY_IMAGES[Math.floor(Math.random() * HOMILY_IMAGES.length)];
            setBgImage(randomBg);
        } else if (category === 'mamdo-commentary' || category === 'bible' || category.startsWith('bible-')) {
            const randomBg = BIBLE_IMAGES[Math.floor(Math.random() * BIBLE_IMAGES.length)];
            setBgImage(randomBg);
        } else if (category === 'story-spring') {
            const randomBg = STORY_IMAGES[Math.floor(Math.random() * STORY_IMAGES.length)];
            setBgImage(randomBg);
        } else if (['free-board', 'gallery', 'qna'].includes(category)) {
            const randomBg = BOARD_IMAGES[Math.floor(Math.random() * BOARD_IMAGES.length)];
            setBgImage(randomBg);
        }
    }, [category]);

    const textFadeVariants = {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0 },
    };

    // Corrected text for specific categories as requested
    let displayTitle = title;
    if (category === 'church' || category.startsWith('church-')) displayTitle = '교회사';
    else if (category === 'mamdo-commentary') displayTitle = '맘도성경여행';

    let displayDescription = description;
    if (category === 'church' || category.startsWith('church-')) {
        displayDescription = '두돌 신부의 한국교회사, 세계교회사';
    } else if (category === 'homily' || category.includes('homily')) {
        displayDescription = '두돌 신부님의 오늘의 강론, 주일, 축일, 특별 강론 공간입니다.';
    } else if (category === 'mamdo-commentary' || category === 'bible' || category.startsWith('bible-')) {
        displayDescription = '두돌 신부님의 성경50주(구약,신약), 맘도 성서 해설';
    } else if (category === 'story-spring') {
        displayDescription = '두돌 신부님의 이야기 샘';
    } else if (category === 'gallery') {
        displayDescription = '두돌 신부님 갤러리';
    } else if (category === 'qna') {
        displayDescription = '궁금하면 물어보세요';
    }

    const isCustomBg = ['church', 'homily', 'mamdo-commentary', 'bible', 'story-spring', 'free-board', 'gallery', 'qna'].some(group =>
        category === group || category.includes(group)
    );

    if (isCustomBg) {
        return (
            <div className="relative h-[250px] flex items-center justify-center overflow-hidden bg-slate-900 border-b border-slate-100">
                {/* Background Image Container */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 transition-opacity duration-1000"
                    style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />

                {/* Content with Fade Effect - Aligned to Bottom Left */}
                <div className="relative z-10 max-w-6xl mx-auto px-6 w-full h-full flex flex-col justify-end pb-12">
                    <motion.div
                        variants={textFadeVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="space-y-1 text-left"
                    >
                        <h1 className="text-3xl md:text-4xl font-medium text-white tracking-tight drop-shadow-lg uppercase">
                            {displayTitle}
                        </h1>
                        <p className="text-base md:text-lg text-slate-100 font-normal drop-shadow-md">
                            {displayDescription}
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Default header for other categories
    return (
        <div className="bg-slate-50 py-16 border-b border-slate-100">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-end">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-extrabold text-[#001f3f] tracking-tight">{title}</h1>
                        <p className="text-lg text-slate-500 font-medium">{description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
