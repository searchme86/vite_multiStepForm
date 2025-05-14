//====여기부터 수정됨====
// BasicInfoSection.tsx: 블로그 포스트의 기본 정보 입력 섹션
// - 의미: 제목, 내용, 카테고리, 게시 옵션 입력
// - 사용 이유: 핵심 정보 입력 및 설정 통합
// - 비유: 블로그 포스트의 표지(제목), 본문(내용), 라벨(카테고리), 설정 스위치
// - 작동 메커니즘:
//   1. useFormContext로 폼 상태 관리
//   2. FormItem으로 입력 필드 관리
//   3. PostGuidelines로 가이드와 저장 설정 렌더링
//   4. Switch로 게시 옵션 관리
// - 관련 키워드: react-hook-form, shadcn/ui, flexbox
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
import { FormItem, FormLabel, FormMessage } from './ui/form';
import { Switch } from './ui/switch';
import { BlogPostFormData } from '../types/blog-post';
import PostGuidelines from './PostGuidelines';
import toast from 'react-hot-toast';

// 상수: 카테고리 옵션
// - 의미: 카테고리 선택지 정의
// - 사용 이유: 드롭다운 메뉴에 표시
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
  const titleValue = watch('title') || '';
  const contentValue = watch('content') || '';
  const categoryValue = watch('category') || '';
  const isDraftValue = watch('isDraft') || false;
  const isPublicValue = watch('isPublic') || true;

  // 핸들러: 제목 변경
  // - 의미: 제목 입력 처리
  // - 사용 이유: 사용자 입력을 폼 상태에 반영
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // setValue 호출
    // - 의미: 제목 필드 업데이트
    // - 사용 이유: 입력값 저장 및 유효성 검사
    setValue('title', e.target.value, { shouldValidate: true });
  };

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

  // 핸들러: 초안 토글
  // - 의미: 초안 설정 처리
  // - 사용 이유: 초안 여부 변경 및 사용자 피드백
  const handleDraftToggle = (checked: boolean) => {
    // setValue 호출
    // - 의미: 초안 필드 업데이트
    // - 사용 이유: 설정 저장 및 유효성 검사
    setValue('isDraft', checked, { shouldValidate: true });
    // toast 호출
    // - 의미: 사용자에게 변경 알림
    // - 사용 이유: 즉각적 피드백 제공
    toast.success(
      checked
        ? '포스트가 초안으로 저장됩니다.'
        : '포스트가 초안에서 해제되었습니다.',
      { duration: 3000 }
    );
  };

  // 핸들러: 공개 토글
  // - 의미: 공개 설정 처리
  // - 사용 이유: 공개 여부 변경 및 사용자 피드백
  const handlePublicToggle = (checked: boolean) => {
    // setValue 호출
    // - 의미: 공개 필드 업데이트
    // - 사용 이유: 설정 저장 및 유효성 검사
    setValue('isPublic', checked, { shouldValidate: true });
    // toast 호출
    // - 의미: 사용자에게 변경 알림
    // - 사용 이유: 즉각적 피드백 제공
    toast.success(
      checked
        ? '포스트가 공개로 설정되었습니다.'
        : '포스트가 비공개로 설정되었습니다.',
      { duration: 3000 }
    );
  };

  return (
    // 컨테이너: 반응형 레이아웃
    // - 의미: 모바일, 태블릿, 데스크톱 지원
    // - 사용 이유: 다양한 화면 크기에서 일관된 UI
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      {/* 가이드라인 컴포넌트 */}
      {/* - 의미: 작성 가이드 표시 */}
      {/* - 사용 이유: 사용자에게 입력 지침 제공 */}
      <PostGuidelines tab="basic" />
      {/* 폼 필드 컨테이너 */}
      {/* - 수정: grid -> flex */}
      {/* - 의미: 입력 필드를 세로로 정렬 */}
      {/* - 사용 이유: flex로 간단한 세로 레이아웃 구현 */}
      {/* - 비유: 책 페이지에 줄글처럼 세로로 쌓인 문단 */}
      <div className="flex flex-col gap-6">
        {/* 제목 필드 */}
        {/* - 의미: 제목 입력 UI */}
        {/* - 사용 이유: 포스트 제목 입력 */}
        <FormItem>
          <FormLabel>제목</FormLabel>
          <Input
            placeholder="블로그 포스트 제목을 입력하세요"
            value={titleValue}
            onChange={handleTitleChange}
            aria-invalid={!!errors.title}
            aria-label="블로그 포스트 제목"
          />
          {errors.title && <FormMessage>{errors.title.message}</FormMessage>}
        </FormItem>
        {/* 내용 필드 */}
        {/* - 의미: 내용 입력 UI */}
        {/* - 사용 이유: 포스트 본문 입력 */}
        <FormItem>
          <FormLabel>내용</FormLabel>
          <Textarea
            placeholder="블로그 포스트 내용을 입력하세요"
            className="min-h-[200px]"
            value={contentValue}
            onChange={handleContentChange}
            aria-invalid={!!errors.content}
            aria-label="블로그 포스트 내용"
          />
          {errors.content && (
            <FormMessage>{errors.content.message}</FormMessage>
          )}
        </FormItem>
        {/* 카테고리 및 설정 컨테이너 */}
        {/* - 수정: grid -> flex */}
        {/* - 의미: 카테고리와 설정을 가로로 배치 */}
        {/* - 사용 이유: flex로 반응형 가로 레이아웃 구현 */}
        {/* - 비유: 책 표지에 나란히 붙은 라벨과 스위치 */}
        {/* 카테고리 필드 */}
        {/* - 의미: 카테고리 선택 UI */}
        {/* - 사용 이유: 포스트 분류 선택 */}
        <FormItem className="flex-1">
          <FormLabel>카테고리</FormLabel>
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
        {/* 설정 필드 */}
        {/* - 의미: 초안 및 공개 설정 UI */}
        {/* - 사용 이유: 게시 옵션 관리 */}
        <div className="ml-auto space-y-4">
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>초안으로 저장</FormLabel>
              <Switch
                checked={isDraftValue}
                onCheckedChange={handleDraftToggle}
                aria-label="초안으로 저장"
              />
            </div>
            {errors.isDraft && (
              <FormMessage>{errors.isDraft.message}</FormMessage>
            )}
          </FormItem>
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>공개 포스트</FormLabel>
              <Switch
                checked={isPublicValue}
                onCheckedChange={handlePublicToggle}
                aria-label="공개 여부"
              />
            </div>
            {errors.isPublic && (
              <FormMessage>{errors.isPublic.message}</FormMessage>
            )}
          </FormItem>
        </div>
      </div>
    </div>
  );
}

export default BasicInfoSection;
//====여기까지 수정됨====
