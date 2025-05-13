//====여기부터 수정됨====
// BasicInfoSection.tsx: 블로그 포스트의 기본 정보 입력 섹션
// - 의미: 제목, 내용, 카테고리 입력 및 주의 문구와 자동저장 토글 관리
// - 사용 이유: 블로그 포스트의 핵심 정보 입력, 작성 가이드, 자동저장 설정 제공
// - 비유: 블로그 포스트의 표지(제목), 본문(내용), 분류 라벨(카테고리), 작성 규칙 메모, 자동저장 스위치
// - 작동 메커니즘:
//   1. useFormContext로 폼 컨텍스트 접근
//   2. FormItem과 watch/setValue로 제목, 내용, 카테고리 입력 관리
//   3. Select로 카테고리 선택, Input과 Textarea로 제목과 내용 입력
//   4. 주의 문구 리스트와 자동저장 토글로 가이드 및 설정 제공
//   5. useState로 토글 상태 관리, react-hot-toast로 상태별 메시지 표시
// - 관련 키워드: react-hook-form, shadcn/ui, Select, zod, FormItem, react-hot-toast
// - 추가 키워드 추천: useState, Switch, Radix UI, manual form control
import React, { useState } from 'react';
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
import toast from 'react-hot-toast';

// 상수: 카테고리 옵션
// - 타입: Array<{ value: string; label: string }>
// - 의미: 사용자가 선택 가능한 카테고리 목록
// - 사용 이유: 고정된 옵션으로 입력 제한, 사용자 선택 용이
// - 비유: 책장에 붙일 색깔 스티커 목록
const categoryOptions = [
  { value: 'tech', label: '기술' },
  { value: 'lifestyle', label: '생활' },
  { value: 'travel', label: '여행' },
  { value: 'food', label: '음식' },
];

