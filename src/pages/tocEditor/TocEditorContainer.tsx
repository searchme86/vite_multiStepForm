//====여기부터 수정됨====
// 코드의 의미: 목차 편집 컨테이너 컴포넌트
// 왜 사용했는지: 최상위 목차 입력 UI와 목록 렌더링 관리
// 실행 매커니즘: 인풋으로 최상위 항목 추가, TocListRenderer로 계층적 목록 렌더링
import { useFormContextWrapper } from '../../components/multiStepForm/hooks/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import TocListRenderer from './parts/TocListRenderer';
import { useTocEditorManager } from './hooks/useTocEditorManager';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import useTocListStateStore from '../../stores/tocList/tocListStateStore';

// 코드의 의미: 목차 편집 컨테이너 컴포넌트
// 왜 사용했는지: 사용자 입력 UI 제공, 최상위 항목 추가 및 목록 표시
// 실행 매커니즘: useTocEditorManager로 항목 추가, TocListRenderer로 렌더링
function TocEditorContainer() {
  // 코드의 의미: 폼 컨텍스트에서 에러 상태 가져오기
  // 왜 사용했는지: tocItems 에러 표시
  const {
    formState: { errors },
  } = useFormContextWrapper<FormSchemaType>();

  // 코드의 의미: Zustand 스토어에서 tocItems 가져오기
  // 왜 사용했는지: 목차 항목 상태 관리
  const { tocItems } = useTocListStateStore();

  // 코드의 의미: useTocEditorManager 훅에서 입력 관리 함수 가져오기
  // 왜 사용했는지: 최상위 항목 추가 로직 처리
  const { inputText, setInputText, addTopLevelItem } = useTocEditorManager();

  // 코드의 의미: 엔터키 이벤트 처리
  // 왜 사용했는지: 엔터키로 최상위 항목 추가
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log(
        '[TocEditorContainer] Enter key pressed, adding top-level item:',
        inputText
      );
      addTopLevelItem();
    }
  };

  // 디버깅: 컴포넌트 렌더링 정보
  console.log(
    '[TocEditorContainer] Rendering, tocItems:',
    tocItems,
    'inputText:',
    inputText,
    'errors.tocItems:',
    errors.tocItems
  );

  // 코드의 의미: 컴포넌트 렌더링
  // 왜 사용했는지: 입력 UI와 목차 목록 표시
  return (
    <div className="flex flex-col w-full max-w-3xl p-4 mx-auto space-y-4 sm:p-6">
      {/* 코드의 의미: 컴포넌트 제목 */}
      <h2 className="text-lg font-semibold">목차 편집</h2>
      {/* 코드의 의미: 최상위 항목 입력 UI */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={inputText}
          onChange={(e) => {
            console.log('[TocEditorContainer] Input changed:', e.target.value);
            setInputText(e.target.value);
          }}
          onKeyPress={handleKeyPress}
          placeholder="최상위 목차 항목 입력"
          className="flex-grow text-sm sm:text-base"
          aria-label="최상위 목차 항목 입력"
        />
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            console.log('[TocEditorContainer] Add button clicked');
            addTopLevelItem();
          }}
          className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 sm:text-base sm:px-6 sm:py-2"
          aria-label="최상위 목차 항목 추가"
        >
          추가
        </Button>
      </div>
      {/* 코드의 의미: 목차 목록 렌더링 */}
      <TocListRenderer items={tocItems} parentPath="" />
      {/* 코드의 의미: 에러 메시지 렌더링 */}
      {errors.tocItems && (
        <p className="text-sm text-red-500" role="alert">
          {errors.tocItems.message as string}
        </p>
      )}
    </div>
  );
}

export default TocEditorContainer;
//====여기까지 수정됨====
