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
        const userId = authStore.user?.userId || authStore.user?.id
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

        const userId = authStore.user?.userId || authStore.user?.id
        if (!userId) {
            console.warn('사용자 ID가 없어 스크랩을 불러올 수 없습니다.')
            scraps.value.clear()
            return
        }

        const storageKey = getStorageKey()
        if (!storageKey) return

        // 먼저 localStorage에서 로드 (즉시 UI 반영)
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]')
        scraps.value.clear()
        saved.forEach(id => scraps.value.add(id))

        // 백엔드 연결: API에서 사용자의 스크랩 목록 가져오기
        try {
            // 백엔드: GET /api/v1/houses/scraps?userId=...
            // TODO: 백엔드에서 JWT 토큰에서 userId를 추출하도록 수정 필요
            const res = await api.get('/houses/scraps', { params: { userId } })
            const houseList = res.data.data || res.data || []
            
            // 백엔드는 HouseInfoDto 배열을 반환하므로 aptSeq를 추출
            if (Array.isArray(houseList)) {
                const scrapIds = houseList.map(house => house.aptSeq || house.id).filter(Boolean)
                scraps.value.clear()
                scrapIds.forEach(id => scraps.value.add(id))
                // localStorage도 백엔드 데이터로 동기화
                localStorage.setItem(storageKey, JSON.stringify(scrapIds))
            }
        } catch (error) {
            // API 호출 실패: localStorage 데이터 사용 (이미 위에서 로드됨)
            console.warn('스크랩 API 호출 실패, localStorage 데이터 사용:', error)
        }
    }

    const toggleScrap = async (estateId) => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
            alert('로그인이 필요합니다.')
            return false
        }

        const userId = authStore.user?.userId || authStore.user?.id
        if (!userId) {
            alert('사용자 정보를 찾을 수 없습니다.')
            return false
        }

        // 메모리 상태 먼저 변경 (즉시 UI 반영)
        const wasScrapped = scraps.value.has(estateId)
        if (wasScrapped) {
            scraps.value.delete(estateId)
        } else {
            scraps.value.add(estateId)
        }

        // localStorage에 즉시 저장
        const storageKey = getStorageKey()
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify([...scraps.value]))
        }

        // 백엔드 API 호출
        try {
            // 백엔드: POST /api/v1/houses/{aptSeq}/scrap?userId=...
            // TODO: 백엔드에서 JWT 토큰에서 userId를 추출하도록 수정 필요
            // 스크랩 추가/삭제는 모두 POST로 처리 (백엔드에서 토글 처리)
            await api.post(`/houses/${estateId}/scrap`, null, { 
                params: { userId } 
            })
            return true
        } catch (error) {
            console.warn('스크랩 API 호출 실패:', error)
            // API 호출 실패 시 이전 상태로 롤백
            if (wasScrapped) {
                scraps.value.add(estateId)
            } else {
                scraps.value.delete(estateId)
            }
            if (storageKey) {
                localStorage.setItem(storageKey, JSON.stringify([...scraps.value]))
            }
            
            // 401 에러는 interceptor에서 처리됨
            if (error.response?.status !== 401) {
                alert('스크랩 처리에 실패했습니다. 다시 시도해주세요.')
            }
            return false
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
