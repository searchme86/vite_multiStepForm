//====여기부터 수정됨====
// 코드의 의미: 목차 상태 초기값 정의
// 왜 사용했는지: 스토어 초기화 시 빈 배열로 시작, 사용자 입력 요구
// 실행 매커니즘: TocItemSchemaType[] 타입으로 초기 목차 항목 설정
import type { TocItemSchemaType } from '../../pages/tocEditor/schema/TocSchema';

// 코드의 의미: 초기 목차 항목 정의
// 왜 사용했는지: 빈 배열로 시작, 유효성 검사로 최소 1개 항목 요구
export const initialTocListState: TocItemSchemaType[] = [];
//====여기까지 수정됨====
