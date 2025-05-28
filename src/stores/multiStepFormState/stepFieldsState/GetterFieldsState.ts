import type {
  GetterFieldsState,
  GetterMethodName,
  PartialGetterFieldsState,
  StepFieldsStateStore,
} from './Helper/StepFieldsStateType';
import { capitalize } from './Helper/StepFieldStateHelper';
import type { blogPostSchemaType } from '../../../pages/write/schema/blogPostSchema';
import { initialFieldsState } from './initialFieldsState';

export const createGetterFieldsState = (): GetterFieldsState => {
  const getter: PartialGetterFieldsState = {};

  const keys = Object.keys(initialFieldsState) as Array<
    keyof blogPostSchemaType
  >;

  keys.forEach(<K extends keyof blogPostSchemaType>(key: K) => {
    const methodName = `get${capitalize(key as string)}` as GetterMethodName<K>;

    (getter as any)[methodName] = function (this: StepFieldsStateStore) {
      return this.state[key];
    };
  });

  return getter as GetterFieldsState;
};
