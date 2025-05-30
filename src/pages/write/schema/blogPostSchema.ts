//====여기부터 수정됨====
// blogPostSchema.ts - 블로그 포스트 통합 스키마 (완전한 타입 안전성)
// - 의미: 모든 블로그 포스트 관련 스키마를 통합한 최종 검증 스키마
// - 사용 이유: 전체 폼 데이터 검증 및 타입 안전성 보장
// - 비유: 책의 모든 요소 (내용, 삽화, 출간 정보)를 종합한 완성본 검수서
// - 작동 메커니즘:
//   1. 각 섹션별 스키마를 intersection으로 통합
//   2. 전체 데이터 교차 검증
//   3. richTextContent 필드 추가로 마크다운 편집기 지원
//   4. any 타입 완전 제거 및 타입 안전성 보장
// - 관련 키워드: zod, schema intersection, type safety, validation, typescript

import { z } from 'zod';
import { blogBasePathSchema } from './blogBasePathSchema';
import { blogContentPathSchema } from './blogContentPathSchema';
import { blogCommonPathSchema } from './blogCommonPathSchema';
import { blogMediaPathSchema } from './blogMediaPathSchema';

// 블로그 포스트 최종 스키마 - 완전한 통합 (intersection 사용)
// - 의미: 모든 섹션의 스키마를 하나로 통합
// - 사용 이유: 전체 폼 데이터의 일관성 및 완정성 보장
// - 수정사항: merge 대신 intersection 사용으로 ZodEffects 호환성 해결
const blogPostBaseSchema = z.intersection(
  z.intersection(
    z.intersection(blogBasePathSchema, blogContentPathSchema),
    blogCommonPathSchema
  ),
  blogMediaPathSchema
);

