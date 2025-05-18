//====여기부터 수정됨====
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormItem, FormMessage } from './ui/form';
import { BlogPostFormData } from '../types/blog-post';

interface TagAutoCompleteProps {
  onAddTag: (tag: string) => void;
}

const suggestedTags = ['react', 'typescript', 'javascript', 'css', 'html'];

function TagAutoComplete({ onAddTag }: TagAutoCompleteProps) {
  const formContext = useFormContext<BlogPostFormData>();
  if (!formContext) {
    return (
      <div className="text-red-500">오류: 폼 컨텍스트를 찾을 수 없습니다.</div>
    );
  }
  const { watch } = formContext;

  const [inputValue, setInputValue] = React.useState('');
  const tags = watch('tags') || [];

  // Compute matching tags: 입력값과 일치하는 태그를 찾아 첫 번째 매칭 태그를 제안
  // 왜: 사용자가 입력한 텍스트와 시작하는 태그를 제안하기 위해, 입력값을 기반으로 필터링
  const cleanedInput = inputValue.replace('#', '').toLowerCase(); // '#re'에서 're'로 변환, 소문자로 변환
  const matchingTags = suggestedTags.filter((tag) =>
    tag.toLowerCase().startsWith(cleanedInput)
  ); // 입력값으로 시작하는 태그 필터링
  const suggestion = matchingTags.length > 0 ? `#${matchingTags[0]}` : null; // 첫 번째 매칭 태그를 '#react' 형식으로 제안

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // 사용자가 입력한 값 가져오기
    const formattedValue = value.startsWith('#') ? value : `#${value}`; // 입력값에 '#' 추가, 이미 있으면 유지
    setInputValue(formattedValue); // 입력값 상태 업데이트
  };

  const handleAddTag = (tag: string) => {
    const cleanedTag = tag.replace('#', '').trim(); // '#' 제거하고 공백 제거
    if (!cleanedTag || tags.includes(`#${cleanedTag}`)) return; // 빈값이나 중복 태그 방지
    onAddTag(`#${cleanedTag}`); // 태그 추가, '#react' 형식으로
    setInputValue(''); // 입력 필드 초기화
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 기본 Enter 동작 방지
      const tagToAdd = suggestion || inputValue; // 제안 있으면 제안, 없으면 입력값 사용
      handleAddTag(tagToAdd); // 태그 추가
    }
  };

  return (
    <FormItem>
      <label className="text-sm font-medium">태그</label>
      <div className="relative px-3 py-2 bg-white border rounded">
        {/* 제안이 있을 때, 입력값과 제안된 나머지 부분을 표시 */}
        {suggestion && (
          <span className="absolute inset-0 flex items-center pointer-events-none">
            <span>{inputValue}</span>
            <span className="text-gray-400">
              {suggestion.slice(inputValue.length)}
            </span>
          </span>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="w-full h-full bg-transparent outline-none"
          style={{ color: suggestion ? 'transparent' : 'inherit' }} // 제안 있으면 투명, 없으면 기본 색상
          placeholder="#태그를 입력하세요"
          aria-label="태그 입력"
        />
      </div>
      <FormMessage />
    </FormItem>
  );
}

export default TagAutoComplete;
//====여기까지 수정됨====
