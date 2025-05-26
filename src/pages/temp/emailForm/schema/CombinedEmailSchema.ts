import { z } from 'zod';
import { FullEmailValidationSchema } from './FullEmailValidationSchema';
import { SplitEmailValidationSchema } from './SplitEmailValidationSchema';

// 코드의 의미: 이메일 스키마 결합
// 왜 사용했는지: 직접 입력과 분리 입력 스키마를 통합
export const CombinedEmailSchema = z.object({
  // 코드의 의미: 직접 이메일 입력 스키마
  // 왜 사용했는지: 직접 입력 필드 유효성 검사
  fullEmailInput: FullEmailValidationSchema,

  // 코드의 의미: 분리 이메일 입력 스키마
  // 왜 사용했는지: 분리 입력 필드 유효성 검사
  splitEmailInput: SplitEmailValidationSchema,
});

export type CombinedEmailSchemaType = z.infer<typeof CombinedEmailSchema>;
