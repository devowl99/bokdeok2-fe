<template>
  <div id="kakao-map" class="map-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  estates: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['marker-detail-click'])

const map = ref(null)
const markers = ref([])
const infoWindows = ref([])

const loadKakaoMap = () => {
  const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY

  // 디버깅: 환경 변수 확인
  console.log('Kakao Map API Key:', apiKey ? '설정됨' : '없음')
  console.log('전체 환경 변수:', import.meta.env)

  if (!apiKey || apiKey === 'your_kakao_javascript_key_here') {
    console.error('Kakao Map API Key is missing!')
    console.error('환경 변수 확인:', {
      VITE_KAKAO_MAP_API_KEY: import.meta.env.VITE_KAKAO_MAP_API_KEY,
      모든_ENV: import.meta.env
    })
    alert('카카오맵 API 키가 설정되지 않았습니다.\n\n확인사항:\n1. .env 파일이 프로젝트 루트에 있는지\n2. VITE_KAKAO_MAP_API_KEY=실제키 형식인지\n3. 개발 서버를 재시작했는지\n\n브라우저 콘솔을 확인해주세요.')
    return
  }

  // Check if script already exists
  if (window.kakao && window.kakao.maps) {
    initMap()
    return
  }

  const script = document.createElement('script')
  const scriptUrl = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${apiKey}&libraries=services,clusterer,drawing`
  console.log('카카오맵 SDK 로드 시도:', scriptUrl.replace(apiKey, '***'))
  script.src = scriptUrl
  script.onload = () => {
    console.log('카카오맵 SDK 로드 완료')
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        console.log('카카오맵 초기화 시작')
        initMap()
      })
    } else {
      console.error('window.kakao.maps가 없습니다')
    }
  }
  script.onerror = (error) => {
    console.error('카카오맵 SDK 로드 실패:', error)
    console.error('API 키 확인 필요:', {
      키_길이: apiKey?.length,
      키_시작: apiKey?.substring(0, 5),
      현재_URL: window.location.href
    })
    alert(`카카오맵을 불러오는데 실패했습니다.\n\n확인사항:\n1. 카카오 개발자 콘솔(https://developers.kakao.com)에서 JavaScript 키를 사용하는지\n2. 플랫폼 설정에서 ${window.location.hostname} 도메인이 등록되어 있는지\n3. API 키에 공백이나 따옴표가 없는지\n\n콘솔을 확인해주세요.`)
  }
  document.head.appendChild(script)
}

const initMap = () => {
  const container = document.getElementById('kakao-map')
  
  if (!container) {
    console.error('지도 컨테이너를 찾을 수 없습니다!')
    return
  }

  console.log('지도 컨테이너 크기:', container.offsetWidth, 'x', container.offsetHeight)

  const options = {
    // Default center: Seoul City Hall
    center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
    level: 7
  }

  try {
    map.value = new window.kakao.maps.Map(container, options)
    console.log('지도 생성 완료')
    
    // Controls
    const zoomControl = new window.kakao.maps.ZoomControl()
    map.value.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)
    
    // 마커 표시 (지도 생성 후)
    if (props.estates.length > 0) {
      addMarkers(props.estates)
    }
  } catch (error) {
    console.error('지도 생성 실패:', error)
  }
}

