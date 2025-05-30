import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useStepFieldsStateStore } from '../../../../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';
import type { blogPostSchemaType } from '../../schema/blogPostSchema';

export function useTagManagement() {
  const formContext = useFormContext<blogPostSchemaType>();

  if (!formContext) {
    console.warn('[useTagManagement] Form context not found');
    return {
      tags: [],
      handleAddTags: () => {},
      handleRemoveTag: () => {},
      tagError: null,
    };
  }

  const {
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = formContext;

  const currentTags = watch('tags') || [];
  const setZustandTags = useStepFieldsStateStore((state) => state.setTags);

  const handleAddTags = useCallback(
    (newTags: string[]) => {
      // ====강화된 디버깅 코드====
      console.log('🚀 [useTagManagement] handleAddTags 시작');
      console.log('📥 받은 새 태그들:', {
        원본배열: newTags,
        JSON: JSON.stringify(newTags),
        각태그분석: newTags.map((tag, i) => ({
          인덱스: i,
          값: tag,
          타입: typeof tag,
          길이: tag.length,
          문자코드: tag.split('').map((c) => c.charCodeAt(0)),
          trim후: tag.trim(),
          JSON: JSON.stringify(tag),
        })),
      });
      // ====디버깅 코드 끝====

      const validNewTags = newTags
        .filter((tag) => tag.trim() !== '')
        .map((tag) => {
          let cleaned = tag.replace(/^[#＃]+/, '');
          cleaned = cleaned.trim();
          cleaned = cleaned.replace(/\s+/g, ' ');

          // ====추가 디버깅====
          console.log(`🧹 태그 정제: "${tag}" → "${cleaned}"`);
          console.log(`📊 정제된 태그 분석:`, {
            원본: tag,
            정제후: cleaned,
            정제후길이: cleaned.length,
            정제후문자코드: cleaned
              .split('')
              .map((c) => `${c}(${c.charCodeAt(0)})`),
            정규식테스트: /^[a-zA-Z0-9가-힣\s_-]+$/.test(cleaned),
          });
          // ====추가 디버깅 끝====

          return cleaned;
        })
        .filter((tag) => tag !== '');

      console.log('✅ 정제된 유효 태그들:', validNewTags);
      console.log('📋 현재 태그들:', currentTags);

      if (validNewTags.length === 0) {
        console.log('[useTagManagement] 유효한 새 태그가 없음');
        return;
      }

      const uniqueNewTags = validNewTags.filter(
        (newTag) => !currentTags.includes(newTag)
      );

      if (uniqueNewTags.length === 0) {
        console.log(
          '[useTagManagement] 중복 태그로 추가하지 않음:',
          validNewTags
        );
        return;
      }

      const finalTags = [...currentTags, ...uniqueNewTags];

      // ====최종 태그 검증 디버깅====
      console.log('🎯 최종 태그 배열 검증:', {
        최종배열: finalTags,
        JSON: JSON.stringify(finalTags),
        개별검증: finalTags.map((tag, i) => {
          const regex = /^[a-zA-Z0-9가-힣\s_-]+$/;
          return {
            인덱스: i,
            태그: tag,
            타입: typeof tag,
            길이: tag.length,
            정규식통과: regex.test(tag),
            문자분석: tag.split('').map((c) => ({
              문자: c,
              코드: c.charCodeAt(0),
              유효: /[a-zA-Z0-9가-힣\s_-]/.test(c),
            })),
          };
        }),
      });
      // ====최종 태그 검증 디버깅 끝====

      if (finalTags.length > 5) {
        setError('tags', {
          type: 'max',
          message: '태그는 최대 5개까지만 추가할 수 있습니다.',
        });
        console.warn('[useTagManagement] 태그 개수 초과');
        return;
      }

      clearErrors('tags');

      // ====setValue 직전 디버깅====
      console.log('💾 setValue 직전 최종 확인:', {
        설정할배열: finalTags,
        shouldValidate: true,
        현재시간: new Date().toISOString(),
      });
      // ====setValue 직전 디버깅 끝====

      setValue('tags', finalTags, { shouldValidate: true });
      setZustandTags(finalTags);

      console.log('[useTagManagement] 태그 추가 완료');
    },
    [currentTags, setValue, setZustandTags, setError, clearErrors]
  );

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const pureTagToRemove = tagToRemove.startsWith('#')
        ? tagToRemove.slice(1)
        : tagToRemove;

      const updatedTags = currentTags.filter((tag) => tag !== pureTagToRemove);

      if (updatedTags.length <= 5) {
        clearErrors('tags');
      }

      setValue('tags', updatedTags, { shouldValidate: true });
      setZustandTags(updatedTags);

      console.log('[useTagManagement] 태그 삭제 완료:', {
        삭제된태그: pureTagToRemove,
        최종태그: updatedTags,
      });
    },
    [currentTags, setValue, setZustandTags, clearErrors]
  );

  const displayTags = currentTags.map((tag) => `#${tag}`);

  return {
    tags: displayTags,
    handleAddTags,
    handleRemoveTag,
    tagError: errors.tags?.message || null,
  };
}
