//====여기부터 수정됨====
// MarkdownPreview.tsx: 블로그 포스트 마크다운 미리보기 섹션
// - 의미: 마크다운 콘텐츠 미리보기 및 검색어 하이라이트 제공 (휘발성 상태)
// - 사용 이유: 작성 콘텐츠 검토, 브라우저 리프레시 시 초기화되는 임시 상태
// - 비유: 작성된 원고를 임시로 인쇄하여 검토하는 과정 (저장되지 않음)
// - 작동 메커니즘:
//   1. watch로 마크다운과 검색어 데이터 접근 (임시 상태만)
//   2. control로 검색어 입력 관리 (세션별 초기화)
//   3. setValue로 폼 업데이트, setSearchTerm으로 임시 상태만 동기화
//   4. DOMPurify로 안전한 HTML 렌더링, 검색어 하이라이트 (휘발성)
//   5. 이미지와 리치텍스트 완전 지원
// - 관련 키워드: react-hook-form, 휘발성 상태, dompurify, tailwindcss, flexbox

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import type { blogPostSchemaType } from '../../pages/write/schema/blogPostSchema';
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

  // 이미지와 리치텍스트를 위한 확장된 허용 태그 및 속성 (수정됨)
  // - 의미: ReactQuill의 모든 기능을 안전하게 렌더링
  // - 사용 이유: 이미지, 스타일링, 포맷팅 완전 지원
  // - 수정: ALLOWED_SCHEMES 제거하여 TypeScript 에러 해결
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
      'img', // 이미지 태그 허용
      'a', // 링크 태그 허용
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td', // 테이블 태그
    ],
    ALLOWED_ATTR: [
      'style',
      'class',
      'id',
      'src',
      'alt',
      'width',
      'height', // 이미지 속성
      'href',
      'target',
      'rel', // 링크 속성
      'colspan',
      'rowspan', // 테이블 속성
      'data-*', // 데이터 속성
    ],
    // ALLOWED_SCHEMES 제거 - DOMPurify 버전에 따라 지원되지 않을 수 있음
    // - 의미: 스키마 제한 없이 모든 이미지 소스 허용
    // - 사용 이유: TypeScript 에러 방지 및 호환성 향상
    ALLOW_DATA_ATTR: true, // 데이터 속성 허용
    ALLOW_UNKNOWN_PROTOCOLS: false, // 알려지지 않은 프로토콜 차단
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('MarkdownPreview: Highlighted HTML with images (volatile)', {
      originalLength: html.length,
      sanitizedLength: sanitized.length,
      hasImages: sanitized.includes('<img'),
      searchTerm: searchTerm,
    });
  }
  return sanitized;
};

// 함수: 안전한 이미지 소스 검증
// - 의미: 이미지 URL의 안전성 확인
// - 사용 이유: XSS 공격 방지 및 보안 강화
const isValidImageSource = (src: string): boolean => {
  try {
    // 허용되는 이미지 소스 패턴
    // - 의미: 안전한 이미지 URL 형식만 허용
    // - 사용 이유: 보안 위험 최소화
    const allowedPatterns = [
      /^https?:\/\//, // HTTP/HTTPS URL
      /^data:image\//, // Data URI (base64 이미지)
      /^\//, // 상대 경로 (같은 도메인)
      /^\.\//, // 현재 디렉토리 상대 경로
    ];

    return allowedPatterns.some((pattern) => pattern.test(src));
  } catch (error) {
    console.warn('MarkdownPreview: Invalid image source format:', src);
    return false;
  }
};

// 함수: 이미지 로드 에러 처리
// - 의미: 깨진 이미지 대체 처리
// - 사용 이유: 사용자 경험 향상
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img) {
    // 이미지 로드 실패 시 플레이스홀더로 교체
    // - 의미: 깨진 이미지 아이콘 대신 사용자 친화적 메시지 표시
    // - 사용 이유: 명확한 상태 전달
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIExvYWQgRXJyb3I8L3RleHQ+PC9zdmc+';
    img.alt = '이미지 로드 실패';
    img.style.maxWidth = '200px';
    img.style.maxHeight = '200px';
    img.style.border = '2px dashed #ccc';
    img.style.borderRadius = '4px';
  }
};

