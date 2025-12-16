import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { MOCK_ESTATES } from '@/api/mockData'
import { useAuthStore } from '@/stores/auth'

export const useScrapStore = defineStore('scrap', () => {
    const scraps = ref(new Set()) // Store IDs only

    const getScrapCount = computed(() => scraps.value.size)

    const isScrapped = (estateId) => scraps.value.has(estateId)

    // Get storage key for current user
    const getStorageKey = () => {
        const authStore = useAuthStore()
        const userId = authStore.user?.id
        if (!userId) return null
        return `scraps_${userId}`
    }

    // Load initial scraps for current user
    const loadScraps = async () => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated || !authStore.user) {
            scraps.value.clear()
            return
        }

        const storageKey = getStorageKey()
        if (!storageKey) return

        // 먼저 localStorage에서 로드 (즉시 UI 반영)
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]')
        scraps.value.clear()
        saved.forEach(id => scraps.value.add(id))

        // 백엔드 연결 시: API에서 사용자의 스크랩 목록 가져오기 (동기화)
        try {
            // GET /api/v1/scrap - JWT 토큰이 자동으로 헤더에 포함됨
            const res = await api.get('/scrap')
            const scrapIds = res.data.data || [] // 백엔드 응답 형식에 맞게 조정
            
            // API 응답이 있고 배열이면 적용 (빈 배열도 유효한 응답)
            if (Array.isArray(scrapIds)) {
                scraps.value.clear()
                scrapIds.forEach(id => scraps.value.add(id))
                // localStorage도 백엔드 데이터로 동기화 (백엔드가 source of truth)
                localStorage.setItem(storageKey, JSON.stringify(scrapIds))
            }
            // API 응답이 없거나 유효하지 않으면 localStorage 데이터 유지
        } catch (error) {
            // 백엔드 연결 전 또는 API 호출 실패: localStorage 데이터 사용 (이미 위에서 로드됨)
            console.warn('API 호출 실패, localStorage 데이터 사용:', error)
            // localStorage 데이터는 이미 위에서 로드했으므로 그대로 유지
        }
    }

    const toggleScrap = async (estateId) => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
            alert('로그인이 필요합니다.')
            return false
        }

        // 메모리 상태 먼저 변경 (즉시 UI 반영)
        const wasScrapped = scraps.value.has(estateId)
        if (wasScrapped) {
            scraps.value.delete(estateId)
        } else {
            scraps.value.add(estateId)
        }

        // localStorage에 즉시 저장 (백엔드 연결 전/후 모두 동작)
        const storageKey = getStorageKey()
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify([...scraps.value]))
        }

        // 백엔드 API 호출 시도 (실패해도 localStorage에 이미 저장됨)
        try {
            if (wasScrapped) {
                // DELETE /api/v1/scrap/{id} - JWT 토큰이 자동으로 헤더에 포함됨
                await api.delete(`/scrap/${estateId}`)
            } else {
                // POST /api/v1/scrap/{id} - JWT 토큰이 자동으로 헤더에 포함됨
                await api.post(`/scrap/${estateId}`)
            }
            return true
        } catch (error) {
            console.warn('API 호출 실패, localStorage에만 저장됨:', error)
            // API 호출 실패해도 localStorage에는 이미 저장되어 있으므로 성공으로 처리
            // 401 에러는 interceptor에서 처리됨
            return true
        }
    }

    // Clear scraps from memory only (keep localStorage for user)
    const clearScraps = () => {
        scraps.value.clear()
        // Don't remove from localStorage - it's user-specific and should persist
    }

    return {
        scraps,
        getScrapCount,
        isScrapped,
        loadScraps,
        toggleScrap,
        clearScraps
    }
})
