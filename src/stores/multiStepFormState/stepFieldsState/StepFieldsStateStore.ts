import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialFieldsState } from './initialFieldsState';
import type { StepFieldsStateStore } from './Helper/StepFieldsStateType';
import { createSetterFieldsState } from './SetterFieldsState';
import { createGetterFieldsState } from './GetterFieldsState';

export const useStepFieldsStateStore = create<StepFieldsStateStore>()(
  persist(
    (set) => {
      const getterMethods = createGetterFieldsState();
      const setterMethods = createSetterFieldsState(set);

      const store: StepFieldsStateStore = {
        state: initialFieldsState,
        ...getterMethods,
        ...setterMethods,
      };

      return store;
    },
    {
      name: 'step-fields-state',
      partialize: (state) => ({
        ...state.state,
      }),
      // onRehydrateStorage: () => {
      //   return (state) => {
      //     if (state) {
      //       if (process.env.NODE_ENV === 'development') {
      //         console.log('[StepFieldsStateStore] State rehydrated', {
      //           markdownRestored: !!state.state.markdown,
      //           searchTermRestored: !!state.state.searchTerm,
      //           richTextContentRestored: !!state.state.richTextContent,
      //           contentRestored: !!state.state.content,
      //           markdownLength: state.state.markdown?.length || 0,
      //           searchTermLength: state.state.searchTerm?.length || 0,
      //         });
      //       }
      //     }
      //   };
      // },
    }
  )
);
