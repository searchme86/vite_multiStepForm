// 코드의 의미: 웹페이지 메타데이터를 가져오는 함수
// 왜 사용했는지: 포트폴리오 URL의 메타데이터를 추출
export const fetchPageMetadata = async (
  url: string
): Promise<{
  title: string;
  description: string;
  image: string;
}> => {
  try {
    // 실제 구현은 외부 API 또는 서버리스 함수로 대체 가능 (예: Open Graph 프로토콜 파싱)
    // 여기서는 모의 데이터로 대체
    const mockResponse = {
      title: '포트폴리오 제목',
      description: '포트폴리오 설명입니다.',
      image: 'https://example.com/image.jpg',
    };

    // 모의 지연 시간 추가
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return mockResponse;
  } catch (error) {
    console.error('메타데이터 가져오기 실패:', error);
    throw error;
  }
};