// MarkdownPreview: 마크다운 미리보기 UI
// - 의미: 마크다운 콘텐츠와 검색어 하이라이트 표시 (휘발성 상태)
// - 사용 이유: 콘텐츠 검토, 브라우저 리프레시 시 초기화, 이미지 완전 지원
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
    console.log(
      'MarkdownPreview: Rendering with volatile state and image support'
    );
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
      hasImageTags: markdown.includes('<img'),
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
  // - 사용 이유: 성능 최적화, 브라우저 리프레시 시 초기화, 이미지 포함
  const highlightedHTML = React.useMemo(() => {
    // ReactQuill HTML을 직접 사용 (이미지 태그 포함)
    // - 의미: 편집기에서 생성된 모든 리치텍스트 요소 유지
    // - 사용 이유: 이미지, 스타일, 포맷팅 완전 지원
    const processedHTML = highlightSearchTerm(markdown, searchTerm);

    if (process.env.NODE_ENV === 'development') {
      console.log('MarkdownPreview: Processed HTML', {
        originalMarkdownLength: markdown.length,
        processedHTMLLength: processedHTML.length,
        hasImages: processedHTML.includes('<img'),
        imageCount: (processedHTML.match(/<img/g) || []).length,
      });
    }

    return processedHTML;
  }, [markdown, searchTerm]);

  // 효과: 이미지 에러 핸들링 설정 및 보안 검증
  // - 의미: 미리보기 영역의 모든 이미지에 에러 핸들러 추가 및 소스 검증
  // - 사용 이유: 깨진 이미지 처리 및 보안 강화
  useEffect(() => {
    if (!previewRef.current) return;

    const images = previewRef.current.querySelectorAll('img');
    images.forEach((img) => {
      // 이미지 소스 보안 검증
      // - 의미: 안전하지 않은 이미지 소스 차단
      // - 사용 이유: XSS 공격 방지
      const imgSrc = img.getAttribute('src');
      if (imgSrc && !isValidImageSource(imgSrc)) {
        console.warn('MarkdownPreview: Blocked unsafe image source:', imgSrc);
        img.src =
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmNjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJsb2NrZWQgVW5zYWZlIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
        img.alt = '차단된 안전하지 않은 이미지';
        return;
      }

      // 이미지 로드 에러 이벤트 리스너 추가
      // - 의미: 각 이미지에 개별 에러 처리 적용
      // - 사용 이유: 일부 이미지 실패가 전체에 영향을 주지 않도록
      img.addEventListener('error', handleImageError);

      // 이미지 스타일링 적용
      // - 의미: 일관된 이미지 표시 스타일
      // - 사용 이유: 사용자 경험 향상
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.borderRadius = '4px';
      img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    });

    // 클린업: 이벤트 리스너 제거
    // - 의미: 메모리 누수 방지
    // - 사용 이유: 컴포넌트 언마운트 시 정리
    return () => {
      images.forEach((img) => {
        img.removeEventListener('error', handleImageError);
      });
    };
  }, [highlightedHTML]);

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
        (_e.target.tagName === 'INPUT' ||
          _e.target.tagName === 'BUTTON' ||
          _e.target.tagName === 'IMG')
      ) {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'MarkdownPreview: Ignored mouse down on input/button/image'
          );
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
          startBlock = (startNode as Element).closest(
            'p,h1,h2,h3,li,ul,ol,div'
          );
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

      {/* 미리보기 영역 - 이미지 완전 지원 */}
      {/* - 의미: ReactQuill 리치텍스트의 모든 요소 렌더링 */}
      {/* - 사용 이유: 이미지, 스타일, 포맷팅 완전 표시 */}
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
          // 이미지와 텍스트의 조화로운 배치
          lineHeight: '1.6',
        }}
        onMouseDown={!isMobile ? handleStart : undefined}
        onMouseUp={!isMobile ? handleEnd : undefined}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        dangerouslySetInnerHTML={{ __html: highlightedHTML || '' }}
        aria-live="polite" // 웹 접근성: 콘텐츠 변경 알림
      />

      {/* 이미지 통계 정보 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' &&
        highlightedHTML.includes('<img') && (
          <div className="p-2 mt-2 border border-blue-200 rounded bg-blue-50">
            <p className="text-xs text-blue-700">
              🖼️ 이미지 {(highlightedHTML.match(/<img/g) || []).length}개가
              포함되어 있습니다.
            </p>
          </div>
        )}

      {/* 보안 경고 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 mt-2 border border-green-200 rounded bg-green-50">
          <p className="text-xs text-green-700">
            🔒 DOMPurify로 보안 처리된 HTML이 렌더링되고 있습니다.
          </p>
        </div>
      )}

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
