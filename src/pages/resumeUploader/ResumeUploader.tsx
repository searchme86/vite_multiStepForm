import DropzoneInputField from '@/components/dropzon/DropzoneInputField';

// 코드의 의미: 이력서 업로드 컴포넌트
// 왜 사용했는지: 이력서 업로드 섹션의 뷰와 로직을 통합 관리
function ResumeUploader() {
  return (
    <div className="space-y-2">
      {/* 코드의 의미: 섹션 제목 표시 */}
      {/* 왜 사용했는지: 사용자에게 이력서 업로드 섹션임을 알림 */}
      <h2 className="text-lg font-semibold">이력서 업로드</h2>

      {/* 코드의 의미: 드롭존 컴포넌트 렌더링 */}
      {/* 왜 사용했는지: 드롭존 UI와 에러 메시지를 직접 관리 */}
      <>
        <div className="space-y-2">
          {/* 코드의 의미: 드롭존 입력 필드 렌더링 */}
          {/* 왜 사용했는지: 공통 컴포넌트를 사용하여 드롭존 UI 제공 */}
          <DropzoneInputField />
        </div>
      </>
    </div>
  );
}

export default ResumeUploader;
