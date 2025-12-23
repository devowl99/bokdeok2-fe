<template>
  <div class="auth-page">
    <Header />
    <div class="background-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>
    
    <div class="auth-card">
      <h2 class="auth-title">로그인</h2>
      <p class="auth-subtitle">복덕이와 함께 똑똑한 내 집 마련을 시작하세요.</p>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <label>이메일</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="example@bokdeok.com" 
            required 
          />
        </div>
        
        <div class="input-group">
          <label>비밀번호</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="비밀번호를 입력하세요" 
            required 
          />
        </div>

        <button type="submit" class="auth-btn submit-btn" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>계정이 없으신가요? <router-link to="/register">회원가입</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/layout/Header.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) return
  
  isLoading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    // 백엔드에서 구체적인 에러 메시지를 보내므로 그대로 사용
    const errorMessage = error.message || '로그인에 실패했습니다. 다시 시도해주세요.'
    alert(errorMessage)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  padding: 20px;
  padding-top: calc(var(--header-height) + 20px);
  position: relative;
  overflow: hidden;
}

.background-blobs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 20s infinite ease-in-out;
}

.blob-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--primary-light) 0%, rgba(255,255,255,0) 70%);
  top: -200px;
  left: -200px;
}

.blob-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--secondary-color) 0%, rgba(255,255,255,0) 70%);
  bottom: -100px;
  right: -100px;
  animation-delay: -5s;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  z-index: 1;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-title {
  font-size: 2.2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 10px;
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.auth-subtitle {
  text-align: center;
  color: var(--text-sub);
  margin-bottom: 35px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-main);
  font-size: 0.9rem;
  margin-left: 5px;
}

.input-group input {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid transparent;
  border-radius: 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

.input-group input:focus {
  border-color: var(--primary-light);
  background-color: white;
  box-shadow: 0 8px 25px rgba(108, 92, 231, 0.15);
  transform: translateY(-2px);
}

.submit-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 15px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.25);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 30px rgba(108, 92, 231, 0.4);
}

.submit-btn:disabled {
  background: #b2bec3;
  cursor: not-allowed;
  box-shadow: none;
}

.auth-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 0.95rem;
  color: var(--text-sub);
}

.auth-footer a {
  color: var(--primary-color);
  font-weight: 700;
  margin-left: 5px;
  text-decoration: none;
  transition: color 0.2s;
}

.auth-footer a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
}
</style>
