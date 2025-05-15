//====여기부터 수정됨====
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
// - 의미: 에러 메시지의 종류와 텍스트를 포함
// - 값: 'empty', 'multi-block', 'mapping-failed' 중 하나와 메시지 문자열
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 함수: 현재 날짜 포맷팅
// - 의미: 오늘 날짜를 "YYYY-MM-DD" 형식으로 변환
// - 사용 이유: 작성 날짜 표시, 사용자 피드백 제공
// - 값: 문자열, 예: "2025-05-15"
const formatCurrentDate = (): string => {
  const today = new Date(); // 오늘 날짜 객체 생성
  const year = today.getFullYear(); // 연도 추출
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 월 추출, 2자리로 패딩
  const day = String(today.getDate()).padStart(2, '0'); // 일 추출, 2자리로 패딩
  return `${year}-${month}-${day}`; // 형식화된 날짜 반환
};

// 함수: 본문 작성 섹션
// - 의미: 태그 입력, 에디터, 미리보기 통합 UI 제공
// - 사용 이유: 블로그 포스트 작성 인터페이스
function ContentSection() {
  // 컴포넌트 렌더링 로그, 개발 환경에서만 출력
  // - 의미: 렌더링 추적
  // - 왜: 프로덕션 환경에서 불필요한 로그 제거
  if (process.env.NODE_ENV === 'development') {
    console.log('ContentSection: Rendering');
  }
  const formContext = useFormContext<BlogPostFormData>(); // 폼 컨텍스트 가져오기
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
        <p className="text-sm">콘텐츠 섹션을 로드할 수 없습니다.</p>
      </div>
    );
  }
  const {
    setValue,
    watch,
    formState: { errors },
  } = formContext; // 폼 상태 관리 함수와 데이터 추출

  const tags = watch('tags') || []; // 태그 상태 감시, 기본값 빈 배열
  // 선택된 블록 텍스트, 오프셋, 길이, 선택 텍스트 상태
  // - 의미: 드래그 선택 위치 매핑 위해
  // - 왜: 정확한 커서 위치를 위해 상태 관리
  const [selectedBlockText, setSelectedBlockText] = useState<string | null>(
    null
  );
  const [selectedOffset, setSelectedOffset] = useState<number | null>(null);
  const [selectedLength, setSelectedLength] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);

  // 태그 추가 핸들러
  // - 의미: 새로운 태그 추가
  // - 사용 이유: 사용자 입력 처리
  const handleAddTag = (tag: string) => {
    if (!tag.trim() || tags.includes(tag)) return; // 태그 비어있거나 중복 시 무시
    setValue('tags', [...tags, tag], { shouldValidate: true }); // 태그 배열에 추가, 유효성 검사
  };

  // 태그 제거 핸들러
  // - 의미: 기존 태그 제거
  // - 사용 이유: 사용자 입력 처리
  const handleRemoveTag = (tag: string) => {
    setValue(
      'tags',
      tags.filter((t: string) => t !== tag),
      { shouldValidate: true }
    ); // 태그 배열에서 제거, 유효성 검사
  };

  // 렌더링: 태그 입력, 에디터, 미리보기 UI
  // - 작동 매커니즘: flex 레이아웃으로 배치, 각 컴포넌트 렌더링
  // - 의미: 사용자 인터페이스 제공
  // - 왜: 사용자 경험 개선
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
            />
            <MarkdownPreview
              setSelectedBlockText={setSelectedBlockText}
              setSelectedOffset={setSelectedOffset}
              setSelectedLength={setSelectedLength}
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
