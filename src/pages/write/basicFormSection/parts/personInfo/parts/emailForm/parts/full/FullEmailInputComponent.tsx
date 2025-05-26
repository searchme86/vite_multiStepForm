import EmailInputField from './EmailInputField';
import ErrorMessageDisplay from './ErrorMessageDisplay';

// 코드의 의미: 직접 이메일 입력 서브 컴포넌트
// 왜 사용했는지: 이메일 입력 필드와 에러 메시지를 통합
function FullEmailInputComponent() {
  return (
    <div className="space-y-2">
      {/* 코드의 의미: 이메일 입력 필드 렌더링 */}
      {/* 왜 사용했는지: 직접 이메일 입력 UI 제공 */}
      <EmailInputField />

      {/* 코드의 의미: 에러 메시지 렌더링 */}
      {/* 왜 사용했는지: 유효성 검사 실패 시 사용자 피드백 */}
      <ErrorMessageDisplay />
    </div>
  );
}

export default FullEmailInputComponent;
