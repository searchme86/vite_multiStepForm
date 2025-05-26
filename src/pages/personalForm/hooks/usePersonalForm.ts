import { useCallback } from 'react';
import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';

// 코드의 의미: 개인 정보 폼 상태와 로직을 관리하는 커스텀 훅
// 왜 사용했는지: 개인 정보 입력 관련 상태와 로직을 캡슐화
export const usePersonalForm = () => {
  // 코드의 의미: react-hook-form의 컨텍스트 훅 사용
  // 왜 사용했는지: 폼 상태와 메서드를 외부 훅에서 가져옴
  const { control, setValue, getValues } =
    useFormContextWrapper<FormSchemaType>();

  // 코드의 의미: 이름 필드 초기화 핸들러
  // 왜 사용했는지: 이름 필드 초기화 로직 제공
  const resetNameFields = useCallback(() => {
    setValue('firstName', '');
    setValue('lastName', '');
  }, [setValue]);

  // 코드의 의미: 전화번호 필드 초기화 핸들러
  // 왜 사용했는지: 전화번호 필드 초기화 로직 제공
  const resetPhoneField = useCallback(() => {
    setValue('phone', '');
  }, [setValue]);

  return { control, getValues, resetNameFields, resetPhoneField };
};
