//====여기부터 수정됨====
// blogContentPathSchema.ts - 블로그 콘텐츠 스키마 (richTextContent 추가)
// - 의미: 블로그 포스트의 콘텐츠 관련 필드 검증
// - 사용 이유: 마크다운, 리치텍스트, 태그, 검색어의 유효성 검사
// - 비유: 책의 본문 내용과 색인을 확인하는 체크리스트
// - 작동 메커니즘:
//   1. 마크다운과 리치텍스트 분리 관리
//   2. 태그 배열 검증 (개수 제한, 중복 방지)
//   3. 검색어 형식 검증
//   4. 선택적 필드와 필수 필드 구분
// - 관련 키워드: zod, markdown, rich text, tags, validation

import { z } from 'zod';

// 태그 검증 스키마 - 개선된 유효성 검사
// - 의미: 개별 태그의 형식 및 내용 검증
// - 사용 이유: 일관된 태그 형식 유지
const tagSchema = z
  .string({
    required_error: '태그는 문자열이어야 합니다.',
    invalid_type_error: '태그는 문자열이어야 합니다.',
  })
  .trim()
  .min(1, { message: '태그는 최소 1자 이상이어야 합니다.' })
  .max(20, { message: '태그는 20자를 초과할 수 없습니다.' })
  .refine((value) => /^[a-zA-Z0-9가-힣\s-_]+$/.test(value), {
    message:
      '태그는 영문, 숫자, 한글, 공백, 하이픈, 언더스코어만 사용할 수 있습니다.',
  })
  .refine((value) => !value.startsWith('#'), {
    message: '태그에 # 기호는 자동으로 추가되므로 입력하지 마세요.',
  });

// 블로그 콘텐츠 경로 스키마 - richTextContent 추가
// - 의미: 블로그 포스트 콘텐츠 관련 필드 검증
// - 사용 이유: 다양한 콘텐츠 형식 지원 및 데이터 무결성 보장
export const blogContentPathSchema = z.object({
  // 마크다운 - 휘발성 상태 (미리보기 전용)
  // - 의미: 마크다운 형식 본문 (임시 저장)
  // - 사용 이유: 미리보기 렌더링, 브라우저 리프레시 시 초기화
  markdown: z
    .string()
    .max(100000, { message: '마크다운 내용은 100,000자를 초과할 수 없습니다.' })
    .optional()
    .or(z.literal('')), // 빈 문자열 허용

  // 리치텍스트 콘텐츠 - 영구 저장 (마크다운 편집기 전용)
  // - 의미: 마크다운 편집기에서 작성한 HTML 형식 리치텍스트
  // - 사용 이유: 멀티스텝폼에서 접근, localStorage 저장
  richTextContent: z
    .string()
    .max(100000, {
      message: '리치텍스트 내용은 100,000자를 초과할 수 없습니다.',
    })
    .optional()
    .or(z.literal('')) // 빈 문자열 허용
    .refine(
      (value) => {
        if (!value) return true; // 선택적 필드이므로 빈 값 허용
        // 기본적인 HTML 태그 검증 (보안상 위험한 태그 차단)
        const dangerousTags =
          /<(script|iframe|object|embed|form|input|textarea|button|select|option|link|meta|base|style|title|head|html|body)[^>]*>/gi;
        return !dangerousTags.test(value);
      },
      { message: '리치텍스트에 위험한 HTML 태그가 포함되어 있습니다.' }
    ),

  // 검색어 - 휘발성 상태 (미리보기 검색 전용)
  // - 의미: 미리보기에서 강조할 검색어
  // - 사용 이유: 텍스트 검색 및 하이라이트 기능
  searchTerm: z
    .string()
    .trim()
    .max(100, { message: '검색어는 100자를 초과할 수 없습니다.' })
    .optional()
    .or(z.literal('')) // 빈 문자열 허용
    .refine(
      (value) => {
        if (!value) return true; // 선택적 필드이므로 빈 값 허용
        // 특수문자 제한 (검색 안전성)
        return /^[a-zA-Z0-9가-힣\s\-_]+$/.test(value);
      },
      {
        message:
          '검색어는 영문, 숫자, 한글, 공백, 하이픈, 언더스코어만 사용할 수 있습니다.',
      }
    ),

  // 태그 - 개선된 배열 검증
  // - 의미: 블로그 포스트 태그 목록
  // - 검증: 개수 제한, 중복 방지, 형식 검사
  tags: z
    .array(tagSchema, {
      required_error: '태그는 배열이어야 합니다.',
      invalid_type_error: '태그는 배열이어야 합니다.',
    })
    .min(1, { message: '최소 1개의 태그를 추가해주세요.' })
    .max(5, { message: '태그는 최대 5개까지 추가할 수 있습니다.' })
    .refine(
      (tags) => {
        // 중복 태그 검사 (대소문자 구분 없음)
        const normalizedTags = tags.map((tag) => tag.toLowerCase().trim());
        const uniqueTags = new Set(normalizedTags);
        return normalizedTags.length === uniqueTags.size;
      },
      { message: '중복된 태그가 있습니다. 각 태그는 고유해야 합니다.' }
    )
    .refine(
      (tags) => {
        // 태그 총 길이 제한 (UI 표시 최적화)
        const totalLength = tags.join('').length;
        return totalLength <= 100;
      },
      { message: '모든 태그의 총 길이는 100자를 초과할 수 없습니다.' }
    ),
});

