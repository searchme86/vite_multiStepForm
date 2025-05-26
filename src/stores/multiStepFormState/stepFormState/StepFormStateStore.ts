// 코드의 의미: Zustand 스토어를 생성하여 폼 상태를 관리
// 왜 사용했는지: 전역 상태를 중앙화하여 컴포넌트 간 동기화 보장
// 참고: persist 미들웨어로 localStorage에 상태 저장
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';
import { initialStepFormState } from './initialStepFormState';
import { createGetterStepFormState } from './GetterStepFormState';
import type { GetterStepFormState } from './GetterStepFormState';
import { createSetterStepFormState } from './SetterStepFormState';
import type { SetterStepFormState } from './SetterStepFormState';

// 스토어 인터페이스
// - 의미: getter와 setter를 결합
// - 사용 이유: 단일 스토어로 상태 관리
interface StepFormStateStore extends GetterStepFormState, SetterStepFormState {
  // 상태 객체
  // - 의미: BlogPostFormData 타입의 상태
  // - 사용 이유: 폼 데이터 저장
  state: blogPostSchemaType;
}

// 스토어 생성
// - 의미: Zustand 스토어 초기화
// - 사용 이유: 전역 상태 관리 및 지속성 제공
export const useStepFormStateStore = create<StepFormStateStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      // - 의미: initialStepFormState로 상태 초기화
      // - 사용 이유: 폼 초기값 설정
      state: initialStepFormState,

      // Getter 함수
      // - 의미: 상태 조회 메서드
      // - 사용 이유: 컴포넌트에서 상태 접근
      ...createGetterStepFormState(initialStepFormState),

      // Setter 함수
      // - 의미: 상태 업데이트 메서드
      // - 사용 이유: 상태 변경 및 유효성 검사
      ...createSetterStepFormState(set, get),
    }),
    {
      // Persist 설정
      // - 의미: localStorage에 상태 저장
      // - 사용 이유: 페이지 리로드 시 상태 복원
      name: 'step-form-state',
      partialize: (state) => ({
        state: state.state,
      }),
    }
  )
);
