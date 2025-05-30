import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StorageValue } from 'zustand/middleware';
import { initialFieldsState } from './initialFieldsState';
import type { StepFieldsStateStore } from './Helper/StepFieldsStateType';
import { createSetterFieldsState } from './SetterFieldsState';
import { getContentFromIndexedDB } from './Helper/indexdbHelper';

// IndexedDB에서 큰 용량의 콘텐츠를 비동기로 불러오는 함수
// markdown과 richTextContent는 용량이 클 수 있어서 별도 저장소 사용
const loadContentFromIndexedDB = async (): Promise<{
  markdown?: string;
  richTextContent?: string;
}> => {
  // Promise.all을 사용하여 두 개의 비동기 작업을 병렬로 실행
  // 성능 최적화를 위해 순차 실행이 아닌 병렬 실행 적용
  const [markdown, richTextContent] = await Promise.all([
    getContentFromIndexedDB('markdown'),
    getContentFromIndexedDB('richTextContent'),
  ]);

  // undefined가 아닌 값만 객체에 포함시키는 조건부 스프레드 연산자
  // 불필요한 undefined 값을 제거하여 깔끔한 객체 반환
  return {
    ...(markdown !== undefined && { markdown }),
    ...(richTextContent !== undefined && { richTextContent }),
  };
};

export const useStepFieldsStateStore = create<StepFieldsStateStore>()(
  persist(
    (set) => {
      // setter 메서드들을 생성
      // 동적으로 생성된 메서드들을 store에 포함시키기 위함
      const setterMethods = createSetterFieldsState(set);

      // 평면화된 구조로 store 생성
      // 기존 { state: blogPostSchemaType } 구조에서 blogPostSchemaType 직접 확장 구조로 변경
      const store: StepFieldsStateStore = {
        // initialFieldsState의 모든 필드를 최상위 레벨에 직접 배치
        // title, summary, content 등을 state로 감싸지 않고 바로 접근 가능
        ...initialFieldsState,
        // setter 메서드들 추가 (setTitle, setSummary 등)
        ...setterMethods,
      };

      // 애플리케이션 시작시 IndexedDB에서 큰 콘텐츠 불러오기
      // 브라우저 리프레시 후에도 markdown, richTextContent 복원을 위함
      const initializeContent = async () => {
        const content = await loadContentFromIndexedDB();
        // 불러온 콘텐츠가 있을 때만 state 업데이트
        if (Object.keys(content).length > 0) {
          // 평면화된 구조에 맞게 직접 필드 업데이트
          set((state) => ({
            ...state, // 기존 모든 필드와 setter 메서드들 유지
            ...content, // IndexedDB에서 불러온 콘텐츠로 해당 필드만 덮어쓰기
          }));
        }
      };

      // 비동기 초기화 실행
      initializeContent();

      return store;
    },
    {
      // persist 설정: 브라우저 리프레시 시에도 상태 유지
      name: 'step-fields-state',

      // 저장할 필드를 선택하는 함수
      // markdown과 richTextContent는 IndexedDB에 저장하므로 로컬스토리지에서 제외
      partialize: (state) => {
        // state에서 markdown과 richTextContent를 제외한 나머지 필드만 저장
        const { markdown, richTextContent, ...restState } = state;
        return restState;
      },

      // 커스텀 스토리지 설정 (로컬스토리지 사용)
      storage: {
        // 로컬스토리지에서 데이터 가져오기
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        // 로컬스토리지에 데이터 저장하기
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        // 로컬스토리지에서 데이터 삭제하기
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },

      // 저장된 상태와 현재 상태를 병합하는 방법 정의
      merge: (persisted, current) => {
        const persistedState = persisted as StorageValue<StepFieldsStateStore>;
        return {
          // 현재 상태를 기본으로 하고 (setter 메서드들 포함)
          ...current,
          // 저장된 상태로 덮어쓰기 (필드 데이터만)
          ...persistedState,
          // markdown과 richTextContent는 현재 상태 유지 (IndexedDB에서 관리)
          markdown: current.markdown,
          richTextContent: current.richTextContent,
        };
      },
    }
  )
);
