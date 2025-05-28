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

  const keys = Object.keys(initialFieldsState) as Array<
    keyof blogPostSchemaType
  >;

  keys.forEach(<K extends keyof blogPostSchemaType>(key: K) => {
    const methodName = `set${capitalize(key as string)}` as SetterMethodName<K>;

    (setter as Record<string, (value: blogPostSchemaType[K]) => void>)[
      methodName
    ] = (value: blogPostSchemaType[K]) => {
      set((state) => ({
        state: {
          ...state.state,
          [key]: value,
        },
      }));

      if (key === 'markdown') {
        setContentInIndexedDB('markdown', value as string | undefined);
      } else if (key === 'richTextContent') {
        setContentInIndexedDB('richTextContent', value as string | undefined);
      }
    };
  });

  setter.resetForm = () => set(() => ({ state: { ...initialFieldsState } }));
  setter.setFormData = (data: blogPostSchemaType) =>
    set(() => ({ state: { ...data } }));

  return setter as SetterFieldsState;
};
