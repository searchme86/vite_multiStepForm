// MarkdownPreview.tsx: ReactQuill HTML 기반 마크다운 미리보기 및 검색어 강조 컴포넌트
// - 의미: ReactQuill의 HTML 출력 렌더링, 검색어 강조, 위치 이동 제공
// - 사용 이유: 작성 내용 실시간 확인 및 특정 텍스트 검색
// - 비유: ReactQuill 잉크로 쓰인 책에서 단어를 형광펜으로 칠하고 페이지 넘기기
// - 작동 메커니즘:
//   1. react-hook-form에서 마크다운(HTML)과 검색어 가져오기
//   2. HTML 텍스트 노드 순회하여 검색어에 <mark> 태그 추가
//   3. 버튼과 키보드 입력으로 검색어 간 이동
//   4. 현재 검색어 위치 표시 및 파란색 강조
//   5. flex 레이아웃으로 반응형 UI
// - 관련 키워드: react-hook-form, react-quill, dangerouslySetInnerHTML, sanitize-html
// - 추천 키워드: DOMParser, scrollIntoView, regex

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { BlogPostFormData } from '../types/blog-post';
import sanitizeHtml from 'sanitize-html';
import './styles.css'; // 스타일 임포트

// 함수: HTML에서 검색어 강조
// - 타입: (html: string, searchTerm: string) => string
// - 의미: HTML 문자열에서 검색어를 <mark>로 감싸기
// - 사용 이유: ReactQuill의 HTML 출력에서 텍스트 매칭
// - Fallback: 원본 HTML 반환
const highlightSearchTerm = (html: string, searchTerm: string): string => {
  // 검색어 없음
  // - 의미: 검색어가 비어 있으면 원본 반환
  // - 사용 이유: 불필요한 처리 방지
  if (!searchTerm.trim()) {
    return html;
  }

  // 정규식
  // - 의미: 검색어를 안전하게 매칭
  // - 사용 이유: XSS 방지 및 정확한 매칭
  const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearch})`, 'gi');

  // DOM 파서
  // - 의미: HTML 문자열을 DOM으로 변환
  // - 사용 이유: 텍스트 노드만 처리
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '<p></p>', 'text/html');

  // 텍스트 노드 순회
  // - 의미: 모든 텍스트 노드에서 검색어 매칭
  // - 사용 이유: HTML 구조 유지
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  // 검색어 강조
  // - 의미: 텍스트 노드에서 검색어를 <mark>로 감싸기
  // - 사용 이유: 시각적 강조
  textNodes.forEach((textNode) => {
    const text = textNode.textContent || '';
    if (regex.test(text)) {
      const span = doc.createElement('span');
      span.innerHTML = text.replace(
        regex,
        '<mark class="search-highlight">$1</mark>'
      );
      textNode.parentNode?.replaceChild(span, textNode);
    }
  });

  // Sanitization
  // - 의미: 안전한 HTML 반환
  // - 사용 이유: XSS 방지
  const sanitized = sanitizeHtml(doc.body.innerHTML, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['mark']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      mark: ['class'],
    },
  });

  console.log('highlightedHTML:', sanitized);
  return sanitized;
};

// 함수: 미리보기 컴포넌트
// - 의미: ReactQuill HTML 렌더링 및 검색 UI
// - 사용 이유: 독립된 미리보기 기능 제공
function MarkdownPreview() {
  // 폼 컨텍스트
  // - 의미: 폼 데이터 및 유효성 검사 관리
  // - 사용 이유: react-hook-form으로 선언적 폼 관리
  // - Fallback: 컨텍스트 없으면 대체 UI 렌더링
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext || !formContext.control) {
    // 대체 UI
    // - 의미: 폼 컨텍스트 누락 시 사용자 알림
    // - 사용 이유: 앱 크래시 방지
    return (
      <div
        className="flex flex-col items-center justify-center p-4 text-red-500"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <h2 className="text-lg font-medium">폼 컨텍스트 오류</h2>
        <p className="text-sm">
          미리보기를 로드할 수 없습니다. 다시 시도해주세요.
        </p>
      </div>
    );
  }
  const { control, watch } = formContext;

  // 값: 마크다운 콘텐츠
  // - 의미: 폼의 마크다운(HTML) 필드 값 추적
  // - 사용 이유: 미리보기 렌더링
  // - Fallback: 빈 문자열
  const markdown = watch('markdown') || '';
  const searchTerm = watch('searchTerm') || '';

  // 상태: 검색 매칭 요소
  // - 의미: 검색어에 매칭된 DOM 요소 목록
  // - 사용 이유: 위치 이동 및 강조
  // - Fallback: 빈 배열
  const [matches, setMatches] = React.useState<Element[]>([]);

  // 상태: 현재 매칭 인덱스
  // - 의미: 현재 포커스된 검색어 위치
  // - 사용 이유: 순서 표시 및 색상 변경
  // - Fallback: -1 (단일 또는 없음)
  const [currentMatchIndex, setCurrentMatchIndex] = React.useState(-1);

  // 참조: 미리보기 컨테이너
  // - 의미: 마크다운 렌더링 DOM 참조
  // - 사용 이유: 검색어 요소 쿼리 및 스크롤
  const previewRef = React.useRef<HTMLDivElement>(null);

  // 디버깅: 검색어와 마크다운 값 확인
  // - 의미: 입력값 추적
  // - 사용 이유: 문제 원인 파악
  React.useEffect(() => {
    console.log('searchTerm:', searchTerm);
    console.log('markdown:', markdown);
  }, [searchTerm, markdown]);

  // 메모: 강조된 HTML
  // - 의미: 검색어 기반 HTML에 마크업 추가
  // - 사용 이유: 성능 최적화
  const highlightedHTML = React.useMemo(() => {
    return highlightSearchTerm(markdown, searchTerm);
  }, [markdown, searchTerm]);

  // 효과: 검색 매칭 업데이트
  // - 의미: HTML 변경 시 매칭 요소 갱신
  // - 사용 이유: 검색어 위치 동적 관리
  React.useEffect(() => {
    if (!previewRef.current) return;
    // DOM 렌더링 후 매칭 요소 수집
    // - 의미: DOM 업데이트 후 쿼리 실행
    // - 사용 이유: 타이밍 문제 해결
    const timer = setTimeout(() => {
      const elements = Array.from(
        previewRef.current!.querySelectorAll('.search-highlight')
      );
      console.log('matches:', elements);
      setMatches(elements);
      setCurrentMatchIndex(elements.length > 1 ? 0 : -1);
    }, 0); // 다음 렌더링 사이클
    return () => clearTimeout(timer);
  }, [highlightedHTML]);

  // 효과: 매칭 위치 강조 및 스크롤
  // - 의미: 현재 검색어로 스크롤, 색상 변경
  // - 사용 이유: 사용자에게 현재 위치 피드백
  React.useEffect(() => {
    if (matches.length <= 1 || currentMatchIndex === -1) return;
    const current = matches[currentMatchIndex];
    current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // 색상 변경
    // - 의미: 현재 매칭은 파란색, 나머지는 노란색
    // - 사용 이유: 시각적 구분
    matches.forEach((el, i) => {
      el.classList.toggle('bg-blue-200', i === currentMatchIndex);
      el.classList.toggle('bg-yellow-200', i !== currentMatchIndex);
    });
    console.log(
      'currentMatchIndex:',
      currentMatchIndex,
      'matches:',
      matches.length
    );
  }, [currentMatchIndex, matches]);

  // 핸들러: 키보드 입력 처리
  // - 의미: Enter, Shift+Enter로 검색어 이동
  // - 사용 이유: 키보드 접근성 제공
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (matches.length <= 1) return;
    if (e.key === 'Enter' && e.shiftKey) {
      // 이전
      // - 의미: 이전 매칭으로 이동
      // - 사용 이유: 순환 탐색 지원
      setCurrentMatchIndex(
        (prev) => (prev - 1 + matches.length) % matches.length
      );
    } else if (e.key === 'Enter') {
      // 다음
      // - 의미: 다음 매칭으로 이동
      // - 사용 이유: 순환 탐색 지원
      setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
    }
  };

  // 핸들러: 이전 버튼
  // - 의미: 이전 검색어로 이동
  // - 사용 이유: 버튼 접근성 제공
  const goToPrevious = () => {
    setCurrentMatchIndex(
      (prev) => (prev - 1 + matches.length) % matches.length
    );
  };

  // 핸들러: 다음 버튼
  // - 의미: 다음 검색어로 이동
  // - 사용 이유: 버튼 접근성 제공
  const goToNext = () => {
    setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
  };

  return (
    // 컨테이너: 미리보기 영역
    // - 의미: 검색과 HTML 렌더링 배치
    // - 사용 이유: flex로 반응형 UI
    <div
      className="flex-1"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
    >
      {/* 라벨 */}
      {/* - 의미: 미리보기 섹션 설명 */}
      {/* - 사용 이유: 사용자 지침 제공 */}
      <label className="text-sm font-medium">미리보기</label>
      {/* 검색 입력 */}
      {/* - 의미: 검색어 입력 UI */}
      {/* - 사용 이유: 텍스트 강조 및 이동 */}
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
      {/* 검색어 컨트롤 */}
      {/* - 의미: 다중 검색어 시 이동 및 카운트 UI */}
      {/* - 사용 이유: 사용자 피드백 및 탐색 지원 */}
      {matches.length > 1 && (
        <div className="flex items-center gap-2 mb-2 text-sm">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrevious}
            aria-label="이전 검색어"
          >
            이전
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={goToNext}
            aria-label="다음 검색어"
          >
            다음
          </Button>
          <span>
            {currentMatchIndex + 1} / {matches.length}
          </span>
        </div>
      )}
      {/* 미리보기 */}
      {/* - 의미: ReactQuill HTML 렌더링 */}
      {/* - 사용 이유: 실시간 콘텐츠 확인 */}
      <div
        ref={previewRef}
        className="border rounded-md p-4 bg-gray-50 min-h-[300px] overflow-auto prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: highlightedHTML || '' }}
      />
    </div>
  );
}

export default MarkdownPreview;
