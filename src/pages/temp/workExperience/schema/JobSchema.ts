import { z } from 'zod';

// 코드의 의미: 경력 정보 스키마 정의
// 왜 사용했는지: 경력 정보 입력 필드의 유효성 검사
export const JobSchema = z
  .object({
    // 코드의 의미: 직함 필드 스키마
    // 왜 사용했는지: 직함 입력 필드 유효성 검사
    title: z
      .string()
      .min(1, '직함은 필수입니다')
      .max(100, '직함은 100자를 초과할 수 없습니다'),

    // 코드의 의미: 회사 필드 스키마
    // 왜 사용했는지: 회사 입력 필드 유효성 검사
    company: z
      .string()
      .min(1, '회사는 필수입니다')
      .max(100, '회사는 100자를 초과할 수 없습니다'),

    // 코드의 의미: 시작 날짜 필드 스키마
    // 왜 사용했는지: 시작 날짜 입력 필드 유효성 검사
    from: z.date().refine((date) => date <= new Date(), {
      message: '시작 날짜는 미래일 수 없습니다',
    }),

    // 코드의 의미: 종료 날짜 필드 스키마
    // 왜 사용했는지: 종료 날짜 입력 필드 유효성 검사
    to: z
      .date()
      .refine(
        (date) =>
          date <=
          new Date(new Date().setFullYear(new Date().getFullYear() + 7)),
        {
          message: '종료 날짜는 현재로부터 7년 이후일 수 없습니다',
        }
      ),

    // 코드의 의미: 설명 필드 스키마
    // 왜 사용했는지: 설명 입력 필드 유효성 검사
    description: z.string().max(500, '설명은 500자를 초과할 수 없습니다'),
    // .optional(),
  })
  //====여기부터 수정됨====
  // 코드의 의미: 날짜 순서 검사
  // 왜 사용했는지: 시작 날짜가 종료 날짜보다 이전인지 확인
  .refine((data) => new Date(data.from) <= new Date(data.to), {
    message: '시작 날짜는 종료 날짜보다 이전이어야 합니다',
    path: ['to'],
  });
//====여기까지 수정됨====

// 코드의 의미: JobSchema 타입을 내보냄
// 왜 사용했는지: 타입스크립트에서 스키마 타입을 재사용하기 위해
export type JobSchemaType = z.infer<typeof JobSchema>;
