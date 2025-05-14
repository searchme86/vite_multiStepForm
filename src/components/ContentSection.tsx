//====여기부터 수정됨====
// ContentSection.tsx: 블로그 포스트의 태그 입력 섹션
// - 의미: 태그 입력 및 관리 UI 제공
// - 사용 이유: 포스트 태그를 사용자 입력으로 추가/삭제
// - 비유: 블로그 포스트에 붙이는 스티커(태그), 사용자가 스티커 붙이고 떼기
// - 작동 메커니즘:
//   1. useFormContext로 폼 상태 관리
//   2. 태그 입력 및 추가/삭제 로직 구현
//   3. PostGuidelines로 가이드라인 표시
//   4. 타이틀 복구, w-full 스타일 적용
// - 관련 키워드: react-hook-form, shadcn/ui, flexbox, Input
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { FormItem, FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';
import PostGuidelines from './PostGuidelines';

// 함수: 태그 섹션
// - 의미: 태그 입력 및 관리 UI 렌더링
// - 사용 이유: 블로그 포스트 태그 입력
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

  // 상태: 임시 태그 입력
  // - 의미: 사용자가 입력 중인 태그 값 추적
  // - 사용 이유: 태그 추가 전 임시 저장
  // - Fallback: 빈 문자열
  const [tempTag, setTempTag] = React.useState('');

  // 값: 태그 배열
  // - 의미: 현재 폼의 태그 목록
  // - 사용 이유: 태그 렌더링 및 관리
  // - Fallback: 빈 배열
  const tags = watch('tags') || [];

  // 핸들러: 태그 입력 변경
  // - 의미: 임시 태그 입력 처리
  // - 사용 이유: 사용자 입력을 임시 상태에 저장
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 상태 업데이트
    // - 의미: tempTag 업데이트
    // - 사용 이유: 실시간 입력 반영
    setTempTag(e.target.value);
  };

  // 핸들러: 태그 추가
  // - 의미: 임시 태그를 태그 목록에 추가
  // - 사용 이유: 사용자 입력을 폼 상태에 반영
  const handleAddTag = () => {
    // 유효성 검사
    // - 의미: 빈 태그 또는 중복 태그 방지
    // - 사용 이유: 데이터 무결성 유지
    if (!tempTag.trim()) return;
    if (tags.includes(tempTag.trim())) return;
    // 태그 추가
    // - 의미: 태그 목록 업데이트
    // - 사용 이유: 새로운 태그를 폼 상태에 저장
    setValue('tags', [...tags, tempTag.trim()], { shouldValidate: true });
    // 임시 태그 초기화
    // - 의미: 입력 필드 비우기
    // - 사용 이유: 다음 태그 입력 준비
    setTempTag('');
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
      {/* 폼 필드 컨테이너 */}
      {/* - 의미: 태그 입력 및 목록을 세로로 정렬 */}
      {/* - 사용 이유: flex로 간단한 세로 레이아웃 구현 */}
      <div className="flex flex-col gap-6">
        {/* 태그 입력 필드 */}
        {/* - 의미: 태그 입력 및 추가 UI */}
        {/* - 사용 이유: 새로운 태그 입력 */}
        <FormItem>
          <label className="text-sm font-medium">태그</label>{' '}
          {/* 타이틀 복구 */}
          <div className="flex w-full gap-2">
            {' '}
            {/* w-full 적용 */}
            <Input
              placeholder="태그를 입력하세요"
              value={tempTag}
              onChange={handleTagInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              aria-label="태그 입력"
              className="flex-1"
            />
            <Button type="button" onClick={handleAddTag} aria-label="태그 추가">
              추가
            </Button>
          </div>
          {errors.tags && <FormMessage>{errors.tags.message}</FormMessage>}
        </FormItem>
        {/* 태그 목록 */}
        {/* - 의미: 추가된 태그 표시 */}
        {/* - 사용 이유: 사용자에게 현재 태그 목록 제공 */}
        <div className="flex flex-wrap w-full gap-2">
          {' '}
          {/* w-full 적용 */}
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
                &times;
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContentSection;
//====여기까지 수정됨====
