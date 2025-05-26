import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import AddressInputComponent from './parts/AddressInputComponent';

// 코드의 의미: 주소 입력 폼 컴포넌트
// 왜 사용했는지: 주소 입력 섹션의 뷰와 로직을 통합 관리
function AddressForm() {
  // 코드의 의미: react-hook-form의 컨텍스트 훅 사용
  // 왜 사용했는지: 폼 상태와 메서드를 외부 훅에서 가져옴
  const {
    formState: { errors },
  } = useFormContextWrapper<FormSchemaType>();

  return (
    <div className="space-y-2">
      {/* 코드의 의미: 섹션 제목 표시 */}
      {/* 왜 사용했는지: 사용자에게 주소 입력 섹션임을 알림 */}
      <h2 className="text-lg font-semibold">주소 입력</h2>

      {/* 코드의 의미: 주소 입력 컴포넌트 렌더링 */}
      {/* 왜 사용했는지: 주소 입력 UI 제공 */}
      <AddressInputComponent />

      {/* 코드의 의미: 에러 메시지 표시 */}
      {/* 왜 사용했는지: 유효성 검사 실패 시 사용자 피드백 */}
      {errors.address && (
        <p className="text-red-500 text-sm">
          {errors.address.message as string}
        </p>
      )}
    </div>
  );
}

export default AddressForm;
