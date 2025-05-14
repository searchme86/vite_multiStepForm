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
const categoryOptions = [
  { value: 'tech', label: '기술' },
  { value: 'lifestyle', label: '생활' },
  { value: 'travel', label: '여행' },
  { value: 'food', label: '음식' },
];

// 함수: 기본 정보 섹션
function BasicInfoSection() {
  // 폼 컨텍스트
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      <div className="text-red-500">오류: 폼 컨텍스트를 찾을 수 없습니다.</div>
    );
  }
  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext;

  // 값: 폼 필드
  const titleValue = watch('title') || '';
  const contentValue = watch('content') || '';
  const categoryValue = watch('category') || '';
  const isDraftValue = watch('isDraft') || false;
  const isPublicValue = watch('isPublic') || true;

  // 핸들러: 제목 변경
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('title', e.target.value, { shouldValidate: true });
  };

  // 핸들러: 내용 변경
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue('content', e.target.value, { shouldValidate: true });
  };

  // 핸들러: 카테고리 변경
  const handleCategoryChange = (value: string) => {
    setValue('category', value, { shouldValidate: true });
  };

  // 핸들러: 초안 토글
  const handleDraftToggle = (checked: boolean) => {
    setValue('isDraft', checked, { shouldValidate: true });
    toast.success(
      checked
        ? '포스트가 초안으로 저장됩니다.'
        : '포스트가 초안에서 해제되었습니다.',
      { duration: 3000 }
    );
  };

  // 핸들러: 공개 토글
  const handlePublicToggle = (checked: boolean) => {
    setValue('isPublic', checked, { shouldValidate: true });
    toast.success(
      checked
        ? '포스트가 공개로 설정되었습니다.'
        : '포스트가 비공개로 설정되었습니다.',
      { duration: 3000 }
    );
  };

  return (
    // 컨테이너: 반응형 레이아웃
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      <PostGuidelines tab="basic" />
      <div className="grid gap-6 sm:grid-cols-2">
        <FormItem className="sm:col-span-2">
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
        <FormItem className="sm:col-span-2">
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
        <FormItem>
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
        <div className="space-y-4">
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
