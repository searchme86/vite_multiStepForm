// import { useFieldArray } from 'react-hook-form';
// import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
// import type { FormSchemaType } from '@/schema/FormSchema';

// // 코드의 의미: 경력 정보 상태와 로직을 관리하는 커스텀 훅
// // 왜 사용했는지: 경력 정보 입력 관련 상태와 로직을 캡슐화
// export const useWorkExperience = () => {
//   // 코드의 의미: react-hook-form의 컨텍스트 훅 사용
//   // 왜 사용했는지: 폼 상태와 메서드를 외부 훅에서 가져옴
//   const { control } = useFormContextWrapper<FormSchemaType>();

//   // 코드의 의미: useFieldArray 훅으로 동적 배열 관리
//   // 왜 사용했는지: 경력 정보 배열을 동적으로 관리
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: 'jobs',
//   });

//   // console.log('useWorkExperience,control ', control);
//   console.log('useWorkExperience,fields ', fields);

//   return { fields, append, remove };
// };
