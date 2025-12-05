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
    }
]
