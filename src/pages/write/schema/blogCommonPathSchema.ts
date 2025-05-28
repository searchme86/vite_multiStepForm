//====여기부터 수정됨====
// blogCommonPathSchema.ts - 블로그 공통 스키마 (타입 안전성 개선)
// - 의미: 블로그 포스트의 게시 관련 공통 필드 검증
// - 사용 이유: 게시 날짜, 초안 상태, 공개 설정의 유효성 검사
// - 비유: 책의 출간 정보 (출간일, 초안 여부, 공개 설정)를 관리하는 체크리스트
// - 작동 메커니즘:
//   1. 날짜 검증 및 미래/과거 날짜 제한
//   2. 불린 값 엄격한 타입 검증
//   3. 비즈니스 로직 검증 (초안과 공개 설정 조합)
//   4. 기본값 설정으로 사용자 경험 개선
// - 관련 키워드: zod, date validation, boolean, business logic

import { z } from 'zod';

// 날짜 관련 상수 - 비즈니스 로직 제한
// - 의미: 게시 날짜의 허용 범위 정의
// - 사용 이유: 합리적인 날짜 범위 제한
export const DATE_LIMITS = {
  // 최소 날짜: 1년 전
  MIN_DATE: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  // 최대 날짜: 1년 후
  MAX_DATE: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
} as const;

