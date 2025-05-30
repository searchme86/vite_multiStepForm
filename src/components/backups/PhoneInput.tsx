import * as React from 'react';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '../ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/utils/Cn';
// import { cn } from '../lib/utils';

// 코드의 의미: PhoneInput 컴포넌트의 props 타입 정의
// 왜 사용했는지: PhoneInput 컴포넌트의 타입 안정성 보장
type PhoneInputProps = Omit<
  React.ComponentProps<'input'>,
  'onChange' | 'value' | 'ref'
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    onChange?: (value: RPNInput.Value) => void;
  };

// 코드의 의미: 전화번호 입력 컴포넌트
// 왜 사용했는지: 국제 전화번호 입력 UI 제공
const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, ...props }, ref) => {
      return (
        <RPNInput.default
          ref={ref}
          className={cn('flex', className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={InputComponent}
          smartCaret={false}
          // 코드의 의미: onChange 이벤트 처리
          // 왜 사용했는지: 유효하지 않은 값(undefined) 처리 및 값 전달
          onChange={(value) => onChange?.(value || ('' as RPNInput.Value))}
          {...props}
        />
      );
    }
  );
PhoneInput.displayName = 'PhoneInput';

// 코드의 의미: 전화번호 입력 필드 컴포넌트
// 왜 사용했는지: react-phone-number-input의 입력 필드를 커스터마이징
const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
  <Input
    className={cn('rounded-e-lg rounded-s-none', className)}
    {...props}
    ref={ref}
  />
));
InputComponent.displayName = 'InputComponent';

// 코드의 의미: 국가 선택 컴포넌트의 props 타입 정의
// 왜 사용했는지: 국가 선택 컴포넌트의 타입 안정성 보장
type CountryEntry = { label: string; value: RPNInput.Country | undefined };

// 코드의 의미: 국가 선택 컴포넌트의 props 타입
// 왜 사용했는지: 국가 선택 컴포넌트의 속성 정의
type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
};

// 코드의 의미: 국가 선택 드롭다운 컴포넌트
// 왜 사용했는지: 전화번호 입력 시 국가 선택 UI 제공
const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex gap-1 px-3 border-r-0 rounded-e-none rounded-s-lg focus:z-10"
          disabled={disabled}
        >
          <FlagComponent
            country={selectedCountry}
            countryName={selectedCountry}
          />
          <ChevronsUpDown
            className={cn(
              '-mr-2 size-4 opacity-50',
              disabled ? 'hidden' : 'opacity-100'
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                    />
                  ) : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// 코드의 의미: 국가 선택 옵션 컴포넌트의 props 타입 정의
// 왜 사용했는지: 국가 선택 옵션 컴포넌트의 타입 안정성 보장
interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
}

// 코드의 의미: 국가 선택 옵션 컴포넌트
// 왜 사용했는지: 국가 목록에서 특정 국가 선택 UI 제공
const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange,
}: CountrySelectOptionProps) => {
  return (
    <CommandItem className="gap-2" onSelect={() => onChange(country)}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-foreground/50">{`+${RPNInput.getCountryCallingCode(
        country
      )}`}</span>
      <CheckIcon
        className={`ml-auto size-4 ${
          country === selectedCountry ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </CommandItem>
  );
};

// 코드의 의미: 국기 표시 컴포넌트
// 왜 사용했는지: 국가 선택 시 국기 아이콘 표시
const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

export { PhoneInput };
