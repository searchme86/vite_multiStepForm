import { useCallback, useEffect } from 'react';
import { fetchAddress } from '../utils/FetchAddress';
import type { Control, UseFormSetValue } from 'react-hook-form';
import type { FormSchemaType } from '@/schema/FormSchema';
import { Country } from '../utils/countries/countries';

// 코드의 의미: 주소 폼 상태와 로직을 관리하는 커스텀 훅
// 왜 사용했는지: 주소 입력 관련 상태와 로직을 캡슐화
export const useAddressForm = (
  control: Control<FormSchemaType>,
  setValue: UseFormSetValue<FormSchemaType>
) => {
  // 코드의 의미: 폼 필드 값 가져오기
  // 왜 사용했는지: 현재 폼 상태를 참조
  const { country, state, address } = control._formValues as FormSchemaType;

  // 코드의 의미: 국가 변경 핸들러
  // 왜 사용했는지: 국가 변경 시 관련 필드 업데이트
  const handleCountryChange = useCallback(
    (value: string) => {
      // 코드의 의미: 국가 존재 여부 확인
      // 왜 사용했는지: 유효하지 않은 국가 코드 입력 방지
      if (Country.countryExists(value)) {
        setValue('country', value);
        setValue('state', ''); // 코드의 의미: 국가 변경 시 주/도 초기화
        // 왜 사용했는지: 국가 변경 시 종속 필드 초기화
        setValue('city', ''); // 코드의 의미: 국가 변경 시 도시 초기화
        // 왜 사용했는지: 국가 변경 시 종속 필드 초기화
      } else {
        setValue('country', '');
        setValue('state', '');
        setValue('city', '');
      }
    },
    [setValue]
  );

  // 코드의 의미: 주/도 변경 핸들러
  // 왜 사용했는지: 주/도 변경 시 관련 필드 업데이트
  const handleStateChange = useCallback(
    (value: string) => {
      // 코드의 의미: 주/도 존재 여부 확인
      // 왜 사용했는지: 유효하지 않은 주/도 입력 방지
      if (country && Country.getStateNames(country).includes(value)) {
        setValue('state', value);
        setValue('city', ''); // 코드의 의미: 주/도 변경 시 도시 초기화
        // 왜 사용했는지: 주/도 변경 시 종속 필드 초기화
      } else {
        setValue('state', '');
        setValue('city', '');
      }
    },
    [country, setValue]
  );

  // 코드의 의미: 주소 자동완성 핸들러
  // 왜 사용했는지: 주소 자동완성 API 호출 및 필드 업데이트
  const handleAddressAutofill = useCallback(async () => {
    if (!address) return;

    try {
      // 코드의 의미: 주소 자동완성 API 호출
      // 왜 사용했는지: 입력된 주소로 관련 데이터 가져오기
      const result = await fetchAddress(address);

      if (result) {
        // 코드의 의미: API 결과로 폼 필드 업데이트
        // 왜 사용했는지: 자동완성 데이터로 필드 채우기
        setValue('country', result.country);
        setValue('state', result.state);
        setValue('city', result.city);
        setValue('zip', result.zip);
        setValue('timezone', result.timezone);
      }
    } catch (error) {
      console.error('주소 자동완성 실패:', error);
    }
  }, [address, setValue]);

  // 코드의 의미: 국가와 주/도 변경 시 시간대 업데이트
  // 왜 사용했는지: 시간대 필드를 동적으로 설정
  useEffect(() => {
    if (country && state && Country.countryExists(country)) {
      // 실제 시간대 로직은 외부 API 또는 유틸리티 함수로 대체 가능
      setValue('timezone', `${country}/${state}`); // 예시 시간대
    } else {
      setValue('timezone', '');
    }
  }, [country, state, setValue]);

  return {
    country,
    state,
    handleCountryChange,
    handleStateChange,
    handleAddressAutofill,
  };
};
