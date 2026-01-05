export default function About() {
    return (
        <div className="bg-white">
            {/* Header */}
            <div className="bg-slate-50 py-20 border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">두돌 소개</h1>
                    <p className="text-lg text-slate-600">이석재 토마스 데 아퀴나스 신부를 소개합니다.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
                {/* Profile Section */}
                <section className="flex flex-col md:flex-row gap-12 items-start">
                    <div className="w-full md:w-1/3 aspect-[3/4] bg-slate-200 rounded-2xl overflow-hidden shadow-lg relative">
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                            <span className="text-sm px-4 text-center">이석재 토마스 데 아퀴나스 신부</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">약력</h2>
                        <div className="prose prose-slate">
                            <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                <li><strong>1979년</strong> 사제 서품</li>
                                <li><strong>인천가톨릭대학교</strong> 제4대 총장 역임</li>
                                <li>인천가톨릭대학교 전임교수 (1996년 ~ )</li>
                                <li>신학교 건설본부장, 복음화연구소장, 사무처장, 교무처장, 대학원장 역임</li>
                                <li>현 <strong>가정동 성당</strong> 주임신부</li>
                            </ul>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 pt-4">사목 철학</h2>
                        <p className="text-slate-700 leading-relaxed">
                            "문화 영성을 통한 복음화"를 평생의 화두로 삼아왔습니다.
                            지식을 넘어 삶의 구체적인 자리에서 하느님의 말씀을 체험하는 즐거운 신앙을 추구합니다.
                        </p>
                    </div>
                </section>

                {/* Books Section */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 border-l-4 border-sky-500 pl-4">대표 저서</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {['신난다 첫영성체 교리', '묻고 답하는 성경 여행', '맘도 몸도 첫번째 성경여행'].map((book) => (
                            <div key={book} className="bg-slate-50 p-6 rounded-xl text-center">
                                <div className="w-16 h-20 bg-white shadow-sm mx-auto mb-4 border border-slate-200 flex items-center justify-center">
                                    <span className="text-[10px] text-slate-300">BOOK</span>
                                </div>
                                <h3 className="font-semibold text-slate-900 text-sm">{book}</h3>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
