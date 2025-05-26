import type { TocItemSchemaType } from '../../pages/tocEditor/schema/TocSchema';

// 코드의 의미: 목차 상태 업데이트 인터페이스 정의
// 왜 사용했는지: setter 함수를 분리하여 단일 책임 원칙 준수
export interface SetterTocListState {
  // 코드의 의미: tocItems 상태 업데이트 함수
  // 왜 사용했는지: 항목 추가/삭제/순서 변경/편집 시 상태 변경
  // 타입: (items: TocItemSchemaType[]) => void - 새로운 배열로 상태 교체
  setTocItems: (items: TocItemSchemaType[]) => void;
}
