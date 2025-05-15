// MarkdownEditor.tsx: Quill 기반 마크다운 에디터
// - 의미: 마크다운 입력, 텍스트 기반 커서 이동
// - 사용 이유: 포스트 작성, 미리보기 선택 반영
// - 비유: 노트에 글 쓰고, 책 페이지로 펜 이동
// - 작동 메커니즘:
//   1. ReactQuill로 마크다운 입력
//   2. 선택된 텍스트로 커서 이동
//   3. 에러 메시지 표시
// - 관련 키워드: react-quill, react-hook-form, tailwindcss

//====여기부터 수정됨====
import React, { useEffect, useRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BlogPostFormData } from '../types/blog-post';
import debounce from 'lodash/debounce';

// 타입: 에러 메시지
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 타입: 컴포넌트 속성
interface MarkdownEditorProps {
  selectedBlockText: string | null;
  selectedText: string | null;
  setErrorMessage: (message: ErrorMessage | null) => void;
}

// Quill 모듈 설정
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
const formats = ['header', 'bold', 'italic', 'list', 'bullet', 'image'];

// 함수: 마크다운 에디터
const MarkdownEditor = React.forwardRef<ReactQuill, MarkdownEditorProps>(
  ({ selectedBlockText, selectedText, setErrorMessage }, ref) => {
    console.log('MarkdownEditor: Rendering');
    const formContext = useFormContext<BlogPostFormData>();
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

    // 디바운스된 setValue
    const debouncedSetValue = useCallback(
      debounce((value: string) => {
        setValue('markdown', value, { shouldValidate: true });
        console.log('MarkdownEditor: Debounced form field value', value);
      }, 300),
      [setValue]
    );

    // 효과: 커서 이동
    useEffect(() => {
      if (isUserTyping.current) {
        console.log('MarkdownEditor: User typing, skipping moveToText');
        return;
      }

      if (!quillRef.current || !selectedBlockText || !selectedText) return;
      const quill = quillRef.current.getEditor();

      // 전체 텍스트 가져오기
      const fullText = quill.getText();
      const blockText = selectedBlockText.replace(/[\n\r]+/g, ' ').trim();
      const searchText = selectedText.trim();

      // 블록 텍스트로 위치 찾기
      const blockIndex = fullText.indexOf(blockText);
      if (blockIndex === -1) {
        setErrorMessage({
          type: 'mapping-failed',
          text: '선택한 블록을 찾을 수 없습니다.',
        });
        console.log('MarkdownEditor: Block text not found', blockText);
        return;
      }

      // 선택 텍스트로 위치 찾기
      const textIndex = fullText.indexOf(searchText, blockIndex);
      if (textIndex === -1) {
        setErrorMessage({
          type: 'mapping-failed',
          text: '선택한 텍스트를 찾을 수 없습니다.',
        });
        console.log('MarkdownEditor: Selected text not found', searchText);
        return;
      }

      // 커서 이동 및 포커스
      quill.setSelection(textIndex, searchText.length);
      quill.focus();
      console.log(
        'MarkdownEditor: Moved to text',
        blockText,
        'selected:',
        searchText,
        'index:',
        textIndex
      );
    }, [selectedBlockText, selectedText, setErrorMessage]);

    // 핸들러: 텍스트 변경
    const handleTextChange = (
      value: string,
      _delta: unknown,
      source: string,
      editor: unknown
    ) => {
      if (source !== 'user') {
        console.log('MarkdownEditor: Non-user change, source:', source);
        return;
      }

      isUserTyping.current = true;
      console.log('MarkdownEditor: Text changed, source:', source);

      // 커서 위치 저장
      let selection: { index: number; length: number } | null = null;
      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        try {
          selection = quill.getSelection();
          console.log('MarkdownEditor: Cursor position', selection);
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
        className="flex-1"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        role="region"
        aria-label="마크다운 에디터"
      >
        <label className="text-sm font-medium">콘텐츠</label>
        <div className="">
          <ReactQuill
            ref={(el) => {
              quillRef.current = el;
              if (typeof ref === 'function') ref(el);
              else if (ref) ref.current = el;
            }}
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
);

export default MarkdownEditor;
//====여기까지 수정됨====
