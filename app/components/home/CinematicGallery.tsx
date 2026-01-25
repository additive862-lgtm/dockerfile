'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface GalleryPost {
    id: number;
    title: string;
    author: string | null;
    thumbnail: string | null;
}

const GalleryImage = ({ src, alt }: { src: string | null; alt: string }) => {
    const [imgSrc, setImgSrc] = useState(src || '/images/no-image.png');
    const [hasError, setHasError] = useState(false);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            onError={() => {
                if (!hasError) {
                    setImgSrc('/images/no-image.png');
                    setHasError(true);
                }
            }}
            unoptimized={imgSrc.startsWith('http')} // External images might need this if they have CORS issues
        />
    );
};

export default function CinematicGallery({ posts }: { posts: any[] }) {
    if (posts.length === 0) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-[#f8f9fa] py-24"
        >
            <div className="max-w-6xl mx-auto px-6 mb-12">
                <h2 className="text-4xl font-black text-[#001f3f]">두돌 갤러리</h2>
            </div>

            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {posts.map((post, idx) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                    >
                        <Link
                            href={`/board/gallery/${post.id}`}
                            className="relative block w-full aspect-square rounded-2xl overflow-hidden group shadow-lg transition-shadow hover:shadow-2xl"
                        >
                            <GalleryImage
                                src={post.thumbnail}
                                alt={post.title}
                            />

                            {/* Dark Gradient Overlay - Always visible at bottom, fades in more on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-70" />

                            {/* Content (Text) */}
                            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                                <h3 className="text-xl font-bold leading-tight mb-1 line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-sm font-medium text-slate-200">
                                    {post.author || '박종환'}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
