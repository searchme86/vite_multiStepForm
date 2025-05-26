import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import { Input } from '@/components/ui/input';

// 코드의 의미: 직함 입력 필드 컴포넌트
// 왜 사용했는지: 직함 입력 UI를 독립적으로 관리
function TitleInputField({ index }: { index: number }) {
  const { control } = useFormContextWrapper<FormSchemaType>();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`jobs.${index}.title`} className="flex items-center">
        직함
      </label>
      <Input
        type="text"
        placeholder="직함"
        className="flex-grow border-neutral-700"
        id={`jobs.${index}.title`}
        {...control.register(`jobs.${index}.title`)}
      />
    </div>
  );
}

export default TitleInputField;
