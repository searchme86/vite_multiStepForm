import { useFormContextWrapper } from '@/components/reactHookForm/useFormContextWrapper';
import type { FormSchemaType } from '@/schema/FormSchema';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../../../../utils/Cn';

// 코드의 의미: 유효한 날짜인지 확인하는 헬퍼 함수
// 왜 사용했는지: format 함수 호출 전 날짜 유효성 검사
const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

// 코드의 의미: 종료 날짜 입력 필드 컴포넌트
// 왜 사용했는지: 종료 날짜 입력 UI를 독립적으로 관리
function EndDateInputField({
  field,
  index,
}: {
  field: { to: Date };
  index: number;
}) {
  const { setValue } = useFormContextWrapper<FormSchemaType>();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`jobs.${index}.to`} className="flex items-center">
        종료 날짜
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full pl-3 text-left font-normal border-neutral-700 bg-accent',
              !isValidDate(field.to) && 'text-muted-foreground'
            )}
          >
            {isValidDate(field.to) ? (
              format(field.to, 'PPP')
            ) : (
              <span>날짜 선택</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={isValidDate(field.to) ? field.to : undefined}
            onSelect={(date) => {
              if (date) {
                setValue(`jobs.${index}.to`, date);
              }
            }}
            disabled={(date) =>
              date.getTime() >
                new Date().setFullYear(new Date().getFullYear() + 7) ||
              date < new Date('1900-01-01')
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default EndDateInputField;
