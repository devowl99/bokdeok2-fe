<template>
  <div class="map-page">
    <Header class="map-header" />
    <div class="content-container">
      <!-- Sidebar / List -->
      <aside class="sidebar" :class="{ 'has-estates-list': (selectedGugun || selectedDong) && estates.length > 0 }">
        <div class="sidebar-header">
          <h3>실거래가 리스트</h3>
          <span class="count">
            <span v-if="totalCount !== null">{{ totalCount }}건</span>
            <span v-else>{{ estates.length }}건</span>
          </span>
        </div>
        <!-- AI 검색어 표시 -->
        <div v-if="aiSearchQuery" class="ai-search-badge">
          <span class="ai-icon">✨</span>
          <span class="ai-query">{{ aiSearchQuery }}</span>
          <button class="clear-ai-search" @click="clearAISearch" title="검색어 제거">×</button>
        </div>
        <div class="location-filter">
          <div class="filter-row">
            <label>시/군/구</label>
            <select 
              v-model="selectedGugun" 
              @change="onGugunChange" 
              class="location-select"
            >
              <option value="">전체</option>
              <option v-for="gugun in gugunList" :key="gugun" :value="gugun">
                {{ gugun }}
              </option>
            </select>
          </div>
          <div class="filter-row">
            <label>읍/면/동</label>
            <select 
              v-model="selectedDong" 
              @change="onDongChange" 
              class="location-select"
              :disabled="!selectedGugun"
            >
              <option value="">전체</option>
              <option v-for="dong in dongList" :key="dong.dongCode" :value="dong.dongName">
                {{ dong.dongName }}
              </option>
            </select>
          </div>
          
          <!-- 상세 옵션 버튼 (오른쪽 아래) -->
          <button class="detail-option-button" @click="toggleFilterPanel">
            <span class="icon">⚙️</span>
            <span class="text">상세 옵션</span>
          </button>
        </div>
        <div class="estate-list">
          <div v-if="isLoading" class="loading-message">매물을 불러오는 중...</div>
          <!-- 필터링이 선택된 경우에만 매물 목록 표시 -->
          <template v-if="selectedGugun || selectedDong">
            <EstateCard
              v-for="estate in estates"
              :key="estate.id"
              :estate="estate"
              :is-scrapped="scrapStore.isScrapped(estate.id)"
              class="map-estate-item"
              @click="goToDetail(estate.id)"
            />
            <div v-if="!isLoading && estates.length === 0" class="empty-message">
              매물이 없습니다.
            </div>
          </template>
        </div>
      </aside>
      
      <!-- 필터 패널 (상세 옵션) -->
      <aside class="filter-panel" :class="{ 'open': isFilterPanelOpen }">
        <div class="filter-panel-header">
          <h4>상세 옵션</h4>
          <button class="close-button" @click="toggleFilterPanel">×</button>
        </div>
        
        <!-- 가격대 필터 -->
        <div class="price-filter">
          <h4 class="filter-section-title">가격대</h4>
          
          <!-- 이중 범위 슬라이더 -->
          <div class="dual-range-slider-container">
            <div class="slider-label">
              <span class="slider-value">{{ formatPriceValue(minPrice) }}</span>
              <span class="slider-value">{{ formatPriceValue(maxPrice) }}</span>
            </div>
            <div class="dual-range-wrapper">
              <div 
                class="selected-range"
                :style="{
                  left: (minPrice / priceRangeMax * 100) + '%',
                  width: ((maxPrice - minPrice) / priceRangeMax * 100) + '%'
                }"
              ></div>
              <input 
                type="range" 
                v-model.number="minPrice" 
                @input="onPriceInput"
                @change="onPriceChange"
                class="range-slider range-slider-min"
                :min="0"
                :max="priceRangeMax"
                step="1000"
              />
              <input 
                type="range" 
                v-model.number="maxPrice" 
                @input="onPriceInput"
                @change="onPriceChange"
                class="range-slider range-slider-max"
                :min="0"
                :max="priceRangeMax"
                step="1000"
              />
            </div>
          </div>
        </div>
        
        <!-- 평수 필터 -->
        <div class="area-filter">
          <h4 class="filter-section-title">면적</h4>
          
          <!-- 이중 범위 슬라이더 -->
          <div class="dual-range-slider-container">
            <div class="slider-label">
              <span class="slider-value">{{ minArea }}㎡</span>
              <span class="slider-value">{{ maxArea }}㎡</span>
            </div>
            <div class="dual-range-wrapper">
              <div 
                class="selected-range"
                :style="{
                  left: (minArea / areaRangeMax * 100) + '%',
                  width: ((maxArea - minArea) / areaRangeMax * 100) + '%'
                }"
              ></div>
              <input 
                type="range" 
                v-model.number="minArea" 
                @input="onAreaInput"
                @change="onAreaChange"
                class="range-slider range-slider-min"
                :min="0"
                :max="areaRangeMax"
                step="1"
              />
              <input 
                type="range" 
                v-model.number="maxArea" 
                @input="onAreaInput"
                @change="onAreaChange"
                class="range-slider range-slider-max"
                :min="0"
                :max="areaRangeMax"
                step="1"
              />
            </div>
          </div>
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScrapStore } from '@/stores/scrap'
import api from '@/api'
import { mapHouseDtosToEstates } from '@/utils/estateMapper'

