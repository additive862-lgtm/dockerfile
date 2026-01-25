'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HERO_IMAGES = [
    '/images/hero-bg-1.jpg',
    '/images/hero-bg-2.jpg',
    '/images/hero-bg-3.jpg'
];

export default function Hero() {
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const randomBg = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
        setBgImage(randomBg);
    }, []);

    return (
        <section className="relative h-[650px] flex items-end justify-center overflow-hidden bg-slate-900 text-white pb-24">
            {/* Background with random image */}
            <div className="absolute inset-0 bg-black/40 z-10" />
            <div
                className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-1000 animate-slow-zoom"
                style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
            />

            <div className="relative z-20 text-center max-w-4xl px-4 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                    className="space-y-4"
                >
                    <h1 className="text-5xl md:text-6xl font-medium tracking-tight drop-shadow-2xl">
                        말씀, <span className="text-white border-b-4 border-white/20 pb-1 font-medium">삶이 되다</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-100 font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        신앙의 발자취를 따라,<br />
                        이석재 신부와 함께하는 교회사 산책
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
