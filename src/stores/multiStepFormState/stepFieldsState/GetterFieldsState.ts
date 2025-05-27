import type {
  GetterFieldsState,
  GetterMethodName,
  PartialGetterFieldsState,
} from './Helper/StepFieldsStateType.ts';
import { capitalize } from './Helper/StepFieldStateHelper';
import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';

export const createGetterFieldsState = (
  state: blogPostSchemaType
): GetterFieldsState => {
  const getter: PartialGetterFieldsState = {};

  // 타입 안전한 키 순회
  const keys = Object.keys(state) as Array<keyof blogPostSchemaType>;

  keys.forEach(<K extends keyof blogPostSchemaType>(key: K) => {
    const methodName = `get${capitalize(key as string)}` as GetterMethodName<K>;

    // 타입 안전한 할당
    (getter as Record<string, () => blogPostSchemaType[K]>)[methodName] = () =>
      state[key];
  });

  return getter as GetterFieldsState;
};
