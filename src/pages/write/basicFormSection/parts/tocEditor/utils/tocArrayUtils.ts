//====여기부터 수정됨====
// 코드의 의미: 목차 배열 조작 유틸리티
// 왜 사용했는지: 복잡한 배열 조작 로직 분리
// 실행 매커니즘: tocItems 배열을 경로 기반으로 수정
import type { TocItemSchemaType } from '../schema/TocSchema';

// 코드의 의미: 항목 위로 이동
// 왜 사용했는지: ^ 버튼으로 항목을 상위 뎁스 또는 같은 뎁스 내 상위 위치로 이동
export function moveItemUpInArray(
  tocItems: TocItemSchemaType[],
  path: string
): TocItemSchemaType[] {
  const updatedItems = [...tocItems];
  let current = updatedItems;
  const pathSegments = path.split('.').map(Number);
  let parentItems = updatedItems;

  // 코드의 의미: 경로를 따라 항목 탐색
  // 왜 사용했는지: 이동할 항목과 부모 배열 접근
  for (let i = 0; i < pathSegments.length - 1; i++) {
    parentItems = current;
    current = current[pathSegments[i]].subItems!;
  }
  const targetIndex = pathSegments[pathSegments.length - 1];

  // 코드의 의미: 최상단 항목 확인
  // 왜 사용했는지: 같은 뎁스 내 이동 또는 상위 뎁스 이동 결정
  if (targetIndex === 0) {
    // 코드의 의미: 최상단 항목이면 상위 뎁스로 이동 시도
    // 왜 사용했는지: 상위 뎁스의 li와 같은 레벨로 이동
    if (pathSegments.length > 1) {
      const parentIndex = pathSegments[pathSegments.length - 2];
      const [movedItem] = current.splice(targetIndex, 1);
      movedItem.depth -= 1;
      parentItems.splice(parentIndex + 1, 0, movedItem);
      console.log(
        '[tocArrayUtils] moveItemUpInArray: Moved item to parent level at path:',
        path,
        'new depth:',
        movedItem.depth,
        'updatedItems:',
        updatedItems
      );
      return updatedItems;
    }
    console.log(
      '[tocArrayUtils] moveItemUpInArray: Item is already at top level, path:',
      path
    );
    return updatedItems;
  }

  // 코드의 의미: 같은 뎁스 내 위로 이동
  // 왜 사용했는지: 현재 배열 내 상위 인덱스로 이동
  [current[targetIndex - 1], current[targetIndex]] = [
    current[targetIndex],
    current[targetIndex - 1],
  ];
  console.log(
    '[tocArrayUtils] moveItemUpInArray: Moved item up within same level at path:',
    path,
    'updatedItems:',
    updatedItems
  );
  return updatedItems;
}

