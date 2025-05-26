//====여기부터 수정됨====
// 코드의 의미: 폼 컨트롤 훅
// 왜 사용했는지: 폼 필드의 제어 로직을 캡슐화
// 수정 이유: 사용되지 않는 임포트(UseFormReturn, useFormContext) 제거, ESLint 및 TypeScript 에러 해결
import type { FormSchemaType } from '@/schema/FormSchema';
import { useFormContextWrapper } from './useFormContextWrapper';

// 코드의 의미: 폼 컨트롤 훅 정의
// 왜 사용했는지: 폼 필드 제어 로직을 캡슐화하여 재사용성 제공
// 실행 매커니즘: useFormContextWrapper를 통해 타입 안전한 폼 컨텍스트 가져옴
export const useFormControls = () => {
  // 코드의 의미: 폼 컨텍스트에서 제어 함수 가져오기
  // 왜 사용했는지: control, setValue, getValues로 폼 필드 관리
  // 실행 매커니즘: useFormContextWrapper가 FormProvider 내 컨텍스트 제공
  const { control, setValue, getValues } =
    useFormContextWrapper<FormSchemaType>();

  // 코드의 의미: 단일 필드 초기화 함수
  // 왜 사용했는지: 특정 필드 값을 현재 값으로 리셋
  // 실행 매커니즘: setValue로 필드 값을 getValues로 가져온 값으로 설정
  const resetField = (field: keyof FormSchemaType) => {
    setValue(field, getValues(field) as never);
  };

  // 코드의 의미: 모든 필드 초기화 함수
  // 왜 사용했는지: 전체 폼 필드를 현재 값으로 리셋
  // 실행 매커니즘: getValues의 모든 키를 순회하며 resetField 호출
  const resetAllFields = () => {
    Object.keys(getValues()).forEach((key) => {
      resetField(key as keyof FormSchemaType);
    });
  };

  // 코드의 의미: 훅 반환 객체
  // 왜 사용했는지: 컴포넌트에서 사용할 제어 함수 제공
  return { control, setValue, getValues, resetField, resetAllFields };
};
//====여기까지 수정됨====
