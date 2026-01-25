'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Post {
    id: number;
    title: string;
    author: string | null;
    createdAt: Date;
    _count: {
        comments: number;
    };
}

interface BoardWithPosts {
    category: string;
    name: string;
    posts: Post[];
}

export default function LatestPostsGrid({ boards }: { boards: any[] }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-6xl mx-auto px-6 py-20"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {boards.map((board, idx) => (
                    <motion.div
                        key={board.category}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-end border-b-2 border-[#001f3f]/10 pb-4">
                            <h3 className="text-xl font-extrabold text-[#001f3f]">{board.name}</h3>
                            <Link
                                href={`/board/${board.category}`}
                                className="text-sm font-bold text-slate-400 hover:text-[#001f3f] transition-colors"
                            >
                                더보기 +
                            </Link>
                        </div>

                        <div className="space-y-5">
                            {board.posts.length === 0 ? (
                                <p className="text-slate-400 text-sm py-4">최근 게시물이 없습니다.</p>
                            ) : board.posts.map((post: any) => (
                                <Link
                                    key={post.id}
                                    href={`/board/${board.category}/${post.id}`}
                                    className="group block"
                                >
                                    <div className="flex flex-col space-y-1.5">
                                        <div className="text-[12px] font-bold text-slate-300 uppercase tracking-wider">
                                            {format(new Date(post.createdAt), 'yyyy.MM.dd')}
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <h4 className="text-[17px] font-black text-slate-800 group-hover:text-[#001f3f] transition-colors truncate">
                                                {post.title}
                                            </h4>
                                            {post._count?.comments > 0 && (
                                                <span className="text-[13px] font-black text-rose-500">
                                                    [{post._count.comments}]
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[13px] font-bold text-slate-300">
                                            {post.author || '익명'}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
