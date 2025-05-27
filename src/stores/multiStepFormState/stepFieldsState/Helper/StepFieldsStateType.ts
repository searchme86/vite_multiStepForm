import type { blogPostSchemaType } from '../../../../pages/write/schema/blogPostSchema';

export type TocItemType = {
  title: string;
  id: string;
  depth: number;
  subItems?: TocItemType[];
};

// 더 안전한 타입 정의를 위한 유틸리티 타입
type CapitalizeString<S extends string> =
  S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S;

export type GetterFieldsState = {
  [K in keyof blogPostSchemaType as `get${CapitalizeString<
    string & K
  >}`]: () => blogPostSchemaType[K];
};

export type SetterFieldsState = {
  [K in keyof blogPostSchemaType as `set${CapitalizeString<string & K>}`]: (
    value: blogPostSchemaType[K]
  ) => void;
} & {
  resetForm: () => void;
  setFormData: (data: blogPostSchemaType) => void;
};

export interface StepFieldsStateStore
  extends GetterFieldsState,
    SetterFieldsState {
  state: blogPostSchemaType;
}

// 동적 메서드 생성을 위한 헬퍼 타입
export type GetterMethodName<K extends keyof blogPostSchemaType> =
  `get${CapitalizeString<string & K>}`;
export type SetterMethodName<K extends keyof blogPostSchemaType> =
  `set${CapitalizeString<string & K>}`;

// 타입 안전한 동적 할당을 위한 헬퍼 타입
export type PartialGetterFieldsState = Partial<GetterFieldsState>;
export type PartialSetterFieldsState = Partial<SetterFieldsState>;
