//====여기부터 수정됨====
// MarkdownPreview.tsx: 블로그 포스트 마크다운 미리보기 섹션
// - 의미: 마크다운 콘텐츠 미리보기 및 검색어 하이라이트 제공 (휘발성 상태)
// - 사용 이유: 작성 콘텐츠 검토, 브라우저 리프레시 시 초기화되는 임시 상태
// - 비유: 작성된 원고를 임시로 인쇄하여 검토하는 과정 (저장되지 않음)
// - 작동 메커니즘:
//   1. watch로 마크다운과 검색어 데이터 접근 (임시 상태만)
//   2. control로 검색어 입력 관리 (세션별 초기화)
//   3. setValue로 폼 업데이트, setSearchTerm으로 임시 상태만 동기화
//   4. ReactMarkdown으로 마크다운 렌더링, 검색어 하이라이트 (휘발성)
// - 관련 키워드: react-hook-form, 휘발성 상태, react-markdown, tailwindcss, flexbox

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { blogPostSchemaType } from '../pages/write/schema/blogPostSchema';
import DOMPurify from 'dompurify';

// 타입: 오류 메시지
// - 의미: 오류 유형과 메시지 정의
// - 사용 이유: 사용자 피드백 제공
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 인터페이스: 컴포넌트 props
// - 의미: 미리보기 설정 및 콜백 전달 (휘발성 상태 전용)
// - 사용 이유: 마크다운 미리보기와 편집기 연동, 임시 상태만 사용
interface MarkdownPreviewProps {
  setSelectedBlockText: (blockText: string | null) => void;
  setSelectedOffset: (offset: number | null) => void;
  setSelectedLength: (length: number | null) => void;
  setSelectedText: (text: string | null) => void;
  setErrorMessage: (message: ErrorMessage | null) => void;
  isMobile?: boolean;
  onClose?: () => void;
  setValue: (name: keyof blogPostSchemaType, value: any, options?: any) => void;
  setSearchTerm: (value: string) => void; // 휘발성 검색어 상태만 업데이트
  control: any;
  watch: any;
}

// 함수: 검색어 하이라이트
// - 의미: 마크다운 HTML에서 검색어 강조 (임시 하이라이트)
// - 사용 이유: 사용자 검색어 시각화 (세션별 초기화)
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
    ALLOWED_ATTR: ['style'],
  });
  if (process.env.NODE_ENV === 'development') {
    console.log('MarkdownPreview: Highlighted HTML (volatile)', sanitized);
  }
  return sanitized;
};

