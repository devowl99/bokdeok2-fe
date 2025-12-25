<template>
  <div class="floating-chat-wrapper" :class="{ open: isOpen }">
    <!-- Toggle Button -->
    <button class="chat-toggle-btn" @click="toggleChat" v-if="!isOpen">
      <span class="icon">✨</span>
      <span class="text">AI 검색</span>
    </button>

    <!-- Chat Window -->
    <div class="chat-window" v-else>
      <div class="chat-header">
        <span class="header-title">✨ 복덕이 AI</span>
        <button class="close-btn" @click="toggleChat">✕</button>
      </div>

      <div class="chat-body" ref="chatBody">
        <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
          <div class="bubble">{{ msg.text }}</div>
        </div>
        <!-- 로딩 인디케이터 -->
        <div v-if="isProcessing" class="message assistant">
          <div class="bubble loading-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <input 
          v-model="input" 
          @keyup.enter="sendMessage"
          placeholder="원하는 조건을 말씀해주세요..."
          :disabled="isProcessing"
        />
        <button class="send-btn" @click="sendMessage" :disabled="!input.trim() || isProcessing">
          <span v-if="!isProcessing">↑</span>
          <span v-else class="loading-spinner">⟳</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import api from '@/api'

const emit = defineEmits(['search-result'])

const isOpen = ref(false)
const input = ref('')
const isProcessing = ref(false)
const chatBody = ref(null)
const isLoadingHistory = ref(false)

const messages = ref([])

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

// 대화 히스토리 로드
const loadHistory = async () => {
  // 이미 로딩 중이거나 히스토리가 이미 있는 경우 스킵
  if (isLoadingHistory.value || messages.value.length > 0) return
  
  isLoadingHistory.value = true
  try {
    const res = await api.get('/llm/history')
    const history = res.data.data || []
    
    if (history.length > 0) {
      // 히스토리가 있으면 불러온 메시지들로 설정
      messages.value = history.map(msg => {
        let content = msg.content || ''
        
        // assistant 메시지가 JSON 형태인 경우 파싱하여 message 필드만 추출
        if (msg.role === 'assistant' && typeof content === 'string') {
          // JSON 형태인지 확인 (중괄호로 시작하는지)
          const trimmedContent = content.trim()
          if (trimmedContent.startsWith('{') && trimmedContent.includes('"message"')) {
            try {
              const parsed = JSON.parse(content)
              // message 필드가 있으면 그것만 사용
              if (parsed.message && typeof parsed.message === 'string') {
                content = parsed.message
              }
            } catch (e) {
              // JSON 파싱 실패 시 원본 사용
              console.warn('히스토리 메시지 파싱 실패:', e)
            }
          }
        }
        
        return {
          role: msg.role,
          text: content
        }
      })
    } else {
      // 히스토리가 없으면 초기 인사 메시지
      messages.value = [
        { role: 'assistant', text: '안녕하세요! 원하시는 지역이나 조건을 말씀해주시면 딱 맞는 매물을 찾아드릴게요.' }
      ]
    }
    
    scrollToBottom()
  } catch (error) {
    console.error('대화 히스토리 로드 실패:', error)
    // 인증 오류 (401, 403)인 경우 메시지 표시
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (messages.value.length === 0) {
        messages.value = [
          { role: 'assistant', text: 'AI 기능을 활용하기 위해서는 로그인이 필요합니다. 로그인 후 이용해주세요.' }
        ]
      }
    } else {
      // 기타 에러 발생 시 초기 메시지로 설정
      if (messages.value.length === 0) {
        messages.value = [
          { role: 'assistant', text: '안녕하세요! 원하시는 지역이나 조건을 말씀해주시면 딱 맞는 매물을 찾아드릴게요.' }
        ]
      }
    }
  } finally {
    isLoadingHistory.value = false
  }
}

