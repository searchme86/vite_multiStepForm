// 코드의 의미: 이메일 형식 유효성 검사 함수
// 왜 사용했는지: 이메일 형식 유효성을 확인
export const isValidEmail = (email: string): boolean => {
  // 코드의 의미: 이메일 형식 정규식
  // 왜 사용했는지: 이메일 형식 검증
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
