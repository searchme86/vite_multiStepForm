import { z } from 'zod';
import { CombinedSchema } from './CombinedSchema';
import { blogPostSchema } from '../pages/write/schema/blogPostSchema';

// 코드의 의미: 폼 스키마 정의
// 왜 사용했는지: 전체 폼 데이터의 타입과 유효성 검사를 정의

export const FormSchema = z.intersection(CombinedSchema, blogPostSchema);

// 코드의 의미: 폼 스키마 타입 추출
// 왜 사용했는지: 타입스크립트에서 폼 데이터 타입 사용
export type FormSchemaType = z.infer<typeof FormSchema>;

// 코드의 의미: 최대 파일 개수 상수
// 왜 사용했는지: 이력서 업로드 시 최대 파일 개수 제한
export const MAX_FILES = 1;

// 코드의 의미: 최대 파일 크기 상수 (5MB)
// 왜 사용했는지: 이력서 업로드 시 최대 파일 크기 제한
export const MAX_RESUME_SIZE_IN_BYTES = 5 * 1024 * 1024;

// 코드의 의미: 허용된 파일 확장자 목록
// 왜 사용했는지: 이력서 업로드 시 허용된 파일 형식 제한
export const VALID_RESUME_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx'];
