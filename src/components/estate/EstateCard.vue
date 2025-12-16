<template>
  <div class="estate-card" :class="{ 'scrapped': isScrapped }" @click="$emit('click')">
    <div class="estate-img-placeholder">🏠</div>
    <div class="estate-info">
      <h4 class="estate-title">{{ estate.title }}</h4>
      <p class="estate-price">{{ formattedPrice }}</p>
      <p class="estate-desc">{{ estate.type }} | {{ estate.desc }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  estate: {
    type: Object,
    required: true
  },
  isScrapped: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const formattedPrice = computed(() => {
  const price = props.estate.price
  if (!price) return ''
  if (price.purchase) return `매매 ${price.purchase / 10000}억`
  return `보증금 ${price.deposit} / 월 ${price.monthly}`
})
</script>

<style scoped>
.estate-card {
  display: flex;
  padding: 20px;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 2px solid rgba(0,0,0,0.03);
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  animation: slideIn 0.5s ease-out forwards;
  opacity: 0;
  width: 100%;
  position: relative;
}

.estate-card.scrapped {
  border: 2px solid #ffd700;
  background: linear-gradient(135deg, #fffef7 0%, #ffffff 100%);
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.2);
}

.estate-card.scrapped::before {
  content: '♥';
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 1.2rem;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
}

.estate-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 30px rgba(108, 92, 231, 0.15);
  border-color: rgba(108, 92, 231, 0.3);
}

.estate-img-placeholder {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #e6eeff 0%, #f1f2f6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-right: 20px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.estate-card:hover .estate-img-placeholder {
  transform: scale(1.1) rotate(5deg);
}

.estate-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden; /* Prevent text overflow issues */
}

.estate-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--text-main);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.estate-price {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 6px;
}

.estate-desc {
  font-size: 0.9rem;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
