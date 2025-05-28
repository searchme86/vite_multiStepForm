//====여기부터 수정됨====
// StepFieldsStateStore.ts - 마크다운 이중 저장 시스템 적용 (변수명 충돌 해결)
// - 의미: 미리보기용 휘발성 상태와 멀티스텝폼용 영구 저장 분리
// - 사용 이유: 브라우저 리프레시 시 미리보기는 초기화, 작성 콘텐츠는 보존
// - 비유: 임시 메모장(휘발성)과 정식 저장소(영구)를 분리한 시스템
// - 작동 메커니즘:
//   1. markdown, searchTerm: 휘발성 상태 (localStorage 제외)
//   2. richTextContent: 영구 저장 상태 (localStorage 포함, 멀티스텝폼에서 사용)
//   3. content: 기존 컴포넌트용 (변수명 충돌 방지)
//   4. partialize로 선택적 저장, onRehydrateStorage로 휘발성 상태 강제 초기화
// - 관련 키워드: zustand, persist, partialize, localStorage, 이중 저장, variable naming

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialFieldsState } from './initialFieldsState';
import { createGetterFieldsState } from './GetterFieldsState';
import type { StepFieldsStateStore } from './Helper/StepFieldsStateType';
import { createSetterFieldsState } from './SetterFieldsState';

// 스토어 생성 - 마크다운 이중 저장 시스템 (변수명 충돌 해결)
// - 의미: 휘발성 미리보기와 영구 콘텐츠 저장을 분리한 Zustand 스토어
// - 사용 이유: 브라우저 리프레시 시 미리보기는 초기화, 작성 콘텐츠는 유지
// - 수정 내용: richTextContent 필드로 마크다운 편집기 전용 리치텍스트 분리
export const useStepFieldsStateStore = create<StepFieldsStateStore>()(
  persist(
    (set) => ({
      // 초기 상태
      // - 의미: initialFieldsState로 초기화
      // - 사용 이유: 폼 초기값 설정
      state: initialFieldsState,
      // Getter 함수
      // - 의미: 상태 조회 메서드 (휘발성과 영구 상태 모두 포함)
      // - 사용 이유: 상태 접근, 멀티스텝폼에서 richTextContent 접근
      ...createGetterFieldsState(initialFieldsState),
      // Setter 함수
      // - 의미: 상태 업데이트 메서드 (휘발성과 영구 상태 모두 포함)
      // - 사용 이유: 상태 동기화, 이중 저장 시스템 지원
      ...createSetterFieldsState(set),
    }),
    {
      // Persist 설정 - 이중 저장 시스템 구현 (변수명 충돌 해결)
      // - 의미: localStorage에 선택적 상태 저장
      // - 사용 이유: 미리보기는 휘발성, 콘텐츠는 영구 저장
      name: 'step-fields-state',
      partialize: (state) => {
        // 마크다운 미리보기 관련 상태를 제외한 나머지만 저장
        // - 의미: markdown, searchTerm을 localStorage에서 제외
        // - 사용 이유: 브라우저 리프레시 시 미리보기 초기화
        // - 수정: richTextContent는 포함하여 멀티스텝폼에서 접근 가능
        const { markdown, searchTerm, ...persistedState } = state.state;

        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[StepFieldsStateStore] Partializing state with variable separation',
            {
              excluded: ['markdown', 'searchTerm'],
              included: Object.keys(persistedState),
              richTextContentSaved: !!persistedState.richTextContent,
              basicContentSaved: !!persistedState.content,
              note: 'richTextContent and content are now separate',
            }
          );
        }

        return {
          state: {
            ...persistedState,
            // 마크다운과 검색어는 항상 초기값으로 설정 (휘발성)
            // - 의미: 리프레시 시 빈 값으로 시작
            // - 사용 이유: 미리보기는 세션별로 새로 시작
            markdown: undefined,
            searchTerm: undefined,
            // richTextContent는 유지됨 (영구 저장, 마크다운 편집기 전용)
            // - 의미: 작성된 리치텍스트는 localStorage에 저장
            // - 사용 이유: 멀티스텝폼에서 이전 단계 데이터 접근
            // content는 유지됨 (영구 저장, 기존 컴포넌트용)
            // - 의미: 기존 BlogContent 컴포넌트의 텍스트는 별도 저장
            // - 사용 이유: 기존 기능 유지, 마크다운과 구분
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
                '[StepFieldsStateStore] State rehydrated with variable separation',
                {
                  volatileStatesCleared: ['markdown', 'searchTerm'],
                  persistentRichTextRestored: !!state.state.richTextContent,
                  persistentContentRestored: !!state.state.content,
                  richTextLength: state.state.richTextContent?.length || 0,
                  contentLength: state.state.content?.length || 0,
                  note: 'Volatile states cleared, both richTextContent and content restored separately',
                }
              );
            }
          }
        };
      },
    }
  )
);
//====여기까지 수정됨====
