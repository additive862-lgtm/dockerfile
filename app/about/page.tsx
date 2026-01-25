'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const PROFILE_IMAGES = [
    '/images/profile1.jpg',
    '/images/profile2.jpg',
    '/images/profile3.jpg'
];

const BACKGROUND_IMAGES = [
    '/images/about-bg-1.jpg',
    '/images/about-bg-2.jpg'
];

export default function About() {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        // Set a random background image on mount
        const randomBg = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
        setBgImage(randomBg);

        const interval = setInterval(() => {
            setCurrentIdx(prev => {
                let next;
                do {
                    next = Math.floor(Math.random() * PROFILE_IMAGES.length);
                } while (next === prev);
                return next;
            });
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const slideVariants = {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 }
    };

    const textFadeVariants = {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0 },
    };

    return (
        <div className="bg-white">
            {/* Header with Random Background Image */}
            <div className="relative h-[250px] flex items-center justify-center overflow-hidden bg-slate-900">
                {/* Background Image Container */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 transition-opacity duration-1000"
                    style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />

                {/* Content with Fade Effect - Aligned to Bottom Left */}
                <div className="relative z-10 max-w-4xl mx-auto px-4 w-full h-full flex flex-col justify-end pb-12">
                    <motion.div
                        variants={textFadeVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="space-y-2 text-left"
                    >
                        <h1 className="text-3xl md:text-4xl font-medium text-white tracking-tight drop-shadow-lg uppercase">
                            두돌 소개
                        </h1>
                        <p className="text-base md:text-lg text-slate-100 font-normal drop-shadow-md">
                            이석재 토마스 데 아퀴나스 신부를 소개합니다.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16 space-y-24">
                {/* Top Section: Profile & Greetings side-by-side */}
                <section className="flex flex-col md:flex-row gap-12 items-start">
                    {/* Left: Profile Photo & Name */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <div className="aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative group">
                            <AnimatePresence initial={false}>
                                <motion.div
                                    key={PROFILE_IMAGES[currentIdx]}
                                    variants={slideVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.4 }
                                    }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={PROFILE_IMAGES[currentIdx]}
                                        alt="이석재 토마스 데 아퀴나스"
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Name Overlay - Matching the mockup */}
                            <div className="absolute bottom-0 inset-x-0 h-16 bg-black/60 backdrop-blur-[2px] flex items-center justify-center gap-6 text-white border-t border-white/10">
                                <span className="text-2xl font-bold tracking-tight">이석재</span>
                                <span className="text-lg font-normal opacity-90">토마스 데 아퀴나스</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Greetings Section */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b-2 border-[#001f3f] inline-block pb-1">인사말씀</h2>
                            <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
                                <p>
                                    예수님께서는 그 옛날 바위(베드로) 위에 당신의 교회를 세우시겠다고 하셨습니다.
                                    베드로 사도는 그의 첫째 편지에서 "주님께로 가까이 오십시오. 그분은 살아 있는 돌입니다."(1베드 2,4) 라고 말씀하셨습니다.
                                </p>
                                <p>
                                    이어 사도는 우리가 "신령한 집을 짓는 데 쓰일 산 돌이 되라"고 권고하셨습니다.
                                    이 말씀 따라 저도 살아있는 돌이 되고 싶어 제 이름 석 자(李錫載)를 쉬운 한문으로 두 이(二) 돌석(石) 있을 재(在) 자로 표현해 보았습니다.
                                    그런데 세월이 지나고 나이가 들어 갈수록 디딤돌 역할을 하기 보다는 걸림돌 역할을 한 때가 더 많았음을 돌아보게 됩니다.
                                    부끄럽지만 제 부족함까지도 주님께서는 다 받아들여 주실 것임을 믿고 홈페이지 주소를 두돌로 하였습니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Biography & Philosophy Grid - Now under the Profile */}
                <section className="grid md:grid-cols-2 gap-12 lg:gap-20">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-slate-100 pb-3">약력</h2>
                        <div className="prose prose-slate prose-lg">
                            <ul className="list-disc pl-5 space-y-4 text-slate-700">
                                <li><strong>1979년</strong> 사제 서품</li>
                                <li><strong>인천가톨릭대학교</strong> 제4대 총장 역임</li>
                                <li>인천가톨릭대학교 전임교수 (1996년 ~ )</li>
                                <li>신학교 건설본부장, 복음화연구소장, 사무처장, 교무처장, 대학원장 역임</li>
                                <li>현 <strong>가정동 성당</strong> 주임신부</li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900 border-b-2 border-slate-100 pb-3">사목 철학</h2>
                        <p className="text-lg text-slate-700 leading-relaxed font-medium">
                            "문화 영성을 통한 복음화"를 평생의 화두로 삼아왔습니다. <br />
                            지식을 넘어 삶의 구체적인 자리에서 하느님의 말씀을 체험하는 즐거운 신앙을 추구합니다.
                        </p>
                    </div>
                </section>

                {/* Track Record Section */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 border-l-4 border-slate-800 pl-4">이석재 토마스 아퀴나스 신부 발자취</h2>
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                        <div className="space-y-4 text-slate-700 leading-relaxed text-[15px]">
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1951.03.07</span>
                                <span>경기 김포에서 태어남</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1969.12</span>
                                <span>성신고등학교(소신학교) 졸업</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1970.03</span>
                                <span>가톨릭대학교 신학부 입학</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1972~1974</span>
                                <span>병역필(육군 병장 전역)</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1977.02</span>
                                <span>가톨릭대학교 졸업(신학사)</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1979.02</span>
                                <span>가톨릭대학교 대학원 졸업(신학 석사)</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline border-t pt-4 mt-4 border-slate-200">
                                <span className="font-bold text-[#001f3f]">1979.03.06</span>
                                <span className="font-bold">사제품(답동 대성당)</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1979~1981</span>
                                <span>도화동, 강화, 제물포 성당 보좌신부</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1981.04~08</span>
                                <span>보병학교 입교, 군종장교 임관</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1981~1982</span>
                                <span>수도기계화보병사단 군종신부</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1982~1984</span>
                                <span>제5군단 군종신부(8월 31일 전역)</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1984.09~1987</span>
                                <span>주원(현, 간석4동) 성당 주임신부</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1987~1991</span>
                                <span>인천교구 교육국장(4년)</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1991~1994</span>
                                <span>제물포 성당 주임(3년)</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1991.03</span>
                                <span>인하대 대학원 사학과(박사과정) 입학</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1995~1998</span>
                                <span>부평5동(현 부개동) 성당 주임</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline font-semibold text-[#001f3f]">
                                <span className="font-bold">1996.02</span>
                                <span>인천가톨릭대학교 교수 임용</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">1998~2006</span>
                                <span>사무처장, 교무처장, 대학원장 역임</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">2000.08.24</span>
                                <span>문학박사 학위 취득(인하대학교 대학원)</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline font-bold text-[#001f3f]">
                                <span>2006.12~2010.11</span>
                                <span>인천가톨릭대학교 총장</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline">
                                <span className="font-bold text-slate-900">2011.01~2025.01</span>
                                <span>주안3동(5년), 소사(4년), 가정동(5년)</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] gap-4 items-baseline text-[#001f3f] font-bold">
                                <span>2025.01~</span>
                                <span>성사 전담 사제</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Publications Section */}
                <section className="space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 border-l-4 border-slate-800 pl-4">저서 및 역서</h2>
                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                            <div className="space-y-4 text-slate-700 leading-relaxed text-[15px]">
                                <div className="flex gap-4">
                                    <span className="text-[#001f3f] font-bold">《성서40주간 문제지》</span>
                                    <span>성서와 함께</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-[#001f3f] font-bold">《신난다 첫영성체교리》</span>
                                    <span>생활성서사</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-[#001f3f] font-bold">《묻고 답하는 성경 여행》</span>
                                    <span>㈜공부발전소</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-[#001f3f] font-bold">《죽음이 마지막 말은 아니다》(공역)</span>
                                    <span>성바오로출판사</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 border-l-4 border-slate-800 pl-4">논문</h2>
                        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                            <ul className="space-y-4 text-slate-700 leading-relaxed text-[15px] list-disc pl-5">
                                <li>비신자 죽음에 대한 교회의 사목적 배려, 인천가톨릭대학교, 누리와 말씀(제3호, 1998.6)</li>
                                <li>조선 대목구 분할에 대한 중국 내 선교회 간의 갈등, 부산교회사연구소, 부산교회사보(제32호, 2001.10)</li>
                                <li>일제 강점기 독일 분도회와 미국 메리놀회의 선교방법 비교 연구, 인하대학교, 인하사학(제9집, 2002.2)</li>
                                <li>강화지역 그리스도교의 사회적 역할, 인천가톨릭대학교, 누리와 말씀(제13호, 2003.6)</li>
                                <li>서양종교 수용의 디딤돌, 신편 강화사(중), 강화군 군사 편찬위원회(2003.2)</li>
                                <li>인도의 고아 교구 창설(1533년) 이후의 아시아 복음화 초기 역사 소고, 가톨릭신학(제4호, 2004 여름)</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
