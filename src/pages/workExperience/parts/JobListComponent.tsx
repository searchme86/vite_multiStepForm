import useStepFormStore from '@/stores/multiStepFormState/StepFormStateStore';
import JobItemMotion from './partsFunc/JobItemMotion';
import JobItemHeader from './JobItemHeader';
import JobInputForm from './partsForm/JobInputForm';

// 코드의 의미: 직업 목록 서브 컴포넌트
// 왜 사용했는지: 직업 항목 목록과 입력 폼 제공
function JobListComponent() {
  const { fields, remove } = useStepFormStore();

  console.log('JobListComponent, fields:', fields);

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <JobItemMotion key={field.id}>
          <JobItemHeader index={index} onRemove={() => remove(index)} />
          <JobInputForm field={field} index={index} />
        </JobItemMotion>
      ))}
    </div>
  );
}

export default JobListComponent;
