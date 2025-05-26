//====여기부터 수정됨====
// 코드의 의미: 목차 편집 관리 훅
// 왜 사용했는지: 목차 항목 추가, 삭제, 편집, 이동, 인덴트 로직 캡슐화
// 실행 매커니즘: Zustand와 react-hook-form 상태 관리, 배열 조작
import { useFieldArray } from 'react-hook-form';
import { useFormContextWrapper } from '../../../components/multiStepForm/hooks/useFormContextWrapper';
import type { FormSchemaType } from '../../../schema/FormSchema';
// import type { FormSchemaType } from '@/schema/FormSchema';
import { useState, useEffect } from 'react';
import type { TocItemSchemaType } from '../schema/TocSchema';
import useTocListStateStore from '../../../stores/tocList/tocListStateStore';
import {
  indentItemInArray,
  outdentItemInArray,
  moveItemUpInArray,
  moveItemDownInArray,
} from '../utils/tocArrayUtils';

// 코드의 의미: tocItems 타입 변환
// 왜 사용했는지: depth를 number로 보장
const normalizeTocItem = (item: TocItemSchemaType): TocItemSchemaType => ({
  ...item,
  depth: item.depth ?? 0,
  subItems: item.subItems ? item.subItems.map(normalizeTocItem) : [],
});

