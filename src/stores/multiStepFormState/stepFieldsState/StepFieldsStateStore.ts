import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialFieldsState } from './initialFieldsState';
import { createGetterFieldsState } from './GetterFieldsState';
import type { StepFieldsStateStore } from './Helper/StepFieldsStateType';
import { createSetterFieldsState } from './SetterFieldsState';

// 스토어 생성
// - 의미: Zustand 스토어 초기화
// - 사용 이유: 상태 관리 및 지속성 제공
export const useStepFieldsStateStore = create<StepFieldsStateStore>()(
  persist(
    (set) => ({
      // 초기 상태
      // - 의미: initialFieldsState로 초기화
      // - 사용 이유: 폼 초기값 설정
      state: initialFieldsState,
      // Getter 함수
      // - 의미: 상태 조회 메서드
      // - 사용 이유: 상태 접근
      ...createGetterFieldsState(initialFieldsState),
      // Setter 함수
      // - 의미: 상태 업데이트 메서드
      // - 사용 이유: 상태 동기화
      ...createSetterFieldsState(set),
    }),
    {
      // Persist 설정
      // - 의미: localStorage에 상태 저장
      // - 사용 이유: 리프레시 시 상태 복원
      name: 'step-fields-state',
      partialize: (state) => ({
        state: state.state,
      }),
    }
  )
);
