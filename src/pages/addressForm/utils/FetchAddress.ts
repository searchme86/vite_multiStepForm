// 코드의 의미: 주소 자동완성 API 호출 함수
// 왜 사용했는지: 입력된 주소로 관련 데이터 가져오기
export const fetchAddress = async (
  address: string
): Promise<{
  country: string;
  state: string;
  city: string;
  zip: string;
  timezone: string;
} | null> => {
  try {
    // 실제 API 호출은 외부 서비스로 대체 가능 (예: Google Maps API)
    // 여기서는 모의 데이터로 대체
    const mockResponse = {
      country: 'KR',
      state: 'Seoul',
      city: 'Gangnam',
      zip: '12345',
      timezone: 'Asia/Seoul',
    };

    // 모의 지연 시간 추가
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return mockResponse;
  } catch (error) {
    console.error('주소 가져오기 실패:', error);
    return null;
  }
};