const sendMessage = async () => {
  if (!input.value.trim() || isProcessing.value || isLoadingHistory.value) return
  
  // 히스토리 로드가 완료될 때까지 대기
  if (messages.value.length === 0 && !isLoadingHistory.value) {
    await loadHistory()
  }

  const userText = input.value
  messages.value.push({ role: 'user', text: userText })
  input.value = ''
  isProcessing.value = true
  
  scrollToBottom()

  try {
    // 백엔드: POST /api/v1/llm
    // 요청: { prompt: "..." }
    // 응답: { message: "...", listings: [...] }
    const res = await api.post('/llm', { 
      prompt: userText,
      type: 'FIND_HOUSE'
    })
    
    // 응답 인터셉터가 { success: true, data: { message, listings } } 형식으로 변환
    let responseData = res.data.data || {}
    
    // responseData가 문자열인 경우 JSON 파싱 시도
    if (typeof responseData === 'string') {
      try {
        responseData = JSON.parse(responseData)
      } catch (e) {
        console.error('응답 데이터 파싱 실패:', e)
        // 파싱 실패 시 문자열 자체를 메시지로 사용
        messages.value.push({ 
          role: 'assistant', 
          text: responseData || '응답을 받지 못했습니다.' 
        })
        return
      }
    }
    
    // message 필드 추출 및 처리
    let message = '응답을 받지 못했습니다.'
    if (responseData.message) {
      // message가 문자열인 경우 그대로 사용
      if (typeof responseData.message === 'string') {
        message = responseData.message.trim()
      } 
      // message가 객체나 배열인 경우 기본 메시지 사용
      else {
        console.warn('message 필드가 문자열이 아닙니다:', responseData.message)
        message = '매물을 찾지 못했습니다. 다른 조건으로 검색해보세요.'
      }
    }
    
    const listings = responseData.listings || []
    
    // AI 응답 메시지 표시 (message 필드만 표시)
    messages.value.push({ role: 'assistant', text: message })
    
    // 실제 DB 매물만 필터링 (manual_로 시작하는 것은 AI가 생성한 추천이므로 제외)
    const realListings = listings.filter(listing => {
      // aptSeq가 manual_로 시작하지 않고, 좌표 정보가 있는 것만
      const aptSeq = listing.aptSeq || listing.apt_seq || ''
      const hasCoordinates = (listing.latitude || listing.lat) && (listing.longitude || listing.lng)
      return !aptSeq.startsWith('manual_') && hasCoordinates
    })
    
    // 실제 DB 매물이 있을 때만 부모로 전달
    if (realListings.length > 0) {
      emit('search-result', realListings)
    }
  } catch (error) {
    console.error('AI 채팅 오류:', error)
    console.error('에러 상태 코드:', error.response?.status)
    console.error('에러 응답 데이터:', error.response?.data)
    
    // 타임아웃 에러 체크
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      messages.value.push({ 
        role: 'assistant', 
        text: 'AI 응답이 시간 내에 완료되지 않았습니다. 잠시 후 다시 시도해주세요. (처리는 계속 진행 중일 수 있습니다.)' 
      })
    }
    // 인증 오류 (401, 403) 체크 - response.status 또는 data.status 모두 확인
    else if (error.response?.status === 401 || error.response?.status === 403) {
      messages.value.push({ 
        role: 'assistant', 
        text: 'AI 기능을 활용하기 위해서는 로그인이 필요합니다. 로그인 후 이용해주세요.' 
      })
    } else {
      // 기타 오류 - 응답 데이터 구조에 따라 메시지 추출
      let errorMessage = '죄송합니다. 오류가 발생했어요. 😢'
      
      if (error.response?.data) {
        const data = error.response.data
        // 객체인 경우
        if (typeof data === 'object' && data !== null) {
          errorMessage = data.message || data.error || errorMessage
        } 
        // 문자열인 경우
        else if (typeof data === 'string') {
          errorMessage = data
        }
      }
      
      messages.value.push({ role: 'assistant', text: errorMessage })
    }
  } finally {
    isProcessing.value = false
    scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}

// 채팅창이 열릴 때 히스토리 로드
watch(isOpen, (newVal) => {
  if (newVal) {
    loadHistory()
  }
})
</script>

<style scoped>
.floating-chat-wrapper {
  position: absolute;
  bottom: 30px;
  right: 30px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* 사이드바 내부에 배치될 때 (부모가 .ai-search-section인 경우) */
.ai-search-section .floating-chat-wrapper {
  position: static;
  width: 100%;
  align-items: stretch;
}

.chat-toggle-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border: none;
  border-radius: 30px;
  padding: 14px 28px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.35);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.chat-toggle-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 30px rgba(108, 92, 231, 0.5);
}

.chat-toggle-btn .icon {
  font-size: 1.3rem;
}

.chat-window {
  width: 360px;
  height: 600px;
  max-height: calc(100vh - 40px);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  border: 1px solid rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  margin-top: 10px;
}

.chat-header {
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-weight: 800;
  color: var(--primary-color);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-sub);
  cursor: pointer;
  padding: 0 5px;
}

.chat-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.user .bubble {
  background: var(--primary-color);
  color: white;
  border-bottom-right-radius: 2px;
}

.assistant .bubble {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-bottom-left-radius: 2px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

/* 로딩 인디케이터 스타일 */
.loading-bubble {
  background: white !important;
  border: 1px solid var(--border-color) !important;
  padding: 12px 16px !important;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
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
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input-area {
  padding: 15px;
  background: white;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 10px;
}

.chat-input-area input {
  flex: 1;
  border: 1px solid #eee;
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
}

.chat-input-area input:focus {
  border-color: var(--primary-light);
  background: white;
}

.chat-input-area input.processing {
  opacity: 0.7;
  cursor: wait;
}

.chat-input-area input:disabled {
  cursor: wait;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:disabled {
  background: #dfe6e9;
  cursor: not-allowed;
  opacity: 0.6;
}

@keyframes popUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
