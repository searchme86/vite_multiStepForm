import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type UseFormSetValue,
} from 'react-hook-form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import type { blogPostSchemaType } from '../../pages/write/schema/blogPostSchema';
import DOMPurify from 'dompurify';
import { useStepFieldsStateStore } from '../../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';

type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

interface MarkdownPreviewProps {
  setSelectedBlockText: (blockText: string | null) => void;
  setSelectedOffset: (offset: number | null) => void;
  setSelectedLength: (length: number | null) => void;
  setSelectedText: (text: string | null) => void;
  setErrorMessage: (message: ErrorMessage | null) => void;
  isMobile?: boolean;
  onClose?: () => void;
  setValue: UseFormSetValue<FieldValues>;
  setSearchTerm: (value: string) => void;
  control: Control<FieldValues>;
  watch: (name?: string | string[] | undefined) => unknown;
}

const highlightSearchTerm = (html: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return html;
  const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach((textNode) => {
    const text = textNode.textContent || '';
    if (regex.test(text)) {
      const span = doc.createElement('span');
      span.innerHTML = text.replace(
        regex,
        '<mark style="background-color: #FFFF99;">$1</mark>'
      );
      textNode.parentNode?.replaceChild(span, textNode);
    }
  });

  const sanitized = DOMPurify.sanitize(doc.body.innerHTML, {
    ALLOWED_TAGS: [
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'li',
      'ul',
      'ol',
      'blockquote',
      'strong',
      'em',
      'u',
      's',
      'sub',
      'sup',
      'mark',
      'br',
      'hr',
      'div',
      'span',
      'pre',
      'code',
      'img',
      'a',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],
    ALLOWED_ATTR: [
      'style',
      'class',
      'id',
      'src',
      'alt',
      'width',
      'height',
      'href',
      'target',
      'rel',
      'colspan',
      'rowspan',
      'data-*',
    ],
    ALLOW_DATA_ATTR: true,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });

  return sanitized;
};