const route = useRoute()
const router = useRouter()
const scrapStore = useScrapStore()
const estates = ref([])
const mapRef = ref(null)
const isModalOpen = ref(false)
const selectedEstateId = ref(null)
const isLoading = ref(false)
const totalCount = ref(null) // 전체 매물 개수 (초기 로드 시)

// 지역 필터링 관련
const gugunList = ref([]) // 시/군/구 목록
const dongList = ref([]) // 읍/면/동 목록
const selectedGugun = ref('') // 선택된 시/군/구
const selectedDong = ref('') // 선택된 읍/면/동
const aiSearchQuery = ref('') // AI 검색어
const minPrice = ref(10000) // 최소 가격 (만원 단위) - 기본값: 천만원
const maxPrice = ref(1000000) // 최대 가격 (만원 단위) - 기본값: 100억
const priceRangeMax = 1000000 // 슬라이더 최대값 (100억)
const minArea = ref(0) // 최소 면적 (㎡)
const maxArea = ref(500) // 최대 면적 (㎡) - 기본값: 500㎡
const areaRangeMax = 500 // 슬라이더 최대값 (500㎡)
const isFilterPanelOpen = ref(false) // 필터 패널 열림 상태

// 시/군/구 목록 조회
const fetchGugunList = async () => {
  try {
    const response = await api.get('/houses/gugun')
    gugunList.value = response.data.data || response.data || []
  } catch (error) {
    console.error('시/군/구 목록 조회 실패:', error)
    gugunList.value = []
  }
}

// 읍/면/동 목록 조회
const fetchDongList = async (gugunName) => {
  if (!gugunName) {
    dongList.value = []
    return
  }
  
  try {
    const response = await api.get(`/houses/dong/gugun/${encodeURIComponent(gugunName)}`)
    dongList.value = response.data.data || response.data || []
  } catch (error) {
    console.error('읍/면/동 목록 조회 실패:', error)
    dongList.value = []
  }
}

// 매물 개수 조회 (필터링 조건 포함 가능)
const fetchTotalCount = async (params = {}) => {
  try {
    const searchParams = { ...params }
    
    // 읍/면/동이 선택된 경우
    if (selectedDong.value && !params.umdNm) {
      searchParams.umdNm = selectedDong.value
    }
    // 시/군/구만 선택된 경우
    else if (selectedGugun.value && !selectedDong.value && !params.gugunName) {
      searchParams.gugunName = selectedGugun.value
    }
    
    // 가격대 필터 추가
    if (minPrice.value !== null && minPrice.value > 0) {
      searchParams.minPrice = minPrice.value
    }
    if (maxPrice.value !== null && maxPrice.value > 0) {
      searchParams.maxPrice = maxPrice.value
    }
    
    // 평수 필터 추가 (기본값이 설정되어 있으므로 항상 전달)
    if (minArea.value != null && minArea.value > 0) {
      searchParams.minArea = minArea.value
    }
    if (maxArea.value != null && maxArea.value > 0) {
      searchParams.maxArea = maxArea.value
    }
    
    // 백엔드: GET /api/v1/houses/count
    const response = await api.get('/houses/count', { params: searchParams })
    totalCount.value = response.data.data || response.data || 0
  } catch (error) {
    console.error('매물 개수 조회 실패:', error)
    totalCount.value = 0
  }
}

