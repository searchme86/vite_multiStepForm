import { useFormContextWrapper } from '../../../../../components/multiStepForm/hooks/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';

// 코드의 의미: 에러 메시지 표시 서브 컴포넌트
// 왜 사용했는지: 직접 입력 에러 메시지를 독립적으로 관리
function ErrorMessageDisplay() {
  // 코드의 의미: react-hook-form의 컨텍스트 훅 사용
  // 왜 사용했는지: 폼 상태와 메서드를 외부 훅에서 가져옴
  const {
    formState: { errors },
  } = useFormContextWrapper<FormSchemaType>();

  return (
    // 코드의 의미: 에러 메시지 렌더링
    // 왜 사용했는지: 유효성 검사 실패 시 사용자 피드백
    <>
      {errors.email?.fullEmailInput && (
        <p className="text-red-500 text-sm">
          {errors.email.fullEmailInput.message as string}
        </p>
      )}
    </>
  );
}

export default ErrorMessageDisplay;
