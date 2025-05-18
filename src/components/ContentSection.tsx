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

// 타입: 오류 메시지 정의
// - 의미: 오류 유형과 메시지 텍스트를 포함
// - 사용 이유: 오류를 구조화하여 관리
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 함수: 현재 날짜 포맷팅
// - 의미: 오늘 날짜를 YYYY-MM-DD 형식으로 반환
// - 사용 이유: 작성 날짜 표시
// - Fallback: 없음, Date 객체는 항상 유효
const formatCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 컴포넌트: 콘텐츠 작성 섹션
// - 의미: 블로그 포스트 작성 UI 제공
// - 사용 이유: 태그 입력, 마크다운 편집, 미리보기 통합
function ContentSection() {
  // 개발 환경 로그
  // - 의미: 개발 모드에서 렌더링 확인
  // - 사용 이유: 디버깅 용이성
  if (process.env.NODE_ENV === 'development') {
    console.log('ContentSection: Rendering');
  }

  // 폼 컨텍스트
  // - 의미: react-hook-form 컨텍스트 가져오기
  // - 사용 이유: 폼 상태 관리
  // - Fallback: 컨텍스트 없으면 오류 UI 표시
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
  // - 의미: setValue, watch, errors 가져오기
  // - 사용 이유: 폼 상태 조작 및 검증
  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext;

  // 상태: 태그 목록 감시
  // - 의미: 폼의 tags 필드 값 가져오기
  // - 사용 이유: 태그 UI 렌더링
  // - Fallback: 빈 배열
  const tags = watch('tags') || [];

  // 상태: 드로어 스냅 포인트
  // - 의미: 모바일 미리보기 드로어 크기 설정
  // - 사용 이유: 반응형 UI 제공
  const snapPoints = ['148px', '355px', 1];

  // 상태: 선택된 블록 텍스트
  // - 의미: 마크다운 편집기에서 선택된 텍스트
  // - 사용 이유: 편집 및 미리보기 연동
  // - Fallback: null
  const [selectedBlockText, setSelectedBlockText] = useState<string | null>(
    null
  );

  // 상태: 선택된 오프셋
  // - 의미: 선택된 텍스트의 시작 위치
  // - 사용 이유: 텍스트 선택 위치 관리
  // - Fallback: null
  const [selectedOffset, setSelectedOffset] = useState<number | null>(null);

  // 상태: 선택된 길이
  // - 의미: 선택된 텍스트의 길이
  // - 사용 이유: 텍스트 선택 범위 관리
  // - Fallback: null
  const [selectedLength, setSelectedLength] = useState<number | null>(null);

  // 상태: 선택된 텍스트
  // - 의미: 사용자가 선택한 텍스트 내용
  // - 사용 이유: 편집 및 미리보기 연동
  // - Fallback: null
  const [selectedText, setSelectedText] = useState<string | null>(null);

  // 상태: 오류 메시지
  // - 의미: 사용자에게 표시할 오류 메시지
  // - 사용 이유: 오류 피드백 제공
  // - Fallback: null
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);

  // 상태: 모바일 여부
  // - 의미: 화면 크기에 따라 모바일 여부 판단
  // - 사용 이유: 반응형 UI 제공
  // - Fallback: false
  const [isMobile, setIsMobile] = useState(false);

  // 상태: 미리보기 열림 여부
  // - 의미: 모바일 미리보기 드로어 상태
  // - 사용 이유: 미리보기 표시 제어
  // - Fallback: false
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 상태: 드로어 스냅 포인트
  // - 의미: 현재 드로어 크기
  // - 사용 이유: 드로어 UI 관리
  // - Fallback: 첫 번째 스냅 포인트
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  // 효과: 창 크기 감지
  // - 의미: 창 크기에 따라 모바일 상태 업데이트
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

  // 함수: 태그 제거
  // - 의미: 지정된 태그를 폼에서 제거
  // - 사용 이유: 사용자 태그 삭제 요청 처리
  // - Fallback: 없음, 필터링은 항상 유효
  const handleRemoveTag = (tag: string) => {
    setValue(
      'tags',
      tags.filter((t: string) => t !== tag),
      { shouldValidate: true }
    );
  };

  // 디버깅 로그
  // - 의미: 모바일 상태 콘솔 출력
  // - 사용 이유: 디버깅 용이성
  console.log('isMobile', isMobile);

  return (
    // 컨테이너: 콘텐츠 섹션 레이아웃
    // - 의미: 전체 UI 구조 정의
    // - 사용 이유: Tailwind로 반응형 레이아웃 제공
    <div
      className="flex flex-col gap-6 px-4 space-y-6 sm:px-6 md:px-8"
      role="region"
      aria-label="콘텐츠 작성 섹션"
    >
      {/* 가이드라인 컴포넌트 */}
      {/* - 의미: 태그 작성 가이드 표시 */}
      {/* - 사용 이유: 사용자 안내 */}
      <PostGuidelines tab="tags" />
      <div className="flex flex-col gap-6">
        {/* 작성 날짜 표시 */}
        {/* - 의미: 현재 날짜 표시 */}
        {/* - 사용 이유: 포스트 메타데이터 제공 */}
        <span className="text-sm text-gray-500" style={{ marginLeft: 'auto' }}>
          작성 날짜: {formatCurrentDate()}
        </span>
        <div className="flex flex-col gap-6">
          {/* 태그 입력 컴포넌트 */}
          {/* - 의미: 태그 입력 UI 제공 */}
          {/* - 사용 이유: 사용자 태그 입력 처리 */}
          {/* //====여기부터 수정됨==== */}
          <TagAutoComplete />
          {/* //====여기까지 수정됨==== */}
          {/* 태그 목록 표시 */}
          {/* - 의미: 추가된 태그를 칩 형태로 표시 */}
          {/* - 사용 이유: 사용자에게 태그 피드백 제공 */}
          <div className="flex flex-wrap w-full gap-2" role="list">
            {tags.map((tag: string) => (
              <div
                key={tag}
                className="flex items-center px-3 py-1 text-sm bg-gray-200 rounded-full"
                role="listitem"
              >
                <span>{tag}</span>
                {/* 태그 제거 버튼 */}
                {/* - 의미: 태그 삭제 트리거 */}
                {/* - 사용 이유: 사용자 태그 관리 */}
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
            {/* 태그 오류 메시지 */}
            {/* - 의미: 태그 입력 오류 표시 */}
            {/* - 사용 이유: 사용자 피드백 제공 */}
            {errors.tags && <FormMessage>{errors.tags.message}</FormMessage>}
          </div>
          {/* 편집기 및 미리보기 컨테이너 */}
          {/* - 의미: 마크다운 편집기와 미리보기 배치 */}
          {/* - 사용 이유: 콘텐츠 작성 및 검토 */}
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
          {/* - 의미: 모바일에서 미리보기 표시 */}
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
          {/* - 사용 이유: UX 개선 */}
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
