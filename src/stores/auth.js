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
            // API call (intercepted by Mock for now)
            const response = await api.post('/auth/login', { email, password })

            const { token: accessToken, user: userData } = response.data.data

            // Update state
            token.value = accessToken
            user.value = userData

            // Persist to storage
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('user', JSON.stringify(userData))

            // Default header for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

            // Load user's scraps after login
            const scrapStore = useScrapStore()
            await scrapStore.loadScraps()

            return true
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        }
    }

    const register = async (formData) => {
        try {
            await api.post('/auth/register', formData)
            return true
        } catch (error) {
            console.error('Registration failed:', error)
            throw error
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
