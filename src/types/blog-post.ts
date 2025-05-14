// types/blog-post.ts: 블로그 포스트 폼 데이터 타입 정의
// - 의미: 폼 데이터의 구조와 유효성 검사 스키마 정의
// - 사용 이유: 타입 안전성과 데이터 무결성 보장
// - 비유: 블로그 포스트의 설계도, 각 부분의 규격 명시
// - 작동 메커니즘:
//   1. TypeScript 인터페이스로 폼 데이터 구조 정의
//   2. Zod로 유효성 검사 스키마 생성
//   3. 폼 필드별 타입과 제약 조건 명시
// - 관련 키워드: TypeScript, Zod, react-hook-form

import { z } from 'zod';

// 스키마: 블로그 포스트 폼 데이터
// - 의미: 폼 입력값의 유효성 검사 규칙
// - 사용 이유: 데이터 무결성 및 사용자 피드백 제공
// - Fallback: 기본값으로 빈 문자열 또는 배열
export const blogPostSchema = z.object({
  // 제목
  // - 의미: 포스트 제목
  // - 사용 이유: 필수 입력 필드
  title: z
    .string()
    .min(5, { message: '제목은 최소 5자 이상이어야 합니다.' })
    .max(100, { message: '제목은 100자를 초과할 수 없습니다.' }),
  // 요약
  // - 의미: 포스트 요약
  // - 사용 이유: 필수 입력 필드
  summary: z
    .string()
    .min(10, { message: '요약은 최소 10자 이상이어야 합니다.' })
    .max(500, { message: '요약은 500자를 초과할 수 없습니다.' }),
  // 내용
  // - 의미: 포스트 본문
  // - 사용 이유: 선택적 입력 필드
  content: z.string().optional(),
  // 마크다운
  // - 의미: 마크다운 형식 본문
  // - 사용 이유: 포스트 콘텐츠 작성
  markdown: z.string().optional(),
  // 검색어
  // - 의미: 미리보기에서 강조할 검색어
  // - 사용 이유: 텍스트 검색 기능
  searchTerm: z.string().optional(),
  // 카테고리
  // - 의미: 포스트 분류
  // - 사용 이유: 필수 입력 필드
  category: z
    .string()
    .min(1, { message: '카테고리를 선택해주세요.' })
    .refine(
      (value) => ['tech', 'lifestyle', 'travel', 'food'].includes(value),
      { message: '유효한 카테고리를 선택해주세요.' }
    ),
  // 태그
  // - 의미: 포스트 태그 목록
  // - 사용 이유: 포스트 검색 및 분류
  tags: z
    .array(z.string())
    .min(1, { message: '최소 1개의 태그를 추가해주세요.' })
    .max(5, { message: '태그는 최대 5개까지 추가할 수 있습니다.' }),
  // 대표 이미지
  // - 의미: 포스트 이미지 파일
  // - 사용 이유: 시각적 콘텐츠 제공
  coverImage: z
    .array(z.any())
    .min(1, { message: '최소 1개의 이미지를 업로드해주세요.' })
    .max(10, { message: '이미지는 최대 10개까지 업로드할 수 있습니다.' }),
  // 게시 날짜
  // - 의미: 포스트 게시 날짜
  // - 사용 이유: 게시 일정 관리
  publishDate: z.date().optional(),
  // 초안 여부
  // - 의미: 초안 저장 여부
  // - 사용 이유: 임시 저장 관리
  isDraft: z.boolean(),
  // 공개 여부
  // - 의미: 포스트 공개 설정
  // - 사용 이유: 공개/비공개 관리
  isPublic: z.boolean(),
});

// 타입: 블로그 포스트 폼 데이터
// - 의미: 폼 데이터의 TypeScript 타입
// - 사용 이유: 타입 안전성 보장
export type BlogPostFormData = z.infer<typeof blogPostSchema>;
