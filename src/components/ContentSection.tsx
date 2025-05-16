import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from './ui/button';
import { FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';
import PostGuidelines from './PostGuidelines';
import TagAutoComplete from './TagAutoComplete';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import { Drawer } from 'vaul';
import './vaul.css';

type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

const formatCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function ContentSection() {
  if (process.env.NODE_ENV === 'development') {
    console.log('ContentSection: Rendering');
  }
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
  const snapPoints = ['148px', '355px', 1];
  const [selectedBlockText, setSelectedBlockText] = useState<string | null>(
    null
  );
  const [selectedOffset, setSelectedOffset] = useState<number | null>(null);
  const [selectedLength, setSelectedLength] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  console.log('isMobile', isMobile);

  return (
    <div
      className="flex flex-col gap-6 px-4 space-y-6 sm:px-6 md:px-8"
      role="region"
      aria-label="콘텐츠 작성 섹션"
    >
      <PostGuidelines tab="tags" />
      <div className="flex flex-col gap-6">
        <span className="text-sm text-gray-500" style={{ marginLeft: 'auto' }}>
          작성 날짜: {formatCurrentDate()}
        </span>
        <div className="flex flex-col gap-6">
          <TagAutoComplete onAddTag={handleAddTag} />
          <div className="flex flex-wrap w-full gap-2" role="list">
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
              selectedOffset={selectedOffset}
              selectedLength={selectedLength}
              selectedText={selectedText}
              setErrorMessage={setErrorMessage}
              isMobile={isMobile}
              onOpenPreview={() => setIsPreviewOpen(true)}
            />
            {!isMobile && (
              <MarkdownPreview
                setSelectedBlockText={setSelectedBlockText}
                setSelectedOffset={setSelectedOffset}
                setSelectedLength={setSelectedLength}
                setSelectedText={setSelectedText}
                setErrorMessage={setErrorMessage}
                isMobile={false}
              />
            )}
          </div>
          {isMobile && (
            <Drawer.Root
              open={isPreviewOpen}
              onOpenChange={setIsPreviewOpen}
              // snapPoints={snapPoints}
              // activeSnapPoint={snap}
              // setActiveSnapPoint={setSnap}
              // snapPoints={[0.2, 0.5, 0.8]} // Drawer가 멈추는 지점 설정
            >
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-4 max-h-[90vh] overflow-auto">
                  <Drawer.Handle className="mx-auto w-12 h-1.5 bg-gray-300 rounded-full mb-4" />
                  <Drawer.Title className="mb-2 text-lg font-medium">
                    미리보기
                  </Drawer.Title>
                  <MarkdownPreview
                    setSelectedBlockText={setSelectedBlockText}
                    setSelectedOffset={setSelectedOffset}
                    setSelectedLength={setSelectedLength}
                    setSelectedText={setSelectedText}
                    setErrorMessage={setErrorMessage}
                    isMobile={true}
                    onClose={() => setIsPreviewOpen(false)}
                  />
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          )}
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
