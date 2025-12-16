<template>
  <div class="map-page">
    <Header class="map-header" />
    <div class="content-container">
      <!-- Sidebar / List -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>매물 리스트</h3>
          <span class="count">{{ estates.length }}건</span>
        </div>
        <div class="estate-list">
          <EstateCard
            v-for="estate in estates"
            :key="estate.id"
            :estate="estate"
            :is-scrapped="scrapStore.isScrapped(estate.id)"
            class="map-estate-item"
            @click="goToDetail(estate.id)"
          />
        </div>
      </aside>

      <!-- Map Area -->
      <main class="map-area">
        <KakaoMap 
          ref="mapRef" 
          :estates="estates" 
          @marker-detail-click="goToDetail"
        />
        <FloatingAIChat />
      </main>
    </div>

    <!-- Estate Detail Modal -->
    <EstateDetailModal 
      :is-open="isModalOpen" 
      :estate-id="selectedEstateId"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import Header from '@/components/layout/Header.vue'
import KakaoMap from '@/components/map/KakaoMap.vue'
import FloatingAIChat from '@/components/common/FloatingAIChat.vue'
import EstateCard from '@/components/estate/EstateCard.vue'
import EstateDetailModal from '@/components/estate/EstateDetailModal.vue'
import { MOCK_ESTATES } from '@/api/mockData'
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScrapStore } from '@/stores/scrap'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const scrapStore = useScrapStore()
const estates = ref(MOCK_ESTATES)
const mapRef = ref(null)
const isModalOpen = ref(false)
const selectedEstateId = ref(null)

// Function to fetch AI recommendations
const fetchRecommendations = async (query) => {
  const res = await api.post('/llm/recommend', { query })
  estates.value = res.data.data.estates
}

// Watch for query changes (e.g. searching from AIChat)
watch(() => route.query.q, async (newQuery) => {
  if (newQuery) {
    await fetchRecommendations(newQuery)
  } else {
    estates.value = MOCK_ESTATES
  }
}, { immediate: true })

// Load scraps on mount
onMounted(() => {
  scrapStore.loadScraps()
})

const formatPrice = (price) => {
  if (price.purchase) return `매매 ${price.purchase / 10000}억`
  return `보증금 ${price.deposit} / 월 ${price.monthly}`
}

const moveToLocation = (loc) => {
  if (mapRef.value && mapRef.value.moveMap) {
    mapRef.value.moveMap(loc.lat, loc.lng)
  }
}

const goToDetail = (id) => {
  selectedEstateId.value = id
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedEstateId.value = null
}
</script>

<style scoped>
/* Page Layout */
.map-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-color: #f8f9fa;
}

/* Map Header - Transparent/Floating look can be achieved, but sticking to white for clarity */
.map-header {
  position: relative;
  z-index: 20;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 1px rgba(0,0,0,0.05);
}

.content-container {
  flex: 1;
  position: relative;
  width: 100%;
  height: calc(100vh - var(--header-height));
}

/* Map Area fills the container behind the sidebar */
.map-area {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

/* Floating Sidebar */
.sidebar {
  position: absolute;
  top: 20px;
  left: 20px;
  bottom: 20px;
  width: 400px;
  background: rgba(255, 255, 255, 0.85); /* Glassmorphism */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08); /* Deep shadow for float effect */
  overflow: hidden;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 24px;
  /* background: rgba(255, 255, 255, 0.6); */
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  font-size: 1.3rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--text-main), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.count {
  color: white;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  box-shadow: 0 4px 10px rgba(108, 92, 231, 0.3);
}

.estate-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px; /* More padding */
  /* Hide scrollbar visually but allow scroll */
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.1) transparent;
}

/* Custom Scrollbar */
.estate-list::-webkit-scrollbar {
  width: 6px;
}
.estate-list::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.1);
  border-radius: 10px;
}
.estate-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.map-estate-item {
  margin-bottom: 16px;
  animation-delay: 0.05s; /* Keep animation delay logic simple or remove */
}

/* Staggered animation for first few items */
.map-estate-item:nth-child(1) { animation-delay: 0.1s; }
.map-estate-item:nth-child(2) { animation-delay: 0.2s; }
.map-estate-item:nth-child(3) { animation-delay: 0.3s; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
