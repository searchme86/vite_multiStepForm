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

// SetterFieldsState: 각 필드에 대한 setter 메서드들
export type SetterFieldsState = {
  [K in keyof blogPostSchemaType as `set${CapitalizeString<string & K>}`]: (
    value: blogPostSchemaType[K]
  ) => void;
} & {
  resetForm: () => void;
  setFormData: (data: blogPostSchemaType) => void;
};

// 평면화된 구조의 StepFieldsStateStore
// state를 중첩하지 않고 모든 필드를 최상위 레벨에 배치
export interface StepFieldsStateStore
  extends blogPostSchemaType,
    SetterFieldsState {
  // blogPostSchemaType의 모든 필드가 직접 포함됨 (title, summary, content 등)
  // SetterFieldsState의 모든 메서드가 포함됨 (setTitle, setSummary 등)
}

// 동적 메서드 생성을 위한 헬퍼 타입
export type SetterMethodName<K extends keyof blogPostSchemaType> =
  `set${CapitalizeString<string & K>}`;

// 타입 안전한 동적 할당을 위한 헬퍼 타입
export type PartialSetterFieldsState = Partial<SetterFieldsState>;
