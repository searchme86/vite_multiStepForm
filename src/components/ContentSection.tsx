//====여기부터 수정됨====
// ContentSection.tsx: 태그 입력 섹션
// - 의미: 블로그 포스트의 태그 입력 관리
// - 사용 이유: 검색 및 분류를 위한 태그 입력
// - 비유: 책에 붙이는 키워드 스티커
// - 작동 메커니즘:
//   1. useFormContext로 태그 관리
//   2. Input으로 태그 추가, Badge로 표시
//   3. PostGuidelines로 가이드와 자동저장 불러오기 제공
// - 관련 키워드: react-hook-form, shadcn/ui, flexbox
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { FormItem, FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';
import PostGuidelines from './PostGuidelines';

// 함수: 태그 입력 섹션
// - 의미: 태그 입력 UI 렌더링
// - 사용 이유: 포스트 태그 관리
function ContentSection() {
  // 폼 컨텍스트
  // - 의미: 폼 데이터 및 오류 관리
  // - 사용 이유: 중앙화된 폼 상태 관리
  // - Fallback: 컨텍스트 없으면 오류 메시지 표시
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      <div className="text-red-500">오류: 폼 컨텍스트를 찾을 수 없습니다.</div>
    );
  }
  const {
    watch,
    setValue,
    formState: { errors },
  } = formContext;

  // 값: 태그
  // - 의미: 현재 태그 목록 추적
  // - 사용 이유: 실시간 태그 렌더링
  // - Fallback: 빈 배열
  const tags = watch('tags') || [];

  // 핸들러: 태그 추가
  // - 의미: 새로운 태그 입력 처리
  // - 사용 이유: 사용자 입력을 태그 목록에 추가
  const handleAddTag = (tag: string) => {
    // 유효성 검사
    // - 의미: 빈 태그, 중복 태그, 최대 개수 제한
    // - 사용 이유: 데이터 무결성 유지
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setValue('tags', [...tags, tag], { shouldValidate: true });
    }
  };

  // 핸들러: 태그 제거
  // - 의미: 특정 태그 삭제
  // - 사용 이유: 사용자 선택 반영
  const handleRemoveTag = (tagToRemove: string) => {
    // 필터링
    // - 의미: 선택된 태그 제외
    // - 사용 이유: 태그 목록 업데이트
    setValue(
      'tags',
      tags.filter((tag) => tag !== tagToRemove),
      { shouldValidate: true }
    );
  };

  return (
    // 컨테이너: 반응형 레이아웃
    // - 의미: 모바일, 태블릿, 데스크톱 지원
    // - 사용 이유: 다양한 화면 크기에서 일관된 UI
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      {/* 가이드라인 컴포넌트 */}
      {/* - 의미: 작성 가이드 및 자동저장 불러오기 표시 */}
      {/* - 사용 이유: 사용자에게 입력 지침 제공 */}
      <PostGuidelines tab="tags" />
      {/* 태그 입력 */}
      {/* - 의미: 태그 입력 및 표시 UI */}
      {/* - 사용 이유: 태그 추가/삭제 관리 */}
      <FormItem>
        <div className="space-y-2">
          <Input
            placeholder="태그를 입력하고 Enter 키를 누르세요"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                handleAddTag(input.value);
                input.value = '';
              }
            }}
            className="w-full sm:w-1/2"
            aria-label="태그 입력"
          />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
                aria-label={`태그 ${tag} 제거`}
              >
                {tag}
              </Badge>
            ))}
          </div>
          {errors.tags && <FormMessage>{errors.tags.message}</FormMessage>}
        </div>
      </FormItem>
    </div>
  );
}

export default ContentSection;
//====여기까지 수정됨====
