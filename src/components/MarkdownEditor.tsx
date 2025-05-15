//====여기부터 수정됨====
// MarkdownEditor.tsx: Quill 기반 마크다운 에디터
// - 의미: 마크다운 입력, 텍스트 기반 커서 이동 및 하이라이트
// - 사용 이유: 포스트 작성, 미리보기 선택 반영, 시각적 하이라이트 제공
// - 비유: 노트에 글 쓰고, 책 페이지에서 선택한 부분을 노란색으로 칠하고 펜을 그 위치에 놓음
// - 작동 메커니즘:
//   1. ReactQuill로 마크다운 입력
//   2. 미리보기에서 선택된 텍스트의 시작 지점으로 커서 이동
//   3. 선택된 텍스트에 노란색 배경 적용
//   4. 에러 메시지 표시
// - 관련 키워드: react-quill, react-hook-form, tailwindcss

import React, { useEffect, useRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BlogPostFormData } from '../types/blog-post';
import debounce from 'lodash/debounce';

// 타입: 에러 메시지
// - 의미: 에러 메시지의 종류와 텍스트를 포함
// - 값: 'empty', 'multi-block', 'mapping-failed' 중 하나와 메시지 문자열
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 타입: 컴포넌트 속성
// - 의미: 부모로부터 받은 선택된 블록 텍스트, 오프셋, 길이, 선택 텍스트, 에러 설정 함수
// - 값: 문자열 또는 null, 숫자 또는 null, 에러 메시지 설정 콜백
interface MarkdownEditorProps {
  selectedBlockText: string | null;
  selectedOffset: number | null;
  selectedLength: number | null;
  selectedText: string | null;
  setErrorMessage: (message: ErrorMessage | null) => void;
}

// Quill 모듈 설정
// - 의미: Quill 에디터의 툴바와 히스토리 설정
// - 사용 이유: 사용자 입력을 위한 UI 제공
// - 값: 툴바 옵션(헤더, 볼드, 이탤릭, 리스트, 이미지)과 히스토리 설정
const modules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['image'],
    ['clean'],
  ],
  history: {
    delay: 2000,
    maxStack: 500,
    userOnly: true,
  },
};

// Quill 포맷
// - 의미: 지원하는 포맷 목록
// - 사용 이유: 에디터에서 허용할 스타일 정의
// - 값: 헤더, 볼드, 이탤릭, 리스트, 이미지
const formats = ['header', 'bold', 'italic', 'list', 'bullet', 'image'];

