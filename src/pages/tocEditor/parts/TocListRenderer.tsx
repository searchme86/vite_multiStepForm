//====여기부터 수정됨====
// 코드의 의미: 목차 목록 렌더링 컴포넌트
// 왜 사용했는지: 최상위 ul 목록 렌더링, TocItemRenderer 호출
// 실행 매커니즘: items 배열을 받아 ul 내 li로 렌더링
import type { TocItemSchemaType } from '../schema/TocSchema';
import TocItemRenderer from './TocItemRenderer';

// 코드의 의미: TocListRenderer의 prop 타입 정의
// 왜 사용했는지: parentPath prop 지원
interface TocListRendererProps {
  items: TocItemSchemaType[];
  parentPath: string;
}

// 코드의 의미: 목차 목록 렌더링 컴포넌트
// 왜 사용했는지: 최상위 목차 항목을 ul로 렌더링
// 실행 매커니즘: items를 TocItemRenderer로 매핑, 계층적 구조는 TocItemRenderer에서 처리
function TocListRenderer({ items, parentPath }: TocListRendererProps) {
  // 코드의 의미: 유효한 항목 필터링
  // 왜 사용했는지: null/undefined 항목 제거
  const validItems = items.filter(
    (item): item is TocItemSchemaType => item !== null && item !== undefined
  );

  // 디버깅: 렌더링 항목 확인
  console.log(
    '[TocListRenderer] Rendering validItems:',
    validItems,
    'parentPath:',
    parentPath
  );

  return (
    <ul
      className="list_blogContent flex flex-col space-y-2"
      role="list"
      aria-label="목차 목록"
    >
      {validItems.map((item, index) => (
        <TocItemRenderer
          key={item.id}
          item={item}
          index={index}
          parentPath={parentPath}
          isLastItem={index === validItems.length - 1}
        />
      ))}
    </ul>
  );
}

export default TocListRenderer;
//====여기까지 수정됨====
