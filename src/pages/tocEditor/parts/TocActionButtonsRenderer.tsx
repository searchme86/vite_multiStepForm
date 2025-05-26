//====여기부터 수정됨====
// 코드의 의미: 목차 액션 버튼 렌더링 컴포넌트
// 왜 사용했는지: 항목 이동, 인덴트, 편집, 삭제 버튼 UI 제공
// 실행 매커니즘: 버튼 클릭으로 각 액션 호출
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Save,
  X,
  Plus,
} from 'lucide-react';

// 코드의 의미: 액션 버튼 렌더링 컴포넌트
// 왜 사용했는지: TocItemRenderer의 액션 버튼 렌더링
// 실행 매커니즘: isEditing, isFirstItem 등 조건에 따라 버튼 표시
function TocActionButtonsRenderer({
  isEditing,
  isFirstItem,
  isAddingSubItem,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onMoveUp,
  onMoveDown,
  onIndent,
  onOutdent,
  onAddSubItem,
  onDelete,
  disabledOutdent,
  disabledDown,
}: {
  isEditing: boolean;
  isFirstItem: boolean;
  isAddingSubItem: boolean;
  onStartEditing: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onIndent: () => void;
  onOutdent: () => void;
  onAddSubItem: () => void;
  onDelete: () => void;
  disabledOutdent?: boolean;
  disabledDown?: boolean;
}) {
  // 디버깅: 버튼 상태 확인
  console.log(
    '[TocActionButtonsRenderer] Rendering buttons, isEditing:',
    isEditing,
    'isFirstItem:',
    isFirstItem,
    'isAddingSubItem:',
    isAddingSubItem,
    'disabledOutdent:',
    disabledOutdent,
    'disabledDown:',
    disabledDown
  );

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {!isEditing && !isFirstItem && (
        <>
          {/* 코드의 의미: 위로 이동 버튼 */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log('[TocActionButtonsRenderer] Move up button clicked');
              onMoveUp();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              console.log('[TocActionButtonsRenderer] Move up button touched');
              onMoveUp();
            }}
            className="flex items-center p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            aria-label="항목 위로 이동"
          >
            <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          {/* 코드의 의미: 아래로 이동 버튼 */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log(
                '[TocActionButtonsRenderer] Move down button clicked'
              );
              onMoveDown();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              console.log(
                '[TocActionButtonsRenderer] Move down button touched'
              );
              onMoveDown();
            }}
            disabled={disabledDown}
            className="flex items-center p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            aria-label="항목 아래로 이동"
            aria-disabled={disabledDown}
          >
            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          {/* 코드의 의미: 인덴트 버튼 */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log('[TocActionButtonsRenderer] Indent button clicked');
              onIndent();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              console.log('[TocActionButtonsRenderer] Indent button touched');
              onIndent();
            }}
            className="flex items-center p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            aria-label="항목 들여쓰기"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          {/* 코드의 의미: 아웃덴트 버튼 */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log('[TocActionButtonsRenderer] Outdent button clicked');
              onOutdent();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              console.log('[TocActionButtonsRenderer] Outdent button touched');
              onOutdent();
            }}
            disabled={disabledOutdent}
            className="flex items-center p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            aria-label="항목 내어쓰기"
            aria-disabled={disabledOutdent}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </>
      )}
      {/* 코드의 의미: 하위 항목 추가 버튼 */}
      {!isEditing && !isAddingSubItem && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            console.log(
              '[TocActionButtonsRenderer] Add sub-item button clicked'
            );
            onAddSubItem();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            console.log(
              '[TocActionButtonsRenderer] Add sub-item button touched'
            );
            onAddSubItem();
          }}
          className="flex items-center p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          aria-label="하위 목차 항목 추가"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      )}
      {/* 코드의 의미: 편집/저장/취소 버튼 */}
      {isEditing ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log(
                '[TocActionButtonsRenderer] Save edit button clicked'
              );
              onSaveEdit();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              console.log(
                '[TocActionButtonsRenderer] Save edit button touched'
              );
              onSaveEdit();
            }}
            className="flex items-center p-1 rounded bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            aria-label="편집 저장"
          >
            <Save className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log(
                '[TocActionButtonsRenderer] Cancel edit button clicked'
              );
              onCancelEdit();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              console.log(
                '[TocActionButtonsRenderer] Cancel edit button touched'
              );
              onCancelEdit();
            }}
            className="flex items-center p-1 rounded bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base"
            aria-label="편집 취소"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            console.log(
              '[TocActionButtonsRenderer] Start editing button clicked'
            );
            onStartEditing();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            console.log(
              '[TocActionButtonsRenderer] Start editing button touched'
            );
            onStartEditing();
          }}
          className="flex items-center p-1 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          aria-label="항목 편집"
        >
          <Pencil className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
        </button>
      )}
      {/* 코드의 의미: 삭제 버튼 */}
      {!isEditing && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            console.log('[TocActionButtonsRenderer] Delete button clicked');
            onDelete();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            console.log('[TocActionButtonsRenderer] Delete button touched');
            onDelete();
          }}
          className="flex items-center p-1 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
          aria-label="항목 삭제"
        >
          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
        </button>
      )}
    </div>
  );
}

export default TocActionButtonsRenderer;
//====여기까지 수정됨====
