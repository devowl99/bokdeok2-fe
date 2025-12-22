import axios from 'axios'

const api = axios.create({
    baseURL: '/api/v1',
    timeout: 10000, // 10초로 증가 (백엔드 응답 시간 고려)
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request Interceptor: JWT 토큰 자동 추가
api.interceptors.request.use(
    (config) => {
        // JWT 토큰 자동 추가
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        
        console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.params || config.data)
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response Interceptor: 에러 처리 및 응답 변환
api.interceptors.response.use(
    (response) => {
        // 백엔드 응답을 프론트엔드 형식으로 변환
        // 백엔드는 직접 DTO를 반환하므로 { success: true, data: response.data } 형식으로 래핑
        return {
            ...response,
            data: {
                success: true,
                data: response.data
            }
        }
    },
    (error) => {
        // 에러 응답 처리
        console.error('[API Error]', error.response?.status, error.response?.data || error.message)
        
        // JWT 토큰 만료 처리 (401 Unauthorized)
        if (error.response?.status === 401) {
            // 동적 import로 순환 참조 방지
            import('@/stores/auth').then(({ useAuthStore }) => {
                const authStore = useAuthStore()
                if (authStore.isAuthenticated) {
                    alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
                    authStore.logout()
                }
            })
        }

        // 에러 응답도 통일된 형식으로 변환
        if (error.response) {
            return Promise.reject({
                ...error,
                response: {
                    ...error.response,
                    data: {
                        success: false,
                        message: error.response.data || error.response.statusText,
                        data: error.response.data
                    }
                }
            })
        }

        return Promise.reject(error)
    }
)

export default api
