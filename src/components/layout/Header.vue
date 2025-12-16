<template>
  <header class="header">
    <div class="logo-area">
      <router-link to="/" class="logo">
        <span class="logo-emoji">🏠</span>
        <span class="logo-text">복덕이</span>
      </router-link>
    </div>

    <div class="right-area">
      <!-- Manual Search Trigger -->
      <button class="nav-btn manual-search-btn" @click="handleManualSearch">
        <span class="icon">🔍</span>
        직접 찾기 (시/군/구)
      </button>

      <div class="auth-menu">
        <template v-if="isLoggedIn">
          <router-link to="/scrap" class="nav-link">스크랩</router-link>
          <router-link to="/mypage" class="nav-link">마이페이지</router-link>
          <button class="nav-btn login-btn" @click="logout">로그아웃</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-btn login-btn">로그인</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useScrapStore } from '@/stores/scrap'

const router = useRouter()
const authStore = useAuthStore()
const scrapStore = useScrapStore()

const isLoggedIn = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const scrapCount = computed(() => scrapStore.getScrapCount)

const handleManualSearch = () => {
  router.push('/map')
}

const logout = () => {
  authStore.logout()
}

onMounted(() => {
  scrapStore.loadScraps()
})
</script>

<style scoped>
.header {
  height: var(--header-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  background-color: transparent; /* Main page style */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary-color);
  text-decoration: none;
}

.logo-text {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.right-area {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 0.95rem;
}

.manual-search-btn {
  background-color: white;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 6px;
}

.manual-search-btn:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.auth-menu {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  color: var(--text-sub);
  font-weight: 500;
  cursor: pointer;
}

.nav-link:hover {
  color: var(--primary-color);
}

.login-btn {
  background-color: var(--primary-color);
  color: white;
}

.login-btn:hover {
  background-color: var(--primary-dark);
}

.welcome-msg {
  font-size: 0.95rem;
  color: var(--text-main);
  font-weight: 600;
  margin-right: 10px;
}
</style>
