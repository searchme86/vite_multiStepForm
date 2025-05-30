import React, { useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useStepFieldsStateStore } from '../../../../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';
import type { blogPostSchemaType } from '../../../../pages/write/schema/blogPostSchema';
import debounce from 'lodash/debounce';
import { Button } from '../../../../components/ui/button';
import type { FieldErrors, FieldValues } from 'react-hook-form';

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
  setValue: (name: keyof blogPostSchemaType, value: any, options?: any) => void;
  setMarkdown: (value: string) => void;
  setRichTextContent?: (value: string) => void;
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
  setValue,
  setMarkdown,
  setRichTextContent,
  errors,
}: MarkdownEditorProps) {
  const zustandStore = useStepFieldsStateStore();

  const quillRef = useRef<ReactQuill>(null);
  const isUserTyping = useRef(false);
  const highlightedRangeRef = useRef<{ index: number; length: number } | null>(
    null
  );
  const [editorValue, setEditorValue] = React.useState('');

  console.log('editorValue', editorValue);
  useEffect(() => {
    const storedMarkdown = zustandStore.markdown || editorValue;
    console.log('storedMarkdown', storedMarkdown);
    const storedRichText = zustandStore.richTextContent || editorValue;
    console.log('storedRichText', storedRichText);

    if (storedMarkdown) {
      setEditorValue(storedMarkdown);
      setValue('markdown', storedMarkdown, { shouldValidate: false });
      if (setMarkdown) {
        setMarkdown(storedMarkdown);
      }
    }

    if (storedRichText && setRichTextContent) {
      setRichTextContent(storedRichText);
    }
  }, []);

  const safeSetRichTextContent = useCallback(
    (value: string) => {
      try {
        if (setRichTextContent && typeof setRichTextContent === 'function') {
          setRichTextContent(value);
        }

        if (
          zustandStore &&
          typeof zustandStore.setRichTextContent === 'function'
        ) {
          zustandStore.setRichTextContent(value);
        }
      } catch (error) {
        console.error('MarkdownEditor: Error saving richTextContent:', error);
      }
    },
    [setRichTextContent, zustandStore]
  );

  const debouncedSetValue = useCallback(
    debounce((value: string) => {
      setValue('markdown', value, { shouldValidate: true });

      if (setMarkdown && typeof setMarkdown === 'function') {
        setMarkdown(value);
      }

      if (zustandStore && typeof zustandStore.setMarkdown === 'function') {
        zustandStore.setMarkdown(value);
      }

      safeSetRichTextContent(value);
    }, 300),
    [setValue, setMarkdown, safeSetRichTextContent, zustandStore]
  );

  const normalizeText = useCallback((text: string): string => {
    return text
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ')
      .trim();
  }, []);

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
    const normalizedFullText = normalizeText(fullText);
    const normalizedBlockText = normalizeText(selectedBlockText);
    const normalizedSearchText = normalizeText(selectedText);

    let foundPosition = -1;
    let searchStartIndex = 0;

    const blockIndex = normalizedFullText.indexOf(normalizedBlockText);
    if (blockIndex !== -1) {
      searchStartIndex = blockIndex;
    }

    if (normalizedSearchText.length >= 3) {
      foundPosition = normalizedFullText.indexOf(
        normalizedSearchText,
        searchStartIndex
      );

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
      if (highlightedRangeRef.current) {
        quill.formatText(
          highlightedRangeRef.current.index,
          highlightedRangeRef.current.length,
          'background',
          false
        );
      }

      const highlightLength = Math.min(
        normalizedSearchText.length,
        normalizedFullText.length - foundPosition
      );
      quill.formatText(foundPosition, highlightLength, 'background', '#ADD8E6');

      highlightedRangeRef.current = {
        index: foundPosition,
        length: highlightLength,
      };

      setTimeout(() => {
        try {
          quill.setSelection(foundPosition, 0);
          quill.focus();
        } catch (e) {
          console.warn('MarkdownEditor: Failed to set cursor position', e);
        }
      }, 100);
    } else {
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

  const handleTextChange = (value: string, _delta: unknown, source: string) => {
    if (source !== 'user') {
      return;
    }

    setEditorValue(value);
    isUserTyping.current = true;

    let selection: { index: number; length: number } | null = null;
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      try {
        selection = quill.getSelection();
      } catch (e) {
        console.warn('MarkdownEditor: Failed to get selection', e);
      }
    }

    debouncedSetValue(value);

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

    setTimeout(() => {
      isUserTyping.current = false;
    }, 100);
  };

  useEffect(() => {
    return () => {
      debouncedSetValue.cancel();
    };
  }, [debouncedSetValue]);

  return (
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
        <ReactQuill
          ref={quillRef}
          value={editorValue}
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