// 함수: 마크다운 에디터
// - 의미: 마크다운 입력 및 커서 이동, 하이라이트 처리 컴포넌트
// - 사용 이유: 사용자 입력과 미리보기 선택 반영, 시각적 피드백 제공
function MarkdownEditor({
  selectedBlockText,
  selectedOffset,
  selectedLength,
  selectedText,
  setErrorMessage,
}: MarkdownEditorProps) {
  // 컴포넌트 렌더링 로그, 개발 환경에서만 출력
  // - 의미: 렌더링 추적
  // - 왜: 프로덕션 환경에서 불필요한 로그 제거
  if (process.env.NODE_ENV === 'development') {
    console.log('MarkdownEditor: Rendering');
  }
  const formContext = useFormContext<BlogPostFormData>();
  // 폼 컨텍스트 없으면 에러 UI 표시
  // - 의미: 폼 데이터 접근 실패 시 사용자 피드백
  // - 왜: 사용자 경험 개선
  if (!formContext || !formContext.watch || !formContext.setValue) {
    return (
      <div
        className="flex flex-col items-center justify-center p-4 text-red-500"
        role="alert"
        aria-live="assertive"
      >
        <h2 className="text-lg font-medium">폼 컨텍스트 오류</h2>
        <p className="text-sm">에디터를 로드할 수 없습니다.</p>
      </div>
    );
  }
  const { watch, setValue } = formContext;

  const quillRef = useRef<ReactQuill>(null);
  const markdown = watch('markdown') || '';
  const isUserTyping = useRef(false);
  const highlightedRangeRef = useRef<{ index: number; length: number } | null>(
    null
  );

  // 디바운스된 setValue
  // - 의미: 입력 지연 업데이트
  // - 사용 이유: 렌더링 최소화, 성능 개선
  const debouncedSetValue = useCallback(
    debounce((value: string) => {
      setValue('markdown', value, { shouldValidate: true });
      // 디버깅 로그, 개발 환경에서만 출력
      // - 의미: 폼 필드 값 확인
      // - 왜: 입력값 추적
      if (process.env.NODE_ENV === 'development') {
        console.log('MarkdownEditor: Debounced form field value', value);
      }
    }, 300),
    [setValue]
  );

  // 효과: 커서 이동 및 하이라이트
  // - 의미: 미리보기 선택 반영, 선택된 텍스트 하이라이트
  // - 사용 이유: 사용자 인터랙션, 시각적 피드백 제공
  useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();

    if (
      selectedBlockText == null ||
      selectedOffset == null ||
      selectedLength == null ||
      selectedText == null
    ) {
      // 기존 하이라이트 제거
      // - 의미: 선택 해제 시 하이라이트 제거
      // - 왜: 사용자 경험 개선, 불필요한 하이라이트 방지
      if (highlightedRangeRef.current) {
        quill.formatText(
          highlightedRangeRef.current.index,
          highlightedRangeRef.current.length,
          'background',
          false
        );
        highlightedRangeRef.current = null;
      }
      return;
    }

    const fullText = quill.getText();
    const blockText = selectedBlockText.replace(/[\n\r]+/g, ' ').trim();
    const searchText = selectedText.trim();

    const indices = [];
    let index = fullText.indexOf(blockText);
    while (index !== -1) {
      indices.push(index);
      index = fullText.indexOf(blockText, index + 1);
    }

    for (const start of indices) {
      const position = start + selectedOffset;
      if (
        position + selectedLength <= fullText.length &&
        fullText.substring(position, position + selectedLength) === searchText
      ) {
        // 기존 하이라이트 제거
        // - 의미: 이전 하이라이트 제거
        // - 왜: 중복 방지
        if (highlightedRangeRef.current) {
          quill.formatText(
            highlightedRangeRef.current.index,
            highlightedRangeRef.current.length,
            'background',
            false
          );
        }
        // 새 하이라이트 적용
        // - 의미: 선택된 텍스트에 노란색 배경 적용
        // - 왜: 사용자에게 선택 영역 시각적 피드백 제공
        quill.formatText(position, selectedLength, 'background', 'yellow');
        // 하이라이트 범위 업데이트
        // - 의미: 현재 하이라이트 범위 저장
        // - 왜: 다음 제거 시 사용
        highlightedRangeRef.current = {
          index: position,
          length: selectedLength,
        };
        // 커서를 시작 지점에 위치, 포커스
        // - 의미: 사용자가 즉시 편집 시작 가능
        // - 왜: 사용자 경험 개선
        quill.setSelection(position, 0);
        quill.focus();
        // 디버깅 로그, 개발 환경에서만 출력
        // - 의미: 하이라이트 및 커서 이동 확인
        // - 왜: 디버깅 용이성
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'MarkdownEditor: Highlighted from',
            position,
            'to',
            position + selectedLength,
            'and moved cursor to',
            position
          );
        }
        return;
      }
    }

    // 매핑 실패 시 에러 처리
    // - 의미: 사용자 피드백
    // - 사용 이유: 오류 알림
    setErrorMessage({
      type: 'mapping-failed',
      text: '선택한 텍스트를 찾을 수 없습니다.',
    });
    // 디버깅 로그, 개발 환경에서만 출력
    // - 의미: 매핑 실패 디버깅
    // - 왜: 문제 추적
    if (process.env.NODE_ENV === 'development') {
      console.log('MarkdownEditor: Selected text not found in any block');
    }
  }, [
    selectedBlockText,
    selectedOffset,
    selectedLength,
    selectedText,
    setErrorMessage,
  ]);

  // 핸들러: 텍스트 변경
  // - 의미: 사용자 입력 처리
  // - 사용 이유: 폼 상태 업데이트
  const handleTextChange = (
    value: string,
    _delta: unknown,
    source: string,
    editor: unknown
  ) => {
    if (source !== 'user') {
      // 사용자 입력이 아니면 무시
      // - 의미: 비사용자 변경 무시
      // - 왜: 성능 최적화
      if (process.env.NODE_ENV === 'development') {
        console.log('MarkdownEditor: Non-user change, source:', source);
      }
      return;
    }

    isUserTyping.current = true;
    // 디버깅 로그, 개발 환경에서만 출력
    // - 의미: 입력 시작 로그
    // - 왜: 입력 추적
    if (process.env.NODE_ENV === 'development') {
      console.log('MarkdownEditor: Text changed, source:', source);
    }

    // 커서 위치 저장
    let selection: { index: number; length: number } | null = null;
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      try {
        selection = quill.getSelection();
        // 디버깅 로그, 개발 환경에서만 출력
        // - 의미: 커서 위치 로그
        // - 왜: 디버깅 용이성
        if (process.env.NODE_ENV === 'development') {
          console.log('MarkdownEditor: Cursor position', selection);
        }
      } catch (e) {
        console.warn('MarkdownEditor: Failed to get selection', e);
      }
    }

    // 폼 상태 업데이트
    debouncedSetValue(value);

    // 커서 위치 복원
    if (selection && quillRef.current) {
      const quill = quillRef.current.getEditor();
      try {
        quill.setSelection(selection.index, selection.length);
      } catch (e) {
        console.warn('MarkdownEditor: Failed to restore selection', e);
      }
    }

    // 입력 플래그 리셋
    setTimeout(() => {
      isUserTyping.current = false;
    }, 100);
  };

  return (
    <div
      className="flex flex-col flex-1 gap-2"
      role="region"
      aria-label="마크다운 에디터"
    >
      <label className="text-sm font-medium">콘텐츠</label>
      <div className="">
        <ReactQuill
          ref={quillRef}
          value={markdown}
          onChange={handleTextChange}
          modules={modules}
          formats={formats}
          theme="snow"
          preserveWhitespace
          className="bg-white border rounded-md"
          aria-label="마크다운 입력"
        />
      </div>
    </div>
  );
}

export default MarkdownEditor;
//====여기까지 수정됨====
