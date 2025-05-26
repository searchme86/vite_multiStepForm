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
import { blogBasePathSchema } from '../basicFormSection/schema/blogBasePathSchema';
import { blogContentPathSchema } from '../basicFormSection/schema/blogContentPathSchema';
import { blogCommonPathSchema } from '../basicFormSection/schema/blogCommonPathSchema';
import { blogMediaPathSchema } from '../basicFormSection/schema/blogMediaPathSchema';

// 스키마: 블로그 포스트 폼 데이터
// - 의미: 폼 입력값의 유효성 검사 규칙
// - 사용 이유: 데이터 무결성 및 사용자 피드백 제공
// - Fallback: 기본값으로 빈 문자열 또는 배열
export const blogPostSchema = blogBasePathSchema
  .merge(blogContentPathSchema)
  .merge(blogCommonPathSchema)
  .merge(blogMediaPathSchema);

// 타입: 블로그 포스트 폼 데이터
// - 의미: 폼 데이터의 TypeScript 타입
// - 사용 이유: 타입 안전성 보장
export type BlogPostFormData = z.infer<typeof blogPostSchema>;
