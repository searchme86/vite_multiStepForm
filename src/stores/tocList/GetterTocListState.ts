import type { TocItemSchemaType } from '../../pages/tocEditor/schema/TocSchema';

// 코드의 의미: 목차 상태 조회 인터페이스 정의
// 왜 사용했는지: getter 함수를 분리하여 단일 책임 원칙 준수
export interface GetterTocListState {
  // 코드의 의미: tocItems 상태 반환
  // 왜 사용했는지: 컴포넌트에서 목차 항목 목록 조회
  // 타입: TocItemSchemaType[] - 목차 항목 배열
  tocItems: TocItemSchemaType[];
}
