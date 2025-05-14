// TagAutoComplete.tsx: 태그 입력 시 자동완성 기능을 제공하는 컴포넌트
// - 의미: 사용자가 태그 입력 시 추천 태그 제공 및 자동 # 추가
// - 사용 이유: 태그 입력 UX 개선, 입력 오류 감소
// - 비유: 친구가 단어를 말하면 비슷한 단어를 추천해주는 메모 앱
// - 작동 메커니즘:
//   1. 입력값에 따라 더미 태그 필터링
//   2. #을 입력값에 자동 추가
//   3. 추천 태그 클릭 시 폼 상태에 추가
//   4. react-hook-form으로 태그 배열 관리
// - 관련 키워드: react-hook-form, shadcn/ui, Input, autocomplete

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { FormItem, FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';

// 인터페이스: 컴포넌트 props
// - 타입: { onAddTag: Function }
// - 의미: 태그 추가 콜백 함수 전달
interface TagAutoCompleteProps {
  onAddTag: (tag: string) => void;
}

// 상수: 더미 태그 목록
// - 의미: 자동완성 추천 태그
// - 사용 이유: 테스트 및 초기 구현용
// - Fallback: 빈 배열
const suggestedTags = ['react', 'typescript', 'javascript', 'css', 'html'];

// 함수: 태그 자동완성 컴포넌트
// - 의미: 태그 입력과 추천 UI 렌더링
// - 사용 이유: 본문 작성 탭에서 태그 입력 최적화
function TagAutoComplete({ onAddTag }: TagAutoCompleteProps) {
  // 폼 컨텍스트
  // - 의미: 폼 데이터 접근
  // - 사용 이유: 태그 배열 관리
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
  const { watch } = formContext;

  // 상태: 임시 입력값
  // - 의미: 사용자가 입력 중인 태그
  // - 사용 이유: 실시간 추천 생성
  // - Fallback: 빈 문자열
  const [inputValue, setInputValue] = React.useState('');

  // 값: 현재 태그 배열
  // - 의미: 폼의 태그 목록
  // - 사용 이유: 중복 태그 방지
  // - Fallback: 빈 배열
  const tags = watch('tags') || [];

  // 값: 필터링된 추천 태그
  // - 의미: 입력값 기반 추천 목록
  // - 사용 이유: 사용자 입력과 일치하는 태그 표시
  // - Fallback: 전체 태그 목록
  const filteredSuggestions = inputValue
    ? suggestedTags.filter((tag) =>
        tag.toLowerCase().includes(inputValue.replace('#', '').toLowerCase())
      )
    : suggestedTags;

  // 핸들러: 입력 변경
  // - 의미: 입력값 업데이트 및 # 처리
  // - 사용 이유: 사용자 입력 반영
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 입력값
    // - 의미: 사용자 입력 추출
    // - 사용 이유: 추천 목록 갱신
    const value = e.target.value;
    // # 처리
    // - 의미: 입력값에 # 추가
    // - 사용 이유: 태그 형식 표준화
    const formattedValue = value.startsWith('#') ? value : `#${value}`;
    setInputValue(formattedValue);
  };

  // 핸들러: 태그 추가
  // - 의미: 입력 또는 추천 태그를 폼에 추가
  // - 사용 이유: 사용자 선택 반영
  const handleAddTag = (tag: string = inputValue) => {
    // 유효성 검사
    // - 의미: 빈 태그 또는 중복 태그 방지
    // - 사용 이유: 데이터 무결성 유지
    const cleanedTag = tag.replace('#', '').trim();
    if (!cleanedTag || tags.includes(`#${cleanedTag}`)) return;
    // 태그 추가
    // - 의미: 폼 상태에 태그 추가
    // - 사용 이유: 사용자 입력 저장
    onAddTag(`#${cleanedTag}`);
    // 입력 초기화
    // - 의미: 다음 입력 준비
    // - 사용 이유: 입력 필드 비우기
    setInputValue('');
  };

  // 핸들러: 키보드 입력
  // - 의미: Enter 키로 태그 추가
  // - 사용 이유: 키보드 친화적 UX
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    // 컨테이너: 태그 입력 및 추천
    // - 의미: 입력 필드와 추천 목록 배치
    // - 사용 이유: flex로 간단한 레이아웃
    <FormItem>
      <label className="text-sm font-medium">태그</label>
      <div className="flex w-full gap-2">
        {/* 입력 필드 */}
        {/* - 의미: 태그 입력 UI */}
        {/* - 사용 이유: 사용자 입력 수집 */}
        <Input
          placeholder="#태그를 입력하세요"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          aria-label="태그 입력"
          className="flex-1"
        />
        <Button
          type="button"
          onClick={() => handleAddTag()}
          aria-label="태그 추가"
        >
          추가
        </Button>
      </div>
      {/* 추천 목록 */}
      {/* - 의미: 추천 태그 표시 */}
      {/* - 사용 이유: 사용자 선택 용이 */}
      {filteredSuggestions.length > 0 && (
        <ul className="mt-2 border rounded-md bg-white max-h-[150px] overflow-y-auto">
          {filteredSuggestions.map((tag) => (
            <li
              key={tag}
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleAddTag(`#${tag}`)}
            >
              <span className="text-gray-800">#{tag}</span>
            </li>
          ))}
        </ul>
      )}
      <FormMessage />
    </FormItem>
  );
}

export default TagAutoComplete;
