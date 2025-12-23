<template>
  <div class="estate-card" :class="{ 'scrapped': isScrapped }" @click="$emit('click')">
    <div class="estate-info">
      <h4 class="estate-title">{{ estate.title }}</h4>
      <p class="estate-price">{{ formattedPrice }}</p>
      <p v-if="formattedArea" class="estate-area">{{ formattedArea }}</p>
      <p class="estate-desc">{{ estate.type }} | {{ estate.desc }}</p>
      <p v-if="dealInfo" class="estate-deal-info">{{ formattedDealInfo }}</p>
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
  if (!price) return '가격 정보 없음'
  
  // 매매 가격 표시 (만원 단위를 억/천만원으로 변환)
  if (price.purchase) {
    const purchaseAmount = price.purchase // 이미 만원 단위
    if (purchaseAmount >= 10000) {
      // 억 단위
      const eok = Math.floor(purchaseAmount / 10000)
      const cheonman = Math.floor((purchaseAmount % 10000) / 1000)
      if (cheonman > 0) {
        return `매매 ${eok}억 ${cheonman}천만원`
      }
      return `매매 ${eok}억원`
    } else if (purchaseAmount >= 1000) {
      // 천만원 단위
      const cheonman = Math.floor(purchaseAmount / 1000)
      return `매매 ${cheonman}천만원`
    } else {
      return `매매 ${purchaseAmount}만원`
    }
  }
  
  // 전세/월세 (현재는 매매만 지원)
  if (price.deposit) {
    return `보증금 ${price.deposit}만원 / 월 ${price.monthly || 0}만원`
  }
  
  return '가격 정보 없음'
})

const dealInfo = computed(() => props.estate.dealInfo)

// 면적 강조 표시 (가격 아래)
const formattedArea = computed(() => {
  if (!dealInfo.value || !dealInfo.value.area) return ''
  // m²를 평으로 변환 (1평 ≈ 3.3m²)
  const pyeong = (dealInfo.value.area / 3.3).toFixed(1)
  return `${dealInfo.value.area}㎡ (${pyeong}평)`
})

const formattedDealInfo = computed(() => {
  if (!dealInfo.value) return ''
  
  const parts = []
  
  // 거래일
  if (dealInfo.value.year && dealInfo.value.month && dealInfo.value.day) {
    parts.push(`${dealInfo.value.year}.${String(dealInfo.value.month).padStart(2, '0')}.${String(dealInfo.value.day).padStart(2, '0')}`)
  }
  
  // 층수
  if (dealInfo.value.floor) {
    parts.push(`${dealInfo.value.floor}층`)
  }
  
  return parts.join(' | ')
})
</script>

<style scoped>
.estate-card {
  display: flex;
  padding: 16px 12px;
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

.estate-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden; /* Prevent text overflow issues */
  width: 100%;
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
  margin-bottom: 4px;
}

.estate-area {
  font-size: 1.0rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 6px;
  opacity: 0.9;
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
  margin-bottom: 4px;
}

.estate-deal-info {
  font-size: 0.85rem;
  color: var(--text-sub);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
