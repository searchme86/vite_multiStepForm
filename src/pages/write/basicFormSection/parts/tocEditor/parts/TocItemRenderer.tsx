//====여기부터 수정됨====
// 코드의 의미: 목차 항목 렌더링 컴포넌트
// 왜 사용했는지: 개별 li 항목 및 하위 ul 렌더링, 액션 버튼 관리
// 실행 매커니즘: item의 제목, 버튼, subItems를 렌더링, 재귀적 ul 생성
import type { TocItemSchemaType } from '../schema/TocSchema';
import TocActionButtonsRenderer from './TocActionButtonsRenderer';
import { useTocEditorManager } from '../hooks/useTocEditorManager';
import { Input } from '../../../../../../components/ui/input';
import { Button } from '../../../../../../components/ui/button';
import { useState } from 'react';
import TocListRenderer from './TocListRenderer';

// 코드의 의미: 목차 항목 렌더링 컴포넌트
// 왜 사용했는지: li 항목 렌더링, 하위 ul 재귀적 렌더링, 사용자 상호작용 처리
// 실행 매커니즘: item의 제목 표시, 버튼으로 이동/편집/추가, subItems로 하위 목록 렌더링
function TocItemRenderer({
  item,
  index,
  parentPath,
  isLastItem,
}: {
  item: TocItemSchemaType;
  index: number;
  parentPath: string;
  isLastItem: boolean;
}) {
  // 코드의 의미: useTocEditorManager에서 액션 함수 가져오기
  // 왜 사용했는지: 항목 이동, 편집, 삭제, 하위 항목 추가
  const {
    editItem,
    moveItemUp,
    moveItemDown,
    indentItem,
    outdentItem,
    addSubItem,
    deleteItem,
    isAddingSubItem,
    subItemText,
    setSubItemText,
    toggleAddSubItem,
  } = useTocEditorManager();

  // 코드의 의미: 편집 모드와 입력 값 상태 관리
  // 왜 사용했는지: 제목 편집 UI와 데이터 동기화
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.title);

  // 코드의 의미: 현재 항목 경로 계산
  // 왜 사용했는지: 계층 경로로 항목 식별
  const currentPath = parentPath ? `${parentPath}.${index}` : `${index}`;

  // 코드의 의미: 리스트 스타일 계산
  // 왜 사용했는지: depth별 다른 리스트 스타일 적용
  const listStyle =
    item.depth === 0 ? 'disc' : item.depth === 1 ? 'circle' : 'square';

  // 디버깅: 항목 렌더링 정보
  console.log(
    `[TocItemRenderer] Rendering item ${item.id}, title: ${item.title}, depth: ${item.depth}, path: ${currentPath}, subItems:`,
    item.subItems,
    'isLastItem:',
    isLastItem
  );

  // 코드의 의미: 편집 모드 시작
  // 왜 사용했는지: 연필 버튼 클릭으로 편집 모드 활성화
  const startEditing = () => {
    setIsEditing(true);
    setEditText(item.title);
    console.log(
      `[TocItemRenderer] Starting edit for item ${item.id}, title: ${item.title}`
    );
  };

  // 코드의 의미: 편집 저장
  // 왜 사용했는지: 수정 버튼 클릭으로 제목 저장
  const saveEdit = () => {
    if (editText.trim()) {
      editItem(currentPath, editText);
      console.log(
        `[TocItemRenderer] Saving edit for item ${item.id}, new title: ${editText}`
      );
    }
    setIsEditing(false);
  };

  // 코드의 의미: 편집 취소
  // 왜 사용했는지: 취소 버튼 클릭으로 변경 사항 무시
  const cancelEdit = () => {
    setIsEditing(false);
    setEditText(item.title);
    console.log(`[TocItemRenderer] Canceling edit for item ${item.id}`);
  };

  // 코드의 의미: 엔터키로 편집 저장
  // 왜 사용했는지: 편집 입력에서 엔터키 처리
  const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('[TocItemRenderer] Enter key pressed in edit mode');
      saveEdit();
    }
  };

  // 코드의 의미: 하위 항목 추가 입력 처리
  // 왜 사용했는지: + 버튼으로 활성화된 입력에서 엔터키 처리
  const handleSubItemKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('[TocItemRenderer] Enter key pressed in sub-item input');
      addSubItem(currentPath);
    }
  };

  return (
    <li
      className={`flex flex-col ${
        item.depth === 0 ? 'blogContent' : 'subList'
      }`}
      style={{ listStyleType: listStyle, marginLeft: `${item.depth * 20}px` }}
      role="listitem"
      aria-label={`목차 항목: ${item.title}`}
    >
      <div className="flex items-center justify-between w-full gap-2">
        {/* 코드의 의미: 제목 또는 편집 입력 렌더링 */}
        {isEditing ? (
          <Input
            value={editText}
            onChange={(e) => {
              console.log(
                '[TocItemRenderer] Edit input changed:',
                e.target.value
              );
              setEditText(e.target.value);
            }}
            onKeyPress={handleEditKeyPress}
            className="flex-grow text-sm sm:text-base"
            autoFocus
            aria-label="목차 항목 제목 편집"
          />
        ) : (
          <span className="flex-grow text-sm sm:text-base">{item.title}</span>
        )}
        {/* 코드의 의미: 액션 버튼 렌더링 */}
        <TocActionButtonsRenderer
          isEditing={isEditing}
          isFirstItem={index === 0 && !parentPath}
          isAddingSubItem={isAddingSubItem(currentPath)}
          onStartEditing={startEditing}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onMoveUp={() => {
            console.log(
              '[TocItemRenderer] Move up requested for item',
              item.id
            );
            moveItemUp(currentPath);
          }}
          onMoveDown={() => {
            console.log(
              '[TocItemRenderer] Move down requested for item',
              item.id
            );
            moveItemDown(currentPath);
          }}
          onIndent={() => {
            console.log('[TocItemRenderer] Indent requested for item', item.id);
            indentItem(currentPath);
          }}
          onOutdent={() => {
            console.log(
              '[TocItemRenderer] Outdent requested for item',
              item.id
            );
            outdentItem(currentPath);
          }}
          onAddSubItem={() => {
            console.log(
              '[TocItemRenderer] Add sub-item requested for item',
              item.id
            );
            toggleAddSubItem(currentPath);
          }}
          onDelete={() => {
            console.log('[TocItemRenderer] Delete requested for item', item.id);
            deleteItem(currentPath);
          }}
          disabledOutdent={item.depth <= 0}
          disabledDown={isLastItem}
        />
      </div>
      {/* 코드의 의미: 하위 항목 입력 UI */}
      {isAddingSubItem(currentPath) && (
        <div className="flex flex-col gap-2 mt-2 ml-4 sm:flex-row">
          <Input
            value={subItemText}
            onChange={(e) => {
              console.log(
                '[TocItemRenderer] Sub-item input changed:',
                e.target.value
              );
              setSubItemText(e.target.value);
            }}
            onKeyPress={handleSubItemKeyPress}
            placeholder="하위 목차 항목 입력"
            className="flex-grow text-sm sm:text-base"
            autoFocus
            aria-label="하위 목차 항목 입력"
          />
          <Button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              console.log('[TocItemRenderer] Add sub-item button clicked');
              addSubItem(currentPath);
            }}
            className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 sm:text-base sm:px-6 sm:py-2"
            aria-label="하위 목차 항목 추가"
          >
            추가
          </Button>
        </div>
      )}
      {/* 코드의 의미: 하위 항목 목록 렌더링 */}
      {item.subItems && item.subItems.length > 0 && (
        <div className="ml-4">
          <TocListRenderer items={item.subItems} parentPath={currentPath} />
        </div>
      )}
    </li>
  );
}

export default TocItemRenderer;
//====여기까지 수정됨====