// 타입 추론 - 개선된 타입 안전성
// - 의미: 스키마에서 TypeScript 타입 자동 생성
// - 사용 이유: 컴파일 타임 타입 체크
export type blogContentPathSchemaType = z.infer<typeof blogContentPathSchema>;

// 유틸리티 함수 - 태그 정규화
// - 의미: 태그 형식을 일관되게 정리
// - 사용 이유: 사용자 입력 정규화
export const normalizeTag = (tag: string): string => {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // 공백을 하이픈으로 변환
    .replace(/[^a-zA-Z0-9가-힣\-_]/g, ''); // 허용되지 않는 문자 제거
};

// 유틸리티 함수 - 태그 배열 정규화
// - 의미: 태그 배열을 일관되게 정리
// - 사용 이유: 중복 제거 및 형식 통일
export const normalizeTags = (tags: string[]): string[] => {
  const normalizedTags = tags.map(normalizeTag).filter((tag) => tag.length > 0); // 빈 태그 제거

  // 중복 제거 (대소문자 구분 없음)
  return Array.from(new Set(normalizedTags));
};

// 유틸리티 함수 - 콘텐츠 길이 계산
// - 의미: HTML 태그를 제외한 실제 콘텐츠 길이 계산
// - 사용 이유: 사용자에게 정확한 글자 수 표시
export const getContentLength = (htmlContent: string): number => {
  if (!htmlContent) return 0;

  try {
    // HTML 태그 제거 후 텍스트 길이 계산
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const textContent = doc.body.textContent || doc.body.innerText || '';
    return textContent.trim().length;
  } catch (error) {
    // 파싱 실패 시 원본 길이 반환
    console.warn('Failed to parse HTML content:', error);
    return htmlContent.length;
  }
};

// 유틸리티 함수 - 콘텐츠 미리보기 생성
// - 의미: 긴 콘텐츠를 요약 형태로 변환
// - 사용 이유: UI에서 간략한 미리보기 표시
export const createContentPreview = (
  content: string,
  maxLength: number = 150
): string => {
  if (!content) return '';

  try {
    // HTML 태그 제거
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const textContent = doc.body.textContent || doc.body.innerText || '';

    if (textContent.length <= maxLength) return textContent;

    // 단어 경계에서 자르기
    const truncated = textContent.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    return lastSpaceIndex > maxLength * 0.8
      ? truncated.substring(0, lastSpaceIndex) + '...'
      : truncated + '...';
  } catch (error) {
    console.warn('Failed to create content preview:', error);
    return content.substring(0, maxLength) + '...';
  }
};
//====여기까지 수정됨====
