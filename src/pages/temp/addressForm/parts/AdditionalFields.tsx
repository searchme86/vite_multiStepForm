import { useAddressForm } from '../hooks/useAddressForm.ts';
import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import { Input } from '@/components/ui/input'; // shadcn/ui 제공
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select.tsx'; // shadcn/ui 제공
import { Country } from '../utils/countries/countries.ts';

// 코드의 의미: 추가 필드 (도시, 우편번호, 시간대 등) 서브 컴포넌트
// 왜 사용했는지: 추가 필드 UI를 독립적으로 관리
function AdditionalFields() {
  // 코드의 의미: react-hook-form의 컨텍스트 훅 사용
  // 왜 사용했는지: 폼 상태와 메서드를 외부 훅에서 가져옴
  const { control, setValue } = useFormContextWrapper<FormSchemaType>();

  // 코드의 의미: 주소 관련 상태와 로직 가져오기
  // 왜 사용했는지: 상태와 비즈니스 로직을 외부 훅에서 관리
  const { country, state } = useAddressForm(control, setValue);

  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="city" className="flex items-center">
          도시
        </label>
        <Select
          onValueChange={(value) => setValue('city', value.toLowerCase())}
          disabled={!country || !state}
          {...control.register('city')}
        >
          <SelectTrigger id="city">
            <SelectValue placeholder="도시를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {state &&
              country &&
              Country.getCityNames(country, state).map((city) => (
                <SelectItem key={city} value={city.toLowerCase()}>
                  {city}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="zip" className="flex items-center">
          우편번호
        </label>
        <Input
          type="text"
          placeholder="우편번호를 입력하세요"
          id="zip"
          {...control.register('zip')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="timezone" className="flex items-center">
          시간대
        </label>
        <Input
          disabled
          id="timezone"
          placeholder="시간대를 입력하세요"
          {...control.register('timezone')}
        />
      </div>
    </>
  );
}

export default AdditionalFields;
