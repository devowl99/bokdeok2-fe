import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import router from '@/router'
import { useScrapStore } from '@/stores/scrap'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('accessToken') || null)
    const user = ref(JSON.parse(localStorage.getItem('user')) || null)

    // 페이지 새로고침 시 토큰 복원 (백엔드 연결 시 자동으로 JWT가 헤더에 포함됨)
    if (token.value) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }

    const isAuthenticated = computed(() => !!token.value)

    const login = async (email, password) => {
        try {
            // 백엔드: /api/v1/auth/login (POST)
            // 요청: { email, password }
            // 응답: { accessToken: "..." }
            const response = await api.post('/auth/login', { email, password })
            
            // 백엔드는 { accessToken: "..." } 형식으로 반환
            // 응답 인터셉터가 { success: true, data: { accessToken: "..." } } 형식으로 변환함
            const accessToken = response.data.data?.accessToken || response.data.data
            
            if (!accessToken) {
                throw new Error('로그인 토큰을 받지 못했습니다.')
            }

            // 토큰 저장
            token.value = accessToken
            localStorage.setItem('accessToken', accessToken)
            
            // Default header for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

            // 로그인 후 사용자 정보 조회
            try {
                const profileResponse = await api.get('/user/profile')
                const userData = profileResponse.data.data || profileResponse.data
                
                // userId를 id로 매핑 (프론트엔드에서 id 사용)
                const mappedUser = {
                    id: userData.userId,
                    userId: userData.userId,
                    email: userData.email,
                    nickname: userData.nickname,
                    phone: userData.phone
                }
                
                user.value = mappedUser
                localStorage.setItem('user', JSON.stringify(mappedUser))
            } catch (profileError) {
                console.warn('프로필 조회 실패, 이메일만 저장:', profileError)
                // 프로필 조회 실패해도 이메일만으로 계속 진행
                user.value = { email, id: null }
                localStorage.setItem('user', JSON.stringify({ email, id: null }))
            }

            // Load user's scraps after login
            const scrapStore = useScrapStore()
            await scrapStore.loadScraps()

            return true
        } catch (error) {
            console.error('Login failed:', error)
            // 백엔드가 문자열을 직접 반환하는 경우와 객체를 반환하는 경우 모두 처리
            let errorMessage = '로그인에 실패했습니다.'
            
            if (error.response?.data) {
                // 응답 데이터가 문자열인 경우
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data
                } 
                // 응답 데이터가 객체인 경우 (인터셉터에서 변환된 경우)
                else if (error.response.data.message) {
                    errorMessage = error.response.data.message
                } else if (error.response.data.data) {
                    // data.data도 문자열일 수 있음
                    errorMessage = typeof error.response.data.data === 'string' 
                        ? error.response.data.data 
                        : error.response.data.data
                }
            } else if (error.message) {
                errorMessage = error.message
            }
            
            throw new Error(errorMessage)
        }
    }

    const register = async (formData) => {
        try {
            // 백엔드: /api/v1/auth/signup (POST)
            // 요청: { email, password, nickname }
            const response = await api.post('/auth/signup', {
                email: formData.email,
                password: formData.password,
                nickname: formData.nickname
            })
            return true
        } catch (error) {
            console.error('Registration failed:', error)
            // 백엔드가 문자열로 에러 메시지를 반환할 수 있음
            const errorMessage = error.response?.data?.message || error.response?.data?.data || '회원가입에 실패했습니다.'
            throw new Error(errorMessage)
        }
    }

    const logout = () => {
        token.value = null
        user.value = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
        
        // 스크랩 데이터는 localStorage에 유지되어 재로그인 시 자동으로 복원됨
        // 메모리 초기화는 loadScraps()에서 자동으로 처리됨
        
        router.push('/')
    }

    return {
        token,
        user,
        isAuthenticated,
        login,
        register,
        logout
    }
})
