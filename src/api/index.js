import axios from 'axios'
import { MOCK_ESTATES, MOCK_USER } from './mockData'

const api = axios.create({
    baseURL: '/api/v1',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Mock Adapter Logic (Simple Interceptor)
// 실제 백엔드 없이 개발하기 위한 간단한 mock 처리입니다.
api.interceptors.request.use(async (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.params || config.data)

    // Mock Latency
    await new Promise(resolve => setTimeout(resolve, 500))

    // 1. Estate List
    if (config.url === '/estate' && config.method === 'get') {
        return Promise.reject({
            response: {
                data: { success: true, data: MOCK_ESTATES },
                status: 200,
                headers: {},
                config: config
            },
            isMock: true // Custom flag to identify mock response
        })
    }

    // 2. Auth Login (Dummy)
    if (config.url === '/auth/login' && config.method === 'post') {
        const { email } = config.data
        // Mock login success logic
        if (email) {
            return Promise.reject({
                response: {
                    data: {
                        success: true,
                        data: {
                            token: 'mock-jwt-token-12345',
                            user: { ...MOCK_USER, email }
                        }
                    },
                    status: 200,
                    headers: {},
                    config: config
                },
                isMock: true
            })
        }
    }

    // 3. Auth Register (Dummy)
    if (config.url === '/auth/register' && config.method === 'post') {
        return Promise.reject({
            response: {
                data: { success: true, message: 'Registration successful' },
                status: 201,
                headers: {},
                config: config
            },
            isMock: true
        })
    }

    // 4. Scrap GET (Load user's scraps from localStorage)
    if (config.url === '/scrap' && config.method === 'get') {
        // localStorage에서 현재 사용자의 스크랩 목록 가져오기
        const token = localStorage.getItem('accessToken')
        const userStr = localStorage.getItem('user')
        let scrapIds = []
        
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                const storageKey = `scraps_${user.id}`
                const saved = JSON.parse(localStorage.getItem(storageKey) || '[]')
                scrapIds = saved
            } catch (e) {
                console.warn('Failed to load scraps from localStorage:', e)
            }
        }
        
        return Promise.reject({
            response: {
                data: { success: true, data: scrapIds },
                status: 200,
                headers: {},
                config: config
            },
            isMock: true
        })
    }

    // 5. Scrap Toggle (Dummy)
    if (config.url.startsWith('/scrap/') && (config.method === 'post' || config.method === 'delete')) {
        return Promise.reject({
            response: {
                data: { success: true, message: 'Scrap updated' },
                status: 200,
                headers: {},
                config: config
            },
            isMock: true
        })
    }

    // 6. LLM Chat (Mock)
    if (config.url === '/llm/chat' && config.method === 'post') {
        const { message } = config.data
        let reply = '제가 도움을 드릴 수 있는 부분이 아닌 것 같아요. 😅'

        if (message.includes('안녕')) reply = '안녕하세요! 어떤 집을 찾고 계신가요? 🏠'
        else if (message.includes('추천')) reply = '고객님의 취향에 딱 맞는 매물을 찾아드릴게요. 원하시는 조건을 말씀해주세요!'
        else if (message.includes('강남')) reply = '강남역 근처의 인기 있는 매물들을 지도에 표시해드렸어요!'
        else reply = `"${message}"에 대한 정보를 찾아보겠습니다. 잠시만 기다려주세요.`

        return Promise.reject({
            response: {
                data: { success: true, data: { reply } },
                status: 200,
                headers: {},
                config: config
            },
            isMock: true
        })
    }

    // 7. LLM Estate Recommendation (Mock)
    if (config.url === '/llm/recommend' && config.method === 'post') {
        // Return random 2-3 estates from MOCK_ESTATES
        const recommended = MOCK_ESTATES.slice(0, 3)

        return Promise.reject({
            response: {
                data: { success: true, data: { estates: recommended } },
                status: 200,
                headers: {},
                config: config
            },
            isMock: true
        })
    }

    // JWT 토큰 자동 추가 (백엔드 연결 시 자동으로 동작)
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config

}, error => {
    return Promise.reject(error)
})

// Response Interceptor to unwrap Mock responses and handle JWT errors
api.interceptors.response.use(
    response => response,
    error => {
        // If it's our custom Mock response, treat it as success
        if (error.isMock && error.response) {
            console.log(`[API Mock Response]`, error.response.data)
            return Promise.resolve(error.response)
        }

        // 백엔드 연결 시: JWT 토큰 만료 처리 (401 Unauthorized)
        if (error.response?.status === 401 && !error.isMock) {
            // 토큰 만료 또는 인증 실패
            // 동적 import로 순환 참조 방지
            import('@/stores/auth').then(({ useAuthStore }) => {
                const authStore = useAuthStore()
                if (authStore.isAuthenticated) {
                    alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
                    authStore.logout()
                }
            })
        }

        return Promise.reject(error)
    }
)

export default api
