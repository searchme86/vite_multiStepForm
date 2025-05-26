import { useFormContextWrapper } from '../../../../../components/multiStepForm/hooks/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';

function SplitEmailErrorMessages() {
  const {
    formState: { errors },
  } = useFormContextWrapper<FormSchemaType>();

  return (
    <>
      {errors.email?.splitEmailInput?.userLocalPart && (
        <p className="text-red-500 text-sm">
          {errors.email.splitEmailInput.userLocalPart.message as string}
        </p>
      )}
      {errors.email?.splitEmailInput?.emailRest && (
        <p className="text-red-500 text-sm">
          {errors.email.splitEmailInput.emailRest.message as string}
        </p>
      )}
      {errors.email?.splitEmailInput?.message && (
        <p className="text-red-500 text-sm">
          {errors.email.splitEmailInput.message as string}
        </p>
      )}
    </>
  );
}

export default SplitEmailErrorMessages;
