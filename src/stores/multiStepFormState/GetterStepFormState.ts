//====여기부터 수정됨====
// 코드의 의미: Zustand 스토어의 getter 함수 생성
// 왜 사용했는지: 상태 접근을 캡슐화하고 순수 함수로 제공
// 수정 이유: undefined 체크 강화, 콘솔 로그 제거
import type {
  EachStep,
  StepFormState,
  StepFormGetters,
} from '@/components/multiStepForm/types/multiStepFormType';

// 코드의 의미: getter 함수 생성
// 왜 사용했는지: 상태를 안전하게 반환
// 실행 매커니즘: get 함수로 상태를 동적으로 가져와 반환
export const createStepFormGetters = (
  get: () => StepFormState,
  steps: EachStep[]
): StepFormGetters => ({
  // 코드의 의미: 현재 단계 반환
  // 왜 사용했는지: 현재 단계 인덱스 제공
  getCurrentStep: () => get().currentStep ?? 0,
  // 코드의 의미: 이전 단계 반환
  // 왜 사용했는지: 이전 단계 인덱스 제공
  getPreviousStep: () => get().previousStep ?? 0,
  // 코드의 의미: 이동 방향 반환
  // 왜 사용했는지: 애니메이션 방향 계산
  getStepTransitionDirection: () => get().stepTransitionDirection ?? 0,
  // 코드의 의미: 전체 단계 수 반환
  // 왜 사용했는지: 단계 수 제공
  getTotalSteps: () => get().totalCountOfSteps ?? steps.length,
  // 코드의 의미: 다음 단계 존재 여부 반환
  // 왜 사용했는지: 다음 버튼 활성화 여부
  getIsNextStepExisted: () => get().isNextStepExisted ?? steps.length > 1,
  // 코드의 의미: 이전 단계 존재 여부 반환
  // 왜 사용했는지: 이전 버튼 활성화 여부
  getIsPrevStepExisted: () => get().isPrevStepExisted ?? false,
  // 코드의 의미: 마지막 단계 여부 반환
  // 왜 사용했는지: 제출 버튼 표시 여부
  getIsCurrentStepFinal: () => get().isCurrentStepFinal ?? steps.length === 1,
});
//====여기까지 수정됨====
