//====여기부터 수정됨====
// ContentSection.tsx: 태그 입력 섹션
// - 의미: 블로그 포스트의 태그 입력 관리
// - 사용 이유: 검색 및 분류를 위한 태그 입력
// - 비유: 책에 붙이는 키워드 스티커
// - 작동 메커니즘:
//   1. useFormContext로 태그 관리
//   2. Input으로 태그 추가, Badge로 표시
//   3. PostGuidelines로 가이드 제공
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { FormItem, FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';
import PostGuidelines from './PostGuidelines';

function ContentSection() {
  // 폼 컨텍스트
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BlogPostFormData>();
  const tags = watch('tags') || [];

  // 핸들러: 태그 추가
  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setValue('tags', [...tags, tag], { shouldValidate: true });
    }
  };

  // 핸들러: 태그 제거
  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      tags.filter((tag) => tag !== tagToRemove),
      {
        shouldValidate: true,
      }
    );
  };

  return (
    // 컨테이너: 반응형 레이아웃
    <div className="px-4 space-y-6 sm:px-6 md:px-8">
      <PostGuidelines tab="tags" />
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
          />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
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
