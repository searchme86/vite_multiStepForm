import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import { Input } from '@/components/ui/input';

function FirstNameField() {
  const { register } = useFormContextWrapper<FormSchemaType>();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="firstName" className="flex items-center">
        이름
      </label>
      <Input
        type="text"
        placeholder="이름을 입력하세요"
        id="firstName"
        {...register('firstName')}
      />
      <p className="text-sm text-gray-500">공개적으로 표시되는 이름입니다.</p>
    </div>
  );
}

export default FirstNameField;
