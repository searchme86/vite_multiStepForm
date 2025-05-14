//====여기부터 수정됨====
// MarkdownEditor.tsx: ReactQuill 기반 마크다운 입력 및 미리보기 컴포넌트
// - 의미: 사용자가 마크다운 형식으로 콘텐츠 입력, 실시간 HTML 미리보기 제공
// - 사용 이유: 본문 작성 탭에서 풍부한 텍스트 편집 및 검색 가능한 미리보기 제공
// - 비유: 노트에 글을 쓰면(입력) 옆 페이지에 예쁜 책이 되고(미리보기), 특정 단어를 찾아 형광펜으로 칠할 수 있는 것(검색)
// - 작동 메커니즘:
//   1. react-hook-form의 Controller로 마크다운 입력 관리
//   2. ReactQuill로 WYSIWYG 편집기 제공, HTML 출력
//   3. watch로 마크다운 값 추적, 미리보기 동기화
//   4. 검색 입력으로 미리보기 텍스트 강조
//   5. onSave 콜백으로 서버 저장 지원
//   6. flex 레이아웃으로 입력/미리보기 분할
// - 관련 키워드: react-hook-form, react-quill, flexbox, Controller, dangerouslySetInnerHTML
// - 추천 키워드: remark-gfm, quill-delta, tailwindcss/typography

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import ReactQuill from 'react-quill';
import { FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { BlogPostFormData } from '../types/blog-post';
import 'react-quill/dist/quill.snow.css'; // ReactQuill 스타일

// 인터페이스: 컴포넌트 props
// - 타입: { onSave?: (markdown: string) => void }
// - 의미: 외부 저장 콜백, 서버 저장 또는 로컬 저장 처리
// - 사용 이유: 저장 로직을 부모 컴포넌트로 위임, 재사용성 향상
interface MarkdownEditorProps {
  onSave?: (markdown: string) => void;
}

// 함수: 마크다운 에디터 컴포넌트
// - 의미: 마크다운 입력, 미리보기, 검색 UI 렌더링
// - 사용 이유: 본문 작성 탭에서 풍부한 편집 및 검토 기능 제공
function MarkdownEditor({ onSave }: MarkdownEditorProps) {
  // 폼 컨텍스트
  // - 의미: 폼 데이터 및 유효성 검사 관리
  // - 사용 이유: react-hook-form으로 선언적 폼 관리
  // - Fallback: 컨텍스트 없으면 오류 메시지 표시
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      // 오류 메시지
      // - 의미: 폼 컨텍스트 오류 표시
      // - 사용 이유: 사용자에게 문제 알림
      <div className="text-red-500">오류: 폼 컨텍스트를 찾을 수 없습니다.</div>
    );
  }
  const { control, watch } = formContext;

  // 상태: 검색어
  // - 의미: 미리보기에서 강조할 텍스트
  // - 사용 이유: 사용자 입력 기반 텍스트 검색
  // - Fallback: 빈 문자열
  const [searchTerm, setSearchTerm] = React.useState('');

  // 값: 마크다운 콘텐츠
  // - 의미: 폼의 마크다운 필드 값 추적
  // - 사용 이유: 미리보기 동기화 및 저장
  // - Fallback: 빈 문자열
  const markdownContent = watch('markdown') || '';

  // 효과: 마크다운 변경 시 저장
  // - 의미: 마크다운 값 변경 시 onSave 콜백 호출
  // - 사용 이유: 자동저장 또는 서버 저장 트리거
  React.useEffect(() => {
    if (onSave && markdownContent) {
      onSave(markdownContent);
    }
  }, [markdownContent, onSave]);

  // 함수: 미리보기 HTML 처리
  // - 타입: (content: string, search: string) => string
  // - 의미: 검색어 기반으로 HTML에 강조 스타일 추가
  // - 사용 이유: 미리보기에서 검색어 강조
  // - Fallback: 원본 콘텐츠 반환
  const highlightSearchTerm = (content: string, search: string): string => {
    if (!search.trim()) {
      // 검색어 없음
      // - 의미: 검색어 없으면 원본 반환
      // - 사용 이유: 불필요한 처리 방지
      return content;
    }
    // 정규식
    // - 의미: 검색어를 HTML 안전하게 매칭
    // - 사용 이유: XSS 방지 및 정확한 매칭
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    // 강조 HTML
    // - 의미: 매칭된 텍스트를 노란색 배경으로 감싸기
    // - 사용 이유: 시각적 피드백 제공
    return content.replace(
      regex,
      '<span style="background-color: #fef08a">$1</span>'
    );
  };

  return (
    // 컨테이너: 입력과 미리보기 영역
    // - 의미: 마크다운 입력과 미리보기를 가로로 배치
    // - 사용 이유: flex로 반응형 레이아웃 구현
    // - 스타일: flex-row로 좌우 분할
    <div className="flex flex-col gap-6 md:flex-row">
      {/* 입력 영역 */}
      {/* - 의미: 마크다운 입력 UI */}
      {/* - 사용 이유: 사용자 입력 수집 */}
      <FormItem className="flex-1">
        <label className="text-sm font-medium">마크다운</label>
        {/* 설명글 */}
        {/* - 의미: 사용자에게 입력 지침 제공 */}
        {/* - 사용 이유: 마크다운 작성 가이드 */}
        <p className="mb-2 text-sm text-gray-500">
          컨텐츠를 마크다운 형식으로 작성해주세요.
        </p>
        <Controller
          name="markdown"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              {/* ReactQuill 편집기 */}
              {/* - 의미: WYSIWYG 방식으로 마크다운 입력 */}
              {/* - 사용 이유: 사용자 친화적 편집 환경 제공 */}
              <ReactQuill
                value={field.value || ''}
                onChange={(value) => field.onChange(value)}
                placeholder="마크다운으로 컨텐츠를 입력하세요 (예: # 제목, **굵은 텍스트**)"
                className="min-h-[300px] h-[300px]"
                aria-invalid={!!error}
                aria-label="마크다운 입력"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    ['link', 'image'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['clean'],
                  ],
                }}
              />
              {/* 오류 메시지 */}
              {/* - 의미: 유효성 검사 오류 표시 */}
              {/* - 사용 이유: 사용자 피드백 제공 */}
              {error && <FormMessage>{error.message}</FormMessage>}
            </>
          )}
        />
      </FormItem>
      {/* 미리보기 영역 */}
      {/* - 의미: 마크다운 HTML 렌더링 및 검색 UI */}
      {/* - 사용 이유: 실시간 피드백 및 텍스트 검색 */}
      {/* - 주석: 나중에 MarkdownPreview 컴포넌트로 분리 가능 */}
      {/* - 분리 구조 예시:
          <MarkdownPreview
            content={markdownContent}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
      */}
      <div className="flex-1">
        <label className="text-sm font-medium">미리보기</label>
        {/* 검색 입력 */}
        {/* - 의미: 미리보기 텍스트 검색 UI */}
        {/* - 사용 이유: 특정 텍스트 강조 */}
        <Input
          placeholder="검색어를 입력하세요 (예: 안녕)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
          aria-label="미리보기 검색"
        />
        <div
          className="border rounded-md p-4 bg-gray-50 min-h-[300px] overflow-auto prose prose-sm max-w-none"
          // dangerouslySetInnerHTML
          // - 의미: ReactQuill의 HTML 출력 렌더링
          // - 사용 이유: 마크다운을 HTML로 표시
          dangerouslySetInnerHTML={{
            __html: highlightSearchTerm(markdownContent, searchTerm),
          }}
        />
      </div>
    </div>
  );
}

export default MarkdownEditor;
//====여기까지 수정됨====
