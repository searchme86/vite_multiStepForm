import { useAddressForm } from '../hooks/useAddressForm';
import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import { Input } from '@/components/ui/input'; // shadcn/ui 제공
import { Button } from '@/components/ui/button'; // shadcn/ui 제공
import { Search } from 'lucide-react';

// 코드의 의미: 자동완성 주소 입력 필드 서브 컴포넌트
// 왜 사용했는지: 주소 입력 및 자동완성 기능 제공
function AddressFieldWithAutofill() {
  // 코드의 의미: react-hook-form의 컨텍스트 훅 사용
  // 왜 사용했는지: 폼 상태와 메서드를 외부 훅에서 가져옴
  const { control, setValue } = useFormContextWrapper<FormSchemaType>();

  // 코드의 의미: 주소 관련 상태와 로직 가져오기
  // 왜 사용했는지: 상태와 비즈니스 로직을 외부 훅에서 관리
  const { handleAddressAutofill } = useAddressForm(control, setValue);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="address" className="flex items-center">
        주소
      </label>
      <div className="flex items-center gap-2">
        {/* 코드의 의미: 주소 입력 필드 렌더링 */}
        {/* 왜 사용했는지: 주소 입력 UI 제공 */}
        <Input
          type="text"
          placeholder="주소를 입력하세요"
          id="address"
          {...control.register('address')}
        />
        {/* 코드의 의미: 주소 자동완성 버튼 렌더링 */}
        {/* 왜 사용했는지: 주소 자동완성 기능 트리거 */}
        <Button
          type="button"
          variant="outline"
          onClick={handleAddressAutofill}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          자동완성
        </Button>
      </div>
    </div>
  );
}

export default AddressFieldWithAutofill;
