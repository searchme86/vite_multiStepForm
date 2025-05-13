//====여기부터 수정됨====
// blog-post.ts: 블로그 포스트 폼 데이터의 스키마와 타입 정의
// - 의미: 폼 데이터의 구조와 유효성 검사 규칙 정의
// - 사용 이유: 데이터 무결성과 타입 안정성 보장
// - 비유: 요리 레시피의 재료 목록과 규격, 각 재료의 양과 품질 점검
// - 작동 메커니즘:
//   1. zod 스키마로 데이터 구조와 유효성 규칙 정의
//   2. z.infer로 타입스크립트 타입 추론
//   3. 폼 입력 시 데이터 유효성 검사
// - 관련 키워드: zod, TypeScript, schema validation, react-hook-form
import { z } from 'zod';

// 스키마: 블로그 포스트 폼 데이터
// - 타입: z.ZodObject
// - 의미: 폼 데이터의 구조와 제약 조건 정의
// - 사용 이유: 런타임과 컴파일 타임에서 데이터 무결성 보장
export const blogPostSchema = z.object({
  // 필드: 제목
  // - 타입: string
  // - 의미: 블로그 포스트의 제목
  // - 사용 이유: 포스트 식별과 검색 용이
  // - 제약: 5~100자
  title: z
    .string()
    .min(5, '제목은 최소 5자 이상이어야 합니다.')
    .max(100, '제목은 100자 미만이어야 합니다.'),

  // 필드: 설명
  // - 타입: string
  // - 의미: 포스트의 요약
  // - 사용 이유: 포스트 미리보기 제공
  // - 제약: 20~500자
  description: z
    .string()
    .min(20, '설명은 최소 20자 이상이어야 합니다.')
    .max(500, '설명은 500자 미만이어야 합니다.'),

  // 필드: 내용
  // - 타입: string
  // - 의미: 포스트 본문
  // - 사용 이유: 포스트의 주요 정보
  // - 제약: 최소 100자
  content: z.string().min(100, '내용은 최소 100자 이상이어야 합니다.'),

  // 필드: 카테고리
  // - 타입: string
  // - 의미: 포스트 분류
  // - 사용 이유: 포스트 검색과 필터링 용이
  // - 제약: 필수 입력
  category: z.string().min(1, '카테고리를 선택해주세요.'),

  // 필드: 태그
  // - 타입: string[]
  // - 의미: 포스트와 관련된 키워드
  // - 사용 이유: 검색과 추천 기능 강화
  // - 제약: 1~5개
  tags: z
    .array(z.string())
    .min(1, '최소 1개의 태그를 추가해주세요.')
    .max(5, '태그는 최대 5개까지 가능합니다.'),

  // 필드: 대표 이미지
  // - 타입: Array<{ file, preview, name, size }>
  // - 의미: 포스트의 대표 이미지
  // - 사용 이유: 시각적 매력과 미리보기 제공
  // - 제약: 1~10개, 각 필드는 선택적
  coverImage: z
    .array(
      z.object({
        file: z.instanceof(File).optional(), // Fallback: 선택적 필드로 호환성 유지
        preview: z.string().optional(),
        name: z.string().optional(),
        size: z.number().optional(),
      })
    )
    .min(1, '대표 이미지는 필수입니다.')
    .max(10, '이미지는 최대 10개까지 가능합니다.'),

  // 필드: 게시 날짜
  // - 타입: Date | undefined
  // - 의미: 포스트 게시 일정
  // - 사용 이유: 예약 게시 지원
  // - 제약: 선택적
  publishDate: z.date().optional(),

  // 필드: 초안 여부
  // - 타입: boolean
  // - 의미: 포스트 저장 상태
  // - 사용 이유: 초안 저장 기능 지원
  // - Fallback: 기본값 false
  isDraft: z.boolean().default(false),

  // 필드: 공개 여부
  // - 타입: boolean
  // - 의미: 포스트 공개 설정
  // - 사용 이유: 접근 제어
  // - Fallback: 기본값 true
  isPublic: z.boolean().default(true),
});

// 타입: 블로그 포스트 폼 데이터
// - 타입: z.infer<typeof blogPostSchema>
// - 의미: zod 스키마에서 추론된 타입
// - 사용 이유: 타입스크립트와 폼 데이터 통합
export type BlogPostFormData = z.infer<typeof blogPostSchema>;

//====여기까지 수정됨====
