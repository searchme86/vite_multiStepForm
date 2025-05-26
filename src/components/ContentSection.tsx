import { useState, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from './ui/button';
import { FormMessage } from './ui/form';
import type { BlogPostFormData } from '../types/blog-post';
import PostGuidelines from './PostGuidelines';
import TagAutoComplete from './TagAutoComplete';
import MarkdownEditor from './MarkdownEditor';
import MarkdownPreview from './MarkdownPreview';
import { Drawer } from 'vaul';
import './vaul.css';

// 타입: 오류 메시지 정의
// - 의미: 오류 유형과 메시지 텍스트를 포함하는 구조
// - 사용 이유: 오류를 체계적으로 관리하고 사용자에게 명확히 전달
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 컴포넌트: 콘텐츠 작성 섹션
// - 의미: 블로그 포스트 작성 UI를 제공하는 컨테이너 컴포넌트
// - 사용 이유: 태그 입력, 마크다운 편집, 미리보기 기능을 통합 관리
function ContentSection() {
  // 개발 환경 로그
  // - 의미: 개발 모드에서 컴포넌트 렌더링 여부 확인
  // - 사용 이유: 디버깅을 통해 렌더링 흐름 추적
  if (process.env.NODE_ENV === 'development') {
    console.log('ContentSection: Rendering');
  }

  // 폼 컨텍스트
  // - 의미: react-hook-form의 컨텍스트를 가져옴
  // - 사용 이유: 폼 상태와 메서드에 접근하여 데이터 관리
  // - Fallback: 컨텍스트가 없으면 오류 UI 표시
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

  // 폼 메서드 추출
  // - 의미: 폼 상태 조작 및 검증을 위한 메서드 가져오기
  // - 사용 이유: 태그 배열 관리 및 오류 처리
  const {
    control,
    watch,
    formState: { errors },
  } = formContext;

  // 필드 배열 관리
  // - 의미: 'tags' 필드를 배열로 관리
  // - 사용 이유: 태그 추가/삭제를 안정적으로 처리
  // - Fallback: 빈 배열
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tags',
  });

  // 상태: 드로어 스냅 포인트
  // - 의미: 모바일 미리보기 드로어의 크기 설정
  // - 사용 이유: 반응형 UI에서 드로어 높이 조절
  const snapPoints = ['148px', '355px', 1];

  // 상태: 선택된 블록 텍스트
  // - 의미: 마크다운 편집기에서 선택된 텍스트 저장
  // - 사용 이유: 편집과 미리보기 간 데이터 연동
  // - Fallback: null
  const [selectedBlockText, setSelectedBlockText] = useState<string | null>(
    null
  );

  // 상태: 선택된 오프셋
  // - 의미: 선택된 텍스트의 시작 위치 저장
  // - 사용 이유: 텍스트 선택 범위 관리
  // - Fallback: null
  const [selectedOffset, setSelectedOffset] = useState<number | null>(null);

  // 상태: 선택된 길이
  // - 의미: 선택된 텍스트의 길이 저장
  // - 사용 이유: 텍스트 선택 범위 관리
  // - Fallback: null
  const [selectedLength, setSelectedLength] = useState<number | null>(null);

  // 상태: 선택된 텍스트
  // - 의미: 사용자가 선택한 텍스트 내용 저장
  // - 사용 이유: 편집과 미리보기 간 데이터 연동
  // - Fallback: null
  const [selectedText, setSelectedText] = useState<string | null>(null);

  // 상태: 오류 메시지
  // - 의미: 사용자에게 표시할 오류 메시지 저장
  // - 사용 이유: 오류 발생 시 사용자 피드백 제공
  // - Fallback: null
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);

  // 상태: 모바일 여부
  // - 의미: 화면 크기에 따라 모바일 여부 판단
  // - 사용 이유: 반응형 UI 제공
  // - Fallback: false
  const [isMobile, setIsMobile] = useState(false);

  // 상태: 미리보기 열림 여부
  // - 의미: 모바일 미리보기 드로어의 열림/닫힘 상태
  // - 사용 이유: 미리보기 표시 제어
  // - Fallback: false
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 상태: 드로어 스냅 포인트
  // - 의미: 현재 드로어 크기 설정
  // - 사용 이유: 드로어 UI 관리
  // - Fallback: 첫 번째 스냅 포인트
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  // 효과: 창 크기 감지
  // - 의미: 창 크기 변경 시 모바일 상태 업데이트
  // - 사용 이유: 반응형 디자인 구현
  // - Fallback: 초기 호출로 설정
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 디버깅 로그
  // - 의미: 모바일 상태를 콘솔에 출력
  // - 사용 이유: 디버깅 시 모바일 상태 확인
  console.log('isMobile', isMobile);

  return (
    // 컨테이너: 콘텐츠 섹션 레이아웃
    // - 의미: 전체 UI 구조를 정의
    // - 사용 이유: Tailwind CSS로 반응형 레이아웃 제공
    <div
      className="flex flex-col gap-6 px-4 space-y-6 sm:px-6 md:px-8"
      role="region"
      aria-label="콘텐츠 작성 섹션"
    >
      {/* 가이드라인 컴포넌트 */}
      {/* - 의미: 태그 작성 가이드 표시 */}
      {/* - 사용 이유: 사용자에게 태그 입력 방법 안내 */}
      <PostGuidelines tab="tags" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          {/* 태그 입력 컴포넌트 */}
          {/* - 의미: 태그 입력 UI 제공 */}
          {/* - 사용 이유: 사용자 태그 입력 처리 */}
          {/* //====여기부터 수정됨==== */}
          <TagAutoComplete
            onAddTags={(newTags) => {
              // 현재 태그 값 추출
              // - 의미: 기존 태그의 value 속성 가져오기
              // - 사용 이유: 중복 태그 추가 방지
              const currentValues = fields.map((field) => field.value);
              // 중복되지 않은 새 태그 필터링
              // - 의미: 기존 태그와 비교하여 고유 태그만 선택
              // - 사용 이유: 데이터 무결성 유지
              const uniqueNewTags = newTags.filter(
                (tag) => !currentValues.includes(tag)
              );
              // 새 태그 추가
              // - 의미: 고유 태그를 객체로 변환하여 추가
              // - 사용 이유: useFieldArray의 append로 안정적 추가
              uniqueNewTags.forEach((tag) => append({ id: tag, value: tag }));
            }}
          />
          {/* //====여기까지 수정됨==== */}
          {/* 태그 목록 표시 */}
          {/* - 의미: 추가된 태그를 칩 형태로 표시 */}
          {/* - 사용 이유: 사용자에게 태그 피드백 제공 */}
          {/* //====여기부터 수정됨==== */}
          <div className="flex flex-wrap w-full gap-2" role="list">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center px-3 py-1 text-sm bg-gray-200 rounded-full"
                role="listitem"
              >
                {/* 태그 값 표시 */}
                {/* - 의미: 태그의 value 속성 표시 */}
                {/* - 사용 이유: 사용자에게 추가된 태그 확인 */}
                <span>{field.value}</span>
                {/* 태그 삭제 버튼 */}
                {/* - 의미: 태그 삭제를 트리거 */}
                {/* - 사용 이유: 사용자 태그 관리 기능 제공 */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  aria-label={`태그 ${field.value} 삭제`}
                  className="ml-2"
                >
                  ×
                </Button>
              </div>
            ))}
            {/* 태그 오류 메시지 */}
            {/* - 의미: 태그 입력 오류 표시 */}
            {/* - 사용 이유: 사용자 피드백 제공 */}
            {errors.tags && <FormMessage>{errors.tags.message}</FormMessage>}
          </div>
          {/* //====여기까지 수정됨==== */}
          {/* 편집기 및 미리보기 컨테이너 */}
          {/* - 의미: 마크다운 편집기와 미리보기 배치 */}
          {/* - 사용 이유: 콘텐츠 작성 및 검토 지원 */}
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
          {/* 모바일 미리보기 드로어 */}
          {/* - 의미: 모바일 환경에서 미리보기 표시 */}
          {/* - 사용 이유: 반응형 UI 제공 */}
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
                  />
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          )}
          {/* 오류 메시지 표시 */}
          {/* - 의미: 사용자에게 오류 피드백 제공 */}
          {/* - 사용 이유: UX 개선 및 오류 알림 */}
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
