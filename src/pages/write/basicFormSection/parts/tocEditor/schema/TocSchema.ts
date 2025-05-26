// 코드의 의미: 목차 항목 스키마 정의
// 왜 사용했는지: 목차 데이터의 구조와 유효성 검사 정의
// 수정 이유: subItems에 최소 1개 항목 요구
import { z } from 'zod';

// 코드의 의미: 목차 항목 스키마
// 왜 사용했는지: 목차 항목의 데이터 구조와 유효성 검사 규칙 정의
// 실행 매커니즘: Zod로 필드별 유효성 검사, 타입 추출
export const TocItemSchema = z.object({
  // 코드의 의미: 항목 ID 필드
  // 왜 사용했는지: 고유 식별자
  id: z.string().min(1, 'ID는 필수입니다'),

  // 코드의 의미: 항목 제목 필드
  // 왜 사용했는지: 목차 항목의 제목 입력
  title: z
    .string()
    .min(1, '제목은 필수입니다')
    .max(100, '제목은 100자를 초과할 수 없습니다'),

  // 코드의 의미: Depth 필드
  // 왜 사용했는지: 목차의 계층 구조 표현
  depth: z.number().min(0, 'Depth는 0 이상이어야 합니다').default(0),

  // 코드의 의미: 하위 항목 필드
  // 왜 사용했는지: 계층적 구조 지원, 최소 1개 항목 요구
  subItems: z.lazy((): z.ZodTypeAny => z.array(TocItemSchema).optional()),
});

// 코드의 의미: 스키마에서 타입 추출
// 왜 사용했는지: TypeScript에서 목차 항목 타입 사용
export type TocItemSchemaType = z.infer<typeof TocItemSchema>;
//====여기까지 수정됨====
