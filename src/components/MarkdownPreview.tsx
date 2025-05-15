//====여기부터 수정됨====
// MarkdownPreview.tsx: 마크다운 미리보기, 클릭+드래그, 검색어 강조
// - 의미: HTML 렌더링, 텍스트 선택, 에러 메시지
// - 사용 이유: 실시간 미리보기, 에디터로 위치 이동
// - 비유: 책에서 문장 색칠 후 노트로 이동
// - 작동 메커니즘:
//   1. onMouseDown, onMouseUp으로 클릭+드래그 처리
//   2. window.getSelection으로 텍스트/블록 추출
//   3. 선택된 텍스트로 에디터 이동
//   4. 검색어 강조 및 다중 결과 탐색 버튼
//   5. 예외 메시지 표시
// - 관련 키워드: window.getSelection, dompurify, react-quill

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { BlogPostFormData } from '../types/blog-post';
import DOMPurify from 'dompurify';
import './styles.css';

// 타입: 에러 메시지
// - 의미: 사용자에게 표시할 에러 정보
// - 사용 이유: 텍스트 선택 실패 시 피드백 제공
type ErrorMessage = {
  type: 'empty' | 'multi-block' | 'mapping-failed';
  text: string;
};

// 타입: 컴포넌트 속성
// - 의미: 부모 컴포넌트로부터 받는 콜백 함수
// - 사용 이유: 선택된 텍스트와 블록을 에디터로 전달
interface MarkdownPreviewProps {
  setSelectedBlockText: (blockText: string | null) => void;
  setSelectedOffset: (offset: number | null) => void;
  setSelectedLength: (length: number | null) => void;
  setSelectedText: (text: string | null) => void;
  setErrorMessage: (message: ErrorMessage | null) => void;
}

// 함수: 검색어 강조
// - 의미: 입력된 검색어를 HTML에서 찾아 노란색으로 표시
// - 사용 이유: 사용자 검색어 가시화
// - 비유: 책에서 단어 찾아 마커로 칠하기
const highlightSearchTerm = (html: string, searchTerm: string): string => {
  // 검색어가 없으면 원본 HTML 반환
  // - 의미: 검색어가 없으면 강조할 필요 없음
  // - 왜: 성능 최적화 및 불필요한 처리 방지
  if (!searchTerm.trim()) return html;
  // 특수문자 이스케이프
  // - 의미: 정규식에서 특수문자 충돌 방지
  // - 왜: 안전한 검색 패턴 생성
  const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parser = new DOMParser();
  // HTML 문자열을 DOM으로 파싱
  // - 의미: 텍스트 노드를 조작하기 위해
  // - 왜: DOM 트리에서 텍스트 노드 탐색
  const doc = parser.parseFromString(html, 'text/html');
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  // 텍스트 노드 수집
  // - 의미: 검색어를 포함한 텍스트만 처리
  // - 왜: 효율적인 검색을 위해
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach((textNode) => {
    const text = textNode.textContent || '';
    if (regex.test(text)) {
      const span = doc.createElement('span');
      // 검색어에 노란색 마크 적용
      // - 의미: 시각적 강조로 사용자에게 표시
      // - 왜: 사용자 경험 개선
      span.innerHTML = text.replace(
        regex,
        '<mark class="search-highlight bg-yellow-200">$1</mark>'
      );
      textNode.parentNode?.replaceChild(span, textNode);
    }
  });
  // 보안 위해 HTML 정화
  // - 의미: XSS 공격 방지
  // - 왜: 사용자 입력 안전성 확보
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
  // 디버깅 로그, 개발 환경에서만 출력
  // - 의미: 강조된 HTML 확인
  // - 왜: 개발 중 디버깅 용이성
  if (process.env.NODE_ENV === 'development') {
    console.log('MarkdownPreview: Highlighted HTML', sanitized);
  }
  return sanitized;
};

