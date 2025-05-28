import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StorageValue } from 'zustand/middleware';
import { initialFieldsState } from './initialFieldsState';
import type { StepFieldsStateStore } from './Helper/StepFieldsStateType';
import { createSetterFieldsState } from './SetterFieldsState';
import { createGetterFieldsState } from './GetterFieldsState';
import { getContentFromIndexedDB } from './Helper/indexdbHelper';

const loadContentFromIndexedDB = async (): Promise<{
  markdown?: string;
  richTextContent?: string;
}> => {
  const [markdown, richTextContent] = await Promise.all([
    getContentFromIndexedDB('markdown'),
    getContentFromIndexedDB('richTextContent'),
  ]);

  return {
    ...(markdown !== undefined && { markdown }),
    ...(richTextContent !== undefined && { richTextContent }),
  };
};

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

      const initializeContent = async () => {
        const content = await loadContentFromIndexedDB();
        if (Object.keys(content).length > 0) {
          set((state) => ({
            state: { ...state.state, ...content },
          }));
        }
      };
      initializeContent();

      return store;
    },
    {
      name: 'step-fields-state',
      partialize: (state) => ({
        state: {
          ...state.state,
          markdown: undefined,
          richTextContent: undefined,
        },
      }),
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      merge: (persisted, current) => {
        const persistedState = persisted as StorageValue<StepFieldsStateStore>;
        return {
          ...current,
          state: {
            ...current.state,
            ...persistedState?.state,
            markdown: current.state.markdown,
            richTextContent: current.state.richTextContent,
          },
        };
      },
    }
  )
);