// 코드의 의미: 항목 아래로 이동
// 왜 사용했는지: v 버튼으로 항목을 같은 뎁스 내 하위 위치 또는 하위 뎁스로 이동
// 수정 이유: 불필요한 parentItems 변수 제거
export function moveItemDownInArray(
  tocItems: TocItemSchemaType[],
  path: string
): TocItemSchemaType[] {
  const updatedItems = [...tocItems];
  let current = updatedItems;
  const pathSegments = path.split('.').map(Number);

  // 코드의 의미: 경로를 따라 항목 탐색
  // 왜 사용했는지: 이동할 항목 접근
  for (let i = 0; i < pathSegments.length - 1; i++) {
    current = current[pathSegments[i]].subItems!;
  }
  const targetIndex = pathSegments[pathSegments.length - 1];

  // 코드의 의미: 최하단 항목 확인
  // 왜 사용했는지: 같은 뎁스 내 이동 또는 하위 뎁스 이동 결정
  if (targetIndex === current.length - 1) {
    // 코드의 의미: 최하단 항목이면 하위 뎁스로 이동 시도
    // 왜 사용했는지: 이전 항목의 subItems로 이동
    if (pathSegments.length > 0 && targetIndex > 0) {
      const prevIndex = targetIndex - 1;
      const prevItem = current[prevIndex];
      const [movedItem] = current.splice(targetIndex, 1);
      movedItem.depth += 1;
      prevItem.subItems = [...(prevItem.subItems || []), movedItem];
      console.log(
        '[tocArrayUtils] moveItemDownInArray: Moved item to sub-level at path:',
        path,
        'new depth:',
        movedItem.depth,
        'added to prev item:',
        prevItem.id,
        'updatedItems:',
        updatedItems
      );
      return updatedItems;
    }
    console.log(
      '[tocArrayUtils] moveItemDownInArray: Item is already at bottom level, path:',
      path
    );
    return updatedItems;
  }

  // 코드의 의미: 같은 뎁스 내 아래로 이동
  // 왜 사용했는지: 현재 배열 내 하위 인덱스로 이동
  [current[targetIndex], current[targetIndex + 1]] = [
    current[targetIndex + 1],
    current[targetIndex],
  ];
  console.log(
    '[tocArrayUtils] moveItemDownInArray: Moved item down within same level at path:',
    path,
    'updatedItems:',
    updatedItems
  );
  return updatedItems;
}

// 코드의 의미: 항목 인덴트
// 왜 사용했는지: > 버튼으로 depth 증가, subItems 추가
export function indentItemInArray(
  tocItems: TocItemSchemaType[],
  path: string
): TocItemSchemaType[] {
  const updatedItems = [...tocItems];
  let current = updatedItems;
  const pathSegments = path.split('.').map(Number);
  for (let i = 0; i < pathSegments.length - 1; i++) {
    current = current[pathSegments[i]].subItems!;
  }
  const targetIndex = pathSegments[pathSegments.length - 1];
  if (targetIndex === 0) {
    console.log(
      '[tocArrayUtils] indentItemInArray: Cannot indent first item, path:',
      path
    );
    return updatedItems;
  }
  const parentIndex = targetIndex - 1;
  const parentItem = current[parentIndex];
  const [indentedItem] = current.splice(targetIndex, 1);
  indentedItem.depth += 1;
  parentItem.subItems = [...(parentItem.subItems || []), indentedItem];
  console.log(
    '[tocArrayUtils] indentItemInArray: Indented item at path:',
    path,
    'new depth:',
    indentedItem.depth,
    'added to parent:',
    parentItem.id,
    'updatedItems:',
    updatedItems
  );
  return updatedItems;
}

// 코드의 의미: 항목 아웃덴트
// 왜 사용했는지: < 버튼으로 depth 감소, subItems 제거
export function outdentItemInArray(
  tocItems: TocItemSchemaType[],
  path: string
): TocItemSchemaType[] {
  const updatedItems = [...tocItems];
  let current = updatedItems;
  const pathSegments = path.split('.').map(Number);
  let parentItems = updatedItems;
  for (let i = 0; i < pathSegments.length - 1; i++) {
    parentItems = current;
    current = current[pathSegments[i]].subItems!;
  }
  const targetIndex = pathSegments[pathSegments.length - 1];
  const item = current[targetIndex];
  if (item.depth <= 0) {
    console.log(
      '[tocArrayUtils] outdentItemInArray: Item cannot be outdented below depth 0, path:',
      path
    );
    return updatedItems;
  }
  const [outdentedItem] = current.splice(targetIndex, 1);
  outdentedItem.depth -= 1;
  const parentIndex = pathSegments[pathSegments.length - 2];
  parentItems.splice(parentIndex + 1, 0, outdentedItem);
  console.log(
    '[tocArrayUtils] outdentItemInArray: Outdented item at path:',
    path,
    'new depth:',
    outdentedItem.depth,
    'updatedItems:',
    updatedItems
  );
  return updatedItems;
}
//====여기까지 수정됨====
