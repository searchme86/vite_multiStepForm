import { useFormContextWrapper } from '../../../components/multiStepForm/hooks/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import FullEmailInputComponent from './parts/full/FullEmailInputComponent';
import SplitEmailInputComponent from './parts/split/SplitEmailInputComponent';
import { useState } from 'react';

function EmailForm() {
  const {
    formState: { errors },
  } = useFormContextWrapper<FormSchemaType>();
  const [selectedDomain, setSelectedDomain] = useState('');

  const handleDomainChange = (value: string) => {
    setSelectedDomain(value);
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">이메일 입력</h2>
      <div className="flex flex-col gap-2">
        <label className="flex items-center">직접 입력</label>
        <FullEmailInputComponent />
      </div>
      <div className="flex flex-col gap-2">
        <label className="flex items-center">분리 입력</label>
        <SplitEmailInputComponent
          handleDomainChange={handleDomainChange}
          selectedDomain={selectedDomain}
        />
      </div>
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message as string}</p>
      )}
    </div>
  );
}

export default EmailForm;