// 코드의 의미: 목차 편집 관리 훅
// 왜 사용했는지: 목차 항목의 상태 관리 및 사용자 액션 처리
// 실행 매커니즘: useFieldArray로 폼 상태 관리, Zustand로 UI 상태 관리
export function useTocEditorManager() {
  // 코드의 의미: 폼 컨텍스트에서 control, getValues, setValue 가져오기
  // 왜 사용했는지: 폼 상태 동기화
  const { control, getValues, setValue } =
    useFormContextWrapper<FormSchemaType>();

  // 코드의 의미: Zustand 스토어에서 tocItems 상태 관리
  // 왜 사용했는지: UI 렌더링 상태
  const { tocItems, setTocItems } = useTocListStateStore();

  // 코드의 의미: 입력 텍스트 상태 관리
  // 왜 사용했는지: 최상위 및 하위 항목 입력
  const [inputText, setInputText] = useState<string>('');
  const [subItemText, setSubItemText] = useState<string>('');

  // 코드의 의미: 하위 항목 추가 모드 상태 관리
  // 왜 사용했는지: + 버튼으로 입력 UI 활성화
  const [addingSubItemPath, setAddingSubItemPath] = useState<string | null>(
    null
  );

  // 코드의 의미: useFieldArray로 tocItems 필드 관리
  // 왜 사용했는지: 동적 배열 필드 관리
  const { fields, append, remove, update, replace } = useFieldArray({
    control,
    name: 'tocItems',
  });

  // 코드의 의미: Zustand와 react-hook-form 동기화
  // 왜 사용했는지: Zustand의 tocItems를 react-hook-form fields에 반영
  useEffect(() => {
    if (tocItems.length > 0 && fields.length === 0) {
      const normalizedItems = tocItems.map(normalizeTocItem);
      console.log(
        '[useTocEditorManager] Syncing Zustand tocItems to react-hook-form fields:',
        normalizedItems
      );
      replace(normalizedItems);
      setValue('tocItems', normalizedItems, { shouldValidate: true });
    }
  }, [tocItems, fields, replace, setValue]);

  // 코드의 의미: 최상위 항목 추가
  // 왜 사용했는지: 인풋 텍스트로 최상위 li 생성
  const addTopLevelItem = () => {
    if (!inputText.trim()) {
      console.log(
        '[useTocEditorManager] addTopLevelItem: Empty input text, skipping'
      );
      return;
    }
    const newItem: TocItemSchemaType = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: inputText,
      depth: 0,
      subItems: [],
    };
    console.log('[useTocEditorManager] Adding top-level item:', newItem);
    const updatedItems = [...tocItems, newItem];
    const normalizedItems = updatedItems.map(normalizeTocItem);
    setTocItems(normalizedItems);
    append(newItem);
    setValue('tocItems', normalizedItems, { shouldValidate: true });
    console.log(
      '[useTocEditorManager] Fields after addTopLevelItem:',
      fields,
      'Form tocItems:',
      getValues('tocItems')
    );
    setInputText('');
  };

  // 코드의 의미: 하위 항목 추가
  // 왜 사용했는지: + 버튼으로 하위 ul > li 생성
  const addSubItem = (path: string) => {
    if (!subItemText.trim()) {
      console.log(
        '[useTocEditorManager] addSubItem: Empty subItem text, skipping'
      );
      return;
    }
    const newSubItem: TocItemSchemaType = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: subItemText,
      depth: path.split('.').length,
      subItems: [],
    };
    console.log(
      '[useTocEditorManager] Adding sub-item at path:',
      path,
      newSubItem
    );
    const updatedItems = [...tocItems];
    let current = updatedItems;
    const pathSegments = path.split('.').map(Number);
    for (let i = 0; i < pathSegments.length - 1; i++) {
      current = current[pathSegments[i]].subItems!;
    }
    const targetIndex = pathSegments[pathSegments.length - 1];
    current[targetIndex].subItems!.push(newSubItem);
    const normalizedItems = updatedItems.map(normalizeTocItem);
    setTocItems(normalizedItems);
    setValue('tocItems', normalizedItems, { shouldValidate: true });
    console.log(
      '[useTocEditorManager] Fields after addSubItem:',
      fields,
      'Form tocItems:',
      getValues('tocItems')
    );
    setSubItemText('');
    setAddingSubItemPath(null);
  };

  // 코드의 의미: 하위 항목 입력 모드 토글
  // 왜 사용했는지: + 버튼으로 입력 UI 활성화/비활성화
  const toggleAddSubItem = (path: string) => {
    const newState = addingSubItemPath === path ? null : path;
    console.log(
      '[useTocEditorManager] Toggling add sub-item mode for path:',
      path,
      'newState:',
      newState
    );
    setAddingSubItemPath(newState);
    setSubItemText('');
  };

  // 코드의 의미: 하위 항목 입력 모드 확인
  // 왜 사용했는지: 특정 경로에서 입력 UI 표시 여부
  const isAddingSubItem = (path: string) => {
    const isActive = addingSubItemPath === path;
    console.log(
      '[useTocEditorManager] Checking isAddingSubItem for path:',
      path,
      'isActive:',
      isActive
    );
    return isActive;
  };

  // 코드의 의미: 항목 편집
  // 왜 사용했는지: 제목 수정
  const editItem = (path: string, newTitle: string) => {
    if (!newTitle.trim()) {
      console.log('[useTocEditorManager] editItem: Empty title, skipping');
      return;
    }
    const updatedItems = [...tocItems];
    let current = updatedItems;
    const pathSegments = path.split('.').map(Number);
    for (let i = 0; i < pathSegments.length - 1; i++) {
      current = current[pathSegments[i]].subItems!;
    }
    const targetIndex = pathSegments[pathSegments.length - 1];
    current[targetIndex].title = newTitle;
    console.log(
      '[useTocEditorManager] Editing item at path:',
      path,
      'newTitle:',
      newTitle
    );
    const normalizedItems = updatedItems.map(normalizeTocItem);
    setTocItems(normalizedItems);
    setValue('tocItems', normalizedItems, { shouldValidate: true });
    console.log(
      '[useTocEditorManager] Fields after editItem:',
      fields,
      'Form tocItems:',
      getValues('tocItems')
    );
  };

  // 코드의 의미: 항목 위로 이동
  // 왜 사용했는지: ^ 버튼으로 항목 순서 변경 또는 상위 뎁스 이동
  const moveItemUp = (path: string) => {
    const updatedItems = moveItemUpInArray(tocItems, path);
    console.log(
      '[useTocEditorManager] Moving item up at path:',
      path,
      'updatedItems:',
      updatedItems
    );
    const normalizedItems = updatedItems.map(normalizeTocItem);
    setTocItems(normalizedItems);
    // react-hook-form 동기화
    const pathSegments = path.split('.').map(Number);
    if (
      pathSegments.length > 1 &&
      pathSegments[pathSegments.length - 1] === 0
    ) {
      // 상위 뎁스로 이동한 경우
      let current = updatedItems;
      for (let i = 0; i < pathSegments.length - 2; i++) {
        current = current[pathSegments[i]].subItems!;
      }
      const parentIndex = pathSegments[pathSegments.length - 2];
      const newIndex = parentIndex + 1;
      update(newIndex, current[newIndex]);
      const oldFieldIndex = fields.findIndex(
        (field) => field.id === current[newIndex].id
      );
      if (oldFieldIndex !== -1 && oldFieldIndex !== newIndex) {
        remove(oldFieldIndex);
        console.log(
          '[useTocEditorManager] Removed old field at index:',
          oldFieldIndex,
          'item ID:',
          current[newIndex].id
        );
      }
    }
    setValue('tocItems', normalizedItems, { shouldValidate: true });
    console.log(
      '[useTocEditorManager] Fields after moveItemUp:',
      fields,
      'Form tocItems:',
      getValues('tocItems')
    );
  };

  // 코드의 의미: 항목 아래로 이동
  // 왜 사용했는지: v 버튼으로 항목 순서 변경 또는 하위 뎁스 이동
  const moveItemDown = (path: string) => {
    const updatedItems = moveItemDownInArray(tocItems, path);
    console.log(
      '[useTocEditorManager] Moving item down at path:',
      path,
      'updatedItems:',
      updatedItems
    );
    const normalizedItems = updatedItems.map(normalizeTocItem);
    setTocItems(normalizedItems);
    // react-hook-form 동기화
    const pathSegments = path.split('.').map(Number);
    if (pathSegments.length > 0 && pathSegments[pathSegments.length - 1] > 0) {
      // 하위 뎁스로 이동한 경우
      let current = updatedItems;
      for (let i = 0; i < pathSegments.length - 1; i++) {
        current = current[pathSegments[i]].subItems!;
      }
      const targetIndex = pathSegments[pathSegments.length - 1];
      const prevIndex = targetIndex - 1;
      if (targetIndex === current.length - 1 && prevIndex >= 0) {
        const prevFieldIndex =
          pathSegments.slice(0, -1).reduce((acc, idx, i) => {
            if (i === 0) return idx;
            return acc + idx;
          }, 0) + prevIndex;
        update(prevFieldIndex, current[prevIndex]);
        const oldFieldIndex = fields.findIndex(
          (field) => field.id === current[prevIndex].subItems!.slice(-1)[0].id
        );
        if (oldFieldIndex !== -1) {
          remove(oldFieldIndex);
          console.log(
            '[useTocEditorManager] Removed old field at index:',
            oldFieldIndex,
            'item ID:',
            current[prevIndex].subItems!.slice(-1)[0].id
          );
        }
      }
    }
    setValue('tocItems', normalizedItems, { shouldValidate: true });
    console.log(
      '[useTocEditorManager] Fields after moveItemDown:',
      fields,
      'Form tocItems:',
      getValues('tocItems')
    );
  };

  // 코드의 의미: 항목 인덴트
  // 왜 사용했는지: > 버튼으로 depth 증가, subItems 추가
  const indentItem = (path: string) => {
    const updatedItems = indentItemInArray(tocItems, path);
    console.log(
      '[useTocEditorManager] Indenting item at path:',
      path,
      'updatedItems:',
      updatedItems
    );
    const normalizedItems = updatedItems.map(normalizeTocItem);
    setTocItems(normalizedItems);
    // react-hook-form 동기화
    const pathSegments = path.split('.').map(Number);
    let current = updatedItems;
    for (let i = 0; i < pathSegments.length - 1; i++) {
      current = current[pathSegments[i]].subItems!;
    }
    const targetIndex = pathSegments[pathSegments.length - 1];
    const parentIndex = targetIndex - 1;
    if (parentIndex >= 0) {
      const parentPathSegments = pathSegments.slice(0, -1);
      const parentFieldIndex =
        parentPathSegments.reduce((acc, idx, i) => {
          if (i === 0) return idx;
          return acc + idx;
        }, 0) + parentIndex;
      update(parentFieldIndex, current[parentIndex]);
      console.log(
        '[useTocEditorManager] Updated parent item at index:',
        parentFieldIndex,
        'item:',
        current[parentIndex]
      );
    }
    const fieldIndex = fields.findIndex(
      (field) => field.id === current[targetIndex].id
    );
    if (fieldIndex !== -1) {
      remove(fieldIndex);
      console.log(
        '[useTocEditorManager] Removed field at index:',
        fieldIndex,
        'item ID:',
        current[targetIndex].id
      );
    }
    setValue('tocItems', normalizedItems, { shouldValidate: true });
    console.log(
      '[useTocEditorManager] Fields after indentItem:',
      fields,
      'Form tocItems:',
      getValues('tocItems')
    );
  };

  // 코드의 의미: 항목 아웃덴트
  // 왜 사용했는지: < 버튼으로 depth 감소, subItems 제거
  const outdentItem = (path: string) => {
    const updatedItems = outdentItemInArray(tocItems, path);
    console.log(
      '[useTocEditorManager] Outdenting item at path:',
      path,
      'updatedItems:',
      updatedItems
    );
    const normalizedItems = updatedItems.map(normalizeTocItem);
    setTocItems(normalizedItems);
    setValue('tocItems', normalizedItems, { shouldValidate: true });
    console.log(
      '[useTocEditorManager] Fields after outdentItem:',
      fields,
      'Form tocItems:',
      getValues('tocItems')
    );
  };

  // 코드의 의미: 항목 삭제
  // 왜 사용했는지: 휴지통 버튼으로 항목 제거
  const deleteItem = (path: string) => {
    const updatedItems = [...tocItems];
    let current = updatedItems;
    const pathSegments = path.split('.').map(Number);
    for (let i = 0; i < pathSegments.length - 1; i++) {
      current = current[pathSegments[i]].subItems!;
    }
    const targetIndex = pathSegments[pathSegments.length - 1];
    const [deletedItem] = current.splice(targetIndex, 1);
    console.log(
      '[useTocEditorManager] Deleting item at path:',
      path,
      'deletedItem:',
      deletedItem,
      'updatedItems:',
      updatedItems
    );
    const normalizedItems = updatedItems.map(normalizeTocItem);
    setTocItems(normalizedItems);
    const fieldIndex = fields.findIndex((field) => field.id === deletedItem.id);
    if (fieldIndex !== -1) {
      remove(fieldIndex);
      console.log(
        '[useTocEditorManager] Removed field at index:',
        fieldIndex,
        'item ID:',
        deletedItem.id
      );
    }
    setValue('tocItems', normalizedItems, { shouldValidate: true });
    console.log(
      '[useTocEditorManager] Fields after deleteItem:',
      fields,
      'Form tocItems:',
      getValues('tocItems')
    );
  };

  // 디버깅: 초기 상태 확인
  console.log(
    '[useTocEditorManager] Initial fields:',
    fields,
    'Initial form tocItems:',
    getValues('tocItems')
  );

  return {
    inputText,
    setInputText,
    subItemText,
    setSubItemText,
    addTopLevelItem,
    addSubItem,
    toggleAddSubItem,
    isAddingSubItem,
    editItem,
    moveItemUp,
    moveItemDown,
    indentItem,
    outdentItem,
    deleteItem,
    fields,
  };
}
//====여기까지 수정됨====