// 매물 목록 조회 (필터링이 선택된 경우에만 호출)
const fetchEstates = async (params = {}) => {
  isLoading.value = true
  try {
    const searchParams = { ...params }
    
    // 읍/면/동이 선택된 경우 (필터링 있음 - limit 없음)
    if (selectedDong.value && !params.umdNm) {
      searchParams.umdNm = selectedDong.value
      // 필터링된 결과는 모두 가져오기 (limit 제거)
      delete searchParams.limit
    }
    // 시/군/구만 선택된 경우 (읍/면/동이 "전체"인 경우) - 필터링 있음
    else if (selectedGugun.value && !selectedDong.value && !params.gugunName) {
      searchParams.gugunName = selectedGugun.value
      // 필터링된 결과는 모두 가져오기 (limit 제거)
      delete searchParams.limit
    }
    
    // 가격대 필터 추가
    if (minPrice.value !== null && minPrice.value > 0) {
      searchParams.minPrice = minPrice.value
    }
    if (maxPrice.value !== null && maxPrice.value > 0) {
      searchParams.maxPrice = maxPrice.value
    }
    
    // 평수 필터 추가 (기본값이 설정되어 있으므로 항상 전달)
    if (minArea.value != null && minArea.value > 0) {
      searchParams.minArea = minArea.value
    }
    if (maxArea.value != null && maxArea.value > 0) {
      searchParams.maxArea = maxArea.value
    }
    
    // 백엔드: GET /api/v1/houses
    const response = await api.get('/houses', { params: searchParams })
    const houseDtos = response.data.data || response.data
    
    // 디버깅: 받아온 데이터 확인
    console.log('Map.vue - 받아온 houseDtos:', houseDtos)
    if (houseDtos && houseDtos.length > 0) {
      console.log('Map.vue - 첫 번째 매물의 latestDealAmount:', houseDtos[0].latestDealAmount)
    }
    
    // 백엔드 DTO를 프론트엔드 형식으로 변환
    estates.value = mapHouseDtosToEstates(Array.isArray(houseDtos) ? houseDtos : [])
    
    // 개수도 함께 업데이트
    totalCount.value = estates.value.length
    
    // 필터링된 경우 해당 지역으로 지도 이동
    if (estates.value.length > 0) {
      // 다음 틱에서 지도 이동 (지도가 준비될 시간을 줌)
      setTimeout(() => {
        moveToEstatesCenter()
      }, 300)
    }
  } catch (error) {
    console.error('매물 목록 조회 실패:', error)
    estates.value = []
    totalCount.value = 0
  } finally {
    isLoading.value = false
  }
}

// 시/군/구 변경 핸들러
const onGugunChange = async () => {
  // 읍/면/동 리셋
  selectedDong.value = ''
  dongList.value = []
  estates.value = [] // 매물 목록 초기화
  
  // 선택된 시/군/구의 읍/면/동 목록 조회
  if (selectedGugun.value) {
    await fetchDongList(selectedGugun.value)
    // 시/군/구 선택 시 해당 시/군/구의 매물 검색 (필터링 있음 - 실제 데이터 조회)
    await fetchEstates({ gugunName: selectedGugun.value })
  } else {
    // 전체 선택 시 - 개수만 조회하고 데이터는 가져오지 않음
    estates.value = []
    await fetchTotalCount()
  }
}

// 읍/면/동 변경 핸들러
const onDongChange = () => {
  if (selectedDong.value) {
    // 특정 읍/면/동 선택 시 (필터링 있음 - 실제 데이터 조회)
    fetchEstates({ umdNm: selectedDong.value })
  } else {
    // "전체" 선택 시 (시/군/구 전체 - 실제 데이터 조회)
    if (selectedGugun.value) {
      fetchEstates({ gugunName: selectedGugun.value })
    } else {
      // 아무것도 선택 안 된 경우 - 개수만 조회
      estates.value = []
      fetchTotalCount()
    }
  }
}

// 가격대 변경 핸들러
const onPriceChange = () => {
  // 지역 필터가 있는 경우에만 검색
  if (selectedGugun.value || selectedDong.value) {
    if (selectedDong.value) {
      fetchEstates({ umdNm: selectedDong.value })
    } else if (selectedGugun.value) {
      fetchEstates({ gugunName: selectedGugun.value })
    }
  }
}

// 평수 입력 핸들러 (슬라이더 드래그 중)
const onAreaInput = () => {
  // 최소값이 최대값보다 크면 조정
  if (minArea.value > maxArea.value) {
    const temp = minArea.value
    minArea.value = maxArea.value
    maxArea.value = temp
  }
}

