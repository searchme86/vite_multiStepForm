import AddressFieldWithAutofill from './AddressFieldWithAutofill';
import CountrySelectDropdown from './CountrySelectDropdown';
import StateSelectDropdown from './StateSelectDropdown';
import AdditionalFields from './AdditionalFields';

// 코드의 의미: 주소 입력 서브 컴포넌트
// 왜 사용했는지: 주소 입력 필드와 관련 컴포넌트를 통합
function AddressInputComponent() {
  return (
    <div className="space-y-2">
      {/* 코드의 의미: 주소 자동완성 입력 필드 렌더링 */}
      {/* 왜 사용했는지: 주소 입력 UI 제공 */}
      <AddressFieldWithAutofill />

      {/* 코드의 의미: 국가 선택 드롭다운 렌더링 */}
      {/* 왜 사용했는지: 국가 선택 UI 제공 */}
      <CountrySelectDropdown />

      {/* 코드의 의미: 주/도 선택 드롭다운 렌더링 */}
      {/* 왜 사용했는지: 주/도 선택 UI 제공 */}
      <StateSelectDropdown />

      {/* 코드의 의미: 추가 필드 렌더링 */}
      {/* 왜 사용했는지: 도시, 우편번호, 시간대 입력 UI 제공 */}
      <AdditionalFields />
    </div>
  );
}

export default AddressInputComponent;
