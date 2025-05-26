import type { UseFormReturn } from 'react-hook-form';
import type { FormSchemaType } from '@/schema/FormSchema';
import type {
  EachStep,
  FormControlsToolProps,
} from '@/components/multiStepForm/types/multiStepFormType';
import { useStepFormStore } from '../../../stores/multiStepFormState/StepFormStateStore';

// 코드의 의미: 커스텀 훅 정의
// 왜 사용했는지: 폼 컨트롤과 단계 이동 로직을 캡슐화
// 실행 매커니즘: Zustand 스토어에서 상태와 함수를 가져와 반환
export const useStepForm = (
  totalSteps: EachStep[],
  hookFormStepObj: UseFormReturn<FormSchemaType> | null
): FormControlsToolProps => {
  // 코드의 의미: Zustand 스토어 상태 가져오기
  // 왜 사용했는지: 단계 이동 상태와 함수를 컴포넌트에 제공
  // 실행 매커니즘: useStepFormStore 호출로 상태와 함수 추출
  const {
    currentStep,
    previousStep,
    stepTransitionDirection,
    totalCountOfSteps,
    isNextStepExisted,
    isPrevStepExisted,
    isCurrentStepFinal,
    nextStep: storeNextStep,
    prevStep: storePrevStep,
    setCurrentStep: storeSetCurrentStep,
    setPreviousStep: storeSetPreviousStep,
    setStep: storeSetStep,
  } = useStepFormStore();

  // 코드의 의미: totalSteps 유효성 검사
  // 왜 사용했는지: 유효하지 않은 steps로 인한 런타임 에러 방지
  // 실행 매커니즘: totalSteps가 없으면 기본값 반환
  if (!totalSteps || totalSteps.length === 0) {
    console.error('totalSteps is empty or undefined in useStepForm');
    return {
      currentStep: 0,
      previousStep: 0,
      stepTransitionDirection: 0,
      totalCountOfSteps: 0,
      isNextStepExisted: false,
      isPrevStepExisted: false,
      isCurrentStepFinal: false,
      nextStep: async () => {},
      prevStep: () => {},
      setCurrentStep: () => {},
      setPreviousStep: () => {},
      setStep: async () => {},
    };
  }

  // 디버깅: 스토어 상태 출력
  console.log('[useStepForm] Store state:', {
    currentStep,
    isNextStepExisted,
    isCurrentStepFinal,
    totalCountOfSteps,
  });

  // 코드의 의미: 커스텀 훅 반환 객체
  // 왜 사용했는지: 컴포넌트에서 사용할 상태와 함수 통합
  return {
    currentStep,
    previousStep,
    stepTransitionDirection,
    totalCountOfSteps,
    isNextStepExisted,
    isPrevStepExisted,
    isCurrentStepFinal,
    // 코드의 의미: 다음 단계 이동 함수
    // 왜 사용했는지: hookFormStepObj 유효성 검사 후 단계 이동
    nextStep: async () => {
      console.log(
        '[useStepForm] nextStep called, hookFormStepObj:',
        !!hookFormStepObj
      ); // 디버깅: 함수 실행 및 hookFormStepObj 확인
      if (!hookFormStepObj) {
        console.error(
          '[useStepForm] nextStep aborted: hookFormStepObj is null'
        ); // 디버깅: null 체크
        return;
      }
      await storeNextStep(hookFormStepObj);
      console.log('[useStepForm] nextStep completed'); // 디버깅: 실행 완료
    },
    // 코드의 의미: 이전 단계 이동 함수
    // 왜 사용했는지: 이전 단계로 이동
    prevStep: storePrevStep,
    // 코드의 의미: 현재 단계 설정 함수
    // 왜 사용했는지: 특정 단계로 수동 이동
    setCurrentStep: storeSetCurrentStep,
    // 코드의 의미: 이전 단계 설정 함수
    // 왜 사용했는지: 이동 방향 계산
    setPreviousStep: storeSetPreviousStep,
    // 코드의 의미: 특정 단계 이동 함수
    // 왜 사용했는지: 헤더에서 단계 클릭 시 이동
    setStep: async (index) => {
      console.log('[useStepForm] setStep called with index:', index); // 디버깅: 함수 실행
      if (!hookFormStepObj) return;
      await storeSetStep(index, hookFormStepObj);
    },
  };
};
