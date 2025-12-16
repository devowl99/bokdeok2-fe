<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <button class="close-btn" @click="closeModal">✕</button>
        
        <div v-if="estate" class="modal-content">
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
        </div>

        <div v-else class="loading">
          매물 정보를 불러오는 중입니다...
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { MOCK_ESTATES } from '@/api/mockData'
import { useScrapStore } from '@/stores/scrap'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  estateId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['close'])

const scrapStore = useScrapStore()
const authStore = useAuthStore()
const estate = ref(null)

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

const closeModal = () => {
  emit('close')
}

// Watch for estateId changes and load data
watch(() => props.estateId, async (newId) => {
  if (newId && props.isOpen) {
    estate.value = null
    // TODO: 실제 API 호출
    // const res = await api.get(`/estate/${newId}`)
    // estate.value = res.data.data
    
    // Mock: 지연 후 데이터 로드
    setTimeout(() => {
      estate.value = MOCK_ESTATES.find(e => e.id === newId)
    }, 300)
  }
}, { immediate: true })

// Load scraps when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await scrapStore.loadScraps()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  position: relative;
  background: white;
  border-radius: 24px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
  color: var(--text-main);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: rotate(90deg);
}

.modal-content {
  padding: 40px;
}

.image-section {
  width: 100%;
  height: 300px;
  background: #dfe6e9;
  border-radius: 20px;
  margin-bottom: 30px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.main-image {
  font-size: 4rem;
  color: #b2bec3;
}

.info-section {
  background: white;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-main);
  flex: 1;
}

.price-badge {
  background: var(--primary-color);
  color: white;
  padding: 8px 18px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
  white-space: nowrap;
}

.meta-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
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
  margin-bottom: 30px;
}

.description-box h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.description-box p {
  line-height: 1.6;
  color: var(--text-main);
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.scrap-btn, .contact-btn {
  flex: 1;
  padding: 16px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
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
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.2);
}

.contact-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.3);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.1rem;
  color: var(--text-sub);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Scrollbar styling for modal */
.modal-container::-webkit-scrollbar {
  width: 8px;
}

.modal-container::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  border-radius: 10px;
}

.modal-container::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>

