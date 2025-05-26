// 코드의 의미: 폼 상태를 조회하는 getter 함수 정의
// 왜 사용했는지: 컴포넌트에서 상태를 안전하게 조회하도록 캡슐화
// 참고: BlogPostFormData 타입을 기반으로 getter 생성
import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';

// Getter 인터페이스
// - 의미: 상태 조회 메서드 정의
// - 사용 이유: 타입 안전성과 캡슐화 보장
export interface GetterStepFormState {
  // 제목 조회
  // - 의미: title 필드 반환
  // - 사용 이유: 컴포넌트에서 제목 표시
  getTitle: () => string;

  // 요약 조회
  // - 의미: summary 필드 반환
  // - 사용 이유: 요약 표시
  getSummary: () => string;

  // 본문 조회
  // - 의미: content 필드 반환
  // - 사용 이유: 본문 표시
  getContent: () => string;

  // 마크다운 조회
  // - 의미: markdown 필드 반환
  // - 사용 이유: 마크다운 에디터 동기화
  getMarkdown: () => string;

  // 검색어 조회
  // - 의미: searchTerm 필드 반환
  // - 사용 이유: 미리보기 검색
  getSearchTerm: () => string;

  // 카테고리 조회
  // - 의미: category 필드 반환
  // - 사용 이유: 카테고리 선택 표시
  getCategory: () => string;

  // 태그 조회
  // - 의미: tags 배열 반환
  // - 사용 이유: 태그 목록 표시
  getTags: () => Array<{ id: string; value: string }>;

  // 커버 이미지 조회
  // - 의미: coverImage 배열 반환
  // - 사용 이유: 파일 목록 표시
  getCoverImage: () => Array<{
    file?: File;
    preview?: string;
    name?: string;
    size?: number;
  }>;

  // 게시 날짜 조회
  // - 의미: publishDate 필드 반환
  // - 사용 이유: 날짜 표시
  getPublishDate: () => Date | undefined;

  // 초안 여부 조회
  // - 의미: isDraft 필드 반환
  // - 사용 이유: 초안 상태 표시
  getIsDraft: () => boolean;

  // 공개 여부 조회
  // - 의미: isPublic 필드 반환
  // - 사용 이유: 공개 상태 표시
  getIsPublic: () => boolean;

  // 전체 폼 데이터 조회
  // - 의미: 전체 폼 상태 반환
  // - 사용 이유: 저장 또는 제출 시 사용
  getFormData: () => blogPostSchemaType;
}

// Getter 구현
// - 의미: 상태 객체를 받아 getter 함수 반환
// - 사용 이유: Zustand 스토어에서 사용
export const createGetterStepFormState = (
  state: blogPostSchemaType
): GetterStepFormState => ({
  getTitle: () => state.title,
  getSummary: () => state.summary,
  getContent: () => state.content,
  getMarkdown: () => state.markdown,
  getSearchTerm: () => state.searchTerm,
  getCategory: () => state.category,
  getTags: () => state.tags,
  getCoverImage: () => state.coverImage,
  getPublishDate: () => state.publishDate,
  getIsDraft: () => state.isDraft,
  getIsPublic: () => state.isPublic,
  getFormData: () => state,
});
