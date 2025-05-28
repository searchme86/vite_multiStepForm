import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialFieldsState } from './initialFieldsState';
import type { StepFieldsStateStore } from './Helper/StepFieldsStateType';
import { createSetterFieldsState } from './SetterFieldsState';
import { createGetterFieldsState } from './GetterFieldsState';

export const useStepFieldsStateStore = create<StepFieldsStateStore>()(
  persist(
    (set) => {
      // 타입 명시적 선언
      const getterMethods = createGetterFieldsState();
      const setterMethods = createSetterFieldsState(set);

      // 모든 요소를 합쳐서 StepFieldsStateStore 생성
      const store: StepFieldsStateStore = {
        state: initialFieldsState,
        ...getterMethods,
        ...setterMethods,
      };

      return store;
    },
    {
      name: 'step-fields-state',
      partialize: (state) => {
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
            markdown: undefined,
            searchTerm: undefined,
          },
        };
      },
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
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