// 함수: 미리보기 컴포넌트
// - 의미: 마크다운 실시간 렌더링 및 검색 기능 제공
// - 사용 이유: 사용자 작성 콘텐츠 미리보기
function MarkdownPreview({
  setSelectedBlockText,
  setSelectedOffset,
  setSelectedLength,
  setSelectedText,
  setErrorMessage,
}: MarkdownPreviewProps) {
  // 컴포넌트 렌더링 로그, 개발 환경에서만 출력
  // - 의미: 렌더링 추적
  // - 왜: 프로덕션 환경에서 불필요한 로그 제거
  if (process.env.NODE_ENV === 'development') {
    console.log('MarkdownPreview: Rendering');
  }
  const formContext = useFormContext<BlogPostFormData>();
  // 폼 컨텍스트 확인
  // - 의미: react-hook-form 데이터 접근
  // - 왜: 폼 데이터 사용을 위해
  if (!formContext || !formContext.control) {
    return (
      <div
        className="flex flex-col items-center justify-center p-4 text-red-500"
        role="alert"
        aria-live="assertive"
      >
        <h2 className="text-lg font-medium">폼 컨텍스트 오류</h2>
        <p className="text-sm">미리보기를 로드할 수 없습니다.</p>
      </div>
    );
  }
  const { control, watch } = formContext;

  // 마크다운 및 검색어 상태 감시
  // - 의미: 실시간 데이터 반영
  // - 왜: 사용자 입력 반영
  const markdown = watch('markdown') || '';
  const searchTerm = watch('searchTerm') || '';
  // 마크다운 디버깅 로그
  // - 의미: 입력값 확인
  // - 왜: 디버깅 용이성
  if (process.env.NODE_ENV === 'development') {
    console.log('MarkdownPreview: Watched markdown', markdown);
  }

  const [matches, setMatches] = useState<Element[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSelecting = useRef(false);

  // 검색어 강조 HTML 계산
  // - 의미: 마크다운과 검색어를 결합해 렌더링 준비
  // - 왜: 사용자 검색어 강조
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

  // 검색 결과 업데이트
  // - 의미: DOM에서 검색어 강조 요소를 찾아 상태 업데이트
  // - 왜: 탐색 버튼과 강조 표시를 위해
  useEffect(() => {
    if (!previewRef.current) return;
    // setTimeout 제거로 즉시 DOM 반영
    // - 의미: 비동기 지연 제거
    // - 왜: 성능 개선
    const elements = Array.from(
      previewRef.current!.querySelectorAll('.search-highlight')
    );
    setMatches(elements);
    setCurrentMatchIndex(elements.length > 0 ? 0 : -1);
    // 디버깅 로그
    // - 의미: 검색 결과 확인
    // - 왜: 디버깅 용이성
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'MarkdownPreview: Search matches',
        elements.length,
        elements.map((el) => el.outerHTML)
      );
    }
  }, [highlightedHTML]);

  // 검색 결과 강조 및 스크롤
  // - 의미: 현재 검색 결과 강조 및 화면 이동
  // - 왜: 사용자에게 현재 위치 표시
  useEffect(() => {
    if (!matches.length || currentMatchIndex === -1) return;
    const current = matches[currentMatchIndex];
    // 부드러운 스크롤로 사용자 경험 개선
    // - 의미: 직관적 탐색 제공
    // - 왜: 사용자 경험 향상
    current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    matches.forEach((el, i) => {
      el.classList.toggle('!bg-blue-200', i === currentMatchIndex);
      el.classList.toggle('!bg-yellow-200', i !== currentMatchIndex);
    });
    // 디버깅 로그
    // - 의미: 강조 상태 확인
    // - 왜: 디버깅 용이성
    if (process.env.NODE_ENV === 'development') {
      console.log('MarkdownPreview: Highlighted match', currentMatchIndex + 1);
    }
  }, [matches, currentMatchIndex]);

  // 함수: 블록 내 오프셋 계산
  // - 의미: 블록 내에서 특정 노드와 오프셋의 전체 오프셋 계산
  // - 사용 이유: 선택된 텍스트의 정확한 위치 매핑
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

  // 마우스 클릭 시작
  // - 의미: 텍스트 선택 시작
  // - 왜: 드래그로 텍스트 선택 처리
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON')
      ) {
        // 버튼/인풋 클릭 무시
        // - 의미: 선택 로직 방지
        // - 왜: 입력 필드와 버튼 클릭 간섭 방지
        if (process.env.NODE_ENV === 'development') {
          console.log('MarkdownPreview: Ignored mouse down on input/button');
        }
        return;
      }
      isSelecting.current = true;
      setErrorMessage(null);
      if (process.env.NODE_ENV === 'development') {
        console.log('MarkdownPreview: Mouse down, selection started');
      }
    },
    [setErrorMessage]
  );

  // 마우스 클릭 종료
  // - 의미: 선택된 텍스트 처리
  // - 왜: 에디터로 텍스트 전달
  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isSelecting.current) return;
      isSelecting.current = false;
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON')
      ) {
        if (process.env.NODE_ENV === 'development') {
          console.log('MarkdownPreview: Ignored mouse up on input/button');
        }
        return;
      }
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (!selectedText) {
        if (process.env.NODE_ENV === 'development') {
          console.log('MarkdownPreview: No text selected, ignoring');
        }
        selection?.removeAllRanges();
        return;
      }

      const range = selection?.getRangeAt(0);
      let startBlock: Element | null = null;

      let node: Node | null = range?.startContainer;
      while (node && !startBlock) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          startBlock = (node as Element).closest('p,h1,h2,h3,li,ul,ol');
        }
        node = node.parentNode;
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
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'MarkdownPreview: Mouse up, block text:',
            blockText,
            'startOffset:',
            startOffset,
            'length:',
            endOffset - startOffset,
            'selected:',
            selectedText
          );
        }
      } else {
        setErrorMessage({
          type: 'mapping-failed',
          text: '텍스트 매핑이 실패했습니다',
        });
        setSelectedBlockText(null);
        setSelectedOffset(null);
        setSelectedLength(null);
        setSelectedText(null);
        if (process.env.NODE_ENV === 'development') {
          console.log('MarkdownPreview: No block found');
        }
      }
      selection?.removeAllRanges();
    },
    [
      setSelectedBlockText,
      setSelectedOffset,
      setSelectedLength,
      setSelectedText,
      setErrorMessage,
    ]
  );

  // 키보드 탐색
  // - 의미: Enter 키로 검색 결과 이동
  // - 왜: 접근성 향상
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (matches.length <= 1) return;
      if (e.key === 'Enter' && e.shiftKey) {
        setCurrentMatchIndex(
          (prev) => (prev - 1 + matches.length) % matches.length
        );
        if (process.env.NODE_ENV === 'development') {
          console.log('MarkdownPreview: Previous match');
        }
      } else if (e.key === 'Enter') {
        setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
        if (process.env.NODE_ENV === 'development') {
          console.log('MarkdownPreview: Next match');
        }
      }
    },
    [matches.length]
  );

  // 버튼 클릭 핸들러
  // - 의미: 이전/다음 검색 결과로 이동
  // - 왜: 사용자 탐색 지원
  const handlePreviousClick = useCallback(() => {
    setCurrentMatchIndex(
      (prev) => (prev - 1 + matches.length) % matches.length
    );
    if (process.env.NODE_ENV === 'development') {
      console.log('MarkdownPreview: Previous button clicked');
    }
  }, [matches.length]);

  const handleNextClick = useCallback(() => {
    setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
    if (process.env.NODE_ENV === 'development') {
      console.log('MarkdownPreview: Next button clicked');
    }
  }, [matches.length]);

  return (
    <div
      className="flex-1"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      role="region"
      aria-label="마크다운 미리보기"
    >
      {/* 미리보기 라벨 */}
      <label className="text-sm font-medium">미리보기</label>
      {/* 검색어 입력 필드 */}
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
      {/* 탐색 버튼 및 현재 위치 표시 */}
      {matches.length > 0 && (
        <div className="flex items-center gap-2 mb-2 text-sm">
          <Button
            type="button"
            variant="outline"
            className="bg-white border-gray-300 hover:bg-gray-100"
            onClick={handlePreviousClick}
            aria-label="이전 검색어"
          >
            이전
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-white border-gray-300 hover:bg-gray-100"
            onClick={handleNextClick}
            aria-label="다음 검색어"
          >
            다음
          </Button>
          <span>
            {currentMatchIndex + 1} / {matches.length}
          </span>
        </div>
      )}
      {/* 미리보기 콘텐츠 */}
      <div
        ref={previewRef}
        className="border rounded-md p-4 bg-gray-50 min-h-[300px] overflow-auto prose prose-sm max-w-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        dangerouslySetInnerHTML={{ __html: highlightedHTML || '' }}
      />
    </div>
  );
}

export default MarkdownPreview;
//====여기까지 수정됨====
