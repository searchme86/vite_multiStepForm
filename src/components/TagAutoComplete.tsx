import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormItem, FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';
import { Input } from './ui/input';
import { Button } from './ui/button';

// 인터페이스: 컴포넌트 props 정의
// - 타입: {}
// - 의미: 현재 props 없음, 필요 시 추가 가능
// - 사용 이유: 타입 안정성과 확장성을 위해
interface TagAutoCompleteProps {}

// 상수: 더미 태그 목록
// - 의미: 자동 완성 추천 태그 제공
// - 사용 이유: 테스트 및 초기 구현용
// - Fallback: 빈 배열
const suggestedTags = ['react', 'typescript', 'javascript', 'css', 'html'];

// 함수: 태그 자동 완성 컴포넌트
// - 의미: 태그 입력과 추천 UI 렌더링
// - 사용 이유: 본문 작성 탭에서 태그 입력 최적화
function TagAutoComplete() {
  // 폼 컨텍스트
  // - 의미: 폼 데이터 접근 및 수정
  // - 사용 이유: 태그 배열 관리 및 상태 업데이트
  // - Fallback: 컨텍스트 없으면 오류 메시지
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      // 오류 메시지
      // - 의미: 폼 컨텍스트 오류 표시
      // - 사용 이유: 사용자에게 문제 알림
      <div className="text-red-500">오류: 폼 컨텍스트를 찾을 수 없습니다.</div>
    );
  }
  const { setValue, watch } = formContext;

  // 상태: 임시 입력값
  // - 의미: 사용자가 입력 중인 태그 문자열
  // - 사용 이유: 다중 태그 입력과 실시간 추천 생성
  // - Fallback: 빈 문자열
  const [inputValue, setInputValue] = React.useState('');

  // 값: 현재 태그 배열
  // - 의미: 폼의 태그 목록
  // - 사용 이유: 중복 태그 방지
  // - Fallback: 빈 배열
  const tags = watch('tags') || [];

  // 값: 입력값 분리
  // - 의미: 쉼표로 구분된 태그를 분리
  // - 사용 이유: 마지막 태그로 제안 생성, 이전 태그는 커밋된 상태로 표시
  const parts = inputValue.split(',').map((part) => part.trim());
  const committedParts = parts.slice(0, -1).filter((part) => part !== '');
  const current = parts[parts.length - 1] || '';
  const committed =
    committedParts.join(', ') + (committedParts.length > 0 ? ', ' : '');

  // 값: 현재 태그 정제
  // - 의미: 현재 태그에서 '#' 제거 및 소문자 변환
  // - 사용 이유: 대소문자 구분 없이 제안 매칭
  const cleanCurrent = current.replace('#', '').toLowerCase().trim();

  // 값: 매칭된 태그 목록
  // - 의미: 현재 태그로 시작하는 태그 필터링
  // - 사용 이유: 제안 태그 생성
  const matchingTags = suggestedTags.filter((tag) =>
    tag.toLowerCase().startsWith(cleanCurrent)
  );

  // 값: 제안 태그
  // - 의미: 첫 번째 매칭 태그를 '#태그' 형식으로 제공
  // - 사용 이유: 사용자에게 단일 제안 제공
  // - Fallback: null
  const suggestion = matchingTags.length > 0 ? `#${matchingTags[0]}` : null;

  // 함수: 태그 추가
  // - 의미: 입력값을 태그로 변환하여 폼에 추가
  // - 사용 이유: 다중 태그를 한 번에 추가하여 상태 덮어쓰기 방지
  const addTagsFromInput = () => {
    // 현재 태그 가져오기
    // - 의미: 폼의 현재 태그 목록
    // - 사용 이유: 중복 태그 필터링
    const currentTags = watch('tags') || [];
    // 새 태그 생성
    // - 의미: 입력값을 쉼표로 분리, 정제, '#' 추가
    // - 사용 이유: 유효한 태그만 추가
    const newTags = inputValue
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '')
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => !currentTags.includes(t));
    // 폼 상태 업데이트
    // - 의미: 기존 태그와 새 태그를 병합
    // - 사용 이유: 단일 setValue 호출로 상태 덮어쓰기 방지
    setValue('tags', [...currentTags, ...newTags], { shouldValidate: true });
    // 입력 초기화
    // - 의미: 다음 입력 준비
    // - 사용 이유: 입력 필드 비우기
    setInputValue('');
  };

  // 핸들러: 입력 변경
  // - 의미: 입력값을 상태에 저장
  // - 사용 이유: 자유로운 다중 태그 입력 허용
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 입력값 업데이트
    // - 의미: 사용자 입력을 상태에 반영
    // - 사용 이유1: 입력값을 상태에 반영
    // - 사용 이유: 실시간 입력 처리
    setInputValue(e.target.value);
  };

  // 핸들러: 키보드 입력
  // - 의미: Tab 키로 제안 완성, Enter 키로 다중 태그 추가
  // - 사용 이유: 키보드 친화적 UX 제공
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab 키 처리
    // - 의미: 제안이 있으면 현재 태그를 제안으로 완성
    // - 사용 이유: 빠른 제안 선택 지원
    if (e.key === 'Tab' && suggestion) {
      setInputValue(committed + suggestion);
      // 기본 동작 방지
      // - 의미: 포커스 이동 방지
      // - 사용 이유: 입력 필드에 포커스 유지
      e.preventDefault();
    }
    // Enter 키 처리
    // - 의미: 입력된 모든 태그를 추가
    // - 사용 이유: 다중 태그를 한 번에 처리
    else if (e.key === 'Enter') {
      // 기본 동작 방지
      // - 의미: 폼 제출 방지
      // - 사용 이유: 태그 추가에 집중
      e.preventDefault();
      addTagsFromInput();
    }
  };

  return (
    // 컨테이너: 태그 입력 및 추천
    // - 의미: 입력 필드와 추천 UI 배치
    // - 사용 이유: Tailwind로 간단한 레이아웃 구성
    <FormItem>
      {/* 라벨: 태그 입력 안내 */}
      {/* - 의미: 입력 필드의 목적 표시 */}
      {/* - 사용 이유: 웹 접근성 준수 */}
      <label className="text-sm font-medium" htmlFor="tag-input">
        태그
      </label>
      {/* 입력 컨테이너 */}
      {/* - 의미: 입력 필드와 제안 UI를 겹쳐 표시 */}
      {/* - 사용 이유: 상대적 위치로 제안 표시 */}
      <div className="relative px-3 py-2 bg-white border rounded">
        {/* 제안 표시 */}
        {/* - 의미: 제안 태그를 입력값과 나머지로 분리 표시 */}
        {/* - 사용 이유: 시각적 구분으로 UX 개선 */}
        {suggestion && (
          <span className="absolute inset-0 flex items-center pointer-events-none">
            {/* 커밋된 태그 및 현재 태그 표시 */}
            {/* - 의미: 입력된 태그와 현재 태그 표시 */}
            {/* - 사용 이유: 사용자 입력과 제안을 구분 */}
            <span>
              {committed}
              {current}
            </span>
            {/* 제안 나머지 표시 */}
            {/* - 의미: 제안의 나머지 부분 회색 표시 */}
            {/* - 사용 이유: 제안 부분 시각적 강조 */}
            <span className="text-gray-400">
              {current.startsWith('#')
                ? suggestion.slice(current.length)
                : suggestion.slice(1 + current.length)}
            </span>
          </span>
        )}
        {/* 입력 필드 */}
        {/* - 의미: 태그 입력 UI */}
        {/* - 사용 이유: 사용자 입력 수집 */}
        <Input
          id="tag-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-transparent outline-none"
          // 스타일: 제안 시 투명, 없으면 기본 색상
          // - 의미: 제안 표시 시 입력값 숨김
          // - 사용 이유: 제안 UI와 겹침 방지
          style={{ color: suggestion ? 'transparent' : 'inherit' }}
          placeholder="#태그를 입력하세요"
          aria-label="태그 입력"
          // 웹 접근성: 자동 완성 상태 알림
          // - 의미: 화면 판독기에 상태 전달
          // - 사용 이유: 접근성 준수
          aria-autocomplete="inline"
          aria-describedby={suggestion ? 'tag-suggestion' : undefined}
        />
        {/* 제안 설명: 화면 판독기용 */}
        {/* - 의미: 제안 존재 시 설명 제공 */}
        {/* - 사용 이유: 접근성 향상 */}
        {suggestion && (
          <span id="tag-suggestion" className="sr-only">
            제안: {suggestion}
          </span>
        )}
      </div>
      {/* 추가 버튼 */}
      {/* - 의미: 입력된 태그를 추가 */}
      {/* - 사용 이유: 버튼 클릭으로 태그 추가 지원 */}
      <Button
        type="button"
        onClick={addTagsFromInput}
        aria-label="태그 추가"
        className="mt-2"
      >
        추가
      </Button>
      <FormMessage />
    </FormItem>
  );
}

export default TagAutoComplete;
