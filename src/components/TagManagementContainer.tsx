import { useFormContext } from 'react-hook-form';
import TagAutoComplete from './TagAutoComplete';
import TagList from './TagList';
import { useTagManagement } from './useTagManagement';
import type { blogPostSchemaType } from '../pages/write/schema/blogPostSchema';

// 컴포넌트: 태그 관리 컨테이너
// - 의미: 태그 입력과 표시를 통합한 UI 컨테이너
// - 사용 이유: 태그 관련 모든 기능을 하나로 묶어 관리
function TagManagementContainer() {
  // 폼 컨텍스트 가져오기
  // - 의미: React Hook Form의 폼 상태에 접근
  // - 사용 이유: blogPostSchemaType 기반 폼 데이터와 태그 상태 동기화
  const formContext = useFormContext<blogPostSchemaType>();

  // 폼 컨텍스트가 없는 경우 에러 처리
  // - 의미: 폼 프로바이더 외부에서 사용된 경우 처리
  // - 사용 이유: 런타임 에러 방지 및 사용자에게 명확한 안내
  if (!formContext) {
    return (
      <div className="text-red-500" role="alert">
        {/* role="alert": 스크린 리더에게 중요한 오류임을 알림 */}
        오류: 폼 컨텍스트를 찾을 수 없습니다.
      </div>
    );
  }

  // 태그 관리 훅 사용
  // - 의미: 태그 추가, 삭제, 상태 관리 로직 분리
  // - 사용 이유: 컴포넌트와 비즈니스 로직 분리로 재사용성 향상
  const { tags, handleAddTags, handleRemoveTag, tagError } = useTagManagement();

  return (
    // 태그 관리 전체 컨테이너
    // - 의미: 태그 입력과 표시 영역을 포함하는 컨테이너
    // - 사용 이유: 시각적 그룹핑과 레이아웃 관리
    <div className="flex flex-col gap-4" role="region" aria-label="태그 관리">
      {/* role="region": 페이지의 의미있는 섹션임을 나타냄 */}
      {/* aria-label: 스크린 리더 사용자에게 영역의 목적 설명 */}

      {/* 태그 입력 컴포넌트 */}
      {/* - 의미: 새로운 태그를 입력하는 인터페이스 */}
      {/* - 사용 이유: 사용자가 태그를 추가할 수 있는 UI 제공 */}
      <TagAutoComplete onAddTags={handleAddTags} />

      {/* 태그 목록 표시 컴포넌트 */}
      {/* - 의미: 현재 추가된 태그들을 시각적으로 표시 */}
      {/* - 사용 이유: 사용자가 추가된 태그를 확인하고 관리할 수 있게 함 */}
      <TagList tags={tags} onRemoveTag={handleRemoveTag} />

      {/* 태그 에러 메시지 표시 */}
      {/* - 의미: Zod 스키마 검증 에러 표시 */}
      {/* - 사용 이유: 사용자에게 태그 관련 검증 오류 알림 */}
      {tagError && (
        <div
          className="text-sm text-red-500"
          role="alert"
          aria-live="assertive"
        >
          {tagError}
        </div>
      )}
    </div>
  );
}

export default TagManagementContainer;
