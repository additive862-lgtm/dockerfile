'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, BookOpen, Clock, Users, House, MessageSquare, History, ScrollText, Compass, MessageCircle } from 'lucide-react';
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

/** 2. 아이콘 매핑 헬퍼 */
function getIconByMenuName(name: string) {
    const size = 18;
    if (name.includes('소개')) return <House size={size} />;
    if (name.includes('교회사') || name.includes('역사')) return <History size={size} />;
    if (name.includes('강론')) return <ScrollText size={size} />;
    if (name.includes('성경') || name.includes('여행')) return <Compass size={size} />;
    if (name.includes('샘') || name.includes('이야기')) return <MessageCircle size={size} />;
    if (name.includes('커뮤니티') || name.includes('게시판')) return <Users size={size} />;
    return <BookOpen size={size} />;
}

const FALLBACK_MENU: NavItem[] = [
    { name: '두돌소개', path: '/about', icon: getIconByMenuName('두돌소개') },
    { name: '교회사', path: '/board/church', icon: getIconByMenuName('교회사') },
    {
        name: '강론',
        icon: getIconByMenuName('강론'),
        dropdown: [
            { name: '오늘의 강론', path: '/board/daily-homily' },
            { name: '주일/대축일 강론', path: '/board/sunday-homily' },
            { name: '축일/기념일 강론', path: '/board/feast-homily' },
            { name: '특별강론', path: '/board/special-homily' },
        ],
    },
    {
        name: '맘도성경여행',
        icon: getIconByMenuName('맘도성경여행'),
        dropdown: [
            { name: '맘도 성서 해설', path: '/board/mamdo-commentary' },
            { name: '성경', path: '/board/bible' },
        ],
    },
    { name: '이야기 샘', path: '/board/story-spring', icon: getIconByMenuName('이야기 샘') },
    {
        name: '커뮤니티',
        icon: getIconByMenuName('커뮤니티'),
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
    const [logoText, setLogoText] = useState('두돌');
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setLogoText(prev => prev === '두돌' ? 'DUDOL' : '두돌');
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Map DB menus to NavItem structure
    const mappedMenus: NavItem[] = initialMenus && initialMenus.length > 0
        ? initialMenus.map(m => ({
            name: m.name,
            path: m.path || undefined,
            icon: getIconByMenuName(m.name),
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
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group h-10 overflow-hidden">
                        {!mounted ? (
                            <span className="text-3xl font-black tracking-tight text-[#001f3f]">
                                두돌
                            </span>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={logoText}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="text-3xl font-black tracking-tight text-[#001f3f] min-w-[100px]"
                                >
                                    {logoText}
                                </motion.span>
                            </AnimatePresence>
                        )}
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
                                    {!mounted ? (
                                        <span className="text-2xl font-black text-[#001f3f]">두돌</span>
                                    ) : (
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={logoText}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.8 }}
                                                className="text-2xl font-black text-[#001f3f]"
                                            >
                                                {logoText}
                                            </motion.span>
                                        </AnimatePresence>
                                    )}
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
