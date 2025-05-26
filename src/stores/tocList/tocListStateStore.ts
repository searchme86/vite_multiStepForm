//====여기부터 수정됨====
// 코드의 의미: 목차 상태 스토어 생성
// 왜 사용했는지: tocItems 상태를 전역적으로 관리하고 LocalStorage에 영속화
// 수정 이유: 빈 배열 초기 상태 허용, 유효성 검사 제거
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { initialTocListState } from './initialTocListState';
import type { GetterTocListState } from './GetterTocListState';
import type { SetterTocListState } from './SetterTocListState';

// 코드의 의미: 목차 상태 스토어 타입 정의
// 왜 사용했는지: getter와 setter를 통합하여 타입 안정성 보장
type TocListState = GetterTocListState & SetterTocListState;

// 코드의 의미: Zustand 스토어 생성
// 왜 사용했는지: tocItems 상태를 전역적으로 관리하고 LocalStorage에 영속화
const useTocListStateStore = create<TocListState>()(
  persist(
    (set) => ({
      // 코드의 의미: 초기 tocItems 상태 설정
      // 왜 사용했는지: 빈 배열로 초기화
      tocItems: initialTocListState,

      // 코드의 의미: tocItems 업데이트 함수
      // 왜 사용했는지: 항목 추가/삭제/순서 변경/편집 시 상태 업데이트
      setTocItems: (items) => {
        console.log('[useTocListStateStore] Updating tocItems:', items);
        set({ tocItems: items });
      },
    }),
    {
      // 코드의 의미: persist 설정
      // 왜 사용했는지: LocalStorage에 저장할 키와 저장소 지정
      name: 'tocListState',
      storage: createJSONStorage(() => localStorage),
      // 코드의 의미: 상태 복원 시 디버깅
      // 왜 사용했는지: 복원된 상태 확인
      onRehydrateStorage: () => {
        return (state, error) => {
          console.log(
            '[useTocListStateStore] Rehydrated tocItems from LocalStorage:',
            state?.tocItems
          );
          if (error) {
            console.error('[useTocListStateStore] Rehydration error:', error);
          }
        };
      },
    }
  )
);

// 코드의 의미: 스토어 기본값 내보내기
// 왜 사용했는지: 컴포넌트에서 스토어 사용 가능
export default useTocListStateStore;
//====여기까지 수정됨====