// 마커 추가 함수
const addMarkers = (estates) => {
  if (!map.value || !window.kakao || !window.kakao.maps) {
    console.warn('지도가 준비되지 않았습니다.')
    return
  }

  // 기존 마커와 정보창 제거
  removeMarkers()

  estates.forEach((estate) => {
    if (!estate.location || !estate.location.lat || !estate.location.lng) {
      console.warn('위치 정보가 없는 매물:', estate.id)
      return
    }

    // 🔍 데이터 품질 체크: 지역 코드와 좌표가 일치하는지 검증
    const lat = estate.location.lat
    const lng = estate.location.lng
    const sggCdPrefix = estate.sggCd ? estate.sggCd.substring(0, 2) : null
    
    // 부산(26)인데 서울 좌표 범위에 있는 경우 제외
    if (sggCdPrefix === '26' && lat >= 37.4 && lat <= 37.7 && lng >= 126.8 && lng <= 127.2) {
      console.warn('⚠️ 좌표 오류: 부산 코드인데 서울 좌표 -', estate.id, estate.sggCd, lat, lng)
      return
    }
    
    // 서울(11)인데 부산 좌표 범위에 있는 경우 제외
    if (sggCdPrefix === '11' && lat >= 35.0 && lat <= 35.5 && lng >= 128.9 && lng <= 129.3) {
      console.warn('⚠️ 좌표 오류: 서울 코드인데 부산 좌표 -', estate.id, estate.sggCd, lat, lng)
      return
    }

    // 마커 생성
    const markerPosition = new window.kakao.maps.LatLng(
      estate.location.lat,
      estate.location.lng
    )

    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      map: map.value
    })

    // 🔍 디버깅: 동 코드 표시 (sgg_cd + umd_cd)
    const dongCode = (estate.sggCd || '?????') + (estate.umdCd || '?????')
    const customOverlay = new window.kakao.maps.CustomOverlay({
      position: markerPosition,
      content: `<div style="
        background: rgba(0, 0, 0, 0.8);
        color: #00ff00;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 9px;
        font-weight: bold;
        white-space: nowrap;
        pointer-events: none;
        border: 1px solid rgba(0, 255, 0, 0.5);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${dongCode}</div>`,
      map: map.value,
      yAnchor: 1.8
    })

    // 정보창 생성
    const infoWindow = new window.kakao.maps.InfoWindow({
      content: createInfoWindowContent(estate),
      removable: true
    })

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, 'click', () => {
      // 다른 정보창 닫기
      infoWindows.value.forEach(iw => iw.close())
      // 현재 정보창 열기
      infoWindow.open(map.value, marker)
    })

    markers.value.push(marker)
    markers.value.push(customOverlay) // 오버레이도 마커처럼 관리
    infoWindows.value.push(infoWindow)
  })

  console.log(`${markers.value.length}개의 마커가 표시되었습니다.`)
}

// 정보창 HTML 생성
const createInfoWindowContent = (estate) => {
  const price = estate.price?.purchase 
    ? `매매 ${(estate.price.purchase / 10000).toFixed(1)}억`
    : `보증금 ${estate.price?.deposit || 0}만원 / 월 ${estate.price?.monthly || 0}만원`

  // 전역 함수 호출을 위한 고유 함수명
  const funcName = `openDetail_${estate.id}`
  
  // 전역 함수 등록
  window[funcName] = () => {
    emit('marker-detail-click', estate.id)
  }

  return `
    <div style="padding: 12px; min-width: 220px;">
      <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px;">${estate.title || '제목 없음'}</div>
      <div style="color: #6c5ce7; font-weight: 600; font-size: 13px; margin-bottom: 6px;">${price}</div>
      <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${estate.type || ''} | ${estate.desc || ''}</div>
      <div style="font-size: 11px; color: #999; margin-bottom: 10px;">${estate.address || ''}</div>
      <button 
        onclick="window['${funcName}'](); return false;"
        style="
          width: 100%;
          padding: 8px 12px;
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(108, 92, 231, 0.3);
        "
        onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(108, 92, 231, 0.4)'"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(108, 92, 231, 0.3)'"
      >
        상세보기
      </button>
    </div>
  `
}

// 마커 제거 함수
const removeMarkers = () => {
  markers.value.forEach((marker) => {
    if (marker.setMap) {
      marker.setMap(null) // Marker
    } else if (marker.setVisible) {
      marker.setVisible(false) // CustomOverlay
    }
  })
  infoWindows.value.forEach(infoWindow => infoWindow.close())
  markers.value = []
  infoWindows.value = []
}

const moveMap = (lat, lng) => {
  if (!map.value) return
  const moveLatLon = new window.kakao.maps.LatLng(lat, lng)
  map.value.panTo(moveLatLon)
}

// estates가 변경될 때 마커 업데이트
watch(() => props.estates, (newEstates) => {
  if (!map.value) return
  
  if (newEstates.length > 0) {
    addMarkers(newEstates)
  } else {
    // 매물이 없으면 마커 제거
    removeMarkers()
  }
}, { deep: true })

// Handle window resize
const handleResize = () => {
  if (map.value) {
    map.value.relayout()
  }
}

defineExpose({ moveMap })

onMounted(() => {
  loadKakaoMap()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 전역 함수 정리
  props.estates.forEach(estate => {
    const funcName = `openDetail_${estate.id}`
    if (window[funcName]) {
      delete window[funcName]
    }
  })
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0; /* Fallback color */
}
</style>
