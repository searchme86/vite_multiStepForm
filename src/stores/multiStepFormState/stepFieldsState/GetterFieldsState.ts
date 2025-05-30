import type {
  GetterFieldsState,
  GetterMethodName,
} from './Helper/StepFieldsStateType.ts';
import { capitalize } from './Helper/StepFieldStateHelper';
import { initialFieldsState } from './initialFieldsState';
import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';

//====여기부터 수정됨====
export const createGetterFieldsState = (): GetterFieldsState => {
  const getter: Partial<GetterFieldsState> = {};

  // initialFieldsState의 모든 키를 가져와서 동적으로 getter 메서드 생성
  // 각 필드마다 get{필드명} 형태의 메서드를 만들기 위함
  const keys = Object.keys(initialFieldsState) as Array<
    keyof blogPostSchemaType
  >;

  keys.forEach(<K extends keyof blogPostSchemaType>(key: K) => {
    // 필드명의 첫 글자를 대문자로 변환하여 getter 메서드명 생성
    // 예: title → getTitle, summary → getSummary
    const methodName = `get${capitalize(key as string)}` as GetterMethodName<K>;

    // 동적으로 생성된 getter 메서드를 getter 객체에 추가
    // 평면화된 구조에서 직접 필드에 접근하도록 변경
    (getter as Record<string, () => blogPostSchemaType[K]>)[methodName] =
      () => {
        // 실제 getter 로직은 스토어에서 구현되어야 함
        // 여기서는 메서드 시그니처만 정의하고 실제 구현은 스토어에서 처리
        // 스토어에서 이 메서드들이 호출될 때 현재 상태값을 반환하도록 구현됨

        // 주의: 이 함수는 실제로는 호출되지 않음
        // Zustand에서 이 메서드들을 오버라이드하여 실제 상태값을 반환
        throw new Error(`${methodName} 메서드는 스토어에서 구현되어야 합니다.`);
      };
  });

  return getter as GetterFieldsState;
};

// 참고: 실제 사용시에는 다음과 같이 getter 메서드를 사용할 수 있습니다
// const store = useStepFieldsStateStore();
// const title = store.getTitle(); // 현재 title 값을 반환
// const summary = store.getSummary(); // 현재 summary 값을 반환

// 하지만 평면화된 구조에서는 직접 접근이 더 간편합니다:
// const { title, summary } = useStepFieldsStateStore();
//====여기까지 수정됨====
