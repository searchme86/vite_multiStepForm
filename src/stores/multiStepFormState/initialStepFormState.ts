import EmailForm from '../../pages/temp/emailForm/EmailForm.tsx';
import TocEditorContainer from '../../pages/write/basicFormSection/parts/tocEditor/TocEditorContainer';
// import TocEditorContainer from '@/pages/tocEditor/TocEditorContainer';
import type {
  StepFormState,
  EachStep,
} from '../../components/multiStepForm/types/multiStepFormType.ts';
// import type {
//   StepFormState,
//   EachStep,
// } from '@/components/multiStepForm/types/multiStepFormType';
import type { FormSchemaType } from '@/schema/FormSchema';

// 코드의 의미: 중첩 경로 유틸리티 타입
// 왜 사용했는지: 폼 필드 경로를 타입 안전하게 생성
export type Paths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${Paths<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type FormPaths = Paths<FormSchemaType>;

// 코드의 의미: 단계 정의
// 왜 사용했는지: 멀티스텝 폼의 단계 구성
export const totalSteps: EachStep[] = [
  {
    stepId: '1',
    stepTitle: '목차 생성',
    stepDescription: '목차를 편집해주세요',
    stepComponent: TocEditorContainer,
    fieldsOfStep: ['tocItems'],
  },
  {
    stepId: '2',
    stepTitle: '이메일 입력',
    stepDescription: '이메일을 입력해주세요',
    stepComponent: EmailForm,
    fieldsOfStep: [
      'email.fullEmailInput',
      'email.splitEmailInput.userLocalPart',
      'email.splitEmailInput.emailRest',
    ],
  },
];

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
  tocItems: [],
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
