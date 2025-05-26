import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import { Input } from '@/components/ui/input';

function LastNameField() {
  const { register } = useFormContextWrapper<FormSchemaType>();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="lastName" className="flex items-center">
        성
      </label>
      <Input
        type="text"
        placeholder="성을 입력하세요"
        id="lastName"
        {...register('lastName')}
      />
      <p className="text-sm text-gray-500">공개적으로 표시되는 이름입니다.</p>
    </div>
  );
}

export default LastNameField;
