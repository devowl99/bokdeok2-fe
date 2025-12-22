<template>
  <div class="scrap-page-container">
    <div class="blob"></div>
    <div class="blob-2"></div>
    <Header />
    
    <main class="content-area">
      <div class="page-header">
        <h2>스크랩 매물</h2>
        <p>스크랩한 매물을 한눈에 모아보세요.</p>
      </div>

      <div v-if="isLoading" class="loading-state">
        <p>스크랩한 매물을 불러오는 중...</p>
      </div>

      <div v-else-if="scraps.length > 0" class="scrap-grid">
        <EstateCard
          v-for="estate in scraps"
          :key="estate.id"
          :estate="estate"
          class="scrap-item"
          @click="goToDetail(estate.id)"
        />
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📂</div>
        <h3>아직 스크랩한 매물이 없어요</h3>
        <p>지도에서 마음에 드는 매물을 찾아 스크랩해보세요!</p>
        <button class="go-map-btn" @click="$router.push('/map')">매물 보러가기</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import Header from '@/components/layout/Header.vue'
import EstateCard from '@/components/estate/EstateCard.vue'
import { useScrapStore } from '@/stores/scrap'
import { useAuthStore } from '@/stores/auth'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { mapHouseDtosToEstates } from '@/utils/estateMapper'

const scrapStore = useScrapStore()
const authStore = useAuthStore()
const router = useRouter()
const scraps = ref([])
const isLoading = ref(false)

// 스크랩된 매물 데이터 조회
const loadScrappedEstates = async () => {
  if (!authStore.isAuthenticated || !authStore.user) {
    scraps.value = []
    return
  }

  const userId = authStore.user?.userId || authStore.user?.id
  if (!userId) {
    scraps.value = []
    return
  }

  isLoading.value = true
  try {
    // 백엔드: GET /api/v1/houses/scraps?userId=...
    const response = await api.get('/houses/scraps', { params: { userId } })
    const houseDtos = response.data.data || response.data || []
    
    // 백엔드 DTO를 프론트엔드 형식으로 변환
    scraps.value = mapHouseDtosToEstates(Array.isArray(houseDtos) ? houseDtos : [])
  } catch (error) {
    console.error('스크랩 매물 조회 실패:', error)
    scraps.value = []
  } finally {
    isLoading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/estate/${id}`)
}

onMounted(async () => {
  await scrapStore.loadScraps()
  await loadScrappedEstates()
})

</script>

<style scoped>
.scrap-page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f6f8fb 0%, #e5eaf5 100%);
  position: relative;
  overflow-x: hidden; /* Prevent blob overflow */
  padding-bottom: 60px;
}

/* Background Blobs (Consistent with MyPage) */
.blob {
  position: absolute;
  top: -10%;
  right: -5%; /* Position differently from MyPage for variety */
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  filter: blur(80px);
  opacity: 0.6;
  border-radius: 50%;
  z-index: 0;
  animation: float 8s ease-in-out infinite;
}

.blob-2 {
  position: absolute;
  bottom: -10%;
  left: -5%;
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  filter: blur(80px);
  opacity: 0.6;
  border-radius: 50%;
  z-index: 0;
  animation: float 10s ease-in-out infinite reverse;
}

.content-area {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 40px auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
  animation: fadeUp 0.8s ease-out;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: var(--text-sub);
  font-size: 1.1rem;
}

/* Grid Layout */
.scrap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.scrap-item {
  /* EstateCard styles are scoped within component, but we can animate entry */
  transition: transform 0.3s;
}

.scrap-item:hover {
  transform: translateY(-8px); /* slightly more lift */
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05);
  max-width: 600px;
  margin: 40px auto;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.8;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 10px;
}

.empty-state p {
  color: var(--text-sub);
  margin-bottom: 30px;
}

.go-map-btn {
  padding: 16px 32px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
}

.go-map-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(108, 92, 231, 0.4);
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(20px, 20px) rotate(5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
