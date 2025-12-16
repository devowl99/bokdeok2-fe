export const MOCK_USER = {
    id: 1,
    email: 'test@bokdeok.com',
    nickname: '복덕이유저',
    profileImage: 'https://via.placeholder.com/150',
    scraps: [1, 3]
}

export const MOCK_ESTATES = [
    {
        id: 1,
        title: '강남역 5분거리 깔끔한 원룸',
        price: { deposit: 1000, monthly: 60 }, // 만원 단위
        type: '원룸',
        location: { lat: 37.498095, lng: 127.027610 },
        address: '서울시 강남구 역삼동',
        desc: '풀옵션, 남향, 주차가능',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 2,
        title: '한강뷰가 보이는 고급 오피스텔',
        price: { deposit: 20000, monthly: 150 },
        type: '오피스텔',
        location: { lat: 37.510829, lng: 127.066046 }, // 봉은사역 근처
        address: '서울시 강남구 삼성동',
        desc: '한강뷰, 헬스장 포함',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 3,
        title: '홍대입구역 복층 오피스텔',
        price: { deposit: 3000, monthly: 80 },
        type: '오피스텔',
        location: { lat: 37.556886, lng: 126.924297 }, // 홍대입구
        address: '서울시 마포구 동교동',
        desc: '복층, 역세권 1분',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 4,
        title: '성수동 힙한 투룸',
        price: { purchase: 55000 },
        type: '아파트',
        location: { lat: 37.544569, lng: 127.056000 }, // 성수
        address: '서울시 성동구 성수동',
        desc: '인테리어 완비, 서울숲 인근',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 5,
        title: '잠실역 도보 3분 신축 원룸',
        price: { deposit: 5000, monthly: 50 },
        type: '원룸',
        location: { lat: 37.513310, lng: 127.102779 }, // 잠실역
        address: '서울시 송파구 잠실동',
        desc: '신축, 역세권, 풀옵션',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 6,
        title: '이태원 고급 원룸',
        price: { deposit: 8000, monthly: 70 },
        type: '원룸',
        location: { lat: 37.534737, lng: 126.994697 }, // 이태원
        address: '서울시 용산구 이태원동',
        desc: '남향, 조용한 주거환경',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 7,
        title: '건대입구역 투룸',
        price: { deposit: 10000, monthly: 80 },
        type: '투룸',
        location: { lat: 37.540693, lng: 127.069230 }, // 건대입구
        address: '서울시 광진구 자양동',
        desc: '넓은 평수, 주차가능',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 8,
        title: '명동역 근처 오피스텔',
        price: { deposit: 15000, monthly: 100 },
        type: '오피스텔',
        location: { lat: 37.563569, lng: 126.982611 }, // 명동
        address: '서울시 중구 명동',
        desc: '시내 중심가, 교통편리',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 9,
        title: '서울대입구역 원룸',
        price: { deposit: 2000, monthly: 40 },
        type: '원룸',
        location: { lat: 37.481284, lng: 126.952712 }, // 서울대입구
        address: '서울시 관악구 봉천동',
        desc: '학생 거주 최적, 저렴한 가격',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 10,
        title: '압구정 고급 아파트',
        price: { purchase: 120000 },
        type: '아파트',
        location: { lat: 37.527516, lng: 127.028453 }, // 압구정
        address: '서울시 강남구 압구정동',
        desc: '고급 주거지역, 넓은 평수',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 11,
        title: '을지로입구역 원룸',
        price: { deposit: 3000, monthly: 45 },
        type: '원룸',
        location: { lat: 37.566214, lng: 126.982792 }, // 을지로입구
        address: '서울시 중구 을지로동',
        desc: '시내 접근성 우수, 저렴',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 12,
        title: '합정역 복층 오피스텔',
        price: { deposit: 5000, monthly: 65 },
        type: '오피스텔',
        location: { lat: 37.549465, lng: 126.913722 }, // 합정
        address: '서울시 마포구 합정동',
        desc: '복층 구조, 넓은 공간',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 13,
        title: '왕십리역 투룸',
        price: { deposit: 7000, monthly: 55 },
        type: '투룸',
        location: { lat: 37.561262, lng: 127.037292 }, // 왕십리
        address: '서울시 성동구 왕십리동',
        desc: '교통편리, 생활편의시설 완비',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 14,
        title: '신촌역 근처 원룸',
        price: { deposit: 4000, monthly: 50 },
        type: '원룸',
        location: { lat: 37.555134, lng: 126.936893 }, // 신촌
        address: '서울시 서대문구 창천동',
        desc: '대학가 인근, 젊은 분위기',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 15,
        title: '청담동 고급 오피스텔',
        price: { deposit: 25000, monthly: 180 },
        type: '오피스텔',
        location: { lat: 37.519109, lng: 127.047342 }, // 청담
        address: '서울시 강남구 청담동',
        desc: '프리미엄 위치, 최고급 시설',
        images: ['https://via.placeholder.com/400x300']
    },
    {
        id: 16,
        title: '노원역 투룸',
        price: { deposit: 6000, monthly: 60 },
        type: '투룸',
        location: { lat: 37.655128, lng: 127.061234 }, // 노원
        address: '서울시 노원구 상계동',
        desc: '넓은 평수, 주차가능',
        images: ['https://via.placeholder.com/400x300']
    }
]
