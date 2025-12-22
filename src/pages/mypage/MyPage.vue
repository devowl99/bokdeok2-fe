<template>
  <div class="mypage-container">
    <div class="blob"></div>
    <div class="blob-2"></div>
    <Header />
    
    <main class="content-area">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar">👤</div>
          <div class="user-info" v-if="user">
            <h2>{{ user.nickname }}</h2>
            <p>{{ user.email }}</p>
          </div>
        </div>

        <div class="actions">
          <button class="action-btn edit-btn" @click="goToEdit">내 정보 수정</button>
          <button class="action-btn logout-btn" @click="handleLogout">로그아웃</button>
          <button class="text-btn delete-account" @click="handleDeleteAccount">회원 탈퇴</button>
        </div>
      </div>

      <div class="scraps-preview">
        <h3>최근 스크랩한 매물 🏠</h3>
        
        <div class="scrap-stats">
          <div class="stat-item">
            <span class="label">스크랩 매물</span>
            <span class="value">{{ scrapCount }}</span>
          </div>
        </div>

        <div v-if="scrapCount > 0" class="scrap-list">
          <div class="button-group">
            <button class="view-all-btn" @click="$router.push('/map')">지도에서 보기</button>
            <button class="view-all-btn" @click="$router.push('/scrap')">스크랩 창에서 보기</button>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>아직 스크랩한 매물이 없어요.</p>
          <button class="go-map-btn" @click="$router.push('/map')">매물 보러가기</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Header from '@/components/layout/Header.vue'
import { useAuthStore } from '@/stores/auth'
import { useScrapStore } from '@/stores/scrap'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const authStore = useAuthStore()
const scrapStore = useScrapStore()
const router = useRouter()

const user = computed(() => authStore.user)
const scrapCount = computed(() => scrapStore.getScrapCount)

const goToEdit = () => {
  router.push('/mypage/edit')
}

const handleLogout = () => {
  authStore.logout()
}

const handleDeleteAccount = async () => {
  if (!confirm('정말로 탈퇴하시겠습니까? 데이터는 복구할 수 없습니다.')) return

  try {
    // 백엔드: DELETE /api/v1/profile
    await api.delete('/profile')
    authStore.logout()
    alert('탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.')
    router.push('/')
  } catch (error) {
    console.error(error)
    const errorMessage = error.response?.data?.message || error.response?.data?.data || '탈퇴 처리 중 오류가 발생했습니다.'
    alert(errorMessage)
  }
}

onMounted(async () => {
  // 프로필 정보 동기화
  if (authStore.isAuthenticated) {
    try {
      const response = await api.get('/user/profile')
      const userData = response.data.data || response.data
      
      // 사용자 정보 업데이트
      const mappedUser = {
        id: userData.userId,
        userId: userData.userId,
        email: userData.email,
        nickname: userData.nickname,
        phone: userData.phone
      }
      authStore.user = mappedUser
      localStorage.setItem('user', JSON.stringify(mappedUser))
    } catch (error) {
      console.warn('프로필 정보 조회 실패:', error)
    }
  }
  
  await scrapStore.loadScraps()
})
</script>

<style scoped>
.mypage-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f6f8fb 0%, #e5eaf5 100%);
  position: relative;
  /* overflow-x: hidden; Removed to prevent double scrollbar */
  overflow: hidden; /* Clip background blobs to prevent extra scrolling */
  padding-bottom: 60px; /* Ensure background covers bottom spacing */
}

/* Background Blobs */
.blob {
  position: absolute;
  top: -10%;
  left: -5%;
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
  right: -5%;
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
  max-width: 600px;
  width: 100%;
  margin: 40px auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  position: relative;
  z-index: 1; /* Above blobs */
  animation: fadeUp 0.8s ease-out;
}

.profile-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 30px;
  padding: 50px 40px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar {
  width: 110px;
  height: 110px;
  background: linear-gradient(135deg, #dfe6e9 0%, #ffffff 100%);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  border-radius: 50%;
  font-size: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
  border: 4px solid white;
}

.user-info h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.user-info p {
  color: var(--text-sub);
  font-size: 1.05rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-top: 30px;
}

.action-btn {
  width: 100%;
  padding: 18px;
  border-radius: 16px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.edit-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(108, 92, 231, 0.4);
  filter: brightness(1.05);
}

.logout-btn {
  background: white;
  color: var(--text-main);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid white;
}

.logout-btn:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.delete-account {
  background: none;
  border: none;
  font-size: 0.9rem;
  color: #ff7675;
  cursor: pointer;
  margin-top: 10px;
  text-decoration: underline;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.delete-account:hover {
  opacity: 1;
}

.scraps-preview {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
}

.scraps-preview h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-main);
}

.scrap-stats {
  margin: 30px 0;
  display: flex;
  justify-content: center;
  gap: 50px;
  padding: 20px 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.scrap-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.scrap-stats .stat-item .label {
  font-size: 0.95rem;
  color: var(--text-sub);
  font-weight: 500;
}

.scrap-stats .stat-item .value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary-color);
}

.empty-state, .scrap-list {
  text-align: center;
  padding: 20px 0;
}

.empty-state p {
  color: var(--text-sub);
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.go-map-btn, .view-all-btn {
  flex: 1;
  min-width: 140px;
  max-width: 200px;
  padding: 12px 24px;
  border-radius: 20px;
  border: 1px solid var(--primary-color);
  background: white;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  text-align: center;
}

.go-map-btn:hover, .view-all-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(108, 92, 231, 0.2);
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
