import type { JobSchemaType } from '../schema/JobSchema';

// 코드의 의미: 경력 정보 관련 유틸리티 함수
// 왜 사용했는지: 경력 정보 처리 로직을 재사용 가능하도록 캡슐화
export const formatJobDuration = (job: JobSchemaType): string => {
  // 코드의 의미: 경력 기간 형식 변환
  // 왜 사용했는지: 시작 날짜와 종료 날짜를 사람이 읽기 쉬운 형식으로 변환
  const from = new Date(job.from).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });
  const to = new Date(job.to).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });
  return `${from} - ${to}`;
};