const isValidImageSource = (src: string): boolean => {
  try {
    const allowedPatterns = [/^https?:\/\//, /^data:image\//, /^\//, /^\.\//];
    return allowedPatterns.some((pattern) => pattern.test(src));
  } catch (error) {
    return false;
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img) {
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIExvYWQgRXJyb3I8L3RleHQ+PC9zdmc+';
    img.alt = '이미지 로드 실패';
    img.style.maxWidth = '200px';
    img.style.maxHeight = '200px';
    img.style.border = '2px dashed #ccc';
    img.style.borderRadius = '4px';
  }
};

function MarkdownPreview({
  setSelectedBlockText,
  setSelectedOffset,
  setSelectedLength,
  setSelectedText,
  setErrorMessage,
  isMobile = false,
  onClose,
  setValue,
  setSearchTerm,
  control,
  watch,
}: MarkdownPreviewProps) {
  const zustandStore = useStepFieldsStateStore();
  const markdown = (watch('markdown') as string) || '';
  const searchTerm = (watch('searchTerm') as string) || '';

  const [matches, setMatches] = useState<Element[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [selectedMobileText, setSelectedMobileText] = useState<string | null>(
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSelecting = useRef(false);

  useEffect(() => {
    if (isInitialized) return;

    const storedSearchTerm = zustandStore.state?.searchTerm || '';
    const storedMarkdown = zustandStore.state?.markdown || '';

    if (storedSearchTerm && !searchTerm) {
      setValue('searchTerm', storedSearchTerm);
    }

    if (storedMarkdown && !markdown) {
      setValue('markdown', storedMarkdown);
    }

    setIsInitialized(true);
  }, [isInitialized, setValue, searchTerm, markdown, zustandStore.state]);

  const highlightedHTML = React.useMemo(() => {
    const htmlContent = markdown || zustandStore.state?.markdown || '';
    const currentSearchTerm =
      searchTerm || zustandStore.state?.searchTerm || '';
    return highlightSearchTerm(htmlContent, currentSearchTerm);
  }, [
    markdown,
    searchTerm,
    zustandStore.state?.markdown,
    zustandStore.state?.searchTerm,
  ]);

  useEffect(() => {
    if (!previewRef.current) return;

    const images = previewRef.current.querySelectorAll('img');
    images.forEach((img) => {
      const imgSrc = img.getAttribute('src');
      if (imgSrc && !isValidImageSource(imgSrc)) {
        img.src =
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmNjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJsb2NrZWQgVW5zYWZlIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
        img.alt = '차단된 안전하지 않은 이미지';
        return;
      }

      img.addEventListener('error', handleImageError);
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.borderRadius = '4px';
      img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener('error', handleImageError);
      });
    };
  }, [highlightedHTML]);

  useEffect(() => {
    if (!previewRef.current) return;
    const elements = Array.from(previewRef.current.querySelectorAll('mark'));
    setMatches(elements);
    setCurrentMatchIndex(elements.length > 0 ? 0 : -1);
  }, [highlightedHTML]);

  useEffect(() => {
    if (!matches.length || currentMatchIndex === -1) return;
    const current = matches[currentMatchIndex];
    current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    matches.forEach((el, i) => {
      el.setAttribute(
        'style',
        i === currentMatchIndex
          ? 'background-color: #ADD8E6;'
          : 'background-color: #FFFF99;'
      );
    });
  }, [matches, currentMatchIndex]);

  const getOffsetInBlock = (
    block: Element,
    container: Node,
    offset: number
  ): number => {
    if (!block.contains(container)) {
      return -1;
    }
    let totalOffset = 0;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node === container) {
        return totalOffset + offset;
      }
      totalOffset += node.textContent?.length || 0;
    }
    return -1;
  };

  const handleStart = useCallback(() => {
    isSelecting.current = true;
    setErrorMessage(null);
  }, [setErrorMessage]);

  const handleEnd = useCallback(() => {
    if (!isSelecting.current) return;
    isSelecting.current = false;
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selectedText) {
      selection?.removeAllRanges();
      return;
    }

    const range = selection?.getRangeAt(0);
    if (!range) {
      setErrorMessage({
        type: 'mapping-failed',
        text: '선택 범위를 가져올 수 없습니다.',
      });
      return;
    }

    let startBlock: Element | null = null;
    let endBlock: Element | null = null;

    let startNode: Node | null = range.startContainer || null;
    while (startNode && !startBlock) {
      if (startNode.nodeType === Node.ELEMENT_NODE) {
        startBlock = (startNode as Element).closest('p,h1,h2,h3,li,ul,ol,div');
      }
      startNode = startNode.parentNode;
    }

    let endNode: Node | null = range.endContainer || null;
    while (endNode && !endBlock) {
      if (endNode.nodeType === Node.ELEMENT_NODE) {
        endBlock = (endNode as Element).closest('p,h1,h2,h3,li,ul,ol,div');
      }
      endNode = endNode.parentNode;
    }

    if (startBlock && endBlock && startBlock !== endBlock) {
      setErrorMessage({
        type: 'multi-block',
        text: '여러 블록에 걸친 선택은 지원되지 않습니다. 단일 블록을 선택해주세요.',
      });
      selection?.removeAllRanges();
      return;
    }

    if (startBlock) {
      const blockText = startBlock.textContent || '';
      const startContainer = range.startContainer;
      const startOffsetInContainer = range.startOffset;
      const endContainer = range.endContainer;
      const endOffsetInContainer = range.endOffset;

      if (
        startContainer.nodeType !== Node.TEXT_NODE ||
        endContainer.nodeType !== Node.TEXT_NODE
      ) {
        setErrorMessage({
          type: 'mapping-failed',
          text: '선택 범위가 텍스트 노드가 아닙니다.',
        });
        return;
      }

      const startOffset = getOffsetInBlock(
        startBlock,
        startContainer,
        startOffsetInContainer
      );
      const endOffset = getOffsetInBlock(
        startBlock,
        endContainer,
        endOffsetInContainer
      );

      if (startOffset === -1 || endOffset === -1) {
        setErrorMessage({
          type: 'mapping-failed',
          text: '오프셋 계산 실패',
        });
        return;
      }

      setSelectedBlockText(blockText);
      setSelectedOffset(startOffset);
      setSelectedLength(endOffset - startOffset);
      setSelectedText(selectedText);
    } else {
      setErrorMessage({
        type: 'mapping-failed',
        text: '텍스트 매핑이 실패했습니다',
      });
      setSelectedBlockText(null);
      setSelectedOffset(null);
      setSelectedLength(null);
      setSelectedText(null);
    }
    selection?.removeAllRanges();
    if (isMobile && onClose) {
      onClose();
    }
  }, [
    setSelectedBlockText,
    setSelectedOffset,
    setSelectedLength,
    setSelectedText,
    setErrorMessage,
    isMobile,
    onClose,
  ]);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      console.log('Touch Start:', {
        x: touch.clientX,
        y: touch.clientY,
        target: (event.target as HTMLElement).tagName,
      });
    },
    []
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      console.log('Touch Move:', {
        x: touch.clientX,
        y: touch.clientY,
        target: (event.target as HTMLElement).tagName,
      });
    },
    []
  );

  const handleTouchEnd = useCallback(
    (_event: React.TouchEvent<HTMLDivElement>) => {
      console.log('Touch End Detected');
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && previewRef.current?.contains(selection.anchorNode)) {
          const text = selection.toString().trim();
          console.log('Selected Text on Mobile:', text);
          if (text) {
            setSelectedMobileText(text);
            console.log('Drag Action Successful: Text selected -', text);
          } else {
            setSelectedMobileText(null);
            console.log('Drag Action Failed: No text selected');
          }
        } else {
          setSelectedMobileText(null);
          console.log('Drag Action Failed: Selection outside preview');
        }
      }, 100);
    },
    []
  );

  useEffect(() => {
    if (isMobile) {
      const handleDocumentTouchEnd = (event: TouchEvent) => {
        handleTouchEnd(event as unknown as React.TouchEvent<HTMLDivElement>);
      };

      document.addEventListener('touchend', handleDocumentTouchEnd);
      return () => {
        document.removeEventListener('touchend', handleDocumentTouchEnd);
      };
    }
  }, [isMobile, handleTouchEnd]);

  const handleInsertText = () => {
    if (selectedMobileText) {
      setSelectedText(selectedMobileText);
      console.log('Inserting text into editor:', selectedMobileText);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleKeyDown = useCallback(
    (keyEvent: React.KeyboardEvent<HTMLInputElement>) => {
      if (matches.length <= 1) return;
      if (keyEvent.key === 'Enter' && keyEvent.shiftKey) {
        setCurrentMatchIndex(
          (prev) => (prev - 1 + matches.length) % matches.length
        );
      } else if (keyEvent.key === 'Enter') {
        setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
      }
    },
    [matches.length]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (zustandStore.setSearchTerm) {
        zustandStore.setSearchTerm(value);
      }
    },
    [setSearchTerm, zustandStore.setSearchTerm]
  );

  return (
    <div
      className="flex-1"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      role="region"
      aria-label="마크다운 미리보기"
    >
      <label className="text-sm font-medium">미리보기</label>
      <Controller
        name="searchTerm"
        control={control}
        render={({ field }) => (
          <Input
            type="text"
            placeholder="검색어를 입력하세요 (예: 안녕)"
            value={field.value || ''}
            onChange={(inputEvent) => {
              const value = inputEvent.target.value;
              field.onChange(value);
              setValue('searchTerm', value);
              handleSearchChange(value);
            }}
            onKeyDown={handleKeyDown}
            className="mb-2"
            aria-label="미리보기 검색"
          />
        )}
      />
      {matches.length > 0 && (
        <div className="flex items-center gap-2 mb-2 text-sm">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setCurrentMatchIndex(
                (prev) => (prev - 1 + matches.length) % matches.length
              )
            }
            aria-label="이전 검색어"
          >
            이전
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setCurrentMatchIndex((prev) => (prev + 1) % matches.length)
            }
            aria-label="다음 검색어"
          >
            다음
          </Button>
          <span>
            {currentMatchIndex + 1} / {matches.length}
          </span>
        </div>
      )}

      <div
        ref={previewRef}
        className="border rounded-md p-4 bg-white min-h-[300px] overflow-auto prose prose-sm max-w-none
                   [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img]:shadow-sm
                   [&_img]:border [&_img]:border-gray-200 [&_img]:mx-auto [&_img]:block
                   [&_p]:mb-3 [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-2
                   [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1
                   [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:italic"
        style={{
          userSelect: 'text',
          lineHeight: '1.6',
        }}
        onMouseDown={!isMobile ? handleStart : undefined}
        onMouseUp={!isMobile ? handleEnd : undefined}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        dangerouslySetInnerHTML={{ __html: highlightedHTML || '' }}
        aria-live="polite"
      />

      {isMobile && selectedMobileText && (
        <div className="mt-2">
          <Button
            type="button"
            onClick={handleInsertText}
            aria-label="에디터에 삽입"
          >
            에디터에 삽입
          </Button>
        </div>
      )}
    </div>
  );
}

export default MarkdownPreview;
