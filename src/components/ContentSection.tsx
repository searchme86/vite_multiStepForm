// ContentSection.tsx: 블로그 포스트 본문 작성 및 미리보기 통합
// - 의미: 태그, 마크다운 입력, 클릭+드래그로 에디터 이동
// - 사용 이유: 포스트 작성과 실시간 미리보기 제공
// - 비유: 책(미리보기)에서 문장 색칠 후 노트(에디터)로 펜 이동
// - 작동 메커니즘:
//   1. useFormContext로 폼 상태 관리
//   2. TagAutoComplete로 태그 입력
//   3. MarkdownEditor와 MarkdownPreview로 입력/미리보기
//   4. 클릭+드래그로 텍스트 선택, 에디터로 커서 이동
// - 관련 키워드: react-hook-form, shadcn-ui, react-quill, tailwindcss

//====여기부터 수정됨====
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from './ui/button';
import { FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';
import PostGuidelines from './PostGuidelines';
import TagAutoComplete from './TagAutoComplete';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';

// 타입: 에러 메시지
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 함수: 현재 날짜 포맷팅
const formatCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 함수: 본문 작성 섹션
function ContentSection() {
  console.log('ContentSection: Rendering');
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      <div
        className="flex flex-col items-center justify-center p-4 text-red-500"
        role="alert"
        aria-live="assertive"
      >
        <h2 className="text-lg font-medium">폼 컨텍스트 오류</h2>
        <p className="text-sm">콘텐츠 섹션을 로드할 수 없습니다.</p>
      </div>
    );
  }
  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext;

  const tags = watch('tags') || [];
  const [selectedBlockText, setSelectedBlockText] = useState<string | null>(
    null
  );
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);

  const handleAddTag = (tag: string) => {
    if (!tag.trim() || tags.includes(tag)) return;
    setValue('tags', [...tags, tag], { shouldValidate: true });
  };

  const handleRemoveTag = (tag: string) => {
    setValue(
      'tags',
      tags.filter((t: string) => t !== tag),
      { shouldValidate: true }
    );
  };

  return (
    <div
      className="px-4 space-y-6 sm:px-6 md:px-8"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <PostGuidelines tab="tags" />
      <div className="flex flex-col gap-6">
        <span className="text-sm text-gray-500" style={{ marginLeft: 'auto' }}>
          작성 날짜: {formatCurrentDate()}
        </span>
        <div className="flex flex-col gap-6">
          <TagAutoComplete onAddTag={handleAddTag} />
          <div className="flex flex-wrap w-full gap-2">
            {tags.map((tag: string) => (
              <div
                key={tag}
                className="flex items-center px-3 py-1 text-sm bg-gray-200 rounded-full"
                role="listitem"
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
          <div className="flex flex-col gap-6 min-h-[400px] md:flex-row">
            <MarkdownEditor
              selectedBlockText={selectedBlockText}
              selectedText={selectedText}
              setErrorMessage={setErrorMessage}
            />
            <MarkdownPreview
              setSelectedBlockText={setSelectedBlockText}
              setSelectedText={setSelectedText}
              setErrorMessage={setErrorMessage}
            />
          </div>
          {errorMessage && (
            <p
              className="text-sm text-red-500"
              role="alert"
              aria-live="assertive"
            >
              {errorMessage.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentSection;
//====여기까지 수정됨====
