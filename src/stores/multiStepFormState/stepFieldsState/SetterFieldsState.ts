import type {
  SetterFieldsState,
  SetterMethodName,
  PartialSetterFieldsState,
  StepFieldsStateStore,
} from './Helper/StepFieldsStateType';
import { capitalize } from './Helper/StepFieldStateHelper';
import { initialFieldsState } from './initialFieldsState';
import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';
import { setContentInIndexedDB } from './Helper/indexdbHelper';

export const createSetterFieldsState = (
  set: (
    fn: (state: StepFieldsStateStore) => Partial<StepFieldsStateStore>
  ) => void
): SetterFieldsState => {
  const setter: PartialSetterFieldsState = {};

  // initialFieldsState의 모든 키를 가져와서 동적으로 setter 메서드 생성
  // 각 필드마다 set{필드명} 형태의 메서드를 만들기 위함
  const keys = Object.keys(initialFieldsState) as Array<
    keyof blogPostSchemaType
  >;

  keys.forEach(<K extends keyof blogPostSchemaType>(key: K) => {
    // 필드명의 첫 글자를 대문자로 변환하여 setter 메서드명 생성
    // 예: title → setTitle, summary → setSummary
    const methodName = `set${capitalize(key as string)}` as SetterMethodName<K>;

    // 동적으로 생성된 setter 메서드를 setter 객체에 추가
    (setter as Record<string, (value: blogPostSchemaType[K]) => void>)[
      methodName
    ] = (value: blogPostSchemaType[K]) => {
      // 평면화된 구조: 중첩된 state 없이 직접 필드 업데이트
      // state.state.title이 아닌 state.title 구조로 변경
      set((state) => ({
        ...state, // 기존 state의 모든 속성 유지 (setter 메서드들 포함)
        [key]: value, // 해당 필드만 새로운 값으로 업데이트
      }));

      // markdown과 richTextContent는 용량이 클 수 있어서 IndexedDB에 별도 저장
      // 로컬스토리지 용량 제한을 피하고 성능 최적화를 위함
      if (key === 'markdown') {
        setContentInIndexedDB('markdown', value as string | undefined);
      } else if (key === 'richTextContent') {
        setContentInIndexedDB('richTextContent', value as string | undefined);
      }
    };
  });

  // 폼 전체를 초기화하는 메서드
  // 사용자가 "새 글 작성" 버튼을 눌렀을 때 모든 필드를 초기값으로 리셋
  setter.resetForm = () =>
    set((state) => ({
      ...state, // setter 메서드들은 유지
      ...initialFieldsState, // 모든 필드를 초기값으로 리셋
    }));

  // 폼 전체 데이터를 한 번에 설정하는 메서드
  // 기존 글을 불러와서 편집할 때 사용
  setter.setFormData = (data: blogPostSchemaType) =>
    set((state) => ({
      ...state, // setter 메서드들은 유지
      ...data, // 새로운 데이터로 모든 필드 업데이트
    }));

  return setter as SetterFieldsState;
};
