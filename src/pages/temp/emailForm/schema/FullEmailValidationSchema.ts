import { z } from 'zod';
import { EmailCommonValidationSchema } from './EmailCommonValidationSchema';

// 코드의 의미: 직접 이메일 입력 유효성 검사 스키마
// 왜 사용했는지: 직접 입력 이메일 필드 유효성 검사
export const FullEmailValidationSchema = z.union([
  EmailCommonValidationSchema,
  z.literal(''),
]);
