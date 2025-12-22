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
      </div>

      <div class="chat-input-area">
        <input 
          v-model="input" 
          @keyup.enter="sendMessage"
          placeholder="원하는 조건을 말씀해주세요..."
          :disabled="isProcessing"
        />
        <button class="send-btn" @click="sendMessage" :disabled="!input.trim() || isProcessing">
          ↑
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import api from '@/api'

const isOpen = ref(false)
const input = ref('')
const isProcessing = ref(false)
const chatBody = ref(null)

const messages = ref([
  { role: 'assistant', text: '안녕하세요! 원하시는 지역이나 조건을 말씀해주시면 딱 맞는 매물을 찾아드릴게요.' }
])

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = async () => {
  if (!input.value.trim() || isProcessing.value) return

  const userText = input.value
  messages.value.push({ role: 'user', text: userText })
  input.value = ''
  isProcessing.value = true
  
  scrollToBottom()

  try {
    // 백엔드: POST /api/v1/llm
    // 요청: { prompt: "..." } (LlmRequestDto)
    // 응답: String (직접 문자열 반환)
    const res = await api.post('/llm', { 
      prompt: userText,
      type: 'FIND_HOUSE' // 또는 'SCENERY'
    })
    
    // 백엔드는 직접 문자열을 반환하므로, 응답 인터셉터가 { success: true, data: "..." } 형식으로 변환
    const reply = res.data.data || res.data || '응답을 받지 못했습니다.'
    messages.value.push({ role: 'assistant', text: reply })
  } catch (error) {
    console.error(error)
    const errorMessage = error.response?.data?.message || error.response?.data?.data || '죄송합니다. 오류가 발생했어요. 😢'
    messages.value.push({ role: 'assistant', text: errorMessage })
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

.chat-toggle-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.chat-toggle-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(108, 92, 231, 0.4);
}

.chat-window {
  width: 350px;
  height: 500px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
}

@keyframes popUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
