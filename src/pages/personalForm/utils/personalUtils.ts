// 코드의 의미: 개인 정보 관련 유틸리티 함수
// 왜 사용했는지: 개인 정보 처리 로직을 재사용 가능하도록 캡슐화
export const formatPhoneNumber = (phone: string): string => {
  // 코드의 의미: 전화번호 형식 변환
  // 왜 사용했는지: 전화번호를 일관된 형식으로 표시
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
};
