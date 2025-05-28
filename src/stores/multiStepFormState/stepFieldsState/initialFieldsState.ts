// initialFieldsState.ts - 마크다운 이중 저장 시스템 초기값
// - 의미: 휘발성 미리보기와 영구 콘텐츠 저장을 위한 초기 상태 정의
// - 사용 이유: 브라우저 리프레시 시 미리보기는 초기화, 작성 콘텐츠는 유지
// - 비유: 임시 메모장과 정식 문서함의 초기 상태를 각각 설정
// - 작동 메커니즘:
//   1. markdown, searchTerm: undefined로 시작 (휘발성)
//   2. content: undefined로 시작하지만 localStorage에 저장됨 (영구)
//   3. 나머지 필드들도 적절한 초기값 설정
// - 관련 키워드: typescript, initial state, volatile, persistent

import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';

// 초기 필드 상태 - 이중 저장 시스템
// - 의미: 폼 필드들의 기본값 정의
// - 사용 이유: 휘발성과 영구 저장 필드 구분을 위한 초기화
export const initialFieldsState: blogPostSchemaType = {
  // 기본 블로그 포스트 정보 (영구 저장)
  // - 의미: 블로그 포스트의 핵심 메타데이터
  // - 사용 이유: 멀티스텝폼에서 지속적으로 사용
  title: '',
  summary: '',

  // 콘텐츠 관련 필드 - 이중 저장 시스템
  // - 의미: 사용자가 작성하는 실제 콘텐츠
  // - 구조:
  //   1. content: 영구 저장 (localStorage 포함, 멀티스텝폼에서 사용)
  //   2. markdown: 휘발성 (localStorage 제외, 미리보기 전용)
  //   3. searchTerm: 휘발성 (localStorage 제외, 미리보기 검색 전용)
  content: undefined, // 영구 저장 - 멀티스텝폼에서 접근 가능한 리치텍스트

  // 마크다운 미리보기 관련 상태 - 휘발성 (항상 초기화)
  // - 의미: 브라우저 리프레시 시 빈 상태로 시작
  // - 사용 이유: 미리보기는 세션별로 새로 작성
  markdown: undefined, // 휘발성 - 마크다운 콘텐츠는 빈 상태로 시작
  searchTerm: undefined, // 휘발성 - 검색어도 빈 상태로 시작

  // 블로그 포스트 메타데이터 (영구 저장)
  // - 의미: 포스트 분류 및 설정 정보
  // - 사용 이유: 멀티스텝폼에서 지속적으로 사용
  category: '',
  tags: [],
  coverImage: [],
  publishDate: undefined,
  tocItems: [],

  // 블로그 포스트 상태 (영구 저장)
  // - 의미: 포스트 공개 설정
  // - 사용 이유: 발행 시 필요한 설정값
  isDraft: false,
  isPublic: true,
};
