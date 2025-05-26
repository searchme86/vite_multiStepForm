import type { UseFormReturn } from 'react-hook-form';
import type { FormSchemaType } from '@/schema/FormSchema';
import type { FormPaths } from '../../../stores/multiStepFormState/initialStepFormState';

// 코드의 의미: 멀티스텝 폼의 타입 정의
// 왜 사용했는지: 타입 재사용성과 코드 일관성 보장
export type EachStep = {
  stepId: string;
  stepTitle: string;
  stepDescription: string;
  stepComponent: () => React.JSX.Element;
  fieldsOfStep: FormPaths[];
};

// 코드의 의미: 초기 상태 타입
// 왜 사용했는지: Zustand 스토어 상태 정의
export interface StepFormState {
  currentStep: number;
  previousStep: number;
  stepTransitionDirection: number;
  totalCountOfSteps: number;
  isNextStepExisted: boolean;
  isPrevStepExisted: boolean;
  isCurrentStepFinal: boolean;
}

// 코드의 의미: Getter 함수 타입
// 왜 사용했는지: 상태 접근 함수 정의
export interface StepFormGetters {
  getCurrentStep: () => number;
  getPreviousStep: () => number;
  getStepTransitionDirection: () => number;
  getTotalSteps: () => number;
  getIsNextStepExisted: () => boolean;
  getIsPrevStepExisted: () => boolean;
  getIsCurrentStepFinal: () => boolean;
}

// 코드의 의미: Setter 함수 타입
// 왜 사용했는지: 상태 업데이트 함수 정의
export interface StepFormSetters {
  nextStep: (hookFormStepObj: UseFormReturn<FormSchemaType>) => Promise<void>;
  prevStep: () => void;
  setCurrentStep: (index: number) => void;
  setPreviousStep: (index: number) => void;
  setStep: (
    index: number,
    hookFormStepObj: UseFormReturn<FormSchemaType>
  ) => Promise<void>;
}

// 코드의 의미: Zustand 스토어 타입
// 왜 사용했는지: 스토어의 전체 타입 정의
export type StepFormStore = StepFormState & StepFormGetters & StepFormSetters;

// 코드의 의미: Zustand 훅의 상태와 함수 타입
// 왜 사용했는지: 컴포넌트에서 사용할 훅 인터페이스 정의
export interface FormControlsToolProps {
  currentStep: number;
  previousStep: number;
  stepTransitionDirection: number;
  totalCountOfSteps: number;
  isNextStepExisted: boolean;
  isPrevStepExisted: boolean;
  isCurrentStepFinal: boolean;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  setCurrentStep: (index: number) => void;
  setPreviousStep: (index: number) => void;
  setStep: (index: number) => Promise<void>;
}
