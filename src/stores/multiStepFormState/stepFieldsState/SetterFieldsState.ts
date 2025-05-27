import type {
  SetterFieldsState,
  SetterMethodName,
  PartialSetterFieldsState,
  StepFieldsStateStore,
} from './Helper/StepFieldsStateType';
import { capitalize } from './Helper/StepFieldStateHelper';
import { initialFieldsState } from './initialFieldsState';
import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';

export const createSetterFieldsState = (
  set: (
    fn: (state: StepFieldsStateStore) => Partial<StepFieldsStateStore>
  ) => void
): SetterFieldsState => {
  const setter: PartialSetterFieldsState = {};

  // 타입 안전한 키 순회
  const keys = Object.keys(initialFieldsState) as Array<
    keyof blogPostSchemaType
  >;

  keys.forEach(<K extends keyof blogPostSchemaType>(key: K) => {
    const methodName = `set${capitalize(key as string)}` as SetterMethodName<K>;

    // 타입 안전한 할당
    (setter as Record<string, (value: blogPostSchemaType[K]) => void>)[
      methodName
    ] = (value: blogPostSchemaType[K]) => {
      set((state) => ({
        state: {
          ...state.state,
          [key]: value,
        },
      }));
    };
  });

  // 추가 메서드들
  setter.resetForm = () => set(() => ({ state: { ...initialFieldsState } }));
  setter.setFormData = (data: blogPostSchemaType) =>
    set(() => ({ state: { ...data } }));

  return setter as SetterFieldsState;
};
