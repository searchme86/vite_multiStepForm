// MarkdownEditor.tsx: ReactQuill 기반 마크다운 입력 컴포넌트
// - 의미: 사용자가 마크다운 형식으로 콘텐츠 입력
// - 사용 이유: 본문 작성 탭에서 풍부한 텍스트 편집 제공
// - 비유: 노트에 글을 쓰는 마법 노트, 친구(react-hook-form)가 기록
// - 작동 메커니즘:
//   1. react-hook-form의 Controller로 마크다운 입력 관리
//   2. ReactQuill로 WYSIWYG 편집기 제공
//   3. useRef로 Quill 인스턴스 관리
//   4. FormProvider 내에서 렌더링, 컨텍스트 없으면 대체 UI
// - 관련 키워드: react-hook-form, react-quill, flexbox, Controller
// - 추천 키워드: quill-delta, tailwindcss/typography, sanitize-html

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import ReactQuill from 'react-quill';
import { FormItem, FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';
import 'react-quill/dist/quill.snow.css';

// 함수: 마크다운 에디터 컴포넌트
// - 의미: 마크다운 입력 UI 렌더링
// - 사용 이유: 본문 작성 탭에서 사용자 입력 수집
function MarkdownEditor() {
  // 폼 컨텍스트
  // - 의미: 폼 데이터 및 유효성 검사 관리
  // - 사용 이유: react-hook-form으로 선언적 폼 관리
  // - Fallback: 컨텍스트 없으면 대체 UI 렌더링
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext || !formContext.control) {
    // 대체 UI
    // - 의미: 폼 컨텍스트 누락 시 사용자 알림
    // - 사용 이유: 앱 크래시 방지, ErrorBoundary 의존 최소화
    return (
      <div
        className="flex flex-col items-center justify-center p-4 text-red-500"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <h2 className="text-lg font-medium">폼 컨텍스트 오류</h2>
        <p className="text-sm">
          마크다운 에디터를 로드할 수 없습니다. 다시 시도해주세요.
        </p>
      </div>
    );
  }
  const { control } = formContext;

  // Quill 참조
  // - 의미: Quill 편집기 DOM 직접 참조
  // - 사용 이유: 안정적인 인스턴스 관리
  const quillRef = React.useRef<ReactQuill>(null);

  return (
    // 컨테이너: 입력 영역
    // - 의미: 마크다운 입력 UI 배치
    // - 사용 이유: flex로 반응형 레이아웃
    <FormItem
      className="flex-1"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
    >
      {/* 라벨 */}
      {/* - 의미: 입력 필드 설명 */}
      {/* - 사용 이유: 사용자 지침 제공 */}
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
              ref={quillRef}
              value={field.value || ''}
              onChange={(value) => field.onChange(value)}
              placeholder="마크다운으로 컨텐츠를 입력하세요 (예: # 제목, **굵은 텍스트**)"
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
  );
}

export default MarkdownEditor;
