// 코드의 의미: 블로그 포스트 폼의 초기 상태를 정의
// 왜 사용했는지: Zustand 스토어의 초기값으로 사용되어 상태를 일관되게 초기화
// 참고: BlogPostFormData 타입을 기반으로 초기값 설정
import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';

// 초기 상태 객체
// - 의미: 폼 필드의 기본값 제공
// - 사용 이유: 폼 초기화 및 리셋 시 사용
export const initialStepFormState: blogPostSchemaType = {
  // 제목 초기값
  // - 의미: 빈 문자열로 초기화
  // - 사용 이유: 사용자 입력 대기
  title: '',

  // 요약 초기값
  // - 의미: 빈 문자열로 초기화
  // - 사용 이유: 사용자 입력 대기
  summary: '',

  // 본문 초기값
  // - 의미: 빈 문자열로 초기화
  // - 사용 이유: 사용자 입력 대기
  content: '',

  // 마크다운 초기값
  // - 의미: 빈 문자열로 초기화
  // - 사용 이유: 마크다운 에디터 초기 상태
  markdown: '',

  // 검색어 초기값
  // - 의미: 빈 문자열로 초기화
  // - 사용 이유: 미리보기 검색 기능 초기 상태
  searchTerm: '',

  // 카테고리 초기값
  // - 의미: 빈 문자열로 초기화
  // - 사용 이유: 카테고리 선택 대기
  category: '',

  // 태그 초기값
  // - 의미: 빈 배열로 초기화
  // - 사용 이유: 태그 입력 대기
  tags: [],

  // 커버 이미지 초기값
  // - 의미: 빈 배열로 초기화
  // - 사용 이유: 파일 업로드 대기
  coverImage: [],

  // 게시 날짜 초기값
  // - 의미: undefined로 초기화
  // - 사용 이유: 선택적 필드로 사용자 입력 대기
  publishDate: undefined,

  // 초안 여부 초기값
  // - 의미: false로 초기화
  // - 사용 이유: 기본적으로 초안이 아님
  isDraft: false,

  // 공개 여부 초기값
  // - 의미: true로 초기화
  // - 사용 이유: 기본적으로 공개 상태
  isPublic: true,
};
