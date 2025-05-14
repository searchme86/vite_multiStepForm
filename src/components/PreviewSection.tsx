//====여기부터 수정됨====
// PreviewSection.tsx: 블로그 포스트 작성 데이터 미리보기 섹션
// - 의미: 모든 탭의 입력 데이터를 렌더링
// - 사용 이유: 작성 내용 최종 확인, 게시 전 검토
// - 비유: 책을 출판 전에 전체 내용을 훑어보는 것
// - 작동 메커니즘:
//   1. useFormContext로 폼 데이터 접근
//   2. 제목, 요약, 내용, 마크다운, 태그, 이미지 등 렌더링
//   3. ReactMarkdown으로 마크다운 콘텐츠 표시
//   4. flex 레이아웃으로 반응형 UI 구성
// - 관련 키워드: react-hook-form, react-markdown, flexbox, shadcn/ui

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BlogPostFormData } from '../types/blog-post';
import ReactMarkdown from 'react-markdown';
import PostGuidelines from './PostGuidelines';

// 함수: 현재 날짜 포맷팅
// - 타입: () => string
// - 의미: 현재 년, 월, 일을 "YYYY-MM-DD" 형식으로 반환
// - 사용 이유: 폼 우측 상단에 작성 날짜 표시
// - Fallback: 현재 날짜 사용
const formatCurrentDate = (): string => {
  // 날짜 객체 생성
  // - 의미: 현재 날짜 가져오기
  // - 사용 이유: 실시간 날짜 표시
  const today = new Date();
  // 포맷팅
  // - 의미: 년, 월, 일을 문자열로 변환
  // - 사용 이유: 사용자 친화적 표시
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 함수: 미리보기 섹션
// - 의미: 작성된 데이터 렌더링
// - 사용 이유: 최종 포스트 확인
function PreviewSection() {
  // 폼 컨텍스트
  // - 의미: 폼 데이터 접근
  // - 사용 이유: 실시간 데이터 렌더링
  // - Fallback: 컨텍스트 없으면 오류 메시지
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      // 오류 메시지
      // - 의미: 폼 컨텍스트 오류 표시
      // - 사용 이유: 사용자에게 문제 알림
      <div className="text-red-500">오류: 폼 컨텍스트를 찾을 수 없습니다.</div>
    );
  }
  const { watch } = formContext;

  // 값: 폼 데이터
  // - 의미: 각 필드 값 추적
  // - 사용 이유: 미리보기 렌더링
  // - Fallback: 빈 문자열 또는 배열
  const title = watch('title') || '제목 없음';
  const summary = watch('summary') || '요약 없음';
  const content = watch('content') || '내용 없음';
  const markdown = watch('markdown') || '';
  const category = watch('category') || '카테고리 없음';
  const tags = watch('tags') || [];
  const coverImage = watch('coverImage') || [];

  return (
    // 컨테이너: 반응형 레이아웃
    // - 의미: 모바일, 태블릿, 데스크톱 지원
    // - 사용 이유: 다양한 화면 크기에서 일관된 UI
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      {/* 가이드라인 컴포넌트 */}
      {/* - 의미: 작성 가이드 표시 */}
      {/* - 사용 이유: 사용자에게 지침 제공 */}
      <PostGuidelines tab="preview" />
      {/* 날짜 및 내용 컨테이너 */}
      {/* - 의미: 날짜와 미리보기 데이터 배치 */}
      {/* - 사용 이유: 날짜 우측 상단 고정 */}
      <div className="flex flex-col gap-6">
        {/* 날짜 표시 */}
        {/* - 의미: 현재 작성 날짜 표시 */}
        {/* - 사용 이유: 작성 시점 제공 */}
        <span className="text-sm text-gray-500" style={{ marginLeft: 'auto' }}>
          작성 날짜: {formatCurrentDate()}
        </span>
        {/* 미리보기 컨테이너 */}
        {/* - 의미: 데이터 렌더링 */}
        {/* - 사용 이유: 사용자 확인 용이 */}
        <div className="flex flex-col gap-6">
          {/* 제목 */}
          <div>
            <h3 className="text-lg font-medium">제목</h3>
            <p className="text-gray-800">{title}</p>
          </div>
          {/* 요약 */}
          <div>
            <h3 className="text-lg font-medium">요약</h3>
            <p className="text-gray-800">{summary}</p>
          </div>
          {/* 내용 */}
          <div>
            <h3 className="text-lg font-medium">내용</h3>
            <p className="text-gray-800">{content}</p>
          </div>
          {/* 마크다운 */}
          <div>
            <h3 className="text-lg font-medium">마크다운</h3>
            <div className="prose-sm prose max-w-none">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
          {/* 카테고리 */}
          <div>
            <h3 className="text-lg font-medium">카테고리</h3>
            <p className="text-gray-800">{category}</p>
          </div>
          {/* 태그 */}
          <div>
            <h3 className="text-lg font-medium">태그</h3>
            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-gray-200 rounded-full"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">태그 없음</p>
              )}
            </div>
          </div>
          {/* 이미지 */}
          <div>
            <h3 className="text-lg font-medium">이미지</h3>
            <div className="flex flex-wrap gap-4">
              {coverImage.length > 0 ? (
                coverImage.map((img, index) => (
                  <img
                    key={index}
                    src={img.preview || ''}
                    alt={`이미지 ${index + 1}`}
                    className="object-cover w-32 h-32 rounded"
                  />
                ))
              ) : (
                <p className="text-gray-500">이미지 없음</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewSection;
//====여기까지 수정됨====
