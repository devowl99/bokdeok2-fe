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

      <!-- 필터 버튼 (왼쪽 아래) -->
      <button class="filter-button" @click="toggleFilterPanel">
        <span class="icon">⚙️</span>
        <span class="text">필터</span>
      </button>

      <div v-if="isLoading" class="loading-state">
        <p>스크랩한 매물을 불러오는 중...</p>
      </div>

      <div v-else-if="filteredScraps.length > 0" class="scrap-grid">
        <EstateCard
          v-for="estate in filteredScraps"
          :key="estate.id"
          :estate="estate"
          class="scrap-item"
          @click="goToDetail(estate.id)"
        />
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📂</div>
        <h3 v-if="originalScraps.length > 0">필터 조건에 맞는 매물이 없어요</h3>
        <h3 v-else>아직 스크랩한 매물이 없어요</h3>
        <p v-if="originalScraps.length > 0">다른 조건으로 검색해보세요!</p>
        <p v-else>지도에서 마음에 드는 매물을 찾아 스크랩해보세요!</p>
        <button v-if="originalScraps.length > 0" class="go-map-btn" @click="resetFilters">필터 초기화</button>
        <button v-else class="go-map-btn" @click="$router.push('/map')">매물 보러가기</button>
      </div>
    </main>

    <!-- 필터 패널 (상세 옵션) -->
    <aside class="filter-panel" :class="{ 'open': isFilterPanelOpen }">
        <div class="filter-panel-header">
          <h4>필터 옵션</h4>
          <button class="close-button" @click="toggleFilterPanel">×</button>
        </div>
      
      <!-- 지역 필터 -->
      <div class="location-filter-section">
        <h4 class="filter-section-title">지역</h4>
        <div class="location-filter-rows">
          <div class="filter-row">
            <label>시/도</label>
            <select 
              v-model="selectedSido" 
              @change="onSidoChange" 
              class="location-select"
            >
              <option value="">전체</option>
              <option v-for="sido in sidoList" :key="sido" :value="sido">
                {{ sido }}
              </option>
            </select>
          </div>
          <div class="filter-row">
            <label>시/군/구</label>
            <select 
              v-model="selectedGugun" 
              @change="onGugunChange" 
              class="location-select"
              :disabled="!selectedSido"
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
        </div>
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
  </div>
</template>

<script setup>
import Header from '@/components/layout/Header.vue'
import EstateCard from '@/components/estate/EstateCard.vue'
import { useScrapStore } from '@/stores/scrap'
import { useAuthStore } from '@/stores/auth'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { mapHouseDtosToEstates } from '@/utils/estateMapper'

const scrapStore = useScrapStore()
const authStore = useAuthStore()
const router = useRouter()
const originalScraps = ref([]) // 필터링 전 원본 데이터
const filteredScraps = ref([]) // 필터링된 데이터
const isLoading = ref(true) // 초기 로딩 상태를 true로 설정

// 필터 상태
const minPrice = ref(0) // 최소 가격 (만원 단위)
const maxPrice = ref(1000000) // 최대 가격 (만원 단위) - 기본값: 100억
const priceRangeMax = 1000000 // 슬라이더 최대값 (100억)
const minArea = ref(0) // 최소 면적 (㎡)
const maxArea = ref(500) // 최대 면적 (㎡) - 기본값: 500㎡
const areaRangeMax = 500 // 슬라이더 최대값 (500㎡)
const isFilterPanelOpen = ref(false) // 필터 패널 열림 상태

// 지역 필터링 관련
const sidoList = ref([]) // 시/도 목록
const gugunList = ref([]) // 시/군/구 목록
const dongList = ref([]) // 읍/면/동 목록
const selectedSido = ref('') // 선택된 시/도
const selectedGugun = ref('') // 선택된 시/군/구
const selectedDong = ref('') // 선택된 읍/면/동

// 가격 포맷팅 함수
const formatPriceValue = (value) => {
  if (value >= 10000) {
    const eok = Math.floor(value / 10000)
    const cheonman = Math.floor((value % 10000) / 1000)
    if (cheonman > 0) {
      return `${eok}억 ${cheonman}천만원`
    }
    return `${eok}억원`
  } else if (value >= 1000) {
    const cheonman = Math.floor(value / 1000)
    return `${cheonman}천만원`
  } else {
    return `${value}만원`
  }
}