// MarkdownPreview: 마크다운 미리보기 UI
// - 의미: 마크다운 콘텐츠와 검색어 하이라이트 표시 (휘발성 상태)
// - 사용 이유: 콘텐츠 검토, 브라우저 리프레시 시 초기화
function MarkdownPreview({
  setSelectedBlockText,
  setSelectedOffset,
  setSelectedLength,
  setSelectedText,
  setErrorMessage,
  isMobile = false,
  onClose,
  setValue,
  setSearchTerm, // 휘발성 검색어만 업데이트
  control,
  watch,
}: MarkdownPreviewProps) {
  // 개발 환경 로그
  // - 의미: 렌더링 확인 (휘발성 상태 모드)
  // - 사용 이유: 디버깅
  if (process.env.NODE_ENV === 'development') {
    console.log('MarkdownPreview: Rendering with volatile state only');
  }

  // 폼 데이터 (휘발성 상태만 사용)
  // - 의미: 마크다운과 검색어 값 추적 (임시 상태)
  // - 사용 이유: 미리보기 렌더링, 브라우저 리프레시 시 초기화
  const markdown = watch('markdown') || '';
  const searchTerm = watch('searchTerm') || '';

  if (process.env.NODE_ENV === 'development') {
    console.log('MarkdownPreview: Watched volatile markdown', {
      markdownLength: markdown.length,
      searchTermLength: searchTerm.length,
      note: 'These values will be cleared on browser refresh',
    });
  }

  // 상태: 검색어 매칭 (세션별 초기화)
  // - 의미: 하이라이트된 검색어 목록 (휘발성)
  const [matches, setMatches] = useState<Element[]>([]);
  // 상태: 현재 매칭 인덱스 (세션별 초기화)
  // - 의미: 활성 검색어 위치 (휘발성)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  // 상태: 모바일 선택 텍스트 (세션별 초기화)
  // - 의미: 모바일 터치로 선택된 텍스트 (휘발성)
  const [selectedMobileText, setSelectedMobileText] = useState<string | null>(
    null
  );
  // 참조: 미리보기 요소
  // - 의미: DOM 조작
  const previewRef = useRef<HTMLDivElement>(null);
  // 상태: 선택 중 여부 (세션별 초기화)
  // - 의미: 텍스트 선택 추적 (휘발성)
  const isSelecting = useRef(false);

  // 메모이제이션: 하이라이트된 HTML (휘발성)
  // - 의미: 마크다운과 검색어로 HTML 생성 (임시 상태)
  // - 사용 이유: 성능 최적화, 브라우저 리프레시 시 초기화
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
      ALLOWED_ATTR: ['style'],
    });
    return highlightSearchTerm(sanitized, searchTerm);
  }, [markdown, searchTerm]);

  // 효과: 검색어 매칭 (휘발성)
  // - 의미: 검색어에 해당하는 요소 찾기 (임시 상태)
  // - 사용 이유: 하이라이트 및 네비게이션, 세션별 초기화
  useEffect(() => {
    if (!previewRef.current) return;
    const elements = Array.from(previewRef.current.querySelectorAll('mark'));
    setMatches(elements);
    setCurrentMatchIndex(elements.length > 0 ? 0 : -1);
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'MarkdownPreview: Search matches (volatile)',
        elements.length,
        elements.map((el) => el.outerHTML)
      );
    }
  }, [highlightedHTML]);

  // 효과: 매칭 하이라이트 및 스크롤 (휘발성)
  // - 의미: 현재 매칭된 검색어 강조 및 표시 (임시 상태)
  // - 사용 이유: 사용자 피드백, 세션별 초기화
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
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'MarkdownPreview: Highlighted and scrolled to match (volatile)',
        currentMatchIndex + 1
      );
    }
  }, [matches, currentMatchIndex]);

  // 함수: 블록 내 오프셋 계산
  // - 의미: 선택된 텍스트의 위치 계산
  // - 사용 이유: 편집기와 미리보기 연동
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

  // 핸들러: 선택 시작 (휘발성)
  // - 의미: 텍스트 선택 시작 처리 (임시 상태)
  // - 사용 이유: 사용자 선택 추적, 세션별 초기화
  const handleStart = useCallback(
    (
      _e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ) => {
      if (
        _e.target instanceof HTMLElement &&
        (_e.target.tagName === 'INPUT' || _e.target.tagName === 'BUTTON')
      ) {
        if (process.env.NODE_ENV === 'development') {
          console.log('MarkdownPreview: Ignored mouse down on input/button');
        }
        return;
      }
      isSelecting.current = true;
      setErrorMessage(null);
    },
    [setErrorMessage]
  );

  // 핸들러: 선택 종료 (휘발성)
  // - 의미: 텍스트 선택 완료 처리 (임시 상태)
  // - 사용 이유: 선택된 텍스트 정보 저장, 세션별 초기화
  const handleEnd = useCallback(
    (
      _e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
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
      if (!range) {
        // range가 undefined인 경우 처리
        // - 의미: 선택 범위를 가져올 수 없는 경우
        // - 사용 이유: 타입 안전성 보장
        setErrorMessage({
          type: 'mapping-failed',
          text: '선택 범위를 가져올 수 없습니다.',
        });
        return;
      }

      let startBlock: Element | null = null;
      let endBlock: Element | null = null;

      // 안전한 타입 처리: Node | undefined → Node | null
      // - 의미: undefined를 null로 변환하여 타입 일관성 보장
      // - 사용 이유: TypeScript 타입 에러 방지
      let startNode: Node | null = range.startContainer || null;
      while (startNode && !startBlock) {
        if (startNode.nodeType === Node.ELEMENT_NODE) {
          startBlock = (startNode as Element).closest('p,h1,h2,h3,li,ul,ol');
        }
        startNode = startNode.parentNode;
      }

      let endNode: Node | null = range.endContainer || null;
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

  // 핸들러: 터치 시작 (휘발성)
  // - 의미: 모바일 터치 이벤트 시작 (임시 상태)
  // - 사용 이유: 모바일 텍스트 선택, 세션별 초기화
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0];
      console.log('Touch Start:', {
        x: touch.clientX,
        y: touch.clientY,
        target: (e.target as HTMLElement).tagName,
      });
    },
    []
  );

  // 핸들러: 터치 이동 (휘발성)
  // - 의미: 모바일 터치 이동 추적 (임시 상태)
  // - 사용 이유: 텍스트 선택 범위 확인, 세션별 초기화
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    console.log('Touch Move:', {
      x: touch.clientX,
      y: touch.clientY,
      target: (e.target as HTMLElement).tagName,
    });
  }, []);

  // 핸들러: 터치 종료 (휘발성)
  // - 의미: 모바일 텍스트 선택 완료 (임시 상태)
  // - 사용 이유: 선택된 텍스트 저장, 세션별 초기화
  const handleTouchEnd = useCallback((_e: React.TouchEvent<HTMLDivElement>) => {
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
  }, []);

  // 효과: 모바일 터치 이벤트 리스너 (휘발성)
  // - 의미: 터치 이벤트 등록 (임시 상태)
  // - 사용 이유: 모바일 텍스트 선택 지원, 세션별 초기화
  useEffect(() => {
    if (isMobile) {
      document.addEventListener('touchend', handleTouchEnd as any);
      return () => {
        document.removeEventListener('touchend', handleTouchEnd as any);
      };
    }
  }, [isMobile, handleTouchEnd]);

  // 핸들러: 텍스트 삽입 (휘발성)
  // - 의미: 모바일 선택 텍스트를 편집기에 삽입 (임시 상태)
  // - 사용 이유: 편집기와 미리보기 연동, 세션별 초기화
  const handleInsertText = () => {
    if (selectedMobileText) {
      setSelectedText(selectedMobileText);
      console.log('Inserting text into editor:', selectedMobileText);
      if (onClose) {
        onClose();
      }
    }
  };

  // 핸들러: 키보드 이벤트 (휘발성)
  // - 의미: 검색어 네비게이션 (임시 상태)
  // - 사용 이유: 사용자 편의성, 세션별 초기화
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
    // 컨테이너: 미리보기 레이아웃 (휘발성)
    // - 의미: 마크다운과 검색어 입력 UI 배치 (임시 상태)
    // - 사용 이유: 사용자 친화적 인터페이스, 브라우저 리프레시 시 초기화
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
            onChange={(e) => {
              const value = e.target.value;
              field.onChange(value);
              setValue('searchTerm', value, { shouldValidate: true });
              // 휘발성 검색어만 업데이트 (Zustand 저장 안함)
              // - 의미: 임시 검색어 상태만 동기화
              // - 사용 이유: 브라우저 리프레시 시 검색어 초기화
              setSearchTerm(value);
            }}
            onKeyDown={handleKeyDown}
            className="mb-2"
            aria-label="미리보기 검색" // 웹 접근성
          />
        )}
      />
      {matches.length > 0 && (
        <div className="flex items-center gap-2 mb-2 text-sm">
          <Button
            type="button" // 웹 접근성: 버튼 타입 명시
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
            type="button" // 웹 접근성: 버튼 타입 명시
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
        style={{ userSelect: 'text' }}
        onMouseDown={!isMobile ? handleStart : undefined}
        onMouseUp={!isMobile ? handleEnd : undefined}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        dangerouslySetInnerHTML={{ __html: highlightedHTML || '' }}
        aria-live="polite" // 웹 접근성: 콘텐츠 변경 알림
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
//====여기까지 수정됨====
