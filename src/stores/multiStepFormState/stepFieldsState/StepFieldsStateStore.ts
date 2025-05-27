// StepFieldsStateStore.ts - 마크다운 미리보기 상태 제외 수정
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialFieldsState } from './initialFieldsState';
import { createGetterFieldsState } from './GetterFieldsState';
import type { StepFieldsStateStore } from './Helper/StepFieldsStateType';
import { createSetterFieldsState } from './SetterFieldsState';

// 스토어 생성 - 마크다운 미리보기 관련 상태는 지속성에서 제외
// - 의미: Zustand 스토어 초기화
// - 사용 이유: 상태 관리 및 선택적 지속성 제공
// - 수정 내용: markdown, searchTerm은 브라우저 리프레시 시 초기화
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
      // Persist 설정 - 마크다운 미리보기 관련 상태 제외
      // - 의미: localStorage에 선택적 상태 저장
      // - 사용 이유: 리프레시 시 마크다운 미리보기는 초기화, 나머지는 복원
      name: 'step-fields-state',
      partialize: (state) => {
        // 마크다운 미리보기 관련 상태를 제외한 나머지만 저장
        // - 의미: markdown, searchTerm을 localStorage에서 제외
        // - 사용 이유: 브라우저 리프레시 시 미리보기 초기화
        const { markdown, searchTerm, ...persistedState } = state.state;

        return {
          state: {
            ...persistedState,
            // 마크다운과 검색어는 항상 초기값으로 설정
            // - 의미: 리프레시 시 빈 값으로 시작
            // - 사용 이유: 미리보기는 세션별로 새로 시작
            markdown: undefined,
            searchTerm: undefined,
          },
        };
      },
      // 스토리지에서 복원 시 처리
      // - 의미: localStorage에서 데이터 로드 시 후처리
      // - 사용 이유: 마크다운 미리보기 상태 강제 초기화
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // 복원 후에도 마크다운 미리보기 관련 상태는 확실히 초기화
            // - 의미: 혹시 저장된 값이 있어도 강제로 초기화
            // - 사용 이유: 확실한 미리보기 초기화 보장
            state.state.markdown = undefined;
            state.state.searchTerm = undefined;

            console.log(
              '[StepFieldsStateStore] Markdown preview states cleared on rehydration'
            );
          }
        };
      },
    }
  )
);
