// ContentSection.tsx: 블로그 포스트의 본문 작성 섹션 (태그 및 마크다운)
// - 의미: 태그와 마크다운 콘텐츠 입력 관리
// - 사용 이유: 포스트 태그와 본문 작성 UI 제공
// - 비유: 블로그 포스트에 스티커(태그) 붙이고 책 내용(마크다운) 쓰기
// - 작동 메커니즘:
//   1. useFormContext로 폼 상태 관리
//   2. TagAutoComplete로 태그 입력 및 추천
//   3. MarkdownEditor와 MarkdownPreview로 마크다운 입력 및 미리보기
//   4. PostGuidelines로 가이드라인 표시
//   5. 날짜 표시 추가
// - 관련 키워드: react-hook-form, shadcn/ui, flexbox, react-markdown

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from './ui/button';
import { FormItem, FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';
import PostGuidelines from './PostGuidelines';
import TagAutoComplete from './TagAutoComplete';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';

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

// 함수: 본문 작성 섹션
// - 의미: 태그와 마크다운 입력 UI 렌더링
// - 사용 이유: 블로그 포스트 본문 작성
function ContentSection() {
  // 폼 컨텍스트
  // - 의미: 폼 데이터 및 유효성 검사 관리
  // - 사용 이유: react-hook-form으로 선언적 폼 관리
  // - Fallback: 컨텍스트 없으면 오류 메시지 표시
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      // 오류 메시지
      // - 의미: 폼 컨텍스트 오류 표시
      // - 사용 이유: 사용자에게 문제 알림
      <div className="text-red-500">오류: 폼 컨텍스트를 찾을 수 없습니다.</div>
    );
  }
  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext;

  // 값: 태그 배열
  // - 의미: 현재 폼의 태그 목록
  // - 사용 이유: 태그 렌더링 및 관리
  // - Fallback: 빈 배열
  const tags = watch('tags') || [];

  // 핸들러: 태그 추가
  // - 의미: 새로운 태그를 태그 목록에 추가
  // - 사용 이유: 사용자 입력을 폼 상태에 반영
  const handleAddTag = (tag: string) => {
    // 유효성 검사
    // - 의미: 빈 태그 또는 중복 태그 방지
    // - 사용 이유: 데이터 무결성 유지
    if (!tag.trim() || tags.includes(tag)) return;
    // 태그 추가
    // - 의미: 태그 목록 업데이트
    // - 사용 이유: 새로운 태그를 폼 상태에 저장
    setValue('tags', [...tags, tag], { shouldValidate: true });
  };

  // 핸들러: 태그 삭제
  // - 의미: 선택한 태그 제거
  // - 사용 이유: 사용자 요청으로 태그 목록 수정
  const handleRemoveTag = (tag: string) => {
    // 태그 필터링
    // - 의미: 선택한 태그 제외한 새 배열 생성
    // - 사용 이유: 폼 상태 업데이트
    setValue(
      'tags',
      tags.filter((t: string) => t !== tag),
      { shouldValidate: true }
    );
  };

  return (
    // 컨테이너: 반응형 레이아웃
    // - 의미: 모바일, 태블릿, 데스크톱 지원
    // - 사용 이유: 다양한 화면 크기에서 일관된 UI
    // - 스타일: flex로 세로 정렬
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      {/* 가이드라인 컴포넌트 */}
      {/* - 의미: 작성 가이드 및 자동저장 불러오기 표시 */}
      {/* - 사용 이유: 사용자에게 입력 지침 제공 */}
      <PostGuidelines tab="tags" />
      {/* 날짜 및 폼 컨테이너 */}
      {/* - 의미: 날짜 표시와 폼 필드를 함께 관리 */}
      {/* - 사용 이유: 날짜를 우측 상단에 고정 */}
      <div className="flex flex-col gap-6">
        {/* 날짜 표시 */}
        {/* - 의미: 현재 작성 날짜 표시 */}
        {/* - 사용 이유: 사용자에게 작성 시점 제공 */}
        <span className="text-sm text-gray-500" style={{ marginLeft: 'auto' }}>
          작성 날짜: {formatCurrentDate()}
        </span>
        {/* 폼 필드 컨테이너 */}
        {/* - 의미: 태그와 마크다운 입력을 세로로 정렬 */}
        {/* - 사용 이유: flex로 간단한 세로 레이아웃 구현 */}
        <div className="flex flex-col gap-6">
          {/* 태그 입력 */}
          {/* - 의미: 태그 입력 및 추천 UI */}
          {/* - 사용 이유: 포스트 태그 관리 */}
          <TagAutoComplete onAddTag={handleAddTag} />
          {/* 태그 목록 */}
          {/* - 의미: 추가된 태그 표시 */}
          {/* - 사용 이유: 사용자에게 현재 태그 목록 제공 */}
          <div className="flex flex-wrap w-full gap-2">
            {tags.map((tag: string) => (
              <div
                key={tag}
                className="flex items-center px-3 py-1 text-sm bg-gray-200 rounded-full"
              >
                <span>{tag}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`태그 ${tag} 삭제`}
                  className="ml-2"
                >
                  ×
                </Button>
              </div>
            ))}
            {errors.tags && <FormMessage>{errors.tags.message}</FormMessage>}
          </div>
          {/* 마크다운 입력 및 미리보기 */}
          {/* - 의미: 마크다운 콘텐츠 입력 및 미리보기 */}
          {/* - 사용 이유: 포스트 본문 작성 및 검토 */}
          <div className="flex flex-col gap-6 min-h-[400px] md:flex-row">
            <MarkdownEditor />
            <MarkdownPreview />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentSection;
