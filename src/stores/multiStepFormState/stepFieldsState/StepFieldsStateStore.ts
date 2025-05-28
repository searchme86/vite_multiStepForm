// StepFieldsStateStore.ts - 마크다운 이중 저장 시스템 적용
// - 의미: 미리보기용 휘발성 상태와 멀티스텝폼용 영구 저장 분리
// - 사용 이유: 브라우저 리프레시 시 미리보기는 초기화, 작성 콘텐츠는 보존
// - 비유: 임시 메모장(휘발성)과 정식 저장소(영구)를 분리한 시스템
// - 작동 메커니즘:
//   1. markdown, searchTerm: 휘발성 상태 (localStorage 제외)
//   2. content: 영구 저장 상태 (localStorage 포함, 멀티스텝폼에서 사용)
//   3. partialize로 선택적 저장, onRehydrateStorage로 휘발성 상태 강제 초기화
// - 관련 키워드: zustand, persist, partialize, localStorage, 이중 저장

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialFieldsState } from './initialFieldsState';
import { createGetterFieldsState } from './GetterFieldsState';
import type { StepFieldsStateStore } from './Helper/StepFieldsStateType';
import { createSetterFieldsState } from './SetterFieldsState';

// 스토어 생성 - 마크다운 이중 저장 시스템
// - 의미: 휘발성 미리보기와 영구 콘텐츠 저장을 분리한 Zustand 스토어
// - 사용 이유: 브라우저 리프레시 시 미리보기는 초기화, 작성 콘텐츠는 유지
// - 수정 내용: content 필드 추가로 멀티스텝폼에서 리치텍스트 접근 가능
export const useStepFieldsStateStore = create<StepFieldsStateStore>()(
  persist(
    (set) => ({
      // 초기 상태
      // - 의미: initialFieldsState로 초기화
      // - 사용 이유: 폼 초기값 설정
      state: initialFieldsState,
      // Getter 함수
      // - 의미: 상태 조회 메서드 (휘발성과 영구 상태 모두 포함)
      // - 사용 이유: 상태 접근, 멀티스텝폼에서 content 접근
      ...createGetterFieldsState(initialFieldsState),
      // Setter 함수
      // - 의미: 상태 업데이트 메서드 (휘발성과 영구 상태 모두 포함)
      // - 사용 이유: 상태 동기화, 이중 저장 시스템 지원
      ...createSetterFieldsState(set),
    }),
    {
      // Persist 설정 - 이중 저장 시스템 구현
      // - 의미: localStorage에 선택적 상태 저장
      // - 사용 이유: 미리보기는 휘발성, 콘텐츠는 영구 저장
      name: 'step-fields-state',
      partialize: (state) => {
        // 마크다운 미리보기 관련 상태를 제외한 나머지만 저장
        // - 의미: markdown, searchTerm을 localStorage에서 제외
        // - 사용 이유: 브라우저 리프레시 시 미리보기 초기화
        // - 추가: content는 포함하여 멀티스텝폼에서 접근 가능
        const { markdown, searchTerm, ...persistedState } = state.state;

        if (process.env.NODE_ENV === 'development') {
          console.log('[StepFieldsStateStore] Partializing state', {
            excluded: ['markdown', 'searchTerm'],
            included: Object.keys(persistedState),
            contentSaved: !!persistedState.content,
          });
        }

        return {
          state: {
            ...persistedState,
            // 마크다운과 검색어는 항상 초기값으로 설정 (휘발성)
            // - 의미: 리프레시 시 빈 값으로 시작
            // - 사용 이유: 미리보기는 세션별로 새로 시작
            markdown: undefined,
            searchTerm: undefined,
            // content는 유지됨 (영구 저장)
            // - 의미: 작성된 리치텍스트는 localStorage에 저장
            // - 사용 이유: 멀티스텝폼에서 이전 단계 데이터 접근
          },
        };
      },
      // 스토리지에서 복원 시 처리
      // - 의미: localStorage에서 데이터 로드 시 후처리
      // - 사용 이유: 휘발성 상태 강제 초기화, 영구 상태 확인
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            // 복원 후에도 휘발성 상태는 확실히 초기화
            // - 의미: 혹시 저장된 값이 있어도 강제로 초기화
            // - 사용 이유: 확실한 미리보기 초기화 보장
            state.state.markdown = undefined;
            state.state.searchTerm = undefined;

            if (process.env.NODE_ENV === 'development') {
              console.log(
                '[StepFieldsStateStore] State rehydrated with dual storage system',
                {
                  volatileStatesCleared: ['markdown', 'searchTerm'],
                  persistentContentRestored: !!state.state.content,
                  contentLength: state.state.content?.length || 0,
                  note: 'Volatile states cleared, persistent content restored',
                }
              );
            }
          }
        };
      },
    }
  )
);
