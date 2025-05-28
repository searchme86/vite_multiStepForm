//====여기부터 수정됨====
// blogMediaPathSchema.ts - 블로그 미디어 스키마 (any 타입 제거)
// - 의미: 블로그 포스트의 미디어 파일 검증
// - 사용 이유: 이미지 업로드 파일의 유효성 검사 및 타입 안전성 보장
// - 비유: 책의 삽화와 이미지를 확인하는 체크리스트
// - 작동 메커니즘:
//   1. File 객체 및 미리보기 URL 검증
//   2. 파일 크기, 형식, 개수 제한
//   3. 안전한 타입 정의로 any 타입 제거
//   4. 업로드된 파일의 메타데이터 검증
// - 관련 키워드: zod, file upload, image validation, type safety

import { z } from 'zod';

// 지원되는 이미지 형식 - 상수 정의
// - 의미: 허용되는 이미지 MIME 타입
// - 사용 이유: 타입 안전성 및 보안 강화
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

export type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

// 이미지 파일 크기 제한 - 상수 정의
// - 의미: 업로드 파일 크기 제한 (바이트 단위)
// - 사용 이유: 성능 최적화 및 저장 공간 관리
export const IMAGE_SIZE_LIMITS = {
  MIN_SIZE: 1024, // 1KB
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB (전체 이미지 합계)
} as const;

// 이미지 아이템 스키마 - any 타입 제거
// - 의미: 업로드된 개별 이미지 파일의 구조 정의
// - 사용 이유: 타입 안전성 보장 및 런타임 검증
const imageItemSchema = z.object({
  // 미리보기 URL - 선택적 필드
  // - 의미: 브라우저에서 생성된 미리보기 URL
  // - 검증: URL 형식 및 Data URI 형식 허용
  preview: z
    .string()
    .refine(
      (value) => {
        if (!value) return true; // 선택적 필드
        // Data URI 또는 Blob URL 형식 검증
        return /^(data:image\/[a-zA-Z+]+;base64,|blob:|https?:\/\/)/.test(
          value
        );
      },
      { message: '올바른 이미지 미리보기 URL 형식이 아닙니다.' }
    )
    .optional(),

  // 파일명 - 선택적 필드
  // - 의미: 원본 파일명
  // - 검증: 파일명 형식 및 확장자 확인
  name: z
    .string()
    .min(1, { message: '파일명은 최소 1자 이상이어야 합니다.' })
    .max(255, { message: '파일명은 255자를 초과할 수 없습니다.' })
    .refine(
      (value) => {
        if (!value) return true; // 선택적 필드
        // 안전한 파일명 검증 (보안상 위험한 문자 제거)
        return /^[a-zA-Z0-9가-힣.\-_\s()[\]]+$/.test(value);
      },
      { message: '파일명에 허용되지 않는 문자가 포함되어 있습니다.' }
    )
    .refine(
      (value) => {
        if (!value) return true;
        // 이미지 확장자 검증
        const imageExtensions = /\.(jpg|jpeg|png|webp|gif|svg)$/i;
        return imageExtensions.test(value);
      },
      { message: '지원되지 않는 이미지 파일 형식입니다.' }
    )
    .optional(),

  // 파일 크기 - 선택적 필드
  // - 의미: 파일 크기 (바이트 단위)
  // - 검증: 최소/최대 크기 제한
  size: z
    .number({
      invalid_type_error: '파일 크기는 숫자여야 합니다.',
    })
    .min(IMAGE_SIZE_LIMITS.MIN_SIZE, {
      message: `파일 크기는 최소 ${
        IMAGE_SIZE_LIMITS.MIN_SIZE / 1024
      }KB 이상이어야 합니다.`,
    })
    .max(IMAGE_SIZE_LIMITS.MAX_SIZE, {
      message: `파일 크기는 최대 ${
        IMAGE_SIZE_LIMITS.MAX_SIZE / (1024 * 1024)
      }MB를 초과할 수 없습니다.`,
    })
    .optional(),

  // 파일 타입 - 선택적 필드
  // - 의미: MIME 타입
  // - 검증: 지원되는 이미지 형식만 허용
  type: z
    .enum(SUPPORTED_IMAGE_TYPES, {
      invalid_type_error: '지원되지 않는 이미지 형식입니다.',
    })
    .optional(),

  // 업로드 상태 - 선택적 필드
  // - 의미: 파일 업로드 진행 상태
  // - 사용 이유: UI에서 업로드 진행률 표시
  uploadProgress: z
    .number()
    .min(0, { message: '업로드 진행률은 0% 이상이어야 합니다.' })
    .max(100, { message: '업로드 진행률은 100%를 초과할 수 없습니다.' })
    .optional(),

  // 업로드 에러 - 선택적 필드
  // - 의미: 업로드 실패 시 에러 메시지
  // - 사용 이유: 사용자에게 에러 상황 전달
  error: z
    .string()
    .max(500, { message: '에러 메시지는 500자를 초과할 수 없습니다.' })
    .optional(),

  // 파일 ID - 선택적 필드
  // - 의미: 서버에서 할당된 파일 고유 식별자
  // - 사용 이유: 업로드된 파일 관리
  fileId: z
    .string()
    .uuid({ message: '올바른 파일 ID 형식이 아닙니다.' })
    .optional(),
});

