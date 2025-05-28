//====여기부터 수정됨====
// ContentSection.tsx: 콘텐츠 작성 섹션
// - 의미: 태그 입력, 마크다운 편집, 미리보기 관리
// - 사용 이유: 콘텐츠 입력 기능 분리, Zustand로 상태 지속성 보장
// - 비유: 블로그 콘텐츠 작성 노트 페이지
// - 작동 메커니즘:
//   1. useFormContext로 폼 상태 관리
//   2. TagAutoComplete으로 태그 입력
//   3. MarkdownEditor와 MarkdownPreview로 콘텐츠 편집 및 미리보기
//   4. Zustand로 태그, 마크다운, 검색어 동기화
// - 관련 키워드: react-hook-form, zustand, shadcn/ui, tailwindcss, flexbox

import React, { useState, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from './ui/button';
import { FormMessage } from './ui/form';
import PostGuidelines from './PostGuidelines';
// import TagAutoComplete from './TagAutoComplete';
import MarkdownEditor from './markdown/MarkdownEditor';
import MarkdownPreview from './markdown/MarkdownPreview';
import { Drawer } from 'vaul';
import { useStepFieldsStateStore } from '../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';
import TagManagementContainer from './TagManagementContainer';

// vaul.css를 조건부로 import
// - 의미: Drawer 컴포넌트 스타일 적용
// - 사용 이유: 모바일 미리보기 드로어 UI
// - 작동 매커니즘: 런타임에 CSS 모듈 존재 여부 확인 후 적용
try {
  // @ts-ignore - CSS 모듈 타입 에러 무시
  require('./vaul.css');
} catch (error) {
  // CSS 파일이 없어도 컴포넌트는 정상 작동
  // - 의미: 스타일 없이도 기능적으로 동작
  // - 사용 이유: 의존성 누락 시에도 앱이 깨지지 않도록 방어
  console.warn('vaul.css not found, using default drawer styles');
}

// 타입: 오류 메시지
// - 의미: 오류 유형과 메시지 정의
// - 사용 이유: 사용자 피드백 제공
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 타입: 태그 필드 아이템
// - 의미: useFieldArray에서 사용하는 태그 필드 구조
// - 사용 이유: 타입 안전성 보장
type TagFieldItem = {
  id: string;
  value: string;
};

// ContentSection: 콘텐츠 작성 UI 제공
// - 의미: 태그 입력, 마크다운 편집, 미리보기 통합
// - 사용 이유: 콘텐츠 입력 관리, Zustand 동기화
function ContentSection() {
  // 개발 환경 로그
  // - 의미: 렌더링 확인
  // - 사용 이유: 디버깅
  if (process.env.NODE_ENV === 'development') {
    console.log('ContentSection: Rendering');
  }

  // FormProvider로부터 폼 메서드들을 가져옴
  // - 의미: 상위 컴포넌트에서 전달된 폼 컨텍스트 사용
  // - 사용 이유: props drilling 없이 폼 상태에 접근
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  // Zustand 상태 및 setter - 안전한 타입 처리
  // - 의미: 태그, 마크다운, 검색어 상태 동기화
  // - 사용 이유: Zustand로 선택적 지속성 보장 (미리보기 제외)
  const store = useStepFieldsStateStore();
  const setTags = store.setTags || (() => {}); // fallback 함수 제공
  const setMarkdown = store.setMarkdown || (() => {}); // fallback 함수 제공 (세션별 초기화)
  const setSearchTerm = store.setSearchTerm || (() => {}); // fallback 함수 제공 (세션별 초기화)

  // 컴포넌트 마운트 시 미리보기 관련 상태 초기화
  // - 의미: 페이지 로드 시 마크다운 미리보기 관련 상태만 초기화
  // - 사용 이유: 브라우저 리프레시 시 미리보기는 새로 시작
  React.useEffect(() => {
    // 마크다운과 검색어만 초기화 (다른 폼 데이터는 유지)
    setValue('markdown', '', { shouldValidate: false });
    setValue('searchTerm', '', { shouldValidate: false });

    // Zustand에서도 초기화 (실제로는 저장되지 않지만 세션 내 상태 초기화)
    setMarkdown('');
    setSearchTerm('');

    if (process.env.NODE_ENV === 'development') {
      console.log('ContentSection: Markdown preview states cleared on mount');
    }
  }, []); // 컴포넌트 마운트 시에만 실행

  // 필드 배열 관리 - 타입 안전한 처리
  // - 의미: 'tags' 필드를 배열로 관리
  // - 사용 이유: 태그 추가/삭제 처리
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tags',
  });

  // 타입 안전한 필드 접근을 위한 타입 가드
  // - 의미: fields를 TagFieldItem 타입으로 안전하게 변환
  // - 사용 이유: 타입 에러 방지
  const typedFields = fields as unknown as TagFieldItem[];

  // 상태: 선택된 블록 텍스트, 오프셋, 길이, 텍스트
  // - 의미: 마크다운 편집 및 미리보기 연동
  const [selectedBlockText, setSelectedBlockText] = useState<string | null>(
    null
  );
  const [selectedOffset, setSelectedOffset] = useState<number | null>(null);
  const [selectedLength, setSelectedLength] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  // 상태: 오류 메시지
  // - 의미: 사용자 피드백
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  // 상태: 모바일 여부
  // - 의미: 반응형 UI 제공
  const [isMobile, setIsMobile] = useState(false);
  // 상태: 미리보기 열림 여부
  // - 의미: 모바일 미리보기 드로어 제어
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 효과: 창 크기 감지
  // - 의미: 모바일 상태 업데이트
  // - 사용 이유: 반응형 디자인
  // - 작동 매커니즘: 창 크기 변경 시 모바일 여부 판단
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 디버깅 로그
  // - 의미: 모바일 상태 확인
  console.log('isMobile', isMobile);

  return (
    // 컨테이너: 콘텐츠 섹션 레이아웃
    // - 의미: 전체 UI 구조 정의
    // - 사용 이유: Tailwind CSS로 반응형 레이아웃
    <div
      className="flex flex-col gap-6 px-4 space-y-6 sm:px-6 md:px-8"
      role="region"
      aria-label="콘텐츠 작성 섹션"
    >
      {/* 가이드라인 컴포넌트 */}
      {/* - 의미: 태그 작성 가이드 표시 */}
      <PostGuidelines tab="tags" setValue={setValue} />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          {/* 태그 입력 컴포넌트 */}
          {/* - 의미: 태그 입력 UI 제공 */}
          {/* <TagAutoComplete
            onAddTags={(newTags) => {
              // 현재 태그 값 추출 - 타입 안전한 처리
              const currentValues = typedFields.map((field) => field.value);
              // 중복되지 않은 새 태그 필터링
              const uniqueNewTags = newTags.filter(
                (tag) => !currentValues.includes(tag)
              );
              // 새 태그 추가
              uniqueNewTags.forEach((tag) => append({ id: tag, value: tag }));
              const updatedTags = [...currentValues, ...uniqueNewTags];
              setValue('tags', updatedTags, { shouldValidate: true });
              setTags(updatedTags); // Zustand 동기화
            }}
          /> */}
          <TagManagementContainer />
          {/* 태그 목록 표시 */}
          {/* - 의미: 추가된 태그를 칩 형태로 표시 */}
          {/* <div className="flex flex-wrap w-full gap-2" role="list">
            {typedFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center px-3 py-1 text-sm bg-gray-200 rounded-full"
                role="listitem"
              >
                <span>{field.value}</span>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    remove(index);
                    const newTags = typedFields
                      .filter((_, i) => i !== index)
                      .map((f) => f.value);
                    setValue('tags', newTags, { shouldValidate: true });
                    setTags(newTags);
                  }}
                  aria-label={`태그 ${field.value} 삭제`}
                  className="ml-2"
                >
                  ×
                </Button>
              </div>
            ))}
            {errors.tags && (
              <FormMessage>
                {typeof errors.tags.message === 'string'
                  ? errors.tags.message
                  : '태그 입력에 오류가 있습니다.'}
              </FormMessage>
            )}
          </div> */}
          {/* 편집기 및 미리보기 컨테이너 */}
          {/* - 의미: 마크다운 편집기와 미리보기 배치 */}
          <div className="flex flex-col gap-6 min-h-[400px] md:flex-row">
            <MarkdownEditor
              selectedBlockText={selectedBlockText}
              selectedOffset={selectedOffset}
              selectedLength={selectedLength}
              selectedText={selectedText}
              setErrorMessage={setErrorMessage}
              isMobile={isMobile}
              onOpenPreview={() => setIsPreviewOpen(true)}
              setValue={setValue}
              setMarkdown={setMarkdown}
            />
            {!isMobile && (
              <MarkdownPreview
                setSelectedBlockText={setSelectedBlockText}
                setSelectedOffset={setSelectedOffset}
                setSelectedLength={setSelectedLength}
                setSelectedText={setSelectedText}
                setErrorMessage={setErrorMessage}
                isMobile={false}
                control={control}
                watch={watch}
                setValue={setValue}
                setSearchTerm={setSearchTerm}
              />
            )}
          </div>
          {/* 모바일 미리보기 드로어 */}
          {/* - 의미: 모바일 환경에서 미리보기 표시 */}
          {isMobile && (
            <Drawer.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
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
                    control={control}
                    watch={watch}
                    setValue={setValue}
                    setSearchTerm={setSearchTerm}
                  />
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          )}
          {/* 오류 메시지 표시 */}
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
