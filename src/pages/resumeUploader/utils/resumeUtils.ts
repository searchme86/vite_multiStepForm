// 코드의 의미: 이력서 관련 유틸리티 함수
// 왜 사용했는지: 이력서 처리 로직을 재사용 가능하도록 캡슐화
export const validateResumeFile = (file: File): boolean => {
  // 코드의 의미: 파일 유효성 검사
  // 왜 사용했는지: 업로드된 파일이 유효한지 확인
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return validTypes.includes(file.type) && file.size <= maxSize;
};