// 스크랩된 매물 데이터 조회
const loadScrappedEstates = async () => {
  if (!authStore.isAuthenticated || !authStore.user) {
    originalScraps.value = []
    filteredScraps.value = []
    isLoading.value = false
    return
  }

  const userId = authStore.user?.userId || authStore.user?.id
  if (!userId) {
    originalScraps.value = []
    filteredScraps.value = []
    isLoading.value = false
    return
  }

  isLoading.value = true
  try {
    // 백엔드: GET /api/v1/houses/scraps?userId=...
    const response = await api.get('/houses/scraps', { params: { userId } })
    const houseDtos = response.data.data || response.data || []
    
    // 백엔드 DTO를 프론트엔드 형식으로 변환
    originalScraps.value = mapHouseDtosToEstates(Array.isArray(houseDtos) ? houseDtos : [])
    
    // 필터 적용
    applyFilters()
  } catch (error) {
    console.error('스크랩 매물 조회 실패:', error)
    originalScraps.value = []
    filteredScraps.value = []
  } finally {
    isLoading.value = false
  }
}

// 시/도 목록 조회
const fetchSidoList = async () => {
  try {
    const response = await api.get('/houses/sido')
    sidoList.value = response.data.data || response.data || []
  } catch (error) {
    console.error('시/도 목록 조회 실패:', error)
    sidoList.value = []
  }
}

// 시/군/구 목록 조회 (시/도로 필터링)
const fetchGugunList = async (sidoName) => {
  if (!sidoName) {
    gugunList.value = []
    return
  }
  
  try {
    const response = await api.get('/houses/gugun', {
      params: { sidoName }
    })
    gugunList.value = response.data.data || response.data || []
  } catch (error) {
    console.error('시/군/구 목록 조회 실패:', error)
    gugunList.value = []
  }
}

// 읍/면/동 목록 조회 (시/도와 시/군/구로 필터링)
// 시/군/구가 있으면 해당 시/군/구의 읍/면/동만, 없으면 시/도의 모든 읍/면/동 조회
const fetchDongList = async (sidoName, gugunName) => {
  // 시/군/구가 없으면 시/도만 선택한 경우
  if (!gugunName) {
    // 시/도만 선택한 경우, 해당 시/도의 모든 시/군/구에 속한 읍/면/동을 가져오기 위해
    // 각 시/군/구의 읍/면/동을 모두 조회
    if (sidoName && gugunList.value.length > 0) {
      // 모든 시/군/구의 읍/면/동을 병렬로 조회
      try {
        const promises = gugunList.value.map(gugun => 
          api.get(`/houses/dong/sido/${encodeURIComponent(sidoName)}/gugun/${encodeURIComponent(gugun)}`)
            .then(res => res.data.data || res.data || [])
            .catch(() => [])
        )
        const results = await Promise.all(promises)
        // 모든 결과를 하나의 배열로 합치고 중복 제거
        const allDongs = results.flat()
        const uniqueDongs = allDongs.filter((dong, index, self) =>
          index === self.findIndex(d => d.dongCode === dong.dongCode || d.dongName === dong.dongName)
        )
        dongList.value = uniqueDongs
      } catch (error) {
        console.error('시/도 읍/면/동 목록 조회 실패:', error)
        dongList.value = []
      }
    } else {
      dongList.value = []
    }
    return
  }
  
  // 시/군/구가 있는 경우
  try {
    if (sidoName) {
      const response = await api.get(`/houses/dong/sido/${encodeURIComponent(sidoName)}/gugun/${encodeURIComponent(gugunName)}`)
      dongList.value = response.data.data || response.data || []
    } else {
      const response = await api.get(`/houses/dong/gugun/${encodeURIComponent(gugunName)}`)
      dongList.value = response.data.data || response.data || []
    }
  } catch (error) {
    console.error('읍/면/동 목록 조회 실패:', error)
    dongList.value = []
  }
}

// 필터 적용 함수 (클라이언트 사이드 필터링)
const applyFilters = () => {
  let filtered = [...originalScraps.value]
  
  // 지역 필터 적용
  // 1. 읍/면/동이 선택된 경우: 해당 동 이름으로 필터링
  if (selectedDong.value) {
    filtered = filtered.filter(estate => {
      const umdNm = estate.umdNm
      if (!umdNm) return false
      return umdNm === selectedDong.value
    })
  }
  // 2. 시/군/구만 선택된 경우: 해당 시/군/구의 읍/면/동 목록에 포함된 매물만 필터링
  else if (selectedGugun.value && dongList.value.length > 0) {
    const validDongNames = dongList.value.map(dong => dong.dongName)
    filtered = filtered.filter(estate => {
      const umdNm = estate.umdNm
      if (!umdNm) return false
      return validDongNames.includes(umdNm)
    })
  }
  // 3. 시/도만 선택된 경우: 해당 시/도의 모든 읍/면/동 목록에 포함된 매물만 필터링
  else if (selectedSido.value && !selectedGugun.value && dongList.value.length > 0) {
    const validDongNames = dongList.value.map(dong => dong.dongName)
    filtered = filtered.filter(estate => {
      const umdNm = estate.umdNm
      if (!umdNm) return false
      return validDongNames.includes(umdNm)
    })
  }
  
  // 가격 필터 적용
  if (minPrice.value > 0 || maxPrice.value < priceRangeMax) {
    filtered = filtered.filter(estate => {
      const price = estate.price?.purchase
      if (!price) return false // 가격 정보가 없으면 제외
      
      return price >= minPrice.value && price <= maxPrice.value
    })
  }
  
  // 면적 필터 적용
  if (minArea.value > 0 || maxArea.value < areaRangeMax) {
    filtered = filtered.filter(estate => {
      const area = estate.dealInfo?.area
      if (!area) return false // 면적 정보가 없으면 제외
      
      return area >= minArea.value && area <= maxArea.value
    })
  }
  
  // 필터링된 결과 적용
  filteredScraps.value = filtered
}

