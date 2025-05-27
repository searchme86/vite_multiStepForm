// initialFieldsState.ts - 마크다운 미리보기 초기값 명시
import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';

export const initialFieldsState: blogPostSchemaType = {
  title: '',
  summary: '',
  content: undefined,
  // 마크다운 미리보기 관련 상태 - 항상 초기화
  // - 의미: 브라우저 리프레시 시 빈 상태로 시작
  // - 사용 이유: 미리보기는 세션별로 새로 작성
  markdown: undefined, // 마크다운 콘텐츠는 빈 상태로 시작
  searchTerm: undefined, // 검색어도 빈 상태로 시작
  category: '',
  tags: [],
  coverImage: [],
  publishDate: undefined,
  tocItems: [],
  isDraft: false,
  isPublic: true,
};
