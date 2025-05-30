import { Controller } from 'react-hook-form';
import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import { PhoneInput } from '@/components/backups/PhoneInput';

// 코드의 의미: 전화번호 입력 필드 컴포넌트
// 왜 사용했는지: 국제 전화번호 입력 UI를 제공하며, react-hook-form과 연동
function PhoneNumberField() {
  // 코드의 의미: react-hook-form의 컨텍스트에서 control 객체를 가져옴
  // 왜 사용했는지: 폼 상태와 입력값을 관리하기 위해
  const { control } = useFormContextWrapper<FormSchemaType>();

  // 코드의 의미: Controller로 PhoneInput 컴포넌트를 감싸 폼 상태 관리
  // 왜 사용했는지: ref 전달 문제를 해결하고, 폼 입력값을 react-hook-form과 동기화
  return (
    <div className="flex flex-col gap-2">
      {/* 코드의 의미: 입력 필드의 레이블을 정의 */}
      {/* 왜 사용했는지: 웹 접근성을 위해 레이블을 제공하여 스크린 리더가 필드를 인식하도록 */}
      <label htmlFor="phone" className="flex items-center">
        전화번호
      </label>
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <PhoneInput international id="phone" defaultCountry="KR" {...field} />
        )}
      />
      {/* 코드의 의미: 입력 필드에 대한 설명 텍스트 */}
      {/* 왜 사용했는지: 웹 접근성을 위해 설명을 제공하여 사용자에게 필드의 목적을 알림 */}
      <p className="text-sm text-gray-500">공개적으로 표시되는 번호입니다.</p>
    </div>
  );
}

// 코드의 의미: 컴포넌트를 기본 내보내기로 설정
// 왜 사용했는지: 다른 파일에서 이 컴포넌트를 임포트하여 사용하기 위해
export default PhoneNumberField;
