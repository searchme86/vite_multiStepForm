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

//====여기부터 수정됨====
import React, { useState, useRef, useEffect } from 'react';
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
  setSelectedText: (text: string | null) => void;
  setErrorMessage: (message: ErrorMessage | null) => void;
}

// 함수: 검색어 강조
// - 의미: 입력된 검색어를 HTML에서 찾아 노란색으로 표시
// - 사용 이유: 사용자 검색어 가시화
// - 비유: 책에서 단어 찾아 마커로 칠하기
const highlightSearchTerm = (html: string, searchTerm: string): string => {
  // 검색어가 없으면 원본 HTML 반환
  if (!searchTerm.trim()) return html;
  // 특수문자 이스케이프
  const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  // 텍스트 노드 수집
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach((textNode) => {
    const text = textNode.textContent || '';
    if (regex.test(text)) {
      const span = doc.createElement('span');
      // 검색어에 노란색 마크 적용
      span.innerHTML = text.replace(
        regex,
        '<mark class="search-highlight bg-yellow-200">$1</mark>'
      );
      textNode.parentNode?.replaceChild(span, textNode);
    }
  });
  // 보안 위해 HTML 정화
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
  console.log('MarkdownPreview: Highlighted HTML', sanitized);
  return sanitized;
};

// 함수: 미리보기 컴포넌트
// - 의미: 마크다운 실시간 렌더링 및 검색 기능 제공
// - 사용 이유: 사용자 작성 콘텐츠 미리보기
function MarkdownPreview({
  setSelectedBlockText,
  setSelectedText,
  setErrorMessage,
}: MarkdownPreviewProps) {
  console.log('MarkdownPreview: Rendering');
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext || !formContext.control) {
    // 폼 컨텍스트 없으면 에러 UI 표시
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
  const markdown = watch('markdown') || '';
  const searchTerm = watch('searchTerm') || '';
  console.log('MarkdownPreview: Watched markdown', markdown); // 디버깅 로그

  const [matches, setMatches] = useState<Element[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSelecting = useRef(false);

  // 검색어 강조 HTML 계산
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
  useEffect(() => {
    if (!previewRef.current) return;
    const timer = setTimeout(() => {
      console.log('MarkdownPreview: Preview DOM', previewRef.current.innerHTML); // 디버깅 로그
      const elements = Array.from(
        previewRef.current!.querySelectorAll('.search-highlight')
      );
      setMatches(elements);
      setCurrentMatchIndex(elements.length > 0 ? 0 : -1);
      console.log('MarkdownPreview: Search matches', elements.length, elements);
    }, 0);
    return () => clearTimeout(timer);
  }, [highlightedHTML]);

  // 검색 결과 강조 및 스크롤
  useEffect(() => {
    if (!matches.length || currentMatchIndex === -1) return;
    const current = matches[currentMatchIndex];
    current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    matches.forEach((el, i) => {
      el.classList.toggle('!bg-blue-200', i === currentMatchIndex);
      el.classList.toggle('!bg-yellow-200', i !== currentMatchIndex);
    });
    console.log('MarkdownPreview: Highlighted match', currentMatchIndex + 1);
  }, [matches, currentMatchIndex]);

  // 마우스 클릭 시작
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target instanceof HTMLElement &&
      (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON')
    ) {
      console.log('MarkdownPreview: Ignored mouse down on input/button');
      return;
    }
    isSelecting.current = true;
    setErrorMessage(null);
    console.log('MarkdownPreview: Mouse down, selection started');
  };

  // 마우스 클릭 종료
  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting.current) return;
    isSelecting.current = false;
    if (
      e.target instanceof HTMLElement &&
      (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON')
    ) {
      console.log('MarkdownPreview: Ignored mouse up on input/button');
      return;
    }
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selectedText) {
      console.log('MarkdownPreview: No text selected, ignoring');
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
      const blockText =
        startBlock.textContent?.replace(/[\n\r]+/g, ' ').trim() || '';
      setSelectedBlockText(blockText);
      setSelectedText(selectedText);
      console.log(
        'MarkdownPreview: Mouse up, block text:',
        blockText,
        'selected:',
        selectedText
      );
    } else {
      setErrorMessage({
        type: 'mapping-failed',
        text: '텍스트 매핑이 실패했습니다',
      });
      setSelectedBlockText(null);
      setSelectedText(null);
      console.log('MarkdownPreview: No block found');
    }
    selection?.removeAllRanges();
  };

  // 키보드 탐색
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (matches.length <= 1) return;
    if (e.key === 'Enter' && e.shiftKey) {
      setCurrentMatchIndex(
        (prev) => (prev - 1 + matches.length) % matches.length
      );
      console.log('MarkdownPreview: Previous match');
    } else if (e.key === 'Enter') {
      setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
      console.log('MarkdownPreview: Next match');
    }
  };

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
            className="bg-white border-gray-300 hover:bg-gray-100"
            onClick={() => {
              setCurrentMatchIndex(
                (prev) => (prev - 1 + matches.length) % matches.length
              );
              console.log('MarkdownPreview: Previous button clicked');
            }}
            aria-label="이전 검색어"
          >
            이전
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-white border-gray-300 hover:bg-gray-100"
            onClick={() => {
              setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
              console.log('MarkdownPreview: Next button clicked');
            }}
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
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        dangerouslySetInnerHTML={{ __html: highlightedHTML || '' }} // HTML 렌더링 복원
      />
    </div>
  );
}

export default MarkdownPreview;
//====여기까지 수정됨====