// 최종 스키마에 전체 데이터 교차 검증 추가
export const blogPostSchema = blogPostBaseSchema
  // 전체 데이터 교차 검증 - 비즈니스 로직
  // - 의미: 개별 필드뿐만 아니라 필드 간 관계도 검증
  // - 사용 이유: 일관된 데이터 상태 보장
  .refine(
    (data) => {
      // 발행된 포스트는 제목과 요약이 필수
      if (data.status === 'published' && (!data.title || !data.summary)) {
        return false;
      }
      return true;
    },
    {
      message: '발행된 포스트는 제목과 요약이 필수입니다.',
      path: ['title'], // 주 에러 표시 위치
    }
  )
  .refine(
    (data) => {
      // 발행된 포스트는 최소 하나의 콘텐츠가 있어야 함
      const hasBasicContent = data.content && data.content.trim().length > 0;
      const hasRichContent =
        data.richTextContent && data.richTextContent.trim().length > 0;
      const hasMarkdown = data.markdown && data.markdown.trim().length > 0;

      if (
        data.status === 'published' &&
        !hasBasicContent &&
        !hasRichContent &&
        !hasMarkdown
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        '발행된 포스트는 최소 하나의 콘텐츠(텍스트, 리치텍스트, 또는 마크다운)가 필요합니다.',
      path: ['content'],
    }
  )
  .refine(
    (data) => {
      // 예약 게시 시 미래 날짜 필수
      if (
        data.isScheduled &&
        (!data.publishDate || data.publishDate <= new Date())
      ) {
        return false;
      }
      return true;
    },
    {
      message: '예약 게시는 미래 날짜로 설정해야 합니다.',
      path: ['publishDate'],
    }
  )
  .refine(
    (data) => {
      // 공개 포스트는 최소 하나의 이미지 권장 (경고 수준)
      // 타입 가드로 coverImage 확인
      if (
        data.isPublic &&
        data.status === 'published' &&
        Array.isArray(data.coverImage) &&
        data.coverImage.length === 0
      ) {
        // 이는 hard validation이 아닌 권장사항으로 처리
        return true; // 현재는 통과시키고, UI에서 경고 표시
      }
      return true;
    },
    {
      message: '공개 포스트에는 대표 이미지를 추가하는 것을 권장합니다.',
      path: ['coverImage'],
    }
  );

// 타입 추론 - 완전한 타입 안전성
// - 의미: 통합 스키마에서 TypeScript 타입 자동 생성
// - 사용 이유: 컴파일 타임 타입 체크 및 IDE 지원
export type blogPostSchemaType = z.infer<typeof blogPostSchema>;

// 부분 타입 정의 - 단계별 폼을 위한 유틸리티
// - 의미: 멀티스텝 폼의 각 단계에서 사용할 부분 타입
// - 사용 이유: 단계별 검증 및 타입 안전성
export type BlogPostBasicData = Pick<
  blogPostSchemaType,
  'title' | 'summary' | 'content' | 'tocItems' | 'category'
>;

export type BlogPostContentData = Pick<
  blogPostSchemaType,
  'markdown' | 'richTextContent' | 'searchTerm' | 'tags'
>;

export type BlogPostMediaData = Pick<blogPostSchemaType, 'coverImage'>;

export type BlogPostCommonData = Pick<
  blogPostSchemaType,
  'publishDate' | 'isDraft' | 'isPublic' | 'isScheduled' | 'status' | 'authorId'
>;

// 폼 데이터 타입 - 호환성을 위한 별칭
// - 의미: 기존 코드와의 호환성 유지
// - 사용 이유: 점진적 마이그레이션 지원
export type BlogPostFormData = blogPostSchemaType;

// 유틸리티 함수 - 스키마 검증
// - 의미: 런타임에서 데이터 검증
// - 사용 이유: 폼 제출 전 검증
export const validateBlogPost = (
  data: unknown
):
  | { success: true; data: blogPostSchemaType }
  | { success: false; error: z.ZodError } => {
  const result = blogPostSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
};

// 유틸리티 함수 - 부분 검증 (단계별 폼용) - 제네릭 타입 제거
// - 의미: 멀티스텝 폼의 각 단계별 검증
// - 사용 이유: 단계별 진행 시 해당 섹션만 검증
export const validateBlogPostSection = (
  data: unknown,
  section: 'basic' | 'content' | 'media' | 'common'
): { success: boolean; error?: z.ZodError } => {
  try {
    switch (section) {
      case 'basic':
        blogBasePathSchema.parse(data);
        break;
      case 'content':
        blogContentPathSchema.parse(data);
        break;
      case 'media':
        blogMediaPathSchema.parse(data);
        break;
      case 'common':
        blogCommonPathSchema.parse(data);
        break;
      default:
        throw new Error(`Unknown section: ${section}`);
    }
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};

// 유틸리티 함수 - 기본값 생성
// - 의미: 새 블로그 포스트의 기본값 생성
// - 사용 이유: 폼 초기화 및 기본 상태 설정
export const createDefaultBlogPost = (): Partial<blogPostSchemaType> => {
  return {
    // 기본 정보
    title: '',
    summary: '',
    content: '',
    category: 'tech', // 기본 카테고리
    tocItems: [],

    // 콘텐츠
    markdown: '',
    richTextContent: '',
    searchTerm: '',
    tags: [],

    // 미디어
    coverImage: [],

    // 공통 설정
    isDraft: true,
    isPublic: true,
    isScheduled: false,
    status: 'draft',
    viewCount: 0,
    lastModified: new Date(),
  };
};

// 유틸리티 함수 - 폼 데이터 정리 (타입 안전성 개선)
// - 의미: 제출 전 데이터 정리 및 최적화
// - 사용 이유: 불필요한 데이터 제거 및 형식 통일
// ====수정된 sanitizeBlogPostData 함수====
export const sanitizeBlogPostData = (
  data: blogPostSchemaType
): blogPostSchemaType => {
  return {
    ...data,
    // 문자열 필드 정리
    title: data.title.trim(),
    summary: data.summary.trim(),
    content: data.content?.trim() || '',
    richTextContent: data.richTextContent?.trim() || '',
    markdown: data.markdown?.trim() || '',
    searchTerm: data.searchTerm?.trim() || '',

    // ====태그 정리 수정====
    // toLowerCase() 제거 - 원본 대소문자 유지
    tags: Array.from(
      new Set(
        data.tags
          .map((tag: string) => tag.trim()) // toLowerCase() 제거
          .filter((tag: string) => tag.length > 0)
      )
    ),
    // ====태그 정리 수정 끝====

    // 날짜 정리
    lastModified: new Date(),
  };
};

// 유틸리티 함수 - 콘텐츠 길이 계산
// - 의미: 모든 콘텐츠 필드의 총 길이 계산
// - 사용 이유: 콘텐츠 분량 확인
export const calculateContentLength = (
  data: blogPostSchemaType
): {
  basicContent: number;
  richTextContent: number;
  markdownContent: number;
  totalContent: number;
} => {
  const basicContent = data.content?.trim().length || 0;

  // 리치텍스트는 HTML 태그 제거 후 계산
  let richTextContent = 0;
  if (data.richTextContent) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.richTextContent, 'text/html');
      richTextContent = (doc.body.textContent || '').trim().length;
    } catch {
      richTextContent = data.richTextContent.length;
    }
  }

  const markdownContent = data.markdown?.trim().length || 0;
  const totalContent = basicContent + richTextContent + markdownContent;

  return {
    basicContent,
    richTextContent,
    markdownContent,
    totalContent,
  };
};