// 평수 변경 핸들러 (슬라이더 드래그 종료)
const onAreaChange = () => {
  // 지역 필터가 있는 경우에만 검색
  if (selectedGugun.value || selectedDong.value) {
    if (selectedDong.value) {
      fetchEstates({ umdNm: selectedDong.value })
    } else if (selectedGugun.value) {
      fetchEstates({ gugunName: selectedGugun.value })
    }
  }
}

// 필터 패널 토글
const toggleFilterPanel = () => {
  isFilterPanelOpen.value = !isFilterPanelOpen.value
}

// Function to fetch AI recommendations (임시로 일반 검색 사용)
const fetchRecommendations = async (query) => {
  // TODO: LLM 추천 API 연결 시 수정
  await fetchEstates()
}

// AI 검색어 제거
const clearAISearch = () => {
  aiSearchQuery.value = ''
  router.push({ name: 'Map' })
}

// Load scraps on mount
onMounted(async () => {
  await scrapStore.loadScraps()
  
  // 시/군/구 목록 로드
  await fetchGugunList()
  
  // URL 쿼리에서 AI 검색어 확인
  if (route.query.q) {
    aiSearchQuery.value = route.query.q
    // TODO: AI 검색 로직 구현 시 여기서 검색 실행
  }
  
  // 초기 매물 개수만 조회 (데이터는 가져오지 않음)
  await fetchTotalCount()
})

// route.query 변경 감지
watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    aiSearchQuery.value = newQuery
  } else {
    aiSearchQuery.value = ''
  }
})

const formatPrice = (price) => {
  if (price.purchase) return `매매 ${price.purchase / 10000}억`
  return `보증금 ${price.deposit} / 월 ${price.monthly}`
}

// 가격 값을 포맷팅하는 함수 (만원 단위 → 억/천만원 표시)
const formatPriceValue = (value) => {
  if (!value || value === 0) return '0만원'
  if (value < 10000) {
    return `${value}만원`
  } else {
    const eok = Math.floor(value / 10000)
    const cheon = value % 10000
    if (cheon === 0) {
      return `${eok}억원`
    } else {
      return `${eok}억 ${cheon}만원`
    }
  }
}

const moveToLocation = (lat, lng) => {
  if (mapRef.value && mapRef.value.moveMap) {
    mapRef.value.moveMap(lat, lng)
  }
}

// 매물들의 중심 좌표 계산 및 지도 이동
const moveToEstatesCenter = () => {
  if (!estates.value || estates.value.length === 0) return
  
  // 유효한 좌표를 가진 매물들만 필터링
  const validEstates = estates.value.filter(
    estate => estate.location && estate.location.lat && estate.location.lng
  )
  
  if (validEstates.length === 0) return
  
  // 중심 좌표 계산
  const avgLat = validEstates.reduce((sum, e) => sum + parseFloat(e.location.lat), 0) / validEstates.length
  const avgLng = validEstates.reduce((sum, e) => sum + parseFloat(e.location.lng), 0) / validEstates.length
  
  // 지도 이동
  moveToLocation(avgLat, avgLng)
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
  width: 360px;
  background: rgba(255, 255, 255, 0.85); /* Glassmorphism */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08); /* Deep shadow for float effect */
  overflow: visible; /* 버튼이 사이드바 밖으로 나올 수 있도록 */
  transition: all 0.3s ease;
  max-height: calc(100vh - 40px);
  /* 필터링 전 기본 높이 (헤더 + 필터링 영역만) - 자동 높이 */
  height: auto;
  min-height: fit-content;
}

