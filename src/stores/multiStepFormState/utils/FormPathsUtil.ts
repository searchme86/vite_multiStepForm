// FormPaths.ts - 개선된 폼 경로 타입 정의
// - 의미: FormSchemaType의 모든 중첩 경로를 정확하게 추론하는 타입
// - 사용 이유: 자동완성과 타입 안전성을 위한 정확한 경로 타입 생성
// - 작동 메커니즘:
//   1. 객체의 모든 키를 재귀적으로 탐색
//   2. 중첩된 객체는 점 표기법으로 경로 생성
//   3. 배열과 옵셔널 필드도 올바르게 처리
//   4. TypeScript 4.1+ 템플릿 리터럴 타입 활용

import type { FormSchemaType } from '@/schema/FormSchema';

// 개선된 Paths 타입 - 더 정확한 경로 추론
// - 의미: 객체의 모든 중첩 경로를 문자열 리터럴 타입으로 생성
// - 사용 이유: 기존 Paths 타입의 재귀 제한 문제 해결
// - 작동 원리: 템플릿 리터럴과 조건부 타입을 활용한 재귀적 경로 생성
export type DeepPaths<T, K extends keyof T = keyof T> = K extends
  | string
  | number
  ? T[K] extends Record<string, unknown>
    ? T[K] extends readonly unknown[] // 배열 타입 체크
      ? K // 배열은 경로 종료
      : `${K}` | `${K}.${DeepPaths<T[K]>}` // 객체는 재귀 계속
    : `${K}` // 원시 타입은 경로 종료
  : never;

// FormSchemaType의 모든 경로 추출
// - 의미: 실제 폼 스키마에서 사용 가능한 모든 경로
// - 사용 이유: 컴파일 타임에 경로 유효성 검증
export type FormPaths = DeepPaths<FormSchemaType>;

// 타입 테스트용 - 실제 경로들이 올바르게 추론되는지 확인
// - 의미: 개발 시 타입이 올바르게 생성되었는지 검증
// - 사용 이유: 타입 정의의 정확성 확인
type TestPaths = FormPaths;
// 예상되는 타입들:
// "firstName" | "lastName" | "phone" | "email" | "email.fullEmailInput"
// | "email.splitEmailInput" | "email.splitEmailInput.userLocalPart"
// | "email.splitEmailInput.emailRest" | "jobs" | "github" | "portfolio"
// | "resume" | "tocItems" | "title" | "summary" | "content" | ...

// 유틸리티 타입 - 특정 경로의 값 타입 추출
// - 의미: 주어진 경로에 해당하는 값의 타입을 추출
// - 사용 이유: 폼 필드의 정확한 타입 검증
export type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? T[K] extends Record<string, unknown>
      ? PathValue<T[K], Rest>
      : never
    : never
  : never;

// 경로 유효성 검증 함수
// - 의미: 런타임에서 경로가 실제로 존재하는지 확인
// - 사용 이유: 동적으로 생성된 경로의 안전성 보장
export const isValidFormPath = (path: string): path is FormPaths => {
  // 간단한 경로 유효성 검사
  const validPaths: FormPaths[] = [
    'firstName',
    'lastName',
    'phone',
    'email',
    'email.fullEmailInput',
    'email.splitEmailInput',
    'email.splitEmailInput.userLocalPart',
    'email.splitEmailInput.emailRest',
    'jobs',
    'github',
    'portfolio',
    'resume',
    'tocItems',
    // blogPostSchema에서 오는 경로들
    'title',
    'summary',
    'content',
    'category',
    'tags',
    'coverImage',
    'publishDate',
    'isDraft',
    'isPublic',
    'isScheduled',
    'status',
    'authorId',
    'viewCount',
    'lastModified',
    'markdown',
    'richTextContent',
    'searchTerm',
  ];

  return validPaths.includes(path as FormPaths);
};

// 경로에서 값 추출 유틸리티 함수
// - 의미: 점 표기법 경로를 사용해 객체에서 값 추출
// - 사용 이유: 동적 경로 접근을 위한 안전한 헬퍼 함수
export const getValueByPath = <T extends Record<string, unknown>>(
  obj: T,
  path: FormPaths
): unknown => {
  // 경로를 점으로 분할하여 중첩 객체 탐색
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    // 현재 값이 객체이고 키가 존재하는지 확인
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined; // 경로가 존재하지 않음
    }
  }

  return current;
};

// 경로에 값 설정 유틸리티 함수
// - 의미: 점 표기법 경로를 사용해 객체에 값 설정
// - 사용 이유: 동적 경로 설정을 위한 안전한 헬퍼 함수
export const setValueByPath = <T extends Record<string, unknown>>(
  obj: T,
  path: FormPaths,
  value: unknown
): T => {
  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) return obj;

  // 경로에 따라 중첩 객체 생성
  let current: Record<string, unknown> = { ...obj };
  let pointer = current;

  for (const key of keys) {
    if (!(key in pointer) || typeof pointer[key] !== 'object') {
      pointer[key] = {};
    }
    pointer = pointer[key] as Record<string, unknown>;
  }

  pointer[lastKey] = value;
  return current as T;
};

// 스텝별 필드 검증 유틸리티
// - 의미: 특정 스텝에서 사용하는 필드들이 모두 유효한 경로인지 확인
// - 사용 이유: 스텝 정의 시 타입 안전성 보장
export const validateStepFields = (fields: string[]): fields is FormPaths[] => {
  return fields.every((field) => isValidFormPath(field));
};

// 타입 가드 - FormPaths 배열 확인
// - 의미: 런타임에서 문자열 배열이 FormPaths 배열인지 확인
// - 사용 이유: 동적 데이터의 타입 안전성 보장
export const isFormPathsArray = (paths: string[]): paths is FormPaths[] => {
  return paths.every((path) => isValidFormPath(path));
};
