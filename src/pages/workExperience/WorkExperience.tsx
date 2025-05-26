import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import JobFormComponent from './parts/JobFormComponent';
import JobListComponent from './parts/JobListComponent';
import { useFieldArray } from 'react-hook-form';
import useStepFormStore from '@/stores/multiStepFormState/StepFormStateStore';
import { useEffect } from 'react';

// 코드의 의미: 경력 정보 입력 컴포넌트
// 왜 사용했는지: 경력 정보 입력 섹션의 뷰와 로직을 통합 관리
function WorkExperience() {
  const {
    formState: { errors },
    control,
  } = useFormContextWrapper<FormSchemaType>();

  // 코드의 의미: useFieldArray 훅으로 동적 배열 관리
  // 왜 사용했는지: 경력 정보 배열을 동적으로 관리
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'jobs',
  });

  // Zustand 스토어에서 상태 관리 액션 가져오기
  const { setFields, setAppend, setRemove } = useStepFormStore();

  // useFieldArray 상태를 Zustand 스토어에 동기화
  useEffect(() => {
    setFields(fields);
    setAppend(append);
    setRemove(remove);
  }, [fields, append, remove, setFields, setAppend, setRemove]);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">경력 정보</h2>
      <JobListComponent />
      <JobFormComponent />
      {errors.jobs && (
        <p className="text-red-500 text-sm">{errors.jobs.message as string}</p>
      )}
    </div>
  );
}

export default WorkExperience;
