import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useStepFieldsStateStore } from '../../../../stores/multiStepFormState/stepFieldsState/StepFieldsStateStore';
import type { blogPostSchemaType } from '../../schema/blogPostSchema';

// 훅: 태그 관리 로직 (5개 초과 에러 처리 추가)
// - 의미: blogPostSchemaType의 tags 필드를 관리하는 커스텀 훅
// - 사용 이유: 상태 관리와 비즈니스 로직을 컴포넌트에서 분리
export function useTagManagement() {
  // React Hook Form 컨텍스트 (blogPostSchemaType 기반)
  // - 의미: blogPostSchemaType을 타입으로 하는 폼 상태에 접근
  // - 사용 이유: 타입 안전한 폼 검증과 제출 시 태그 데이터 포함
  const formContext = useFormContext<blogPostSchemaType>();

  // 폼 컨텍스트가 없는 경우 에러 방지
  // - 의미: 안전한 폴백 제공
  // - 사용 이유: 런타임 에러 방지
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

  // React Hook Form에서 현재 태그 값 가져오기
  // - 의미: blogPostSchemaType의 tags 필드 값 실시간 감시
  // - 사용 이유: 폼 상태 변경에 따른 UI 업데이트
  const currentTags = watch('tags') || [];

  // Zustand 스토어 setter만 가져오기
  // - 의미: 전역 상태 업데이트 함수만 필요
  // - 사용 이유: React Hook Form이 주 상태이므로 Zustand는 동기화용으로만 사용
  const setZustandTags = useStepFieldsStateStore((state) => state.setTags);

  // 함수: 태그 추가 처리 (5개 초과 에러 처리 개선)
  // - 의미: 새로운 태그들을 React Hook Form과 Zustand 모두에 추가
  // - 사용 이유: 동기화된 태그 추가 보장 및 에러 처리
  const handleAddTags = useCallback(
    (newTags: string[]) => {
      // 유효한 새 태그만 필터링
      // - 의미: 빈 문자열이나 공백만 있는 태그 제거
      // - 사용 이유: 의미없는 태그 추가 방지
      const validNewTags = newTags.filter((tag) => tag.trim() !== '');

      if (validNewTags.length === 0) {
        return;
      }

      // 중복되지 않는 태그만 추가
      // - 의미: 이미 존재하는 태그는 제외하고 새로운 태그만 추가
      // - 사용 이유: 태그 중복 방지 및 깔끔한 목록 유지
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

      // 최종 태그 목록 계산
      // - 의미: 기존 태그 + 새 태그 = 최종 목록
      // - 사용 이유: 완전한 태그 목록 생성
      const finalTags = [...currentTags, ...uniqueNewTags];

      // blogContentPathSchema의 태그 검증 (최대 5개) 확인
      // - 의미: Zod 스키마의 max(5) 제약 확인 및 React Hook Form 에러 설정
      // - 사용 이유: 스키마 검증 규칙 준수 및 사용자 피드백
      if (finalTags.length > 5) {
        // React Hook Form에 에러 설정
        // - 의미: 폼 필드에 직접 에러 메시지 설정
        // - 사용 이유: 사용자가 UI에서 에러 메시지를 볼 수 있도록 함
        setError('tags', {
          type: 'max',
          message: '태그는 최대 5개까지만 추가할 수 있습니다.',
        });

        console.warn(
          '[useTagManagement] 태그는 최대 5개까지만 추가할 수 있습니다.'
        );
        return;
      }

      // 5개 이하일 때는 에러 제거
      // - 의미: 정상 범위 내에서는 에러 상태 제거
      // - 사용 이유: 이전 에러 메시지 제거
      clearErrors('tags');

      // React Hook Form 값 설정
      // - 의미: setValue로 blogPostSchemaType의 tags 필드 업데이트
      // - 사용 이유: 폼 검증 트리거 및 정확한 상태 반영
      setValue('tags', finalTags, { shouldValidate: true });

      // Zustand 상태 업데이트
      // - 의미: 전역 상태에 새 태그 목록 저장
      // - 사용 이유: 다른 컴포넌트와 상태 공유
      setZustandTags(finalTags);

      console.log('[useTagManagement] 태그 추가 완료:', {
        추가된태그: uniqueNewTags,
        최종태그: finalTags,
      });
    },
    [currentTags, setValue, setZustandTags, setError, clearErrors]
  );

  // 함수: 태그 삭제 처리
  // - 의미: 지정된 태그를 React Hook Form과 Zustand 모두에서 제거
  // - 사용 이유: 동기화된 태그 삭제 보장
  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      // 새로운 태그 목록 생성
      // - 의미: 삭제할 태그를 제외한 나머지 태그들
      // - 사용 이유: 업데이트할 상태 데이터 준비
      const updatedTags = currentTags.filter((tag) => tag !== tagToRemove);

      // 태그 삭제 시 5개 초과 에러 제거
      // - 의미: 태그가 줄어들면 5개 초과 에러 자동 제거
      // - 사용 이유: 태그 삭제로 정상 범위가 되면 에러 해제
      if (updatedTags.length <= 5) {
        clearErrors('tags');
      }

      // React Hook Form 값 설정
      // - 의미: setValue로 blogPostSchemaType의 tags 필드 업데이트
      // - 사용 이유: 폼 검증 트리거 및 정확한 상태 반영
      setValue('tags', updatedTags, { shouldValidate: true });

      // Zustand 상태 업데이트
      // - 의미: 전역 상태에 업데이트된 태그 목록 저장
      // - 사용 이유: 다른 컴포넌트와 상태 공유
      setZustandTags(updatedTags);

      console.log('[useTagManagement] 태그 삭제 완료:', {
        삭제된태그: tagToRemove,
        최종태그: updatedTags,
      });
    },
    [currentTags, setValue, setZustandTags, clearErrors]
  );

  // 훅 반환값
  // - 의미: 컴포넌트에서 사용할 상태와 함수들을 객체로 반환
  // - 사용 이유: 동기화된 태그 상태와 관리 함수 제공
  return {
    tags: currentTags, // React Hook Form의 현재 태그 사용 (blogPostSchemaType 기반)
    handleAddTags,
    handleRemoveTag,
    // 태그 검증 에러 정보도 함께 제공
    // - 의미: Zod 스키마 검증 결과 + 수동 설정 에러
    // - 사용 이유: UI에서 에러 메시지 표시 가능
    tagError: errors.tags?.message || null,
  };
}
