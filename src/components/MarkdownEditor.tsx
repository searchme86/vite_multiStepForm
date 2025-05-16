import React, { useEffect, useRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BlogPostFormData } from '../types/blog-post';
import debounce from 'lodash/debounce';
import { Button } from './ui/button';

type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

interface MarkdownEditorProps {
  selectedBlockText: string | null;
  selectedOffset: number | null;
  selectedLength: number | null;
  selectedText: string | null;
  setErrorMessage: (message: ErrorMessage | null) => void;
  isMobile: boolean;
  onOpenPreview: () => void;
}

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

function MarkdownEditor({
  selectedBlockText,
  selectedOffset,
  selectedLength,
  selectedText,
  setErrorMessage,
  isMobile,
  onOpenPreview,
}: MarkdownEditorProps) {
  if (process.env.NODE_ENV === 'development') {
    console.log('MarkdownEditor: Rendering');
  }
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
  const highlightedRangeRef = useRef<{ index: number; length: number } | null>(
    null
  );

  const debouncedSetValue = useCallback(
    debounce((value: string) => {
      setValue('markdown', value, { shouldValidate: true });
      if (process.env.NODE_ENV === 'development') {
        console.log('MarkdownEditor: Debounced form field value', value);
      }
    }, 300),
    [setValue]
  );

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
    const blockText = selectedBlockText.replace(/\s+/g, ' ').trim();
    const searchTextNormalized = selectedText.replace(/\s+/g, ' ').trim();

    const indices = [];
    let index = fullText.indexOf(blockText);
    while (index !== -1) {
      indices.push(index);
      index = fullText.indexOf(blockText, index + 1);
    }

    for (const start of indices) {
      const position = start + selectedOffset;
      if (position < 0 || position + selectedLength > fullText.length) continue;
      const editorText = fullText
        .substring(position, position + selectedLength)
        .replace(/\s+/g, ' ')
        .trim();
      if (editorText === searchTextNormalized) {
        if (highlightedRangeRef.current) {
          quill.formatText(
            highlightedRangeRef.current.index,
            highlightedRangeRef.current.length,
            'background',
            false
          );
        }
        quill.formatText(position, selectedLength, 'background', '#ADD8E6');
        const appliedFormats = quill.getFormat(position, selectedLength);
        console.log('Applied formats:', appliedFormats);
        highlightedRangeRef.current = {
          index: position,
          length: selectedLength,
        };
        setTimeout(() => {
          quill.setSelection(position, 0);
          quill.focus();
        }, 0);
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

    setErrorMessage({
      type: 'mapping-failed',
      text: '선택한 텍스트를 찾을 수 없습니다.',
    });
    if (process.env.NODE_ENV === 'development') {
      console.log('MarkdownEditor: Selected text not found in any block', {
        fullText,
        blockText,
        searchText: selectedText,
      });
    }
  }, [
    selectedBlockText,
    selectedOffset,
    selectedLength,
    selectedText,
    setErrorMessage,
  ]);

  const handleTextChange = (
    value: string,
    _delta: unknown,
    source: string,
    editor: unknown
  ) => {
    if (source !== 'user') {
      if (process.env.NODE_ENV === 'development') {
        console.log('MarkdownEditor: Non-user change, source:', source);
      }
      return;
    }

    isUserTyping.current = true;
    if (process.env.NODE_ENV === 'development') {
      console.log('MarkdownEditor: Text changed, source:', source);
    }

    let selection: { index: number; length: number } | null = null;
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      try {
        selection = quill.getSelection();
        if (process.env.NODE_ENV === 'development') {
          console.log('MarkdownEditor: Cursor position', selection);
        }
      } catch (e) {
        console.warn('MarkdownEditor: Failed to get selection', e);
      }
    }

    debouncedSetValue(value);

    if (selection && quillRef.current) {
      const quill = quillRef.current.getEditor();
      try {
        quill.setSelection(selection.index, selection.length);
      } catch (e) {
        console.warn('MarkdownEditor: Failed to restore selection', e);
      }
    }

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
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">콘텐츠</label>
        {isMobile && (
          <Button type="button" onClick={onOpenPreview}>
            미리보기 보기
          </Button>
        )}
      </div>
      <div>
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
