//====여기부터 수정됨====
// 코드의 의미: 폼 설정 훅
// 왜 사용했는지: react-hook-form의 폼 설정을 초기화
// 수정 이유: 훅 호출 최상단 보장, 디버깅 로그 추가
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';
import type { FormSchemaType } from '@/schema/FormSchema';

// 코드의 의미: 폼 설정 훅 정의
// 왜 사용했는지: 폼 초기화와 유효성 검사 설정
// 실행 매커니즘: useForm으로 폼 설정, zodResolver로 유효성 검사
export const useFormSetup = <T extends ZodSchema>(
  schema: T
): UseFormReturn<FormSchemaType> => {
  // 코드의 의미: 폼 초기화
  // 왜 사용했는지: zod 스키마로 유효성 검사, 기본값 설정
  // 실행 매커니즘: useForm을 최상단에서 호출, 폼 상태 초기화
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: {
        fullEmailInput: '',
        splitEmailInput: {
          userLocalPart: '',
          emailRest: '',
        },
      },
      jobs: [],
      github: '',
      portfolio: '',
      resume: [],
      tocItems: [],
    },
    mode: 'onChange',
  });

  // 디버깅: 폼 초기화 상태 출력
  console.log(
    '[useFormSetup] Form initialized with defaultValues:',
    form.getValues()
  );

  return form;
};
//====여기까지 수정됨====
