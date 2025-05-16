import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { BlogPostFormData } from '../types/blog-post';
import DOMPurify from 'dompurify';

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
        '<mark class="search-highlight bg-yellow-200">$1</mark>'
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
      'li',
      'img',
      'ul',
      'ol',
      'strong',
      'em',
      'mark',
      'br',
      'div',
      'span',
    ],
    ALLOWED_ATTR: ['class', 'src'],
  });
  return sanitized;
};

function MarkdownPreview({
  setSelectedBlockText,
  setSelectedOffset,
  setSelectedLength,
  setSelectedText,
  setErrorMessage,
  isMobile = false,
  onClose,
}: MarkdownPreviewProps) {
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext || !formContext.control) {
    return (
      <div
        className="flex flex-col items-center justify-center p-4 text-red-500"
        role="region"
        aria-live="assertive"
      >
        <h2 className="text-lg font-medium">폼 컨텍스트 오류</h2>
        <p className="text-sm">미리보기를 로드할 수 없습니다.</p>
      </div>
    );
  }
  const { control, watch } = formContext;

  const markdown = watch('markdown') || '';
  const searchTerm = watch('searchTerm') || '';

  const [matches, setMatches] = useState<Element[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSelecting = useRef(false);

  const highlightedHTML = React.useMemo(() => {
    const sanitized = DOMPurify.sanitize(markdown, {
      ALLOWED_TAGS: [
        'p',
        'h1',
        'h2',
        'h3',
        'li',
        'img',
        'ul',
        'ol',
        'strong',
        'em',
        'mark',
        'br',
        'div',
        'span',
      ],
      ALLOWED_ATTR: ['class', 'src'],
    });
    return highlightSearchTerm(sanitized, searchTerm);
  }, [markdown, searchTerm]);

  useEffect(() => {
    if (!previewRef.current) return;
    const elements = Array.from(
      previewRef.current!.querySelectorAll('.search-highlight')
    );
    setMatches(elements);
    setCurrentMatchIndex(elements.length > 0 ? 0 : -1);
  }, [highlightedHTML]);

  useEffect(() => {
    if (!matches.length || currentMatchIndex === -1) return;
    const current = matches[currentMatchIndex];
    current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    matches.forEach((el, i) => {
      el.classList.toggle('!bg-blue-200', i === currentMatchIndex);
      el.classList.toggle('!bg-yellow-200', i !== currentMatchIndex);
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

  const handleStart = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON')
      ) {
        return;
      }
      isSelecting.current = true;
      setErrorMessage(null);
    },
    [setErrorMessage]
  );

  const handleEnd = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ) => {
      if (!isSelecting.current) return;
      isSelecting.current = false;
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (!selectedText) {
        selection?.removeAllRanges();
        return;
      }

      const range = selection?.getRangeAt(0);
      let startBlock: Element | null = null;
      let endBlock: Element | null = null;

      let startNode: Node | null = range?.startContainer;
      while (startNode && !startBlock) {
        if (startNode.nodeType === Node.ELEMENT_NODE) {
          startBlock = (startNode as Element).closest('p,h1,h2,h3,li,ul,ol');
        }
        startNode = startNode.parentNode;
      }

      let endNode: Node | null = range?.endContainer;
      while (endNode && !endBlock) {
        if (endNode.nodeType === Node.ELEMENT_NODE) {
          endBlock = (endNode as Element).closest('p,h1,h2,h3,li,ul,ol');
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
    },
    [
      setSelectedBlockText,
      setSelectedOffset,
      setSelectedLength,
      setSelectedText,
      setErrorMessage,
      isMobile,
      onClose,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (matches.length <= 1) return;
      if (e.key === 'Enter' && e.shiftKey) {
        setCurrentMatchIndex(
          (prev) => (prev - 1 + matches.length) % matches.length
        );
      } else if (e.key === 'Enter') {
        setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
      }
    },
    [matches.length]
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
            onChange={(e) => field.onChange(e.target.value)}
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
        className="border rounded-md p-4 bg-gray-50 min-h-[300px] overflow-auto prose prose-sm max-w-none"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        dangerouslySetInnerHTML={{ __html: highlightedHTML || '' }}
      />
    </div>
  );
}

export default MarkdownPreview;
