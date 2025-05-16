import React, { useState, useEffect } from 'react';
// import React, { useState } from 'react';
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

// 타입: 에러 메시지
// - 의미: 에러 메시지의 종류와 텍스트를 포함
// - 값: 'empty', 'multi-block', 'mapping-failed' 중 하나와 메시지 문자열
// - 왜: 사용자에게 구체적인 에러 피드백 제공
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
  // 컴포넌트 렌더링 로그, 개발 환경에서만 출력
  // - 의미: 렌더링 추적
  // - 왜: 프로덕션 환경에서 불필요한 로그 제거
  if (process.env.NODE_ENV === 'development') {
    console.log('ContentSection: Rendering'); // 렌더링 시작 로그 출력
    // - 의미: 컴포넌트 렌더링 확인
    // - 왜: 디버깅 용이성
  }
  const formContext = useFormContext<BlogPostFormData>(); // 폼 컨텍스트 가져오기
  // - 의미: react-hook-form으로 폼 상태 접근
  // - 왜: 마크다운 및 태그 데이터 동기화
  // 폼 컨텍스트 없으면 에러 UI 표시
  // - 의미: 폼 데이터 접근 실패 시 사용자 피드백
  // - 왜: 사용자 경험 개선
  if (!formContext) {
    return (
      <div
        className="flex flex-col items-center justify-center p-4 text-red-500"
        role="alert"
        aria-live="assertive"
      >
        <h2 className="text-lg font-medium">폼 컨텍스트 오류</h2>
        {/* - 의미: 에러 메시지 제목 표시 */}
        {/* - 왜: 사용자에게 오류 상황 명확히 전달 */}
        <p className="text-sm">콘텐츠 섹션을 로드할 수 없습니다.</p>
        {/* - 의미: 에러 상세 메시지 표시 */}
        {/* - 왜: 오류 원인 설명 */}
      </div>
    ); // 폼 컨텍스트 오류 시 에러 메시지 렌더링
    // - 의미: 사용자에게 오류 알림
    // - 왜: 오류 상황 처리
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
  const [selectedOffset, setSelectedOffset] = useState<number | null>(null);
  const [selectedLength, setSelectedLength] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  return (
    <div
      className="flex flex-col gap-6 px-4 space-y-6 sm:px-6 md:px-8"
      role="region"
      aria-label="콘텐츠 작성 섹션"
    >
      {/* - 의미: 전체 콘텐츠 섹션 컨테이너 */}
      {/* - 왜: 접근성 및 레이아웃 구조 제공 */}
      <PostGuidelines tab="tags" />
      {/* - 의미: 태그 작성 가이드라인 렌더링 */}
      {/* - 왜: 사용자에게 태그 입력 지침 제공 */}
      <div className="flex flex-col gap-6">
        {/* - 의미: 내부 콘텐츠 컨테이너 */}
        {/* - 왜: 세로 레이아웃 구성 */}
        <span className="text-sm text-gray-500" style={{ marginLeft: 'auto' }}>
          작성 날짜: {formatCurrentDate()}
        </span>
        {/* - 의미: 현재 날짜 표시 */}
        {/* - 왜: 사용자에게 작성 시점 정보 제공 */}
        <div className="flex flex-col gap-6">
          {/* - 의미: 태그 및 에디터/미리보기 컨테이너 */}
          {/* - 왜: 하위 컴포넌트 그룹화 */}
          <TagAutoComplete onAddTag={handleAddTag} />
          {/* - 의미: 태그 자동완성 컴포넌트 렌더링 */}
          {/* - 왜: 태그 입력 인터페이스 제공 */}
          <div className="flex flex-wrap w-full gap-2" role="list">
            {/* - 의미: 태그 목록 컨테이너 */}
            {/* - 왜: 태그 동적 렌더링 및 접근성 */}
            {tags.map((tag: string) => (
              <div
                key={tag}
                className="flex items-center px-3 py-1 text-sm bg-gray-200 rounded-full"
                role="listitem"
              >
                {/* - 의미: 개별 태그 렌더링 */}
                {/* - 왜: 태그 표시 및 삭제 인터페이스 */}
                <span>{tag}</span>
                {/* - 의미: 태그 이름 표시 */}
                {/* - 왜: 사용자에게 태그 내용 전달 */}
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
                {/* - 의미: 태그 삭제 버튼 */}
                {/* - 왜: 태그 제거 기능 제공 */}
              </div>
            ))}
            {errors.tags && <FormMessage>{errors.tags.message}</FormMessage>}
            {/* - 의미: 태그 유효성 검사 에러 메시지 */}
            {/* - 왜: 사용자에게 입력 오류 피드백 */}
          </div>
          <div className="flex flex-col gap-6 min-h-[400px] md:flex-row">
            {/* - 의미: 에디터 및 미리보기 컨테이너 */}
            {/* - 왜: 반응형 레이아웃 제공 */}
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
              snapPoints={[0.2, 0.5, 0.8]} // 20%, 50%, 80% 높이에서 멈춤
            >
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-4 max-h-[80vh] overflow-auto">
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
          {/* - 의미: 에러 메시지 렌더링 */}
          {/* - 왜: 선택 실패 시 사용자 피드백 */}
        </div>
      </div>
    </div>
  );
}

export default ContentSection;
