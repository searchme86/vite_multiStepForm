//====여기부터 수정됨====
// BasicInfoSection.tsx: 블로그 포스트의 기본 정보 입력 섹션
// - 의미: 제목, 내용, 카테고리 입력을 처리하는 폼 섹션
// - 사용 이유: 블로그 포스트의 핵심 정보 관리
// - 비유: 블로그 포스트의 표지(제목), 본문(내용), 분류 라벨(카테고리)
// - 작동 메커니즘:
//   1. useFormContext로 폼 컨텍스트 접근
//   2. Controller로 카테고리 입력 관리, ref 전달 제거
//   3. Select로 카테고리 선택, 유효성 검사 오류 표시
// - 관련 키워드: react-hook-form, shadcn/ui, Select, zod, Controller
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { BlogPostFormData } from '../types/blog-post';

// 상수: 카테고리 옵션
// - 타입: Array<{ value: string; label: string }>
// - 의미: 사용자가 선택 가능한 카테고리 목록
// - 사용 이유: 고정된 옵션으로 입력 제한
// - 비유: 책장에 붙일 색깔 스티커 목록
const categoryOptions = [
  { value: 'tech', label: '기술' },
  { value: 'lifestyle', label: '생활' },
  { value: 'travel', label: '여행' },
  { value: 'food', label: '음식' },
];

// 함수: 기본 정보 섹션 컴포넌트
// - 의미: 제목, 내용, 카테고리 입력 UI
// - 사용 이유: 사용자 입력 수집 및 유효성 검사
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
    control,
    formState: { errors },
  } = formContext;

  return (
    // 컨테이너: 입력 필드와 레이블
    // - 의미: 제목, 내용, 카테고리 입력 UI 통합
    // - 사용 이유: 사용자 친화적 레이아웃 제공
    <div className="space-y-6">
      {/* 제목 입력 */}
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>제목</FormLabel>
            <FormControl>
              <Input
                placeholder="블로그 포스트 제목을 입력하세요"
                {...field}
                aria-invalid={!!errors.title}
                aria-label="블로그 포스트 제목"
              />
            </FormControl>
            {errors.title && <FormMessage>{errors.title.message}</FormMessage>}
          </FormItem>
        )}
      />
      {/* 내용 입력 */}
      <FormField
        control={control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>내용</FormLabel>
            <FormControl>
              <Textarea
                placeholder="블로그 포스트 내용을 입력하세요"
                className="min-h-[200px]"
                {...field}
                aria-invalid={!!errors.content}
                aria-label="블로그 포스트 내용"
              />
            </FormControl>
            {errors.content && (
              <FormMessage>{errors.content.message}</FormMessage>
            )}
          </FormItem>
        )}
      />
      {/* 카테고리 선택 */}
      {/* - 의미: 카테고리 입력 필드, Select 컴포넌트 사용 */}
      {/* - 사용 이유: 사용자에게 고정된 옵션 제공, ref 전달 방지 */}
      <Controller
        control={control}
        name="category"
        render={({ field, fieldState: { error } }) => (
          <FormItem>
            <FormLabel>카테고리</FormLabel>
            {/* FormControl 제거, Select 직접 렌더링 */}
            <Select
              onValueChange={field.onChange}
              value={field.value || ''} // Fallback: 값이 없으면 빈 문자열
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
            {error && <FormMessage>{error.message}</FormMessage>}
          </FormItem>
        )}
      />
    </div>
  );
}

export default BasicInfoSection;
//====여기까지 수정됨====
