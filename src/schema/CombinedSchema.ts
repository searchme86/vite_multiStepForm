import { z } from 'zod';
import { CombinedEmailSchema } from '../pages/write/basicFormSection/parts/personInfo/parts/emailForm/schema/CombinedEmailSchema';

import { JobSchema } from '../pages/temp/workExperience/schema/JobSchema';
import { TocItemSchema } from '../pages/write/basicFormSection/parts/tocEditor/schema/TocSchema';
import { blogPostSchema } from '../pages/write/schema/blogPostSchema';

// 코드의 의미: 전체 폼 스키마 결합
// 왜 사용했는지: 모든 폼 필드의 유효성 검사를 하나의 스키마로 통합
export const CombinedSchema = z.object({
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

  // 코드의 의미: 이메일 필드 스키마 (서브 스키마 결합)
  // 왜 사용했는지: 이메일 입력 필드 유효성 검사
  email: CombinedEmailSchema,

  // // 코드의 의미: 주소 필드 스키마
  // // 왜 사용했는지: 주소 입력 필드 유효성 검사
  // address: z
  //   .string()
  //   .min(1, '주소는 필수입니다')
  //   .max(200, '주소는 200자를 초과할 수 없습니다'),

  // // 코드의 의미: 국가 필드 스키마
  // // 왜 사용했는지: 국가 입력 필드 유효성 검사
  // country: z.string().min(1, '국가는 필수입니다'),

  // // 코드의 의미: 주/도 필드 스키마
  // // 왜 사용했는지: 주/도 입력 필드 유효성 검사
  // state: z.string().optional(),

  // // 코드의 의미: 도시 필드 스키마
  // // 왜 사용했는지: 도시 입력 필드 유효성 검사
  // city: z.string().optional(),

  // // 코드의 의미: 우편번호 필드 스키마
  // // 왜 사용했는지: 우편번호 입력 필드 유효성 검사
  // zip: z.string().optional(),

  // // 코드의 의미: 시간대 필드 스키마
  // // 왜 사용했는지: 시간대 입력 필드 유효성 검사
  // timezone: z.string().optional(),

  // 코드의 의미: 경력 정보 필드 스키마 (배열)
  // 왜 사용했는지: 경력 정보 입력 필드 유효성 검사
  jobs: z.array(JobSchema).optional(),

  // 코드의 의미: GitHub URL 필드 스키마
  // 왜 사용했는지: GitHub URL 입력 필드 유효성 검사
  github: z
    .string()
    .url('유효한 GitHub URL을 입력하세요')
    .optional()
    .or(z.literal('')),

  // 코드의 의미: 포트폴리오 URL 필드 스키마
  // 왜 사용했는지: 포트폴리오 URL 입력 필드 유효성 검사
  portfolio: z
    .string()
    .url('유효한 포트폴리오 URL을 입력하세요')
    .optional()
    .or(z.literal('')),

  // 코드의 의미: 이력서 파일 필드 스키마
  // 왜 사용했는지: 이력서 파일 업로드 필드 유효성 검사
  resume: z.array(z.instanceof(File)).optional(),
  tocItems: z.array(TocItemSchema).optional(),
});
// .merge(blogPostSchema);

export type CombinedSchemaType = z.infer<typeof CombinedSchema>;