// 필터 초기화
const resetFilters = () => {
  selectedSido.value = ''
  selectedGugun.value = ''
  selectedDong.value = ''
  gugunList.value = []
  dongList.value = []
  minPrice.value = 0
  maxPrice.value = priceRangeMax
  minArea.value = 0
  maxArea.value = areaRangeMax
  applyFilters()
}

// 시/도 변경 핸들러
const onSidoChange = async () => {
  selectedGugun.value = ''
  selectedDong.value = ''
  gugunList.value = []
  dongList.value = []
  
  if (selectedSido.value) {
    await fetchGugunList(selectedSido.value)
    // 시/도만 선택한 경우, 모든 시/군/구의 읍/면/동 목록을 가져옴
    if (gugunList.value.length > 0) {
      await fetchDongList(selectedSido.value, '')
    }
  }
  
  applyFilters()
}

// 시/군/구 변경 핸들러
const onGugunChange = async () => {
  selectedDong.value = ''
  dongList.value = []
  
  if (selectedGugun.value) {
    await fetchDongList(selectedSido.value, selectedGugun.value)
    // 시/군/구 선택 시 해당 지역의 읍/면/동 목록을 가져온 후 필터링
    // dongList가 로드된 후 필터링하도록 약간의 지연 추가
    setTimeout(() => {
      applyFilters()
    }, 100)
  } else {
    applyFilters()
  }
}

// 읍/면/동 변경 핸들러
const onDongChange = () => {
  applyFilters()
}

// 가격 입력 핸들러 (슬라이더 드래그 중)
const onPriceInput = () => {
  // 최소값이 최대값보다 크면 조정
  if (minPrice.value > maxPrice.value) {
    const temp = minPrice.value
    minPrice.value = maxPrice.value
    maxPrice.value = temp
  }
}

// 가격 변경 핸들러 (슬라이더 드래그 종료)
const onPriceChange = () => {
  applyFilters()
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
  applyFilters()
}

// 필터 패널 토글
const toggleFilterPanel = () => {
  isFilterPanelOpen.value = !isFilterPanelOpen.value
}

const goToDetail = (id) => {
  router.push(`/estate/${id}`)
}

onMounted(async () => {
  await scrapStore.loadScraps()
  await fetchSidoList() // 시/도 목록 로드
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
  overflow-x: hidden;
  padding-bottom: 60px;
}

/* Background Blobs */
.blob {
  position: absolute;
  top: -10%;
  right: -5%;
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
  position: relative;
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

/* 필터 버튼 (오른쪽 아래) */
.filter-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border: none;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  box-shadow: 0 6px 20px rgba(108, 92, 231, 0.35);
  z-index: 99;
}

.filter-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(108, 92, 231, 0.45);
  background: linear-gradient(135deg, #5f4fd8, #8b7ff5);
}

.filter-button:active {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(108, 92, 231, 0.35);
}

.filter-button .icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.filter-button .text {
  font-size: 1rem;
  letter-spacing: 0.3px;
}

/* 필터 패널 (상세 옵션) */
.filter-panel {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%) translateX(calc(100% + 20px));
  width: 400px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(108, 92, 231, 0.05);
  z-index: 100;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  overflow-x: hidden;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
  opacity: 0;
  pointer-events: none;
}

.filter-panel.open {
  transform: translateY(-50%) translateX(0);
  opacity: 1;
  pointer-events: auto;
}

/* 필터 패널 스크롤바 스타일 */
.filter-panel::-webkit-scrollbar {
  width: 6px;
}

.filter-panel::-webkit-scrollbar-track {
  background: rgba(108, 92, 231, 0.05);
  border-radius: 3px;
}

.filter-panel::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 3px;
  transition: background 0.2s ease;
}

.filter-panel::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5f4fd8, #8b7ff5);
}

