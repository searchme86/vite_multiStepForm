//====여기부터 수정됨====
// 코드의 의미: Zustand 스토어 정의
// 왜 사용했는지: 멀티스텝 폼의 상태를 중앙화하고, localStorage에 지속적으로 저장
// 수정 이유: partialize, merge, onRehydrateStorage 제거, localStorage 저장 단순화
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  StepFormStore,
  StepFormState,
} from '@/components/multiStepForm/types/multiStepFormType';
import { createStepFormGetters } from './GetterStepFormState';
import { createStepFormSetters } from './SetterStepFormState';
import { totalSteps } from './InitialStepFormState';

// 코드의 의미: Zustand 스토어 생성
// 왜 사용했는지: 상태 관리와 localStorage 지속성을 통합
// 실행 매커니즘: create()로 스토어 생성, persist 미들웨어로 localStorage에 상태 저장
const useStepFormStore = create<StepFormStore>()(
  persist<StepFormStore>(
    (set, get) => {
      // 코드의 의미: 초기 상태 정의
      // 왜 사용했는지: 스토어의 기본 상태 설정, totalSteps 길이에 따라 동적 설정
      // 실행 매커니즘: totalSteps.length로 동적 계산, 기본값 설정
      const initialState: StepFormState = {
        currentStep: 0,
        previousStep: 0,
        stepTransitionDirection: 0,
        totalCountOfSteps: totalSteps.length,
        isNextStepExisted: totalSteps.length > 1,
        isPrevStepExisted: false,
        isCurrentStepFinal: totalSteps.length === 1,
      };

      // 코드의 의미: 스토어 객체 반환
      // 왜 사용했는지: 초기 상태와 getter/setter 함수를 결합
      // 실행 매커니즘: initialState와 함수들을 병합하여 단일 스토어 객체 생성
      return {
        ...initialState,
        ...createStepFormGetters(get, totalSteps),
        ...createStepFormSetters(set, get, totalSteps),
      };
    },
    {
      // 코드의 의미: persist 설정
      // 왜 사용했는지: localStorage에 상태를 저장
      // 실행 매커니즘: 최소 설정으로 상태 직렬화/역직렬화
      name: 'step-form-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// 코드의 의미: 스토어 내보내기
// 왜 사용했는지: 다른 컴포넌트에서 스토어 사용 가능하도록
export { useStepFormStore };
//====여기까지 수정됨====
