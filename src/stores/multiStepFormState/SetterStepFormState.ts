//====여기부터 수정됨====
// 코드의 의미: Zustand 스토어의 setter 함수 생성
// 왜 사용했는지: 상태 업데이트 로직을 캡슐화
// 수정 이유: tocItems 유효성 검사 에러 디버깅을 위해 입력값과 에러 로그 개선
import type {
  EachStep,
  StepFormState,
  StepFormSetters,
} from '@/components/multiStepForm/types/multiStepFormType';
import type { UseFormReturn } from 'react-hook-form';
import type { FormSchemaType } from '@/schema/FormSchema';
import type { FormPaths } from '@/stores/multiStepFormState/InitialStepFormState';

// 코드의 의미: 중첩 경로를 단일 키로 변환
// 왜 사용했는지: react-hook-form의 trigger와 호환
// 실행 매커니즘: 필드 경로를 파싱하여 최상위 키 추출
const convertFieldPathsToKeys = (
  fieldPaths: FormPaths[]
): (keyof FormSchemaType)[] => {
  return fieldPaths
    .filter((path): path is string => typeof path === 'string')
    .map((path) => path.split('.')[0] as keyof FormSchemaType)
    .filter((key, index, self) => self.indexOf(key) === index);
};

// 코드의 의미: setter 함수 생성
// 왜 사용했는지: 상태 업데이트를 안전하게 처리
// 실행 매커니즘: set 함수로 상태를 업데이트
export const createStepFormSetters = (
  set: (fn: (state: StepFormState) => StepFormState) => void,
  get: () => StepFormState,
  totalSteps: EachStep[]
): StepFormSetters => ({
  // 코드의 의미: 다음 단계 이동
  // 왜 사용했는지: 유효성 검사 후 단계 이동
  // 실행 매커니즘: 필드 유효성 검사 후 상태 업데이트
  nextStep: async (hookFormStepObj: UseFormReturn<FormSchemaType>) => {
    console.log('[SetterStepFormState] nextStep called'); // 디버깅: 함수 실행
    const currentStep = get().currentStep;
    console.log('[SetterStepFormState] currentStep:', currentStep); // 디버깅: 현재 단계
    if (!totalSteps[currentStep]) {
      console.error('[SetterStepFormState] Invalid step index:', currentStep); // 디버깅: 유효하지 않은 단계
      return;
    }
    const fields = convertFieldPathsToKeys(
      totalSteps[currentStep].fieldsOfStep
    );
    console.log('[SetterStepFormState] fields to validate:', fields); // 디버깅: 검증할 필드
    console.log(
      '[SetterStepFormState] tocItems value before trigger:',
      JSON.stringify(hookFormStepObj.getValues('tocItems'), null, 2)
    ); // 디버�ING: tocItems 입력값 (자세히 출력)
    const isAllFieldsValid = await hookFormStepObj.trigger(fields, {
      shouldFocus: true,
    });
    console.log('[SetterStepFormState] isAllFieldsValid:', isAllFieldsValid); // 디버깅: 유효성 검사 결과
    console.log(
      '[SetterStepFormState] form errors after trigger:',
      JSON.stringify(hookFormStepObj.formState.errors, null, 2)
    ); // 디버깅: trigger 후 에러 상태 (자세히 출력)
    console.log(
      '[SetterStepFormState] tocItems field state:',
      hookFormStepObj.getFieldState('tocItems')
    ); // 디버깅: tocItems 필드 상태
    if (!isAllFieldsValid) {
      console.error('[SetterStepFormState] Validation failed'); // 디버깅: 검증 실패
      throw new Error('Validation failed for fields: ' + fields.join(', ')); // 에러 throw로 상위 catch 블록에서 처리
    }
    if (get().isCurrentStepFinal) {
      console.log('[SetterStepFormState] Already at final step'); // 디버깅: 마지막 단계
      return;
    }
    set((state) => {
      const newState = {
        ...state,
        currentStep: currentStep + 1,
        previousStep: currentStep,
        stepTransitionDirection: 1,
        isNextStepExisted: currentStep + 1 < totalSteps.length - 1,
        isPrevStepExisted: true,
        isCurrentStepFinal: currentStep + 1 === totalSteps.length - 1,
      };
      console.log('[SetterStepFormState] New state:', newState); // 디버깅: 상태 업데이트
      return newState;
    });
  },
  // 코드의 의미: 이전 단계 이동
  // 왜 사용했는지: 이전 단계로 이동
  prevStep: () => {
    const currentStep = get().currentStep;
    if (currentStep === 0) return;
    set((state) => ({
      ...state,
      currentStep: currentStep - 1,
      previousStep: currentStep,
      stepTransitionDirection: -1,
      isNextStepExisted: true,
      isPrevStepExisted: currentStep - 1 > 0,
      isCurrentStepFinal: false,
    }));
  },
  // 코드의 의미: 현재 단계 설정
  // 왜 사용했는지: 특정 단계로 이동
  setCurrentStep: (index) =>
    set((state) => ({
      ...state,
      currentStep: index,
      stepTransitionDirection: index - state.previousStep,
      isNextStepExisted: index < totalSteps.length - 1,
      isPrevStepExisted: index > 0,
      isCurrentStepFinal: index === totalSteps.length - 1,
    })),
  // 코드의 의미: 이전 단계 설정
  // 왜 사용했는지: 이동 방향 계산
  setPreviousStep: (index) =>
    set((state) => ({
      ...state,
      previousStep: index,
      stepTransitionDirection: state.currentStep - index,
    })),
  // 코드의 의미: 특정 단계 이동
  // 왜 사용했는지: 헤더에서 단계 클릭 시 이동
  setStep: async (index, hookFormStepObj: UseFormReturn<FormSchemaType>) => {
    const currentStep = get().currentStep;
    if (
      index === currentStep ||
      index > currentStep + 1 ||
      !totalSteps[currentStep]
    )
      return;
    const fields = convertFieldPathsToKeys(
      totalSteps[currentStep].fieldsOfStep
    );
    const isAllFieldsValid = await hookFormStepObj.trigger(fields, {
      shouldFocus: true,
    });
    if (!isAllFieldsValid) return;
    set((state) => ({
      ...state,
      currentStep: index,
      previousStep: currentStep,
      stepTransitionDirection: index - currentStep,
      isNextStepExisted: index < totalSteps.length - 1,
      isPrevStepExisted: index > 0,
      isCurrentStepFinal: index === totalSteps.length - 1,
    }));
  },
});
//====여기까지 수정됨====
