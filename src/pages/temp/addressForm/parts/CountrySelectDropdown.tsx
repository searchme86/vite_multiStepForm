import { useAddressForm } from '../hooks/useAddressForm';
import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // shadcn/ui 제공
import { Country } from '../utils/countries/countries';

// 코드의 의미: 국가 선택 드롭다운 서브 컴포넌트
// 왜 사용했는지: 국가 선택 드롭다운 UI를 독립적으로 관리
function CountrySelectDropdown() {
  // 코드의 의미: react-hook-form의 컨텍스트 훅 사용
  // 왜 사용했는지: 폼 상태와 메서드를 외부 훅에서 가져옴
  const { control, setValue } = useFormContextWrapper<FormSchemaType>();

  // 코드의 의미: 주소 관련 상태와 로직 가져오기
  // 왜 사용했는지: 상태와 비즈니스 로직을 외부 훅에서 관리
  const { country, handleCountryChange } = useAddressForm(control, setValue);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="country" className="flex items-center">
        국가
      </label>
      <Select onValueChange={handleCountryChange} value={country}>
        <SelectTrigger id="country">
          <SelectValue placeholder="국가를 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {Country.countryNames().map((country) => (
            <SelectItem key={country.code} value={country.code.toLowerCase()}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default CountrySelectDropdown;