// 블로그 미디어 경로 스키마 - 타입 안전성 개선
// - 의미: 블로그 포스트 미디어 파일 검증
// - 사용 이유: 안전한 파일 업로드 및 관리
export const blogMediaPathSchema = z.object({
  // 대표 이미지 - 개선된 배열 검증
  // - 의미: 포스트 대표 이미지 파일들
  // - 검증: 개수 제한, 전체 크기 제한, 형식 검사
  coverImage: z
    .array(imageItemSchema, {
      required_error: '이미지는 배열이어야 합니다.',
      invalid_type_error: '이미지는 배열이어야 합니다.',
    })
    .min(1, { message: '최소 1개의 이미지를 업로드해주세요.' })
    .max(10, { message: '이미지는 최대 10개까지 업로드할 수 있습니다.' })
    .refine(
      (images) => {
        // 전체 이미지 크기 합계 검증
        const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
        return totalSize <= IMAGE_SIZE_LIMITS.MAX_TOTAL_SIZE;
      },
      {
        message: `전체 이미지 크기는 ${
          IMAGE_SIZE_LIMITS.MAX_TOTAL_SIZE / (1024 * 1024)
        }MB를 초과할 수 없습니다.`,
      }
    )
    .refine(
      (images) => {
        // 중복 파일명 검사
        const fileNames = images
          .map((img) => img.name)
          .filter((name) => name && name.length > 0);
        const uniqueNames = new Set(fileNames);
        return fileNames.length === uniqueNames.size;
      },
      {
        message:
          '중복된 파일명이 있습니다. 각 파일은 고유한 이름을 가져야 합니다.',
      }
    ),
});

// 타입 추론 - 개선된 타입 안전성
// - 의미: 스키마에서 TypeScript 타입 자동 생성
// - 사용 이유: 컴파일 타임 타입 체크 및 any 타입 제거
export type blogMediaPathSchemaType = z.infer<typeof blogMediaPathSchema>;

// 개별 이미지 아이템 타입
// - 의미: 단일 이미지 파일의 타입 정의
// - 사용 이유: 컴포넌트에서 안전한 타입 사용
export type ImageItemType = z.infer<typeof imageItemSchema>;

// 유틸리티 함수 - 파일 크기 포맷팅
// - 의미: 바이트 단위를 사람이 읽기 쉬운 형태로 변환
// - 사용 이유: UI에서 파일 크기 표시
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 유틸리티 함수 - 이미지 타입 검증
// - 의미: MIME 타입이 지원되는 이미지 형식인지 확인
// - 사용 이유: 런타임에서 파일 형식 검증
export const isValidImageType = (
  mimeType: string
): mimeType is SupportedImageType => {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType as SupportedImageType);
};

// 유틸리티 함수 - 파일 확장자 추출
// - 의미: 파일명에서 확장자 부분 추출
// - 사용 이유: 파일 형식 확인
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// 유틸리티 함수 - 이미지 미리보기 URL 생성
// - 의미: File 객체에서 브라우저 미리보기 URL 생성
// - 사용 이유: UI에서 이미지 미리보기 표시
export const createImagePreview = (file: File): string => {
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Failed to create image preview:', error);
    return '';
  }
};

