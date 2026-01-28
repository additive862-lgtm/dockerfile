const nextConfig = {
    // Docker 빌드를 위한 standalone 모드 설정
    output: "standalone",
    // 이미지 호스팅 도메인 설정
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
};

export default nextConfig;