// 블로그 공통 경로 스키마 - 개선된 검증
// - 의미: 블로그 포스트 게시 관련 공통 필드 검증
// - 사용 이유: 일관된 게시 정책 및 데이터 무결성 보장
export const blogCommonPathSchema = z
  .object({
    // 게시 날짜 - 강화된 날짜 검증
    // - 의미: 포스트 게시 예정 날짜
    // - 검증: 유효한 날짜 범위, 비즈니스 로직
    publishDate: z
      .date({
        required_error: '게시 날짜를 선택해주세요.',
        invalid_type_error: '올바른 날짜 형식이 아닙니다.',
      })
      .min(DATE_LIMITS.MIN_DATE, {
        message: `게시 날짜는 ${DATE_LIMITS.MIN_DATE.toLocaleDateString(
          'ko-KR'
        )} 이후여야 합니다.`,
      })
      .max(DATE_LIMITS.MAX_DATE, {
        message: `게시 날짜는 ${DATE_LIMITS.MAX_DATE.toLocaleDateString(
          'ko-KR'
        )} 이전이어야 합니다.`,
      })
      .refine(
        (date) => {
          // 과거 날짜 허용하되, 너무 오래된 날짜는 제한
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          return date >= oneYearAgo;
        },
        { message: '1년 이상 과거의 날짜는 설정할 수 없습니다.' }
      )
      .optional(),

    // 초안 여부 - 엄격한 불린 검증
    // - 의미: 포스트 초안 저장 여부
    // - 검증: 불린 타입 강제, 기본값 설정
    isDraft: z
      .boolean({
        required_error: '초안 여부를 설정해주세요.',
        invalid_type_error: '초안 여부는 true 또는 false여야 합니다.',
      })
      .default(false), // 기본값: 초안 아님

    // 공개 여부 - 엄격한 불린 검증
    // - 의미: 포스트 공개 설정
    // - 검증: 불린 타입 강제, 기본값 설정
    isPublic: z
      .boolean({
        required_error: '공개 여부를 설정해주세요.',
        invalid_type_error: '공개 여부는 true 또는 false여야 합니다.',
      })
      .default(true), // 기본값: 공개

    // 예약 게시 여부 - 선택적 필드
    // - 의미: 미래 날짜로 예약 게시 설정 여부
    // - 사용 이유: 콘텐츠 스케줄링 기능
    isScheduled: z.boolean().default(false).optional(),

    // 최종 수정 날짜 - 자동 생성 필드
    // - 의미: 포스트 마지막 수정 시간
    // - 사용 이유: 버전 관리 및 수정 이력 추적
    lastModified: z
      .date()
      .default(() => new Date()) // 현재 시간으로 기본값
      .optional(),

    // 작성자 ID - 선택적 필드
    // - 의미: 포스트 작성자 식별자
    // - 사용 이유: 다중 사용자 환경에서 작성자 추적
    authorId: z
      .string()
      .uuid({ message: '올바른 작성자 ID 형식이 아닙니다.' })
      .optional(),

    // 게시 상태 - enum 기반 상태 관리
    // - 의미: 포스트의 현재 상태
    // - 사용 이유: 워크플로우 관리
    status: z
      .enum(['draft', 'review', 'published', 'archived'], {
        required_error: '게시 상태를 설정해주세요.',
        invalid_type_error: '유효한 게시 상태를 선택해주세요.',
      })
      .default('draft'), // 기본값: 초안

    // 조회수 - 선택적 필드
    // - 의미: 포스트 조회 횟수
    // - 사용 이유: 인기도 측정
    viewCount: z
      .number()
      .int({ message: '조회수는 정수여야 합니다.' })
      .min(0, { message: '조회수는 0 이상이어야 합니다.' })
      .default(0)
      .optional(),
  })
  // 교차 검증 - 비즈니스 로직
  // - 의미: 필드 간 상호 관계 검증
  // - 사용 이유: 일관된 데이터 상태 보장
  .refine(
    (data) => {
      // 초안이 아니면서 비공개인 경우 검증
      if (!data.isDraft && !data.isPublic) {
        return false; // 발행된 포스트는 공개되어야 함
      }
      return true;
    },
    {
      message: '발행된 포스트는 공개 설정이 필요합니다.',
      path: ['isPublic'], // 에러 표시 위치
    }
  )
  .refine(
    (data) => {
      // 예약 게시인 경우 미래 날짜 필요
      if (data.isScheduled && data.publishDate) {
        const now = new Date();
        return data.publishDate > now;
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
      // 아카이브된 포스트는 이미 발행되었어야 함
      if (data.status === 'archived') {
        return !data.isDraft;
      }
      return true;
    },
    {
      message: '아카이브된 포스트는 초안 상태일 수 없습니다.',
      path: ['status'],
    }
  );

// 타입 추론 - 개선된 타입 안전성
// - 의미: 스키마에서 TypeScript 타입 자동 생성
// - 사용 이유: 컴파일 타임 타입 체크
export type blogCommonPathSchemaType = z.infer<typeof blogCommonPathSchema>;

// 게시 상태 타입 정의
// - 의미: 포스트 상태의 가능한 값들
// - 사용 이유: 타입 안전한 상태 관리
export type PostStatus = 'draft' | 'review' | 'published' | 'archived';

// 상태별 라벨 매핑 - 사용자 친화적 표시
// - 의미: 상태 코드를 한국어 라벨로 변환
// - 사용 이유: UI에서 사용자 친화적 표시
export const STATUS_LABELS: Record<PostStatus, string> = {
  draft: '초안',
  review: '검토 중',
  published: '발행됨',
  archived: '보관됨',
} as const;

// 유틸리티 함수 - 상태 검증
// - 의미: 런타임에서 포스트 상태 유효성 확인
// - 사용 이유: 동적 데이터 검증
export const isValidPostStatus = (status: string): status is PostStatus => {
  return ['draft', 'review', 'published', 'archived'].includes(status);
};

// 유틸리티 함수 - 상태 라벨 조회
// - 의미: 상태 코드를 한국어 라벨로 변환
// - 사용 이유: UI 표시용
export const getStatusLabel = (status: PostStatus): string => {
  return STATUS_LABELS[status] || status;
};

// 유틸리티 함수 - 게시 가능 여부 확인 (타입 안전성 개선)
// - 의미: 포스트가 게시 가능한 상태인지 확인
// - 사용 이유: 게시 버튼 활성화 조건
export const canPublish = (
  data: Partial<blogCommonPathSchemaType>
): boolean => {
  // 타입 가드로 undefined 처리
  const isDraft = data.isDraft ?? true; // undefined면 true로 간주
  const isPublic = data.isPublic ?? false; // undefined면 false로 간주
  const status = data.status ?? 'draft';

  // 초안이 아니고, 공개 설정이며, 검토 완료 상태
  return !isDraft && isPublic && status !== 'draft';
};

// 유틸리티 함수 - 예약 게시 가능 여부 확인
// - 의미: 예약 게시 설정이 가능한지 확인
// - 사용 이유: 예약 게시 UI 활성화 조건
export const canSchedule = (
  publishDate?: Date,
  isDraft: boolean = false
): boolean => {
  if (!publishDate || isDraft) return false;
  const now = new Date();
  return publishDate > now;
};

// 유틸리티 함수 - 상대 시간 표시
// - 의미: 날짜를 상대적 시간으로 변환
// - 사용 이유: 사용자 친화적 시간 표시
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}일 전`;

  return date.toLocaleDateString('ko-KR');
};

// 유틸리티 함수 - 기본값 생성
// - 의미: 새 포스트의 기본 공통 필드 값 생성
// - 사용 이유: 폼 초기화
export const createDefaultCommonFields = (): blogCommonPathSchemaType => {
  return {
    isDraft: true,
    isPublic: true,
    isScheduled: false,
    status: 'draft',
    viewCount: 0,
    lastModified: new Date(),
  };
};
//====여기까지 수정됨====