// 유틸리티 함수 - 미리보기 URL 해제
// - 의미: 메모리 누수 방지를 위한 URL 해제
// - 사용 이유: 컴포넌트 언마운트 시 정리
export const revokeImagePreview = (url: string): void => {
  try {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Failed to revoke image preview:', error);
  }
};

// 유틸리티 함수 - 이미지 파일 검증
// - 의미: 업로드된 파일이 유효한 이미지인지 검증
// - 사용 이유: 클라이언트 측 사전 검증
export const validateImageFile = (
  file: File
): {
  isValid: boolean;
  error?: string;
} => {
  // 파일 크기 검증
  if (file.size < IMAGE_SIZE_LIMITS.MIN_SIZE) {
    return {
      isValid: false,
      error: `파일 크기가 너무 작습니다. 최소 ${formatFileSize(
        IMAGE_SIZE_LIMITS.MIN_SIZE
      )} 이상이어야 합니다.`,
    };
  }

  if (file.size > IMAGE_SIZE_LIMITS.MAX_SIZE) {
    return {
      isValid: false,
      error: `파일 크기가 너무 큽니다. 최대 ${formatFileSize(
        IMAGE_SIZE_LIMITS.MAX_SIZE
      )}까지 허용됩니다.`,
    };
  }

  // 파일 타입 검증
  if (!isValidImageType(file.type)) {
    return {
      isValid: false,
      error: `지원되지 않는 파일 형식입니다. ${SUPPORTED_IMAGE_TYPES.join(
        ', '
      )} 형식만 지원됩니다.`,
    };
  }

  // 파일명 검증
  if (file.name.length > 255) {
    return {
      isValid: false,
      error: '파일명이 너무 깁니다. 255자 이하로 해주세요.',
    };
  }

  return { isValid: true };
};

// 유틸리티 함수 - 이미지 배열 검증
// - 의미: 업로드된 이미지 배열의 전체 유효성 검증
// - 사용 이유: 전체 업로드 제한 확인
export const validateImageArray = (
  files: File[]
): {
  isValid: boolean;
  error?: string;
} => {
  // 개수 제한 검증
  if (files.length === 0) {
    return {
      isValid: false,
      error: '최소 1개의 이미지를 업로드해주세요.',
    };
  }

  if (files.length > 10) {
    return {
      isValid: false,
      error: '이미지는 최대 10개까지 업로드할 수 있습니다.',
    };
  }

  // 전체 크기 검증
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > IMAGE_SIZE_LIMITS.MAX_TOTAL_SIZE) {
    return {
      isValid: false,
      error: `전체 이미지 크기는 ${formatFileSize(
        IMAGE_SIZE_LIMITS.MAX_TOTAL_SIZE
      )}를 초과할 수 없습니다.`,
    };
  }

  // 중복 파일명 검증
  const fileNames = files.map((file) => file.name);
  const uniqueNames = new Set(fileNames);
  if (fileNames.length !== uniqueNames.size) {
    return {
      isValid: false,
      error: '중복된 파일명이 있습니다. 각 파일은 고유한 이름을 가져야 합니다.',
    };
  }

  // 개별 파일 검증
  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `${file.name}: ${validation.error}`,
      };
    }
  }

  return { isValid: true };
};

// 상수 - 이미지 형식별 라벨
// - 의미: MIME 타입을 사용자 친화적 이름으로 변환
// - 사용 이유: UI에서 파일 형식 표시
export const IMAGE_TYPE_LABELS: Record<SupportedImageType, string> = {
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/gif': 'GIF',
  'image/svg+xml': 'SVG',
} as const;

// 유틸리티 함수 - 이미지 타입 라벨 조회
// - 의미: MIME 타입을 사용자 친화적 라벨로 변환
// - 사용 이유: UI 표시용
export const getImageTypeLabel = (mimeType: string): string => {
  return IMAGE_TYPE_LABELS[mimeType as SupportedImageType] || mimeType;
};
//====여기까지 수정됨====
