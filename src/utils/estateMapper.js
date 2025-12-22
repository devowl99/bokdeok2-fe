/**
 * 백엔드 HouseInfoDto를 프론트엔드 Estate 형식으로 변환
 * @param {Object} houseDto - 백엔드 HouseInfoDto
 * @param {Array} deals - 거래 내역 (선택적)
 * @returns {Object} 프론트엔드 Estate 객체
 */
export function mapHouseDtoToEstate(houseDto, deals = []) {
  // 거래 내역에서 가격 정보 추출 (첫 번째 거래 사용)
  let price = null
  if (deals && deals.length > 0) {
    const firstDeal = deals[0]
    const dealAmount = parseFloat(firstDeal.dealAmount || 0)
    
    // 거래 금액이 1억 이상이면 매매로 간주 (임시 로직)
    if (dealAmount >= 10000) {
      price = { purchase: dealAmount }
    } else {
      // 전세/월세는 거래 내역에서 직접 얻을 수 없으므로 기본값
      price = { deposit: 5000, monthly: 50 }
    }
  } else {
    // 거래 내역이 없으면 기본값
    price = { deposit: 5000, monthly: 50 }
  }

  return {
    id: houseDto.aptSeq || houseDto.aptSeq, // aptSeq를 id로 사용
    aptSeq: houseDto.aptSeq, // 원본도 유지
    title: houseDto.aptNm || '아파트',
    price: price,
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

