<template>
  <div class="detail-page">
    <Header class="detail-header" />
    
    <main class="content-wrapper" v-if="estate">
      <!-- Image Section -->
      <section class="image-section">
        <div class="main-image">
          <span>🏠</span>
        </div>
      </section>

      <!-- Info Section -->
      <section class="info-section">
        <div class="info-header">
          <h1 class="title">{{ estate.title }}</h1>
          <div class="price-badge">{{ formatPrice(estate.price) }}</div>
        </div>

        <div class="meta-info">
          <div class="meta-item">
            <span class="label">유형</span>
            <span class="value">{{ estate.type }}</span>
          </div>
          <div class="meta-item">
            <span class="label">위치</span>
            <span class="value">{{ estate.address }}</span>
          </div>
        </div>

        <div class="description-box">
          <h3>상세 설명</h3>
          <p>{{ estate.desc }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="scrap-btn" @click="toggleScrap" :class="{ active: isScrapped }">
            <span class="icon">{{ isScrapped ? '♥' : '♡' }}</span>
            {{ isScrapped ? '스크랩 취소' : '스크랩' }}
          </button>
          <button class="contact-btn">문의하기</button>
        </div>
      </section>
    </main>

    <div v-else class="loading">
      매물 정보를 불러오는 중입니다...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import { useScrapStore } from '@/stores/scrap'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'
import { mapHouseDtoToEstate } from '@/utils/estateMapper'

const route = useRoute()
const scrapStore = useScrapStore()
const authStore = useAuthStore()

const estate = ref(null)
const isLoading = ref(false)

// Use store for scrap state
const isScrapped = computed(() => {
  if (!estate.value) return false
  return scrapStore.isScrapped(estate.value.id)
})

const formatPrice = (price) => {
  if (!price) return ''
  if (price.purchase) return `매매 ${price.purchase / 10000}억`
  return `보증금 ${price.deposit} / 월 ${price.monthly}`
}

const toggleScrap = async () => {
  if (!authStore.isAuthenticated) {
    alert('로그인이 필요한 서비스입니다.')
    return
  }
  
  if (estate.value) {
    await scrapStore.toggleScrap(estate.value.id)
  }
}

onMounted(async () => {
  const aptSeq = route.params.id // aptSeq를 파라미터로 사용
  
  isLoading.value = true
  try {
    // 백엔드: GET /api/v1/houses/{aptSeq}
    const houseResponse = await api.get(`/houses/${aptSeq}`)
    const houseDto = houseResponse.data.data || houseResponse.data
    
    // 거래 내역 조회
    let deals = []
    try {
      const dealsResponse = await api.get(`/houses/${aptSeq}/deals`)
      deals = dealsResponse.data.data || dealsResponse.data || []
    } catch (dealsError) {
      console.warn('거래 내역 조회 실패:', dealsError)
    }
    
    // 백엔드 DTO를 프론트엔드 형식으로 변환
    estate.value = mapHouseDtoToEstate(houseDto, deals)
  } catch (error) {
    console.error('매물 상세 조회 실패:', error)
    alert('매물 정보를 불러올 수 없습니다.')
  } finally {
    isLoading.value = false
  }
  
  // Load scraps
  await scrapStore.loadScraps()
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.detail-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.content-wrapper {
  max-width: 1000px;
  width: 100%;
  margin: 40px auto;
  padding: 0 20px;
  animation: fadeUp 0.6s ease-out;
}

.image-section {
  width: 100%;
  height: 400px;
  background: #dfe6e9;
  border-radius: 24px;
  margin-bottom: 40px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.main-image {
  font-size: 5rem;
  color: #b2bec3;
}

.info-section {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-main);
}

.price-badge {
  background: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

.meta-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 0.9rem;
  color: var(--text-sub);
  font-weight: 600;
}

.value {
  font-size: 1.1rem;
  color: var(--text-main);
  font-weight: 500;
}

.description-box {
  margin-bottom: 40px;
}

.description-box h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.description-box p {
  line-height: 1.6;
  color: var(--text-main);
  font-size: 1.05rem;
}

.action-buttons {
  display: flex;
  gap: 20px;
}

.scrap-btn, .contact-btn {
  flex: 1;
  padding: 18px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.scrap-btn {
  background: white;
  border: 2px solid var(--border-color);
  color: var(--text-main);
}

.scrap-btn:hover {
  background: #ffeaa7;
  border-color: #ffeaa7;
  color: #d63031;
}

.scrap-btn.active {
  background: #ffeaa7;
  border-color: #ffeaa7;
  color: #d63031;
}

.contact-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.2);
}

.contact-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(108, 92, 231, 0.3);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
  color: var(--text-sub);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
