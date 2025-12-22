<template>
  <div class="edit-page-container">
    <div class="blob"></div>
    <div class="blob-2"></div>
    <Header />
    
    <main class="content-area">
      <div class="edit-card">
        <h2>내 정보 수정</h2>
        
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label>이메일</label>
            <input type="text" :value="user?.email" disabled class="disabled-input" />
          </div>

          <div class="form-group">
            <label>닉네임</label>
            <input 
              v-model="nickname" 
              type="text" 
              placeholder="변경할 닉네임을 입력하세요" 
            />
          </div>

          <div class="form-group">
            <label>새 비밀번호</label>
            <input 
              v-model="password" 
              type="password" 
              placeholder="변경할 비밀번호 (선택사항)" 
            />
          </div>

          <div class="form-group">
            <label>비밀번호 확인</label>
            <input 
              v-model="confirmPassword" 
              type="password" 
              placeholder="비밀번호 확인" 
            />
          </div>

          <div class="actions">
            <button type="submit" class="save-btn" :disabled="isLoading">
              {{ isLoading ? '저장 중...' : '저장하기' }}
            </button>
            <button type="button" class="cancel-btn" @click="$router.back()">취소</button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import Header from '@/components/layout/Header.vue'
import { useAuthStore } from '@/stores/auth'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const authStore = useAuthStore()
const router = useRouter()
const user = computed(() => authStore.user)

const nickname = ref(user.value?.nickname || '')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const updateProfile = async () => {
  if (!nickname.value.trim()) {
    alert('닉네임을 입력해주세요.')
    return
  }

  if (password.value && password.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  isLoading.value = true
  try {
    const payload = { nickname: nickname.value }
    if (password.value) {
      payload.password = password.value
    }

    // 백엔드: PUT /api/v1/profile/edit
    await api.put('/profile/edit', payload)
    
    // 수정 후 프로필 정보 다시 조회
    try {
      const profileResponse = await api.get('/user/profile')
      const userData = profileResponse.data.data || profileResponse.data
      
      const mappedUser = {
        id: userData.userId,
        userId: userData.userId,
        email: userData.email,
        nickname: userData.nickname,
        phone: userData.phone
      }
      
      authStore.user = mappedUser
      localStorage.setItem('user', JSON.stringify(mappedUser))
      
      alert('성공적으로 수정되었습니다.')
      router.push('/mypage')
    } catch (profileError) {
      console.warn('수정 후 프로필 조회 실패:', profileError)
      alert('수정은 완료되었지만 프로필 정보를 다시 불러오지 못했습니다.')
      router.push('/mypage')
    }
  } catch (error) {
    console.error(error)
    alert('수정에 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.edit-page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f6f8fb 0%, #e5eaf5 100%);
  position: relative;
  overflow-x: hidden;
}

/* Background Blobs */
.blob {
  position: absolute;
  top: -10%;
  right: -5%;
  width: 500px;
  height: 500px;
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
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  filter: blur(80px);
  opacity: 0.6;
  border-radius: 50%;
  z-index: 0;
  animation: float 10s ease-in-out infinite reverse;
}

.content-area {
  flex: 1;
  max-width: 500px;
  width: 100%;
  margin: 80px auto;
  padding: 0 20px;
  position: relative;
  z-index: 1; /* Above blobs */
  animation: fadeUp 0.8s ease-out;
}

.edit-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 30px;
  padding: 50px 40px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
}

h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 40px;
  text-align: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.form-group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
  margin-left: 4px;
}

input {
  padding: 16px 20px;
  border-radius: 16px;
  border: 2px solid transparent;
  background: white;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

input:focus {
  border-color: var(--primary-color);
  background: white;
  outline: none;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.15);
  transform: translateY(-2px);
}

.disabled-input {
  background: rgba(255, 255, 255, 0.5);
  color: #b2bec3;
  cursor: not-allowed;
  border-color: transparent;
  box-shadow: none;
}

.actions {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.save-btn {
  padding: 18px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(108, 92, 231, 0.4);
  filter: brightness(1.05);
}

.save-btn:active {
  transform: translateY(0);
}

.save-btn:disabled {
  background: #b2bec3;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  padding: 18px;
  background: white;
  color: var(--text-sub);
  border: 1px solid white; /* Glass effect border */
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.cancel-btn:hover {
  background: #f8f9fa;
  color: var(--text-main);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
