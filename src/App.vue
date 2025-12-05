<template>
  <div id="app">
    <header>
      <h1>Bokdeok2 Frontend</h1>
    </header>
    <main>
      <div class="container">
        <h2>Vue.js 앱이 성공적으로 실행되었습니다! 🎉</h2>
        <p>카운터 예제:</p>
        <div class="counter">
          <button @click="decrement">-</button>
          <span class="count">{{ count }}</span>
          <button @click="increment">+</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 600;
}

main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.container {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

button:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}

.count {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  min-width: 60px;
}
</style>

