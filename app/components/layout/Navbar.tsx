'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, BookOpen, Clock, Users, House, MessageSquare } from 'lucide-react';
import AuthButton from '../auth/AuthButton';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 라이브러리 유틸리티 */
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** 1. 메뉴 데이터 정의 (상수 관리) */
interface NavSubItem {
    name: string;
    path: string;
}

interface NavItem {
    name: string;
    path?: string;
    icon?: React.ReactNode;
    dropdown?: NavSubItem[];
}

const FALLBACK_MENU: NavItem[] = [
    { name: '두돌소개', path: '/about', icon: <House size={18} /> },
    { name: '교회사', path: '/board/church', icon: <Clock size={18} /> },
    {
        name: '강론',
        icon: <BookOpen size={18} />,
        dropdown: [
            { name: '오늘의 강론', path: '/board/daily-homily' },
            { name: '주일/대축일 강론', path: '/board/sunday-homily' },
            { name: '축일/기념일 강론', path: '/board/feast-homily' },
            { name: '특별강론', path: '/board/special-homily' },
        ],
    },
    {
        name: '맘도성경여행',
        icon: <BookOpen size={18} />,
        dropdown: [
            { name: '맘도 성서 해설', path: '/board/mamdo-commentary' },
            { name: '성경', path: '/board/bible' },
        ],
    },
    { name: '이야기 샘', path: '/board/story-spring', icon: <MessageSquare size={18} /> },
    {
        name: '커뮤니티',
        icon: <Users size={18} />,
        dropdown: [
            { name: '자유게시판', path: '/board/free-board' },
            { name: '갤러리', path: '/board/gallery' },
            { name: '질문과 답변', path: '/board/qna' },
        ],
    },
];

export default function Navbar({ initialMenus }: { initialMenus?: any[] }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const pathname = usePathname();

    // Map DB menus to NavItem structure
    const mappedMenus: NavItem[] = initialMenus && initialMenus.length > 0
        ? initialMenus.map(m => ({
            name: m.name,
            path: m.path || undefined,
            icon: <BookOpen size={18} />, // Default icon for all for now, can be improved
            dropdown: m.subMenus && m.subMenus.length > 0
                ? m.subMenus.map((sm: any) => ({ name: sm.name, path: sm.path || "" }))
                : undefined
        }))
        : FALLBACK_MENU;

    const navMenus = mappedMenus;


    /** 2. 인터랙션 및 애니메이션 (Framer Motion) */
    const desktopDropdownVariants = {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.2 }
    };

    const mobileMenuVariants = {
        closed: { x: '100%', opacity: 0 },
        open: { x: 0, opacity: 1 },
        exit: { x: '100%', opacity: 0 }
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <span className="text-3xl font-black tracking-tight text-[#001f3f] group-hover:opacity-80 transition-opacity">
                            두돌
                        </span>
                    </Link>

                    {/* Right Side Group (Nav + Auth + Mobile Menu) */}
                    <div className="flex items-center gap-4 ml-auto">
                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center space-x-2">
                            {navMenus.map((item) => {
                                const isActive = item.path === pathname ||
                                    (item.dropdown?.some(sub => sub.path === pathname));

                                return (
                                    <div
                                        key={item.name}
                                        className="relative py-2"
                                        onMouseEnter={() => setOpenDropdown(item.name)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                    >
                                        {item.path ? (
                                            <Link
                                                href={item.path}
                                                className={cn(
                                                    "relative flex items-center gap-2 px-4 py-2.5 rounded-md text-[16px] font-bold transition-all duration-200",
                                                    isActive
                                                        ? "text-[#001f3f]"
                                                        : "text-slate-600 hover:text-[#001f3f] hover:bg-slate-50"
                                                )}
                                            >
                                                {item.icon}
                                                {item.name}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="underline"
                                                        className="absolute bottom-0 left-0 h-0.5 w-full bg-[#F2F2F2]"
                                                    />
                                                )}
                                            </Link>
                                        ) : (
                                            <button
                                                className={cn(
                                                    "relative flex items-center gap-2 px-4 py-2.5 rounded-md text-[16px] font-bold transition-all duration-200 text-slate-600 hover:text-[#001f3f] hover:bg-slate-50",
                                                    (openDropdown === item.name || isActive) && "text-[#001f3f]"
                                                )}
                                            >
                                                {item.icon}
                                                {item.name}
                                                <ChevronDown size={16} className={cn("transition-transform duration-200", openDropdown === item.name && "rotate-180")} />
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="underline"
                                                        className="absolute bottom-0 left-0 h-0.5 w-full bg-[#F2F2F2]"
                                                    />
                                                )}
                                            </button>
                                        )}

                                        <AnimatePresence>
                                            {item.dropdown && openDropdown === item.name && (
                                                <motion.div
                                                    initial="initial"
                                                    animate="animate"
                                                    exit="exit"
                                                    variants={desktopDropdownVariants}
                                                    className="absolute top-full left-0 w-52 bg-white rounded-md shadow-lg border border-slate-100 overflow-hidden py-2"
                                                >
                                                    {item.dropdown.map((subItem) => {
                                                        const isSubActive = pathname === subItem.path;
                                                        return (
                                                            <Link
                                                                key={subItem.path}
                                                                href={subItem.path}
                                                                className={cn(
                                                                    "block px-6 py-3 text-[15px] font-semibold transition-colors",
                                                                    isSubActive
                                                                        ? "text-[#001f3f] bg-slate-50"
                                                                        : "text-slate-600 hover:text-[#001f3f] hover:bg-slate-50"
                                                                )}
                                                            >
                                                                {subItem.name}
                                                            </Link>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </nav>

                        <AuthButton />

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 text-[#001f3f]"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Menu size={30} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav (Slide in) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="exit"
                            variants={mobileMenuVariants}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] shadow-2xl lg:hidden overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-10">
                                    <span className="text-2xl font-black text-[#001f3f]">두돌</span>
                                    <button onClick={() => setIsMenuOpen(false)} className="text-slate-400">
                                        <X size={32} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {navMenus.map((item) => (
                                        <div key={item.name} className="space-y-3">
                                            {item.path ? (
                                                <Link
                                                    href={item.path}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 text-xl font-bold text-[#001f3f]"
                                                >
                                                    {item.icon}
                                                    {item.name}
                                                </Link>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 text-xl font-bold text-slate-400">
                                                        {item.icon}
                                                        {item.name}
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 pl-8">
                                                        {item.dropdown?.map((subItem) => (
                                                            <Link
                                                                key={subItem.path}
                                                                href={subItem.path}
                                                                onClick={() => setIsMenuOpen(false)}
                                                                className="block py-2 text-lg font-semibold text-slate-700 hover:text-[#001f3f]"
                                                            >
                                                                {subItem.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