/* 매물이 있을 때 사이드바를 창 크기에 맞춰 확장 (하단 여백 추가로 지도가 보이도록) */
.sidebar.has-estates-list {
  bottom: 100px; /* 하단에 100px 여백 추가 */
  height: calc(100vh - 120px); /* top 20px + bottom 100px */
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
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.ai-search-badge {
  margin: 0 24px 16px 24px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(108, 92, 231, 0.05) 100%);
  border: 1px solid rgba(108, 92, 231, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideDown 0.3s ease-out;
}

.ai-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.ai-query {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--primary-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-ai-search {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(108, 92, 231, 0.1);
  border: none;
  color: var(--primary-color);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-ai-search:hover {
  background: rgba(108, 92, 231, 0.2);
  transform: scale(1.1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.location-filter {
  padding: 16px 24px 12px 24px; /* 하단 패딩 감소 */
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative; /* 버튼 위치 기준점 */
  overflow: visible; /* 버튼이 border 밖으로 나가도 보이도록 */
  margin-bottom: 25px; /* 리스트와의 간격 */
}


/* 상세 옵션 버튼 (읍/면/동 선택 창 오른쪽 아래) */
.detail-option-button {
  position: absolute;
  bottom: -18px; /* border-bottom 선 아래쪽에 위치 */
  right: 24px;
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(108, 92, 231, 0.05) 100%);
  border: 1.5px solid rgba(108, 92, 231, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--primary-color);
  white-space: nowrap;
}

.detail-option-button:hover {
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.15) 0%, rgba(108, 92, 231, 0.1) 100%);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(108, 92, 231, 0.2);
}

.detail-option-button:active {
  transform: translateY(0);
}

.detail-option-button .icon {
  font-size: 0.75rem;
}

.detail-option-button .text {
  font-size: 0.7rem;
}

/* 필터 패널 (상세 옵션) */
.filter-panel {
  position: absolute;
  top: 20px;
  left: 400px; /* 사이드바 너비(360px) + 여백(20px) + 추가 여백(20px) */
  width: 360px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  z-index: 9;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateX(-100%);
  opacity: 0;
  pointer-events: none;
}

.filter-panel.open {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

.filter-panel-header {
  padding: 24px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  z-index: 1;
}

.filter-panel-header h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
}

.close-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(108, 92, 231, 0.1);
  border: none;
  color: var(--primary-color);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.close-button:hover {
  background: rgba(108, 92, 231, 0.2);
  transform: scale(1.1);
}

.filter-panel .price-filter,
.filter-panel .area-filter {
  padding: 10px 24px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.filter-panel .area-filter:last-child {
  border-bottom: none;
}

.filter-panel .filter-section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}

/* 이중 범위 슬라이더 컨테이너 */
.dual-range-slider-container {
  position: relative;
}

.dual-range-wrapper {
  position: relative;
  height: 40px;
  margin: 6px 0 12px 0;
  display: flex;
  align-items: center;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.slider-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary-color);
}

.range-slider {
  position: absolute;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: transparent;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;
  margin: 0;
  padding: 0;
  top: calc(50% - 7px);
  transform: translateY(-50%);
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(108, 92, 231, 0.3);
  transition: all 0.2s ease;
  pointer-events: all;
  position: relative;
  z-index: 2;
  margin-top: -7px; /* thumb를 트랙 중앙에 정렬 */
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 8px rgba(108, 92, 231, 0.4);
}

.range-slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 3px;
  background: transparent;
}

.range-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(108, 92, 231, 0.3);
  transition: all 0.2s ease;
  pointer-events: all;
  position: relative;
  z-index: 2;
}

.range-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 8px rgba(108, 92, 231, 0.4);
}

.range-slider::-moz-range-track {
  height: 6px;
  border-radius: 3px;
  background: transparent;
}

/* 슬라이더 트랙 배경 */
.dual-range-wrapper::before {
  content: '';
  position: absolute;
  top: calc(50% - 7px);
  left: 0;
  right: 0;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  transform: translateY(-50%);
  z-index: 0;
}

/* 선택된 범위 표시 */
.selected-range {
  position: absolute;
  top: calc(50% - 7px);
  height: 6px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 3px;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
}

.range-slider-min {
  z-index: 1;
}

.range-slider-max {
  z-index: 2;
}


.filter-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-row label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-sub);
  margin-left: 4px;
}

.location-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(108, 92, 231, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.location-select:hover:not(:disabled) {
  border-color: var(--primary-color);
}

.location-select:focus:not(:disabled) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
}

.location-select:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border-color: #e0e0e0;
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
  overflow-y: auto;
  padding: 20px 20px 20px 20px; /* 상단 패딩 증가 (버튼 공간 확보) */
  /* Hide scrollbar visually but allow scroll */
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.1) transparent;
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* 필터링 전에는 높이가 자동으로 조정됨 */
  flex: 0 0 auto;
}

/* 매물이 있을 때 flex: 1로 확장 (남은 공간 모두 사용, 넘치면 스크롤) */
.sidebar.has-estates-list .estate-list {
  flex: 1;
  min-height: 0; /* flex 아이템이 올바르게 스크롤되도록 */
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
