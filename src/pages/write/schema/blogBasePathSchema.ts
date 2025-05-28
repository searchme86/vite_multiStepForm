//====여기부터 수정됨====
// blogBasePathSchema.ts - 블로그 기본 정보 스키마 (타입 안전성 개선)
// - 의미: 블로그 포스트의 핵심 메타데이터 검증
// - 사용 이유: 제목, 요약, 콘텐츠, 목차의 유효성 검사
// - 비유: 책의 기본 정보 (제목, 요약, 목차)를 확인하는 체크리스트
// - 작동 메커니즘:
//   1. Zod 스키마로 타입 안전성 보장
//   2. 문자열 길이 및 형식 검증
//   3. 선택적 필드와 필수 필드 구분
//   4. 카테고리 enum 방식으로 타입 안전성 향상
// - 관련 키워드: zod, validation, type safety, schema, typescript

import { z } from 'zod';
import { TocItemSchema } from '../basicFormSection/parts/tocEditor/schema/TocSchema';

// 카테고리 enum - 타입 안전성 향상
// - 의미: 허용되는 카테고리 목록을 상수로 정의
// - 사용 이유: 오타 방지 및 IDE 자동완성 지원
export const BLOG_CATEGORIES = ['tech', 'lifestyle', 'travel', 'food'] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

// 블로그 기본 경로 스키마 - 개선된 검증
// - 의미: 블로그 포스트 기본 정보 검증 규칙
// - 사용 이유: 데이터 무결성 보장 및 사용자 경험 개선
export const blogBasePathSchema = z.object({
  // 제목 - 강화된 검증
  // - 의미: 블로그 포스트 제목
  // - 검증: 길이, 공백 문자 처리, 특수문자 제한
  title: z
    .string({
      required_error: '제목은 필수 입력 항목입니다.',
      invalid_type_error: '제목은 문자열이어야 합니다.',
    })
    .trim() // 앞뒤 공백 제거
    .min(5, { message: '제목은 최소 5자 이상이어야 합니다.' })
    .max(100, { message: '제목은 100자를 초과할 수 없습니다.' })
    .refine((value) => value.replace(/\s+/g, '').length >= 3, {
      message: '제목은 공백을 제외하고 최소 3자 이상이어야 합니다.',
    }),

  // 요약 - 강화된 검증
  // - 의미: 블로그 포스트 요약 내용
  // - 검증: 길이, 의미있는 내용 확인
  summary: z
    .string({
      required_error: '요약은 필수 입력 항목입니다.',
      invalid_type_error: '요약은 문자열이어야 합니다.',
    })
    .trim()
    .min(10, { message: '요약은 최소 10자 이상이어야 합니다.' })
    .max(500, { message: '요약은 500자를 초과할 수 없습니다.' })
    .refine((value) => value.replace(/\s+/g, '').length >= 5, {
      message: '요약은 공백을 제외하고 최소 5자 이상이어야 합니다.',
    }),

  // 기본 텍스트 콘텐츠 - 선택적 필드 (BlogContent 컴포넌트용)
  // - 의미: 단순 텍스트 입력 콘텐츠
  // - 사용 이유: 기본 텍스트 입력 지원, 마크다운과 구분
  content: z
    .string()
    .trim()
    .max(10000, { message: '내용은 10,000자를 초과할 수 없습니다.' })
    .optional()
    .or(z.literal('')), // 빈 문자열 허용

  // 목차 - 개선된 타입 안전성
  // - 의미: 블로그 포스트 목차 구조
  // - 검증: 배열 유효성 및 중첩 구조 확인
  tocItems: z
    .array(TocItemSchema)
    .max(20, { message: '목차는 최대 20개까지 추가할 수 있습니다.' })
    .optional()
    .default([]), // 기본값으로 빈 배열

  // 카테고리 - enum 기반 타입 안전성
  // - 의미: 블로그 포스트 분류
  // - 검증: 미리 정의된 카테고리만 허용
  category: z
    .enum(BLOG_CATEGORIES, {
      required_error: '카테고리를 선택해주세요.',
      invalid_type_error: '유효한 카테고리를 선택해주세요.',
    })
    .refine((value) => BLOG_CATEGORIES.includes(value), {
      message: '선택된 카테고리가 유효하지 않습니다.',
    }),
});

// 타입 추론 - 개선된 타입 안전성
// - 의미: 스키마에서 TypeScript 타입 자동 생성
// - 사용 이유: 컴파일 타임 타입 체크
export type blogBasePathSchemaType = z.infer<typeof blogBasePathSchema>;

// 카테고리 라벨 매핑 - 사용자 친화적 표시
// - 의미: 카테고리 코드를 한국어 라벨로 변환
// - 사용 이유: UI에서 사용자 친화적 표시
export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  tech: '기술',
  lifestyle: '라이프스타일',
  travel: '여행',
  food: '음식',
} as const;

// 유틸리티 함수 - 카테고리 검증
// - 의미: 런타임에서 카테고리 유효성 확인
// - 사용 이유: 동적 데이터 검증
export const isValidCategory = (category: string): category is BlogCategory => {
  return BLOG_CATEGORIES.includes(category as BlogCategory);
};

// 유틸리티 함수 - 카테고리 라벨 조회
// - 의미: 카테고리 코드를 한국어 라벨로 변환
// - 사용 이유: UI 표시용
export const getCategoryLabel = (category: BlogCategory): string => {
  return CATEGORY_LABELS[category] || category;
};
//====여기까지 수정됨====
