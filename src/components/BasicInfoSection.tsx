//====여기부터 수정됨====
// BasicInfoSection.tsx: 블로그 포스트의 기본 정보 입력 섹션
// - 의미: 제목, 내용, 카테고리 입력 및 주의 문구 관리
// - 사용 이유: 블로그 포스트의 핵심 정보와 작성 가이드 제공
// - 비유: 블로그 포스트의 표지(제목), 본문(내용), 분류 라벨(카테고리), 작성 규칙 메모
// - 작동 메커니즘:
//   1. useFormContext로 폼 컨텍스트 접근
//   2. Controller로 카테고리 입력 관리, ref 전달 제거
//   3. Select로 카테고리 선택, 유효성 검사 오류 표시
//   4. 주의 문구 리스트와 확인 버튼으로 사용자 가이드 제공
// - 관련 키워드: react-hook-form, shadcn/ui, Select, zod, Controller, react-hot-toast
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
import { Button } from './ui/button';
import { BlogPostFormData } from '../types/blog-post';
import toast from 'react-hot-toast';

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
// - 의미: 제목, 내용, 카테고리 입력 및 주의 문구 UI
// - 사용 이유: 사용자 입력 수집 및 작성 가이드 제공
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

  // 함수: 주의 문구 확인 핸들러
  // - 의미: 확인 버튼 클릭 시 토스트 팝업 표시
  // - 사용 이유: 사용자에게 가이드 확인 피드백 제공
  const handleGuidelinesCheck = () => {
    toast.success('유의사항을 확인했습니다.', {
      duration: 3000, // 3초 후 자동 사라짐
    });
  };

  return (
    // 컨테이너: 입력 필드, 주의 문구, 확인 버튼
    // - 의미: 제목, 내용, 카테고리 입력 및 가이드 UI 통합
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
          {/* 버튼: 주의 문구 확인 */}
          {/* - 의미: 사용자가 가이드를 확인했음을 알림 */}
          {/* - 사용 이유: 인터랙티브 피드백 제공 */}
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={handleGuidelinesCheck}
            aria-label="유의사항 확인"
          >
            유의사항 확인
          </Button>
        </div>
      </div>
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
            <FormControl>
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
            </FormControl>
            {error && <FormMessage>{error.message}</FormMessage>}
          </FormItem>
        )}
      />
    </div>
  );
}

export default BasicInfoSection;
//====여기까지 수정됨====
