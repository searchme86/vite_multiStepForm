import { z } from 'zod';

// 코드의 의미: 이메일 공통 유효성 검사 스키마
// 왜 사용했는지: 이메일 형식 유효성 검사 로직 재사용
export const EmailCommonValidationSchema = z
  .string()
  .email('유효한 이메일 주소를 입력하세요')
  .max(255, '이메일은 255자를 초과할 수 없습니다');
