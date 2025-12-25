<template>
  <div class="ai-chat-container">
    <div class="content-wrapper">
      <h2 class="greeting">
        <template v-if="isLoggedIn">
          {{ user?.nickname || '회원' }}님 환영합니다!
        </template>
        <template v-else>
          무엇을 도와드릴까요?
        </template>
      </h2>
      
      <!-- 로딩 인디케이터 (간단한 형태) -->
      <div v-if="isProcessing" class="loading-indicator-wrapper">
        <div class="loading-indicator">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p class="loading-text">AI가 매물을 찾고 있습니다...</p>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-box-wrapper">
        <div class="input-box">
          <span class="icon">✨</span>
          <input 
            v-model="input" 
            type="text" 
            :placeholder="isProcessing ? 'AI가 응답 중입니다...' : '원하는 조건을 입력하세요 (예: 강남역 근처 5억 이하 투룸)'"
            @keyup.enter="sendMessage"
            :disabled="isProcessing"
            :class="{ 'processing': isProcessing }"
          />
          <button class="send-btn" @click="sendMessage" :disabled="!input.trim() || isProcessing">
            <span v-if="!isProcessing">➤</span>
            <span v-else class="loading-spinner">⟳</span>
          </button>
        </div>
      </div>

      <!-- Quick Recommendations -->
      <div class="tags-container" v-if="!isProcessing">
        <button v-for="tag in tags" :key="tag" class="tag-btn" @click="setQuery(tag)">
          {{ tag }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router = useRouter()
const authStore = useAuthStore()
const input = ref('')
const isProcessing = ref(false)

const isLoggedIn = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

const tags = [
  '🏙️ 강남 역세권 오피스텔',
  '🏞️ 한강뷰 아파트',
  '🎓 대학가 저렴한 원룸',
  '🚗 주차 가능한 투룸'
]

const setQuery = (text) => {
  input.value = text
  sendMessage()
}

const sendMessage = async () => {
  if (!input.value.trim() || isProcessing.value) return

  const userText = input.value
  input.value = ''
  isProcessing.value = true

  try {
    // 백엔드: POST /api/v1/llm
    // 요청: { prompt: "..." }
    // 응답: { message: "...", listings: [...] }
    const res = await api.post('/llm', { 
      prompt: userText,
      type: 'FIND_HOUSE'
    })
    
    // 응답 인터셉터가 { success: true, data: { message, listings } } 형식으로 변환
    const responseData = res.data.data || {}
    const listings = responseData.listings || []
    
    // 실제 DB 매물만 필터링 (manual_로 시작하는 것은 AI가 생성한 추천이므로 제외)
    const realListings = listings.filter(listing => {
      // aptSeq가 manual_로 시작하지 않고, 좌표 정보가 있는 것만
      const aptSeq = listing.aptSeq || listing.apt_seq || ''
      const hasCoordinates = (listing.latitude || listing.lat) && (listing.longitude || listing.lng)
      return !aptSeq.startsWith('manual_') && hasCoordinates
    })
    
    // 매물이 있으면 sessionStorage에 저장하고 지도 페이지로 이동
    if (realListings.length > 0) {
      sessionStorage.setItem('aiSearchResults', JSON.stringify(realListings))
    }
    
    // 응답을 받았으면 지도 페이지로 이동 (매물이 없어도 이동)
    isProcessing.value = false
    router.push({ name: 'Map' })
  } catch (error) {
    console.error('AI 채팅 오류:', error)
    isProcessing.value = false
    
    // 타임아웃 에러 체크
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      alert('AI 응답이 시간 내에 완료되지 않았습니다. 잠시 후 다시 시도해주세요. (처리는 계속 진행 중일 수 있습니다.)')
    }
    // 인증 오류 (401, 403) 체크
    else if (error.response?.status === 401 || error.response?.status === 403) {
      alert('AI 기능을 활용하기 위해서는 로그인이 필요합니다. 로그인 후 이용해주세요.')
      router.push({ name: 'Login' })
    } else {
      // 기타 오류
      alert('죄송합니다. 오류가 발생했어요. 다시 시도해주세요.')
    }
  }
}
</script>

<style scoped>
.ai-chat-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: transparent;
  width: 100%;
  z-index: 1;
  transform: translateY(-40px);
}

.content-wrapper {
  width: 100%;
  max-width: 800px;
  padding: 0 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.greeting {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 40px;
  letter-spacing: -1px;
  background: linear-gradient(135deg, var(--text-main) 0%, var(--primary-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeUp 0.8s ease-out;
}

/* 로딩 인디케이터 (메인 페이지용) */
.loading-indicator-wrapper {
  width: 100%;
  margin-bottom: 30px;
  animation: fadeIn 0.3s ease-out;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.loading-text {
  margin-top: 15px;
  color: var(--text-main);
  font-size: 1rem;
  font-weight: 500;
}

.typing-indicator {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.typing-indicator span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.4;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-12px);
    opacity: 1;
  }
}

/* Input Box Styling */
.input-box-wrapper {
  width: 100%;
  margin-bottom: 30px;
  animation: fadeUp 0.8s ease-out 0.2s backwards;
}

.input-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 30px;
  padding: 18px 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06), 0 2px 10px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.input-box:focus-within {
  box-shadow: 0 15px 50px rgba(108, 92, 231, 0.2);
  border-color: rgba(108, 92, 231, 0.3);
  transform: translateY(-2px);
  background: white;
}

.icon {
  font-size: 1.6rem;
  margin-right: 15px;
  animation: pulse 2s infinite;
}

input {
  flex: 1;
  border: none;
  font-size: 1.2rem;
  color: var(--text-main);
  background: transparent;
  font-weight: 500;
}

input::placeholder {
  color: #b2bec3;
  font-weight: 400;
}

input.processing {
  opacity: 0.7;
  cursor: wait;
}

input:disabled {
  cursor: wait;
}

.send-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-left: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
  border: none;
  cursor: pointer;
}

.send-btn:disabled {
  background: #dfe6e9;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.5;
}

.send-btn:not(:disabled):hover {
  transform: scale(1.1) rotate(10deg);
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.5);
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Tags Styling */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  animation: fadeUp 0.8s ease-out 0.4s backwards;
}

.tag-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  color: var(--text-sub);
  font-size: 0.95rem;
  transition: all 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.tag-btn:hover {
  background: white;
  border-color: var(--primary-light);
  color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.15);
  transform: translateY(-2px);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
