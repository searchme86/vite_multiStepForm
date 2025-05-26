import { useFormContextWrapper } from '../../../../../../../../../components/multiStepForm/hooks/useFormContextWrapper.ts';
import type { FormSchemaType } from '../../../../../../../../../schema/FormSchema.ts';
import { Input } from '../../../../../../../../../components/ui/input.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../../../../../components/ui/select.tsx';

function EmailSplitInputFields({
  handleDomainChange,
  selectedDomain,
}: {
  handleDomainChange: (value: string) => void;
  selectedDomain: string;
}) {
  const { register, setValue } = useFormContextWrapper<FormSchemaType>();

  const domains = [
    { value: 'custom', label: '직접 입력' },
    { value: 'naver.com', label: 'naver.com' },
    { value: 'daum.net', label: 'daum.net' },
  ];

  const handleSelectChange = (value: string) => {
    handleDomainChange(value);
    if (value !== 'custom') {
      setValue('email.splitEmailInput.emailRest', value);
    } else {
      setValue('email.splitEmailInput.emailRest', '');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email.splitEmailInput.userLocalPart"
          className="flex items-center"
        >
          로컬 파트
        </label>
        <Input
          type="text"
          placeholder="로컬 파트를 입력하세요"
          id="email.splitEmailInput.userLocalPart"
          {...register('email.splitEmailInput.userLocalPart')}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email.splitEmailInput.emailRest"
          className="flex items-center"
        >
          도메인 파트
        </label>
        <div className="flex items-center gap-2">
          <span>@</span>
          <Input
            type="text"
            placeholder="도메인 파트를 입력하세요"
            id="email.splitEmailInput.emailRest"
            disabled={selectedDomain !== 'custom'}
            {...register('email.splitEmailInput.emailRest')}
          />
          <Select onValueChange={handleSelectChange} value={selectedDomain}>
            <SelectTrigger>
              <SelectValue placeholder="도메인 선택" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((domain) => (
                <SelectItem key={domain.value} value={domain.value}>
                  {domain.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default EmailSplitInputFields;
