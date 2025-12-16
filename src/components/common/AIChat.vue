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
      
      <!-- Input Area -->
      <div class="input-box-wrapper">
        <div class="input-box">
          <span class="icon">✨</span>
          <input 
            v-model="query" 
            type="text" 
            placeholder="원하는 조건을 입력하세요 (예: 강남역 근처 5억 이하 투룸)"
            @keyup.enter="handleSearch"
          />
          <button class="send-btn" @click="handleSearch" :disabled="!query.trim()">
            ➤
          </button>
        </div>
      </div>

      <!-- Quick Recommendations -->
      <div class="tags-container">
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

const router = useRouter()
const authStore = useAuthStore()
const query = ref('')

const isLoggedIn = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

const tags = [
  '🏙️ 강남 역세권 오피스텔',
  '🏞️ 한강뷰 아파트',
  '🎓 대학가 저렴한 원룸',
  '🚗 주차 가능한 투룸'
]

const setQuery = (text) => {
  query.value = text
}

const handleSearch = () => {
  if (!query.value.trim()) return
  
  // TODO: Call AI API or Navigate to Map with query
  console.log('Searching for:', query.value)
  alert(`AI 검색 시작: "${query.value}"\n(결과 페이지로 이동합니다)`)
  
  // Mock navigation
  router.push({ name: 'Map', query: { q: query.value } }) // Creating Map route might be needed
}
</script>

<style scoped>
.ai-chat-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: transparent; /* Changed to transparent to show blobs */
  width: 100%;
  z-index: 1;
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
  font-size: 3rem; /* Larger font */
  font-weight: 800;
  margin-bottom: 40px;
  letter-spacing: -1px;
  /* Gradient Text Effect */
  background: linear-gradient(135deg, var(--text-main) 0%, var(--primary-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeUp 0.8s ease-out;
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
  background: rgba(255, 255, 255, 0.9); /* Slight transparency */
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
</style>
