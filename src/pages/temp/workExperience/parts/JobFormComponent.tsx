import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import useStepFormStore from '@/stores/multiStepFormState/StepFormStateStore';
import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';

// 코드의 의미: 직업 정보 추가 버튼 서브 컴포넌트
// 왜 사용했는지: 새로운 직업 항목 추가 기능 제공
function JobFormComponent() {
  const { append } = useStepFormStore();
  const { watch } = useFormContextWrapper<FormSchemaType>();

  console.log('JobFormComponent - append:', append);

  return (
    <Button
      type="button"
      onClick={() => {
        append({
          title: '',
          company: '',
          from: new Date(),
          to: new Date(),
          description: '',
        });
        console.log('jobs after append:', watch('jobs'));
      }}
      className="flex items-center space-x-2 text-purple-700 hover:text-purple-700/80 hover:underline"
    >
      <PlusCircle className="size-4 mr-2" />
      직업 추가
    </Button>
  );
}

export default JobFormComponent;
