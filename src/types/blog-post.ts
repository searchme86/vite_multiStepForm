//====여기부터 수정됨====
// blog-post.ts: 블로그 포스트 폼 데이터의 타입과 스키마 정의
// - 의미: 폼 데이터 구조와 유효성 검사 규칙 정의
// - 사용 이유: TypeScript 타입 안정성과 Zod 유효성 검사 통합
// - 비유: 블로그 포스트의 설계도, 각 부분(제목, 내용 등)의 규격 명시
// - 작동 메커니즘:
//   1. BlogPostFormData 인터페이스로 폼 데이터 타입 정의
//   2. blogPostSchema로 Zod를 사용해 유효성 검사 규칙 정의
//   3. react-hook-form과 통합하여 폼 데이터 관리
// - 관련 키워드: TypeScript, Zod, react-hook-form, schema validation

import { z } from 'zod';

// 인터페이스: 블로그 포스트 폼 데이터
// - 의미: 폼 필드의 TypeScript 타입 정의
// - 사용 이유: 타입 안정성 보장, IDE 자동완성 지원
export interface BlogPostFormData {
  title: string; // 포스트 제목
  summary: string; // 포스트 요약 (신규)
  content: string | undefined; // 포스트 내용 (optional로 변경)
  markdown: string | undefined; // 마크다운 내용 (신규, optional)
  category: string; // 포스트 카테고리
  tags: string[]; // 포스트 태그
  coverImage: Array<{
    file?: File; // 업로드된 파일
    preview?: string; // 미리보기 URL
    name?: string; // 파일 이름
    size?: number; // 파일 크기
  }>; // 대표 이미지
  publishDate?: Date; // 게시 날짜
  isDraft: boolean; // 초안 여부
  isPublic: boolean; // 공개 여부
}

// Zod 스키마: 블로그 포스트 폼 유효성 검사
// - 의미: 폼 데이터의 유효성 검사 규칙 정의
// - 사용 이유: 사용자 입력 검증, 오류 메시지 제공
// - Fallback: 기본값 및 optional 처리로 유효성 검사 실패 방지
export const blogPostSchema = z.object({
  // 제목
  // - 의미: 포스트 제목 입력 검증
  // - 사용 이유: 제목은 필수, 길이 제한
  title: z
    .string()
    .min(5, { message: '제목은 최소 5자 이상이어야 합니다.' })
    .max(100, { message: '제목은 최대 100자 이하이어야 합니다.' }),

  // 요약 (신규)
  // - 의미: 포스트 요약 입력 검증
  // - 사용 이유: 요약은 필수, 최소 10자
  summary: z
    .string()
    .min(10, { message: '요약은 최소 10자 이상이어야 합니다.' })
    .max(500, { message: '요약은 최대 500자 이하이어야 합니다.' }),

  // 내용
  // - 의미: 포스트 본문 입력 검증
  // - 사용 이유: 내용은 선택 사항 (optional로 변경)
  content: z.string().optional(),

  // 마크다운 (신규)
  // - 의미: 마크다운 내용 입력 검증
  // - 사용 이유: 마크다운은 선택 사항
  markdown: z.string().optional(),

  // 카테고리
  // - 의미: 포스트 카테고리 선택 검증
  // - 사용 이유: 카테고리는 필수
  category: z.string().min(1, { message: '카테고리를 선택해주세요.' }),

  // 태그
  // - 의미: 포스트 태그 입력 검증
  // - 사용 이유: 태그는 최소 1개, 최대 5개
  tags: z
    .array(z.string())
    .min(1, { message: '최소 1개의 태그를 추가해주세요.' })
    .max(5, { message: '태그는 최대 5개까지 추가할 수 있습니다.' }),

  // 대표 이미지
  // - 의미: 업로드된 이미지 검증
  // - 사용 이유: 이미지는 최소 1개
  coverImage: z
    .array(
      z.object({
        file: z.instanceof(File).optional(),
        preview: z.string().optional(),
        name: z.string().optional(),
        size: z.number().optional(),
      })
    )
    .min(1, { message: '최소 1개의 이미지를 업로드해주세요.' }),

  // 게시 날짜
  // - 의미: 게시 날짜 입력 검증
  // - 사용 이유: 날짜는 선택 사항
  publishDate: z.date().optional(),

  // 초안 여부
  // - 의미: 초안 저장 설정
  // - 사용 이유: 기본값 false
  isDraft: z.boolean().default(false),

  // 공개 여부
  // - 의미: 공개 설정
  // - 사용 이유: 기본값 true
  isPublic: z.boolean().default(true),
});

// 타입: Zod 스키마로부터 유추된 타입
// - 의미: 스키마와 타입 동기화
// - 사용 이유: 타입 안전성 유지
export type BlogPostFormDataSchema = z.infer<typeof blogPostSchema>;
//====여기까지 수정됨====
