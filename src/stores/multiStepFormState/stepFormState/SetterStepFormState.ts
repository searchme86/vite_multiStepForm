// 코드의 의미: 폼 상태를 업데이트하는 setter 함수 정의
// 왜 사용했는지: 무한 렌더링을 방지하며 상태를 안전하게 변경
// 참고: blogPostSchema로 유효성 검사 수행
import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';
import { blogPostSchema } from '../../../pages/write/schema/blogPostSchema';
import { initialStepFormState } from './initialstepFormState';

// Setter 인터페이스
// - 의미: 상태 업데이트 메서드 정의
// - 사용 이유: 타입 안전성과 캡슐화 보장
export interface SetterStepFormState {
  // 제목 업데이트
  // - 의미: title 필드 설정
  // - 사용 이유: 사용자 입력 반영
  setTitle: (title: string) => void;

  // 요약 업데이트
  // - 의미: summary 필드 설정
  // - 사용 이유: 사용자 입력 반영
  setSummary: (summary: string) => void;

  // 본문 업데이트
  // - 의미: content 필드 설정
  // - 사용 이유: 사용자 입력 반영
  setContent: (content: string) => void;

  // 마크다운 업데이트
  // - 의미: markdown 필드 설정
  // - 사용 이유: 마크다운 에디터 동기화
  setMarkdown: (markdown: string) => void;

  // 검색어 업데이트
  // - 의미: searchTerm 필드 설정
  // - 사용 이유: 미리보기 검색
  setSearchTerm: (searchTerm: string) => void;

  // 카테고리 업데이트
  // - 의미: category 필드 설정
  // - 사용 이유: 카테고리 선택 반영
  setCategory: (category: string) => void;

  // 태그 추가
  // - 의미: tags 배열에 새 태그 추가
  // - 사용 이유: 태그 입력 처리
  addTag: (tag: { id: string; value: string }) => void;

  // 태그 제거
  // - 의미: tags 배열에서 태그 제거
  // - 사용 이유: 태그 삭제 처리
  removeTag: (index: number) => void;

  // 커버 이미지 추가
  // - 의미: coverImage 배열에 새 파일 추가
  // - 사용 이유: 파일 업로드 처리
  addCoverImage: (
    files: Array<{
      file?: File;
      preview?: string;
      name?: string;
      size?: number;
    }>
  ) => void;

  // 커버 이미지 제거
  // - 의미: coverImage 배열에서 파일 제거
  // - 사용 이유: 파일 삭제 처리
  removeCoverImage: (index: number) => void;

  // 커버 이미지 일괄 제거
  // - 의미: coverImage 배열에서 여러 파일 제거
  // - 사용 이유: 다중 삭제 처리
  bulkRemoveCoverImage: (indexes: number[]) => void;

  // 게시 날짜 업데이트
  // - 의미: publishDate 필드 설정
  // - 사용 이유: 날짜 선택 반영
  setPublishDate: (date: Date | undefined) => void;

  // 초안 여부 업데이트
  // - 의미: isDraft 필드 설정
  // - 사용 이유: 초안 상태 변경
  setIsDraft: (isDraft: boolean) => void;

  // 공개 여부 업데이트
  // - 의미: isPublic 필드 설정
  // - 사용 이유: 공개 상태 변경
  setIsPublic: (isPublic: boolean) => void;

  // 폼 초기화
  // - 의미: 모든 필드를 초기 상태로 리셋
  // - 사용 이유: 폼 리셋 기능 제공
  resetForm: () => void;

  // 폼 데이터 저장
  // - 의미: 폼 데이터를 localStorage에 저장
  // - 사용 이유: 자동저장/임시저장 구현
  saveFormData: (type: 'autosave' | 'tempsave') => void;
}

// Setter 구현
// - 의미: 상태와 set 함수를 받아 setter 함수 반환
// - 사용 이유: Zustand 스토어에서 상태 업데이트 처리
export const createSetterStepFormState = (
  set: (fn: (state: blogPostSchemaType) => blogPostSchemaType) => void,
  get: () => blogPostSchemaType
): SetterStepFormState => ({
  setTitle: (title) =>
    set((state) => {
      const newState = { ...state, title };
      // 유효성 검사
      // - 의미: title 필드 검증
      // - 사용 이유: 데이터 무결성 보장
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('Title validation failed:', result.error);
      }
      return newState;
    }),

  setSummary: (summary) =>
    set((state) => {
      const newState = { ...state, summary };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('Summary validation failed:', result.error);
      }
      return newState;
    }),

  setContent: (content) =>
    set((state) => {
      const newState = { ...state, content };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('Content validation failed:', result.error);
      }
      return newState;
    }),

  setMarkdown: (markdown) =>
    set((state) => {
      const newState = { ...state, markdown };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('Markdown validation failed:', result.error);
      }
      return newState;
    }),

  setSearchTerm: (searchTerm) =>
    set((state) => {
      const newState = { ...state, searchTerm };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('SearchTerm validation failed:', result.error);
      }
      return newState;
    }),

  setCategory: (category) =>
    set((state) => {
      const newState = { ...state, category };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('Category validation failed:', result.error);
      }
      return newState;
    }),

  addTag: (tag) =>
    set((state) => {
      const newState = { ...state, tags: [...state.tags, tag] };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('Tags validation failed:', result.error);
      }
      return newState;
    }),

  removeTag: (index) =>
    set((state) => {
      const newState = {
        ...state,
        tags: state.tags.filter((_, i) => i !== index),
      };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('Tags validation failed:', result.error);
      }
      return newState;
    }),

  addCoverImage: (files) =>
    set((state) => {
      const newState = {
        ...state,
        coverImage: [...state.coverImage, ...files],
      };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('CoverImage validation failed:', result.error);
      }
      return newState;
    }),

  removeCoverImage: (index) =>
    set((state) => {
      const newState = {
        ...state,
        coverImage: state.coverImage.filter((_, i) => i !== index),
      };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('CoverImage validation failed:', result.error);
      }
      return newState;
    }),

  bulkRemoveCoverImage: (indexes) =>
    set((state) => {
      const newState = {
        ...state,
        coverImage: state.coverImage.filter((_, i) => !indexes.includes(i)),
      };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('CoverImage validation failed:', result.error);
      }
      return newState;
    }),

  setPublishDate: (date) =>
    set((state) => {
      const newState = { ...state, publishDate: date };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('PublishDate validation failed:', result.error);
      }
      return newState;
    }),

  setIsDraft: (isDraft) =>
    set((state) => {
      const newState = { ...state, isDraft };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('IsDraft validation failed:', result.error);
      }
      return newState;
    }),

  setIsPublic: (isPublic) =>
    set((state) => {
      const newState = { ...state, isPublic };
      const result = blogPostSchema.safeParse(newState);
      if (!result.success) {
        console.warn('IsPublic validation failed:', result.error);
      }
      return newState;
    }),

  resetForm: () =>
    set(() => ({
      ...initialStepFormState,
    })),

  saveFormData: (type) =>
    set((state) => {
      // 저장 키 생성
      // - 의미: autosave/tempsave 구분
      // - 사용 이유: 저장 데이터 식별
      const key = `${type}_all_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(state));
      return state; // 상태 변경 없음
    }),
});