// 유틸리티 함수 - 발행 준비 상태 확인 (타입 가드 추가)
// - 의미: 포스트가 발행 가능한 상태인지 종합 확인
// - 사용 이유: 발행 버튼 활성화 및 사용자 가이드
export const checkPublishReadiness = (
  data: blogPostSchemaType
): {
  isReady: boolean;
  missingFields: string[];
  warnings: string[];
} => {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // 필수 필드 확인
  if (!data.title?.trim()) missingFields.push('제목');
  if (!data.summary?.trim()) missingFields.push('요약');
  if (!data.category) missingFields.push('카테고리');
  if (data.tags.length === 0) missingFields.push('태그 (최소 1개)');

  // 콘텐츠 확인
  const contentLength = calculateContentLength(data);
  if (contentLength.totalContent === 0) {
    missingFields.push('콘텐츠 (텍스트, 리치텍스트, 또는 마크다운)');
  }

  // 권장사항 확인 - 타입 가드 추가
  if (Array.isArray(data.coverImage) && data.coverImage.length === 0) {
    warnings.push('대표 이미지를 추가하면 더 매력적인 포스트가 됩니다.');
  }

  if (data.summary.length < 50) {
    warnings.push('요약을 좀 더 자세히 작성하면 독자에게 도움이 됩니다.');
  }

  if (contentLength.totalContent < 100) {
    warnings.push('콘텐츠가 다소 짧습니다. 더 자세한 내용을 추가해보세요.');
  }

  return {
    isReady: missingFields.length === 0,
    missingFields,
    warnings,
  };
};

// 유틸리티 함수 - 에러 메시지 한국어 변환
// - 의미: Zod 에러를 사용자 친화적 한국어로 변환
// - 사용 이유: 사용자 경험 개선
export const formatValidationErrors = (
  error: z.ZodError
): Record<string, string[]> => {
  const formattedErrors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(err.message);
  });

  return formattedErrors;
};

// 상수 - 콘텐츠 타입 우선순위
// - 의미: 여러 콘텐츠 필드가 있을 때 표시 우선순위
// - 사용 이유: 미리보기에서 어떤 콘텐츠를 먼저 보여줄지 결정
export const CONTENT_TYPE_PRIORITY = [
  'richTextContent', // 1순위: 리치텍스트 (마크다운 편집기)
  'content', // 2순위: 기본 텍스트
  'markdown', // 3순위: 마크다운
] as const;

// 유틸리티 함수 - 주 콘텐츠 선택
// - 의미: 여러 콘텐츠 중 표시할 주 콘텐츠 선택
// - 사용 이유: 미리보기 및 표시 로직
export const getPrimaryContent = (
  data: blogPostSchemaType
): {
  content: string;
  type: 'richTextContent' | 'content' | 'markdown' | 'none';
} => {
  for (const type of CONTENT_TYPE_PRIORITY) {
    const content = data[type];
    if (content && content.trim().length > 0) {
      return { content: content.trim(), type };
    }
  }

  return { content: '', type: 'none' };
};

// 유틸리티 함수 - 데이터 비교
// - 의미: 두 블로그 포스트 데이터의 변경사항 확인
// - 사용 이유: 저장 필요 여부 판단
export const hasDataChanged = (
  original: blogPostSchemaType,
  current: blogPostSchemaType
): boolean => {
  // 날짜 필드는 비교에서 제외 (자동 생성되므로)
  const { lastModified: _, ...originalData } = original;
  const { lastModified: __, ...currentData } = current;

  return JSON.stringify(originalData) !== JSON.stringify(currentData);
};
//====여기까지 수정됨====
