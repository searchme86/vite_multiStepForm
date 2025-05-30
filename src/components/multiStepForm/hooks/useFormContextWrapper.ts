import type { UseFormReturn } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import type { FormSchemaType } from '../../../schema/FormSchema';

// 코드의 의미: 폼 컨텍스트 래퍼 훅
// 왜 사용했는지: react-hook-form의 FormProvider 컨텍스트를 타입 안전하게 사용
export const useFormContextWrapper = <
  T extends FormSchemaType
>(): UseFormReturn<T> => {
  // 코드의 의미: 컨텍스트 가져오기
  // 왜 사용했는지: FormProvider 내에서만 사용 보장
  const context = useFormContext<T>();
  if (!context) {
    throw new Error('useFormContextWrapper must be used within a FormProvider');
  }
  return context;
};