// 함수: 기본 정보 섹션 컴포넌트
// - 의미: 제목, 내용, 카테고리 입력과 주의 문구, 자동저장 토글 UI
// - 사용 이유: 사용자 입력 수집, 작성 가이드 제공, 자동저장 설정 관리
function BasicInfoSection() {
  // 폼 컨텍스트: react-hook-form 훅
  // - 타입: UseFormReturn<BlogPostFormData> | null
  // - 의미: 폼 상태 및 메서드 접근
  // - 사용 이유: 중앙화된 폼 관리
  // - Fallback: 컨텍스트가 없으면 오류 메시지 표시
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      <div className="text-red-500">
        오류: 폼 컨텍스트를 찾을 수 없습니다. FormProvider 내에서 사용해야
        합니다.
      </div>
    );
  }
  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext;

  // 상태: 자동저장 토글
  // - 타입: boolean
  // - 의미: 자동저장 설정 여부 관리
  // - 사용 이유: true/false 전환으로 사용자 설정 반영
  // - Fallback: 기본값 false로 초기화
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState<boolean>(false);

  // 값: 폼 필드 현재 값
  // - 타입: string | undefined
  // - 의미: title, content, category 필드 값 관찰
  // - 사용 이유: Input, Textarea, Select 컴포넌트와 동기화
  // - Fallback: undefined일 경우 빈 문자열로 처리
  const titleValue = watch('title') || '';
  const contentValue = watch('content') || '';
  const categoryValue = watch('category') || '';

  // 함수: 자동저장 토글 핸들러
  // - 의미: 토글 상태 전환 및 토스트 메시지 표시
  // - 사용 이유: 사용자에게 자동저장 설정 변경 피드백 제공
  // - 작동 메커니즘:
  //   1. setIsAutoSaveEnabled로 상태 토글
  //   2. toast.success로 상태에 따라 다른 메시지 표시
  //   3. 3초 후 토스트 자동 사라짐
  const handleAutoSaveToggle = () => {
    setIsAutoSaveEnabled((prev) => {
      const newState = !prev;
      // 토스트: 자동저장 상태에 따라 메시지 표시
      // - 의미: 사용자에게 설정 변경 알림
      // - 사용 이유: 즉각적인 피드백 제공
      toast.success(
        newState
          ? '자동 저장이 설정됐습니다.'
          : '자동저장 설정이 종료됐습니다.',
        {
          duration: 3000, // 3초 후 자동 사라짐
        }
      );
      return newState;
    });
  };

  // 함수: 제목 변경 핸들러
  // - 의미: Input 컴포넌트의 값 변경 시 폼 상태 업데이트
  // - 사용 이유: FormControl 없이 수동으로 값 관리
  // - 작동 메커니즘:
  //   1. setValue로 title 필드 업데이트
  //   2. shouldValidate로 유효성 검사 실행
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('title', e.target.value, { shouldValidate: true });
  };

  // 함수: 내용 변경 핸들러
  // - 의미: Textarea 컴포넌트의 값 변경 시 폼 상태 업데이트
  // - 사용 이유: FormControl 없이 수동으로 값 관리
  // - 작동 메커니즘:
  //   1. setValue로 content 필드 업데이트
  //   2. shouldValidate로 유효성 검사 실행
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue('content', e.target.value, { shouldValidate: true });
  };

  // 함수: 카테고리 변경 핸들러
  // - 의미: Select 컴포넌트의 값 변경 시 폼 상태 업데이트
  // - 사용 이유: FormControl 없이 수동으로 값 관리
  // - 작동 메커니즘:
  //   1. setValue로 category 필드 업데이트
  //   2. shouldValidate로 유효성 검사 실행
  const handleCategoryChange = (value: string) => {
    setValue('category', value, { shouldValidate: true });
  };

  return (
    // 컨테이너: 입력 필드, 주의 문구, 자동저장 토글
    // - 의미: 제목, 내용, 카테고리 입력과 가이드 및 설정 UI 통합
    // - 사용 이유: 사용자 친화적 레이아웃 제공
    <div className="space-y-6">
      {/* 주의 문구 섹션 */}
      <div className="p-6 space-y-6 rounded-lg bg-gray-50">
        <div>
          <h3 className="mb-4 text-lg font-medium">포스트 작성 유의사항</h3>
          {/* 리스트: 주의 문구 */}
          {/* - 의미: 사용자에게 작성 규칙 안내 */}
          {/* - 사용 이유: 명확한 가이드 제공 */}
          <ul className="pl-5 space-y-2 text-gray-600 list-disc">
            <li>제목은 5자 이상 100자 이하로 작성해주세요.</li>
            <li>내용은 100자 이상 작성해주세요.</li>
            <li>카테고리를 반드시 선택해주세요.</li>
            <li>최소 1개 이상의 태그를 추가해주세요. (최대 5개)</li>
            <li>대표 이미지는 최소 1개 이상 업로드해주세요. (최대 10개)</li>
          </ul>
          {/* 토글: 자동저장 설정 */}
          {/* - 의미: 자동저장 활성화/비활성화 설정 */}
          {/* - 사용 이유: 사용자 인터랙션 및 피드백 제공 */}
          <div className="flex items-center justify-between p-4 mt-4 border rounded-lg">
            <div className="space-y-0.5">
              <FormLabel>자동 저장</FormLabel>
              <p className="text-sm text-gray-500">
                자동 저장을 활성화하면 주기적으로 포스트가 저장됩니다.
              </p>
            </div>
            {/* FormControl 제거, Switch 직접 사용 */}
            <Switch
              checked={isAutoSaveEnabled}
              onCheckedChange={handleAutoSaveToggle}
              aria-label="자동저장 설정"
            />
          </div>
        </div>
      </div>
      {/* 제목 입력 */}
      {/* - 의미: 제목 입력 필드, 수동 값 관리 */}
      {/* - 사용 이유: ref 전달 문제 해결, Input과 호환 */}
      <FormItem>
        <FormLabel>제목</FormLabel>
        {/* FormControl 제거, Input 직접 사용 */}
        <Input
          placeholder="블로그 포스트 제목을 입력하세요"
          value={titleValue}
          onChange={handleTitleChange}
          aria-invalid={!!errors.title}
          aria-label="블로그 포스트 제목"
        />
        {errors.title && <FormMessage>{errors.title.message}</FormMessage>}
      </FormItem>
      {/* 내용 입력 */}
      {/* - 의미: 내용 입력 필드, 수동 값 관리 */}
      {/* - 사용 이유: ref 전달 문제 해결, Textarea와 호환 */}
      <FormItem>
        <FormLabel>내용</FormLabel>
        {/* FormControl 제거, Textarea 직접 사용 */}
        <Textarea
          placeholder="블로그 포스트 내용을 입력하세요"
          className="min-h-[200px]"
          value={contentValue}
          onChange={handleContentChange}
          aria-invalid={!!errors.content}
          aria-label="블로그 포스트 내용"
        />
        {errors.content && <FormMessage>{errors.content.message}</FormMessage>}
      </FormItem>
      {/* 카테고리 선택 */}
      {/* - 의미: 카테고리 입력 필드, 수동 값 관리 */}
      {/* - 사용 이유: ref 전달 문제 해결, Radix UI Select와 호환 */}
      <FormItem>
        <FormLabel>카테고리</FormLabel>
        {/* FormControl 제거, Select 직접 사용 */}
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
  );
}

export default BasicInfoSection;
//====여기까지 수정됨====
