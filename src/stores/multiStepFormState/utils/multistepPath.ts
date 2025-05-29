// 코드의 의미: 단계 정의

import type { EachStep } from '../../../components/multiStepForm/types/multiStepFormType';
import BasicInfoSection from '../../../pages/write/basicFormSection/BasicInfoSection';
import EmailForm from '../../../pages/write/basicFormSection/parts/personInfo/parts/emailForm/EmailForm';
import TocEditorContainer from '../../../pages/write/basicFormSection/parts/tocEditor/TocEditorContainer';

// 단계 정의
// 왜 사용했는지: 멀티스텝 폼의 단계 구성
export const totalSteps: EachStep[] = [
  {
    stepId: '1',
    stepTitle: '목차 생성',
    stepDescription: '목차를 편집해주세요',
    stepComponent: TocEditorContainer, // 탭에서 렌더링할 컴포넌트
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
  {
    stepId: '3',
    stepTitle: '기본정보',
    stepDescription: '블로그에 입력할 기본 정보를 입력해주세요',
    stepComponent: BasicInfoSection,
    fieldsOfStep: [
      'email.fullEmailInput',
      'email.splitEmailInput.userLocalPart',
      'email.splitEmailInput.emailRest',
    ],
  },
];
