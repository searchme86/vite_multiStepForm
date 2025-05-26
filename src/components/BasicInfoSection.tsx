// BasicInfoSection.tsx: 블로그 포스트의 기본 정보 입력 섹션
// - 의미: 제목, 요약, 내용, 카테고리 입력 관리
// - 사용 이유: 핵심 정보 입력을 위한 UI 제공
// - 비유: 블로그 포스트의 표지(제목), 소개글(요약), 본문(내용), 라벨(카테고리)
// - 작동 메커니즘:
//   1. useFormContext로 폼 상태 관리
//   2. FormItem으로 입력 필드 구성
//   3. PostGuidelines로 가이드라인 표시
//   4. Textarea 크기 고정(resize: none, 고정 height)
//   5. 날짜 표시 추가 (우측 상단)
//   6. 요약 필드 추가, 내용 필드 optional 처리
// - 관련 키워드: react-hook-form, shadcn/ui, flexbox, Textarea, Zod

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { FormItem, FormMessage } from './ui/form';
// import type { BlogPostFormData } from '../types/blog-post';
import type { BlogPostFormData } from '../pages/write/schema/blogPostSchema';
import PostGuidelines from './PostGuidelines';
import BlogTitle from '../pages/write/basicFormSection/parts/BlogTitle';
import BlogSummary from '../pages/write/basicFormSection/parts/BlogSummary';

// 상수: 카테고리 옵션
// - 의미: 카테고리 선택지 정의
// - 사용 이유: 드롭다운 메뉴에 표시
// - Fallback: 빈 배열로 초기화
const categoryOptions = [
  { value: 'tech', label: '기술' },
  { value: 'lifestyle', label: '생활' },
  { value: 'travel', label: '여행' },
  { value: 'food', label: '음식' },
];

// 함수: 기본 정보 섹션
// - 의미: 사용자 입력 폼 렌더링
// - 사용 이유: 블로그 포스트의 기본 정보 입력
function BasicInfoSection() {
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

  // 값: 폼 필드
  // - 의미: 폼 입력값 추적
  // - 사용 이유: 실시간 입력값 반영
  // - Fallback: 값이 없으면 빈 문자열 또는 기본값
  // const summaryValue = watch('summary') || '';
  const contentValue = watch('content') || '';
  const categoryValue = watch('category') || '';

  // 핸들러: 내용 변경
  // - 의미: 내용 입력 처리
  // - 사용 이유: 사용자 입력을 폼 상태에 반영
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // setValue 호출
    // - 의미: 내용 필드 업데이트
    // - 사용 이유: 입력값 저장 및 유효성 검사
    setValue('content', e.target.value, { shouldValidate: true });
  };

  // 핸들러: 카테고리 변경
  // - 의미: 카테고리 선택 처리
  // - 사용 이유: 사용자 선택을 폼 상태에 반영
  const handleCategoryChange = (value: string) => {
    // setValue 호출
    // - 의미: 카테고리 필드 업데이트
    // - 사용 이유: 선택값 저장 및 유효성 검사
    setValue('category', value, { shouldValidate: true });
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
      <PostGuidelines tab="basic" />
      {/* 날짜 및 폼 컨테이너 */}
      {/* - 의미: 날짜 표시와 폼 필드를 함께 관리 */}
      {/* - 사용 이유: 날짜를 우측 상단에 고정 */}
      <div className="flex flex-col gap-6">
        {/* 폼 필드 컨테이너 */}
        {/* - 의미: 입력 필드를 세로로 정렬 */}
        {/* - 사용 이유: flex로 간단한 세로 레이아웃 구현 */}
        <div className="flex flex-col gap-6">
          <BlogTitle />
          <BlogSummary />
          {/* 내용 필드 */}
          {/* - 의미: 내용 입력 UI */}
          {/* - 사용 이유: 포스트 본문 입력, optional */}
          <FormItem>
            <label className="text-sm font-medium">내용</label>
            <Textarea
              placeholder="블로그 포스트 내용을 입력하세요 (선택 사항)"
              className="min-h-[200px] h-[200px] resize-none"
              value={contentValue}
              onChange={handleContentChange}
              aria-invalid={!!errors.content}
              aria-label="블로그 포스트 내용"
            />
            {errors.content && (
              <FormMessage>{errors.content.message}</FormMessage>
            )}
          </FormItem>
          {/* 카테고리 필드 */}
          {/* - 의미: 카테고리 선택 UI */}
          {/* - 사용 이유: 포스트 분류 선택 */}
          <FormItem className="flex-1">
            <label className="text-sm font-medium">카테고리</label>
            <Select
              onValueChange={handleCategoryChange}
              value={categoryValue}
              aria-label="카테고리 선택"
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <FormMessage>{errors.category.message}</FormMessage>
            )}
          </FormItem>
        </div>
      </div>
    </div>
  );
}

export default BasicInfoSection;
