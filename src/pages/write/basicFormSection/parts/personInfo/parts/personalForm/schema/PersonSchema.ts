import { z } from 'zod';
import { CombinedEmailSchema } from '../../emailForm/schema/CombinedEmailSchema';

export const PersonInfoSchema = z.object({
  // 코드의 의미: 이름 필드 스키마
  // 왜 사용했는지: 이름 입력 필드 유효성 검사
  firstName: z
    .string()
    .min(1, '이름은 필수입니다')
    .max(50, '이름은 50자를 초과할 수 없습니다'),

  // 코드의 의미: 성 필드 스키마
  // 왜 사용했는지: 성 입력 필드 유효성 검사
  lastName: z
    .string()
    .min(1, '성은 필수입니다')
    .max(50, '성은 50자를 초과할 수 없습니다'),

  // 코드의 의미: 전화번호 필드 스키마
  // 왜 사용했는지: 전화번호 입력 필드 유효성 검사
  phone: z
    .string()
    .min(10, '전화번호는 최소 10자 이상이어야 합니다')
    .max(15, '전화번호는 15자를 초과할 수 없습니다'),
  email: CombinedEmailSchema,
});

export type PersonInfoType = z.infer<typeof PersonInfoSchema>;
