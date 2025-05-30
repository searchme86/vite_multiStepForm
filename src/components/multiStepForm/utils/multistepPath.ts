// 코드의 의미: 단계 정의

import type { EachStep } from '../types/multiStepFormType';
import MultiStepFirstStep from '../pages/MultiStepFirstStep';
import MultiStepSecondStep from '../pages/MultiStepSecondStep';
import MultiStepThirdStep from '../pages/MultiStepThirdStep';
import MultiStepFourthStep from '../pages/MultiStepFourthStep';

export const totalSteps: EachStep[] = [
  {
    stepId: '1',
    stepTitle: '블로그 기본',
    stepDescription: '블로그 기본정보를 입력해주세요',
    stepComponent: MultiStepFirstStep, // 탭에서 렌더링할 컴포넌트
    fieldsOfStep: ['title', 'summary', 'content', 'category', 'tocItems'],
  },
  {
    stepId: '2',
    stepTitle: '블로그 컨텐츠',
    stepDescription: '블로그 컨텐츠를 입력해주세요',
    stepComponent: MultiStepSecondStep,
    fieldsOfStep: ['tags', 'markdown'],
  },
  {
    stepId: '3',
    stepTitle: '블로그 미디어',
    stepDescription: '블로그에 추가할 미디어 파일을 입력해주세요',
    stepComponent: MultiStepThirdStep,
    fieldsOfStep: ['coverImage'],
  },
  {
    stepId: '4',
    stepTitle: '작성 블로그 미리보기',
    stepDescription: '블로그에 추가할 미디어 파일을 입력해주세요',
    stepComponent: MultiStepFourthStep,
    fieldsOfStep: ['richTextContent'],
  },
];
