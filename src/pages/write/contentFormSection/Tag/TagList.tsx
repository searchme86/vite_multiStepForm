import { Button } from '../../../../components/ui/button';

// 인터페이스: 태그 목록 컴포넌트 props
// - 의미: 태그 배열과 삭제 콜백 함수 정의
// - 사용 이유: 타입 안전성과 컴포넌트 재사용성 확보
interface TagListProps {
  tags: string[]; // blogPostSchemaType의 tags 필드 타입과 일치
  onRemoveTag: (tagToRemove: string) => void; // 태그 삭제 콜백 함수
}

// 컴포넌트: 태그 목록 표시
// - 의미: 태그들을 칩 형태로 표시하고 개별 삭제 기능 제공
// - 사용 이유: 직관적인 태그 관리 UI 제공
function TagList({ tags, onRemoveTag }: TagListProps) {
  // 태그가 없는 경우 처리
  // - 의미: 빈 태그 배열일 때 안내 메시지 표시
  // - 사용 이유: 사용자에게 현재 상태를 명확히 알림
  if (!tags || tags.length === 0) {
    return (
      <div className="text-sm text-gray-500" role="status">
        {/* role="status": 현재 상태 정보임을 스크린 리더에게 알림 */}
        추가된 태그가 없습니다.
      </div>
    );
  }

  return (
    // 태그 목록 컨테이너
    // - 의미: 태그들을 가로로 나열하는 플렉스 컨테이너
    // - 사용 이유: 태그들을 시각적으로 그룹핑하고 반응형 레이아웃 제공
    <div
      className="flex flex-wrap gap-2"
      role="list"
      aria-label={`${tags.length}개의 태그`}
    >
      {/* role="list": 태그들이 목록임을 스크린 리더에게 알림 */}
      {/* aria-label: 전체 태그 개수 정보 제공 */}

      {/* 태그 배열을 순회하며 각 태그를 렌더링 */}
      {/* - 의미: 각 태그를 개별 아이템으로 표시 */}
      {/* - 사용 이유: 동적으로 태그 개수만큼 UI 생성 */}
      {tags.map((tag, index) => (
        <div
          key={`${tag}-${index}`} // 고유 키로 React 렌더링 최적화
          className="flex items-center px-3 py-1 text-sm bg-gray-200 rounded-full"
          role="listitem" // 목록의 개별 아이템임을 명시
        >
          {/* 태그 텍스트 표시 */}
          {/* - 의미: 실제 태그 내용을 화면에 표시 */}
          {/* - 사용 이유: 사용자가 태그 내용을 확인할 수 있게 함 */}
          <span className="text-gray-800">{tag}</span>

          {/* 태그 삭제 버튼 */}
          {/* - 의미: 개별 태그를 삭제하는 버튼 */}
          {/* - 사용 이유: 사용자가 불필요한 태그를 제거할 수 있게 함 */}
          <Button
            type="button" // 폼 제출 방지
            onClick={() => onRemoveTag(tag)} // 클릭 시 해당 태그 삭제
            className="h-auto p-1 ml-2 text-gray-600 rounded-full hover:text-red-600 hover:bg-red-100"
            aria-label={`태그 ${tag} 삭제`} // 스크린 리더용 설명
            title={`${tag} 태그 삭제`} // 마우스 호버 시 툴팁
          >
            {/* ✕ 문자로 삭제 아이콘 표현 */}
            {/* - 의미: 삭제 기능을 나타내는 시각적 아이콘 */}
            {/* - 사용 이유: 직관적인 UI 제공 */}
            <span aria-hidden="true">×</span>
            {/* aria-hidden="true": 스크린 리더는 무시하고 시각적으로만 표시 */}
          </Button>
        </div>
      ))}
    </div>
  );
}

export default TagList;
