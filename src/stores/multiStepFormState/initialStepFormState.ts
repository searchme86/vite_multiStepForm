import type { StepFormState } from '../../components/multiStepForm/types/multiStepFormType.ts';
import type { FormSchemaType } from '@/schema/FormSchema';
import { initialFieldsState } from './stepFieldsState/initialFieldsState.ts';

// 코드의 의미: 기본 폼 필드 값
// 왜 사용했는지: 폼의 초기 데이터 제공
export const defaultFieldsValue: FormSchemaType = {
  firstName: '',
  lastName: '',
  email: {
    fullEmailInput: '',
    splitEmailInput: {
      userLocalPart: '',
      emailRest: '',
    },
  },
  phone: '',
  jobs: [],
  github: '',
  portfolio: '',
  resume: [],
  ...initialFieldsState,
};

// 코드의 의미: 초기 상태 생성
// 왜 사용했는지: Zustand 스토어의 초기 상태 설정
export const createInitialStepFormState = (
  totalFormStepsCount: number
): StepFormState => ({
  currentStep: 0,
  previousStep: 0,
  stepTransitionDirection: 0,
  totalCountOfSteps: totalFormStepsCount,
  isNextStepExisted: totalFormStepsCount > 1,
  isPrevStepExisted: false,
  isCurrentStepFinal: totalFormStepsCount === 1,
});
