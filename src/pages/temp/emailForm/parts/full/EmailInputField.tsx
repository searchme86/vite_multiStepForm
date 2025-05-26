// import { useFormContextWrapper } from '../../../../components/multiStepForm/hooks/useStepForm';
import { useFormContextWrapper } from '../../../../../components/multiStepForm/hooks/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import { Input } from '../../../../../components/ui/input';

function EmailInputField() {
  const { register } = useFormContextWrapper<FormSchemaType>();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="email.fullEmailInput" className="flex items-center">
        이메일
      </label>
      <Input
        type="email"
        placeholder="이메일을 입력하세요"
        id="email.fullEmailInput"
        {...register('email.fullEmailInput')}
      />
    </div>
  );
}

export default EmailInputField;
