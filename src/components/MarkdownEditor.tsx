//====여기부터 수정됨====
// MarkdownEditor.tsx: 블로그 포스트 마크다운 입력 편집기
// - 의미: 마크다운 형식의 본문 입력 UI 제공
// - 사용 이유: 콘텐츠 작성 및 편집, Zustand로 상태 지속성 보장
// - 비유: 블로그 본문을 작성하는 타자기
// - 작동 메커니즘:
//   1. watch와 setValue로 폼 상태 관리
//   2. ReactQuill로 마크다운 입력 처리
//   3. setValue로 폼 업데이트, setMarkdown으로 Zustand 동기화
//   4. 선택된 텍스트 하이라이트 및 오류 처리
// - 관련 키워드: react-hook-form, zustand, react-quill, tailwindcss, flexbox

import React, { useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
// CSS 스타일시트를 조건부로 import
// - 의미: ReactQuill 테마 스타일 적용
// - 사용 이유: 편집기 UI 스타일링
// - 작동 매커니즘: 런타임에 CSS 모듈 존재 여부 확인 후 적용
try {
  // @ts-ignore - CSS 모듈 타입 에러 무시
  await import('react-quill/dist/quill.snow.css');
} catch (error) {
  // CSS 파일이 없어도 컴포넌트는 정상 작동
  // - 의미: 스타일 없이도 기능적으로 동작
  // - 사용 이유: 의존성 누락 시에도 앱이 깨지지 않도록 방어
  console.warn('ReactQuill CSS not found, using default styles');
}

import type { blogPostSchemaType } from '../pages/write/schema/blogPostSchema';
import debounce from 'lodash/debounce';
import { Button } from './ui/button';

// 타입: 오류 메시지
// - 의미: 오류 유형과 메시지 정의
// - 사용 이유: 사용자 피드백 제공
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 인터페이스: 컴포넌트 props
// - 의미: 편집기 설정 및 콜백 전달
// - 사용 이유: 마크다운 편집과 미리보기 연동
interface MarkdownEditorProps {
  selectedBlockText: string | null;
  selectedOffset: number | null;
  selectedLength: number | null;
  selectedText: string | null;
  setErrorMessage: (message: ErrorMessage | null) => void;
  isMobile: boolean;
  onOpenPreview: () => void;
  setValue: (name: keyof blogPostSchemaType, value: any, options?: any) => void;
  setMarkdown: (value: string) => void;
}

// 툴바 및 포맷 설정
// - 의미: ReactQuill 편집기 옵션
// - 사용 이유: 사용자 친화적 편집 환경
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

const formats = [
  'header',
  'bold',
  'italic',
  'list',
  'bullet',
  'image',
  'background',
];

// MarkdownEditor: 마크다운 입력 편집기
// - 의미: 마크다운 본문 입력 및 편집
// - 사용 이유: 콘텐츠 작성, Zustand 동기화
function MarkdownEditor({
  selectedBlockText,
  selectedOffset,
  selectedLength,
  selectedText,
  setErrorMessage,
  isMobile,
  onOpenPreview,
  setValue,
  setMarkdown,
}: MarkdownEditorProps) {
  // 개발 환경 로그
  // - 의미: 렌더링 확인
  // - 사용 이루: 디버깅
  if (process.env.NODE_ENV === 'development') {
    console.log('MarkdownEditor: Rendering');
  }

  // 참조: ReactQuill 인스턴스
  // - 의미: 편집기 제어
  const quillRef = useRef<ReactQuill>(null);
  // 상태: 사용자 입력 여부
  // - 의미: 사용자 입력 추적
  const isUserTyping = useRef(false);
  // 상태: 하이라이트 범위
  // - 의미: 선택된 텍스트 하이라이트 관리
  const highlightedRangeRef = useRef<{ index: number; length: number } | null>(
    null
  );
  // 상태: 현재 에디터 값
  // - 의미: 무한 렌더링 방지를 위한 안정적인 값 관리
  // - 사용 이유: ReactQuill value prop 최적화
  const [editorValue, setEditorValue] = React.useState('');

  // 디바운스된 setValue 및 setMarkdown
  // - 의미: 입력 지연 처리
  // - 사용 이유: 성능 최적화 및 무한 렌더링 방지
  const debouncedSetValue = useCallback(
    debounce((value: string) => {
      setValue('markdown', value, { shouldValidate: true });
      setMarkdown(value); // Zustand 동기화
      if (process.env.NODE_ENV === 'development') {
        console.log('MarkdownEditor: Debounced form field value', value);
      }
    }, 300),
    [setValue, setMarkdown]
  );

  // 함수: 텍스트 정규화
  // - 의미: HTML과 Plain Text 간 일관성 보장
  // - 사용 이유: 텍스트 매핑 정확도 향상
  const normalizeText = useCallback((text: string): string => {
    return text
      .replace(/\s+/g, ' ') // 여러 공백을 하나로
      .replace(/&nbsp;/g, ' ') // HTML 공백 엔티티 변환
      .replace(/\u00A0/g, ' ') // 유니코드 공백 변환
      .trim();
  }, []);

  // 효과: 선택된 텍스트 하이라이트
  // - 의미: 미리보기에서 선택된 텍스트 표시
  // - 사용 이유: 편집과 미리보기 연동
  // - 작동 매커니즘: 선택된 텍스트 위치에 하이라이트 적용
  useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();

    if (
      selectedBlockText == null ||
      selectedOffset == null ||
      selectedLength == null ||
      selectedText == null
    ) {
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
    // 개선된 텍스트 정규화
    // - 의미: HTML과 Plain Text 간 일관성 보장
    // - 사용 이유: 텍스트 매핑 정확도 향상
    const normalizedFullText = normalizeText(fullText);
    const normalizedBlockText = normalizeText(selectedBlockText);
    const normalizedSearchText = normalizeText(selectedText);

    // 유연한 텍스트 검색
    // - 의미: 부분 문자열 매칭으로 검색 성공률 향상
    // - 사용 이유: HTML 변환으로 인한 텍스트 차이 해결
    let foundPosition = -1;
    let searchStartIndex = 0;

    // 블록 텍스트 찾기
    const blockIndex = normalizedFullText.indexOf(normalizedBlockText);
    if (blockIndex !== -1) {
      searchStartIndex = blockIndex;
    }

    // 선택된 텍스트 찾기 (부분 매칭 포함)
    if (normalizedSearchText.length >= 3) {
      // 최소 3글자 이상일 때만 검색
      foundPosition = normalizedFullText.indexOf(
        normalizedSearchText,
        searchStartIndex
      );

      // 부분 매칭으로 재시도
      if (foundPosition === -1 && normalizedSearchText.length > 10) {
        const partialSearch = normalizedSearchText.substring(
          0,
          Math.min(20, normalizedSearchText.length)
        );
        foundPosition = normalizedFullText.indexOf(
          partialSearch,
          searchStartIndex
        );
      }
    }

    if (foundPosition !== -1) {
      // 기존 하이라이트 제거
      if (highlightedRangeRef.current) {
        quill.formatText(
          highlightedRangeRef.current.index,
          highlightedRangeRef.current.length,
          'background',
          false
        );
      }

      // 새 하이라이트 적용
      const highlightLength = Math.min(
        normalizedSearchText.length,
        normalizedFullText.length - foundPosition
      );
      quill.formatText(foundPosition, highlightLength, 'background', '#ADD8E6');

      highlightedRangeRef.current = {
        index: foundPosition,
        length: highlightLength,
      };

      // 커서 위치 설정 (지연 실행으로 안정성 보장)
      setTimeout(() => {
        try {
          quill.setSelection(foundPosition, 0);
          quill.focus();
          if (process.env.NODE_ENV === 'development') {
            console.log(
              'MarkdownEditor: Successfully highlighted and positioned cursor at',
              foundPosition
            );
          }
        } catch (e) {
          console.warn('MarkdownEditor: Failed to set cursor position', e);
        }
      }, 100); // 100ms 지연으로 안정성 향상
    } else {
      // 텍스트를 찾지 못한 경우 상세 로그
      if (process.env.NODE_ENV === 'development') {
        console.log('MarkdownEditor: Text search failed', {
          fullTextLength: normalizedFullText.length,
          blockTextLength: normalizedBlockText.length,
          searchTextLength: normalizedSearchText.length,
          searchText: normalizedSearchText.substring(0, 50) + '...',
        });
      }

      setErrorMessage({
        type: 'mapping-failed',
        text: '선택한 텍스트를 찾을 수 없습니다. 다시 시도해보세요.',
      });
    }
  }, [
    selectedBlockText,
    selectedOffset,
    selectedLength,
    selectedText,
    setErrorMessage,
    normalizeText,
  ]);

  // 핸들러: 텍스트 변경
  // - 의미: 사용자 입력 처리
  // - 사용 이유: 마크다운 입력 동기화
  // - 작동 매커니즘: 입력값 디바운스로 폼과 Zustand 업데이트
  const handleTextChange = (
    value: string,
    _delta: unknown,
    source: string
    // editor 매개변수 제거 - 사용되지 않음
  ) => {
    // API 변경은 무시 (무한 렌더링 방지)
    // - 의미: 프로그래매틱 변경 시 처리하지 않음
    // - 사용 이유: 사용자 입력만 처리하여 성능 최적화
    if (source !== 'user') {
      if (process.env.NODE_ENV === 'development') {
        console.log('MarkdownEditor: Non-user change ignored, source:', source);
      }
      return;
    }

    // 에디터 값 업데이트
    // - 의미: 무한 렌더링 방지를 위한 안정적인 값 관리
    // - 사용 이유: ReactQuill value prop 최적화
    setEditorValue(value);

    isUserTyping.current = true;
    if (process.env.NODE_ENV === 'development') {
      console.log('MarkdownEditor: Text changed by user');
    }

    // 선택 영역 보존
    let selection: { index: number; length: number } | null = null;
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      try {
        selection = quill.getSelection();
      } catch (e) {
        console.warn('MarkdownEditor: Failed to get selection', e);
      }
    }

    // 디바운스로 폼 업데이트
    debouncedSetValue(value);

    // 선택 영역 복원 (지연 실행)
    if (selection && quillRef.current) {
      setTimeout(() => {
        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          try {
            quill.setSelection(selection.index, selection.length);
          } catch (e) {
            console.warn('MarkdownEditor: Failed to restore selection', e);
          }
        }
      }, 10);
    }

    // 타이핑 상태 해제
    setTimeout(() => {
      isUserTyping.current = false;
    }, 100);
  };

  return (
    // 컨테이너: 편집기 레이아웃
    // - 의미: 마크다운 입력 UI 배치
    // - 사용 이유: 사용자 친화적 인터페이스
    <div
      className="flex flex-col flex-1 gap-2"
      role="region"
      aria-label="마크다운 에디터"
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">콘텐츠</label>
        {isMobile && (
          <Button
            type="button"
            onClick={onOpenPreview}
            aria-label="미리보기 보기"
          >
            미리보기 보기
          </Button>
        )}
      </div>
      <div>
        {/* ReactQuill deprecation 경고 무시 */}
        {/* - 의미: 라이브러리 내부 경고로 기능에는 영향 없음 */}
        {/* - 해결: ReactQuill 업데이트 또는 대안 라이브러리 사용 권장 */}
        <ReactQuill
          ref={quillRef}
          value={editorValue}
          onChange={handleTextChange}
          modules={modules}
          formats={formats}
          theme="snow"
          preserveWhitespace
          className="bg-white border rounded-md"
          aria-label="마크다운 입력" // 웹 접근성
        />
      </div>
    </div>
  );
}

export default MarkdownEditor;
//====여기까지 수정됨====