.filter-panel-header {
  padding: 28px 28px 24px 28px;
  border-bottom: 1px solid rgba(108, 92, 231, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
  backdrop-filter: blur(30px);
  z-index: 1;
}

.filter-panel-header h4 {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.3px;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(108, 92, 231, 0.08);
  border: 1px solid rgba(108, 92, 231, 0.1);
  color: var(--primary-color);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  font-weight: 300;
}

.close-button:hover {
  background: rgba(108, 92, 231, 0.15);
  border-color: rgba(108, 92, 231, 0.2);
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.2);
}

.filter-panel .location-filter-section,
.filter-panel .price-filter,
.filter-panel .area-filter {
  padding: 28px;
  border-bottom: 1px solid rgba(108, 92, 231, 0.06);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%);
  transition: background 0.3s ease;
}

.filter-panel .location-filter-section:hover,
.filter-panel .price-filter:hover,
.filter-panel .area-filter:hover {
  background: linear-gradient(180deg, rgba(108, 92, 231, 0.02) 0%, rgba(108, 92, 231, 0.01) 100%);
}

.filter-panel .area-filter:last-child {
  border-bottom: none;
}

.location-filter-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  padding: 10px 14px;
  border: 1.5px solid rgba(108, 92, 231, 0.2);
  border-radius: 10px;
  font-size: 0.9rem;
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.location-select:hover:not(:disabled) {
  border-color: rgba(108, 92, 231, 0.4);
  box-shadow: 0 2px 8px rgba(108, 92, 231, 0.1);
}

.location-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
}

.location-select:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.filter-panel .filter-section-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.2px;
}

.filter-panel .filter-section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
}

/* 이중 범위 슬라이더 컨테이너 */
.dual-range-slider-container {
  position: relative;
}

.dual-range-wrapper {
  position: relative;
  height: 48px;
  margin: 8px 0 16px 0;
  display: flex;
  align-items: center;
  background: linear-gradient(180deg, rgba(108, 92, 231, 0.08) 0%, rgba(108, 92, 231, 0.12) 100%);
  border-radius: 12px;
  padding: 0 4px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 슬라이더 트랙 배경 */
.dual-range-wrapper::before {
  content: '';
  position: absolute;
  top: calc(50% - 4px);
  left: 4px;
  right: 4px;
  height: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  transform: translateY(-50%);
  z-index: 0;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 선택된 범위 표시 */
.selected-range {
  position: absolute;
  top: calc(50% - 4px);
  left: 4px;
  height: 8px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 4px;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(108, 92, 231, 0.3);
  transition: all 0.2s ease;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.slider-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--primary-color);
  padding: 6px 14px;
  background: rgba(108, 92, 231, 0.1);
  border: 1px solid rgba(108, 92, 231, 0.2);
  border-radius: 10px;
  letter-spacing: -0.2px;
  box-shadow: 0 2px 6px rgba(108, 92, 231, 0.1);
  transition: all 0.2s ease;
}

.slider-value:hover {
  background: rgba(108, 92, 231, 0.15);
  border-color: rgba(108, 92, 231, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(108, 92, 231, 0.15);
}

.range-slider {
  position: absolute;
  width: calc(100% - 8px);
  left: 4px;
  height: 8px;
  border-radius: 4px;
  background: transparent;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;
  margin: 0;
  padding: 0;
  top: calc(50% - 4px);
  transform: translateY(-50%);
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: all;
  position: relative;
  z-index: 2;
  margin-top: -9px;
  border: 2px solid white;
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.25);
  box-shadow: 0 6px 20px rgba(108, 92, 231, 0.5), 0 0 0 4px rgba(108, 92, 231, 0.1);
}

.range-slider::-webkit-slider-thumb:active {
  transform: scale(1.15);
}

.range-slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 3px;
  background: transparent;
}

.range-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.8);
  border: 2px solid white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: all;
  position: relative;
  z-index: 2;
}

.range-slider::-moz-range-thumb:hover {
  transform: scale(1.25);
  box-shadow: 0 6px 20px rgba(108, 92, 231, 0.5), 0 0 0 4px rgba(108, 92, 231, 0.1);
}

.range-slider::-moz-range-thumb:active {
  transform: scale(1.15);
}

.range-slider::-moz-range-track {
  height: 6px;
  border-radius: 3px;
  background: transparent;
}

.range-slider-min {
  z-index: 2;
}

.range-slider-max {
  z-index: 3;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  text-align: center;
}

.loading-state p {
  font-size: 1.2rem;
  color: var(--text-sub);
  font-weight: 500;
}

/* Grid Layout */
.scrap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.scrap-item {
  transition: transform 0.3s;
}

.scrap-item:hover {
  transform: translateY(-8px);
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
