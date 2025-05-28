//====여기부터 수정됨====
// initialFieldsState.ts - 마크다운 이중 저장 시스템 초기값 (변수명 충돌 해결)
// - 의미: 휘발성 미리보기와 영구 콘텐츠 저장을 위한 초기 상태 정의
// - 사용 이유: 브라우저 리프레시 시 미리보기는 초기화, 작성 콘텐츠는 유지
// - 비유: 임시 메모장과 정식 문서함의 초기 상태를 각각 설정
// - 작동 메커니즘:
//   1. markdown, searchTerm: undefined로 시작 (휘발성)
//   2. richTextContent: undefined로 시작하지만 localStorage에 저장됨 (영구, 마크다운 전용)
//   3. content: 기존 컴포넌트용 필드 (충돌 방지)
//   4. 나머지 필드들도 적절한 초기값 설정
// - 관련 키워드: typescript, initial state, volatile, persistent, variable naming

import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';

// 초기 필드 상태 - 이중 저장 시스템 (변수명 충돌 해결)
// - 의미: 폼 필드들의 기본값 정의
// - 사용 이유: 휘발성과 영구 저장 필드 구분, 변수명 충돌 방지
export const initialFieldsState: blogPostSchemaType = {
  // 기본 블로그 포스트 정보 (영구 저장)
  // - 의미: 블로그 포스트의 핵심 메타데이터
  // - 사용 이유: 멀티스텝폼에서 지속적으로 사용
  title: '',
  summary: '',

  // 기존 컴포넌트용 콘텐츠 필드 (영구 저장)
  // - 의미: BlogContent 컴포넌트에서 사용하는 기본 텍스트 입력
  // - 사용 이유: 기존 스키마 호환성 유지, 마크다운과 구분
  content: undefined, // 기존 컴포넌트용 - 단순 텍스트 입력

  // 마크다운 편집기 전용 콘텐츠 필드 - 이중 저장 시스템
  // - 의미: 마크다운 편집기에서 작성하는 리치텍스트 콘텐츠
  // - 구조:
  //   1. richTextContent: 영구 저장 (localStorage 포함, 멀티스텝폼에서 사용)
  //   2. markdown: 휘발성 (localStorage 제외, 미리보기 전용)
  //   3. searchTerm: 휘발성 (localStorage 제외, 미리보기 검색 전용)
  richTextContent: undefined, // 영구 저장 - 마크다운 편집기 전용 리치텍스트

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
//====여기까지 수정됨====
