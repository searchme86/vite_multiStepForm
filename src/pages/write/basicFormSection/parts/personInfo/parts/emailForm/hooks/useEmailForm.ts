import { useCallback } from 'react';
import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';

// 코드의 의미: 이메일 폼 상태와 로직을 관리하는 커스텀 훅
// 왜 사용했는지: 이메일 입력 관련 상태와 로직을 캡슐화
export const useEmailForm = () => {
  // 코드의 의미: react-hook-form의 컨텍스트 훅 사용
  // 왜 사용했는지: 폼 상태와 메서드를 외부 훅에서 가져옴
  const { control, setValue, getValues } =
    useFormContextWrapper<FormSchemaType>();

  // 코드의 의미: 직접 입력과 분리 입력 필드 초기화 핸들러
  // 왜 사용했는지: 입력 방식 변경 시 다른 필드 초기화
  const handleInputModeSwitch = useCallback(
    (mode: 'full' | 'split') => {
      if (mode === 'full') {
        setValue('email.splitEmailInput', { userLocalPart: '', emailRest: '' });
      } else {
        setValue('email.fullEmailInput', '');
      }
    },
    [setValue]
  );

  return { control, getValues, handleInputModeSwitch };
};
