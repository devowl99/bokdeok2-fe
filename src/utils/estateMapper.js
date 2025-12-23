/**
 * 백엔드 HouseInfoDto를 프론트엔드 Estate 형식으로 변환
 * @param {Object} houseDto - 백엔드 HouseInfoDto
 * @param {Array} deals - 거래 내역 (선택적)
 * @returns {Object} 프론트엔드 Estate 객체
 */
export function mapHouseDtoToEstate(houseDto, deals = []) {
  // 디버깅: 받아온 데이터 확인 (리스트 조회 시 가격 정보 확인용)
  if (!deals || deals.length === 0) {
    console.log('mapHouseDtoToEstate (리스트 조회) - houseDto:', houseDto)
    console.log('mapHouseDtoToEstate (리스트 조회) - latestDealAmount:', houseDto.latestDealAmount)
    console.log('mapHouseDtoToEstate (리스트 조회) - latestDealYear:', houseDto.latestDealYear)
  }
  
  // 거래 내역에서 가격 정보 추출
  let price = null
  
  // 최신 거래 정보가 있는 경우 (목록 조회 시 latestDealAmount 사용)
  if (houseDto.latestDealAmount) {
    const dealAmount = parseDealAmount(houseDto.latestDealAmount)
    console.log('parsed dealAmount:', dealAmount)
    if (dealAmount !== null) {
      price = { purchase: dealAmount }
    }
  }
  // deals 배열이 있는 경우 (상세 조회 시 deals 사용)
  else if (deals && deals.length > 0) {
    const firstDeal = deals[0]
    const dealAmount = parseDealAmount(firstDeal.dealAmount)
    if (dealAmount !== null) {
      price = { purchase: dealAmount }
    }
  }
  
  // 거래 정보도 함께 저장
  const dealInfo = houseDto.latestDealYear ? {
    year: houseDto.latestDealYear,
    month: houseDto.latestDealMonth,
    day: houseDto.latestDealDay,
    floor: houseDto.latestDealFloor,
    area: houseDto.latestDealArea ? parseFloat(houseDto.latestDealArea) : null
  } : (deals && deals.length > 0 ? {
    year: deals[0].dealYear,
    month: deals[0].dealMonth,
    day: deals[0].dealDay,
    floor: deals[0].floor,
    area: deals[0].excluUseAr ? parseFloat(deals[0].excluUseAr) : null
  } : null)

  return {
    id: houseDto.aptSeq || houseDto.aptSeq, // aptSeq를 id로 사용
    aptSeq: houseDto.aptSeq, // 원본도 유지
    title: houseDto.aptNm || '아파트',
    price: price, // 거래 내역이 없으면 null
    dealInfo: dealInfo, // 거래 일자, 층수, 면적 정보
    type: '아파트', // 백엔드에 type 필드가 없으므로 기본값
    location: {
      lat: parseFloat(houseDto.latitude) || 0,
      lng: parseFloat(houseDto.longitude) || 0
    },
    address: houseDto.roadNm || houseDto.umdNm || '',
    desc: `건축년도: ${houseDto.buildYear || '미상'}, 지번: ${houseDto.jibun || ''}`,
    buildYear: houseDto.buildYear,
    jibun: houseDto.jibun,
    roadNm: houseDto.roadNm,
    umdNm: houseDto.umdNm
  }
}

/**
 * 거래 금액 문자열을 파싱 (만원 단위로 변환)
 * @param {string} dealAmount - 거래 금액 문자열 (예: "50,000", "50000")
 * @returns {number|null} 만원 단위 금액 또는 null
 */
function parseDealAmount(dealAmount) {
  if (!dealAmount) return null
  
  // 쉼표 제거 후 숫자로 변환
  const cleaned = String(dealAmount).replace(/,/g, '').trim()
  const amount = parseFloat(cleaned)
  
  if (isNaN(amount) || amount <= 0) return null
  
  // 이미 만원 단위인 것으로 가정 (실제 데이터 구조에 따라 조정 필요)
  return amount
}

/**
 * 여러 HouseInfoDto를 Estate 배열로 변환
 * @param {Array} houseDtos - 백엔드 HouseInfoDto 배열
 * @returns {Array} 프론트엔드 Estate 배열
 */
export function mapHouseDtosToEstates(houseDtos) {
  if (!Array.isArray(houseDtos)) {
    return []
  }
  return houseDtos.map(dto => mapHouseDtoToEstate(dto))
}

