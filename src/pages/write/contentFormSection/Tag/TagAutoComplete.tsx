import React from 'react';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { FormItem, FormMessage } from '../../../../components/ui/form';

interface TagAutoCompleteProps {
  onAddTags: (tags: string[]) => void;
}

const suggestedTags = ['react', 'typescript', 'javascript', 'css', 'html'];

function TagAutoComplete({ onAddTags }: TagAutoCompleteProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [isComposing, setIsComposing] = React.useState(false);

  const parts = inputValue.split(',').map((part) => part.trim());
  const committedParts = parts.slice(0, -1).filter((part) => part !== '');
  const current = parts[parts.length - 1] || '';
  const committed =
    committedParts.join(', ') + (committedParts.length > 0 ? ', ' : '');

  // ====여기부터 수정됨====
  // 현재 태그에서 '#' 제거 (입력 시 #이 있어도 제거)
  const cleanCurrent = current.replace(/^#+/, '').toLowerCase().trim();
  // ====여기까지 수정됨====

  const matchingTags = suggestedTags.filter((tag) =>
    tag.toLowerCase().startsWith(cleanCurrent)
  );

  // UI 표시용 제안 (# 포함)
  const suggestion = matchingTags.length > 0 ? `#${matchingTags[0]}` : null;

  const addTagsFromInput = () => {
    if (!inputValue.trim()) {
      return;
    }

    // ====여기부터 수정됨====
    // 순수 텍스트만 추출 (# 제거)
    // 스키마 검증을 위해 # 없는 깨끗한 텍스트만 전달
    const newTags = inputValue
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '')
      .map((t) => t.replace(/^#+/, '')); // #을 제거한 순수 텍스트만
    // ====여기까지 수정됨====

    if (newTags.length > 0) {
      // 순수 텍스트 배열을 부모에게 전달
      onAddTags(newTags);
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) {
      return;
    }

    if (e.key === 'Tab' && suggestion) {
      // ====여기부터 수정됨====
      // 제안 완성 시 # 없는 텍스트로 설정
      const suggestionText = suggestion.replace(/^#+/, '');
      setInputValue(committed + suggestionText);
      // ====여기까지 수정됨====
      e.preventDefault();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      addTagsFromInput();
    }
  };

  return (
    <FormItem>
      <label className="text-sm font-medium" htmlFor="tag-input">
        태그
      </label>
      <div className="relative px-3 py-2 bg-white border rounded">
        {/* UI 표시용 제안 (# 포함) */}
        {suggestion && (
          <span className="absolute inset-0 flex items-center pointer-events-none">
            <span>
              {committed}
              {current}
            </span>
            <span className="text-gray-400">
              {/* ====여기부터 수정됨==== */}
              {/* 제안 표시 로직 수정 */}
              {current.replace(/^#+/, '') === ''
                ? suggestion
                : suggestion.slice(current.replace(/^#+/, '').length)}
              {/* ====여기까지 수정됨==== */}
            </span>
          </span>
        )}
        <Input
          id="tag-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className="w-full h-full bg-transparent outline-none"
          style={{ color: suggestion ? 'transparent' : 'inherit' }}
          placeholder="태그를 입력하세요 (예: react, javascript)"
          aria-label="태그 입력"
          aria-autocomplete="inline"
          aria-describedby={suggestion ? 'tag-suggestion' : undefined}
        />
        {suggestion && (
          <span id="tag-suggestion" className="sr-only">
            제안: {suggestion}
          </span>
        )}
      </div>
      <Button
        type="button"
        onClick={addTagsFromInput}
        aria-label="태그 추가"
        className="mt-2"
        disabled={!inputValue.trim()}
      >
        추가
      </Button>
      <FormMessage />
    </FormItem>
  );
}

export default TagAutoComplete;
