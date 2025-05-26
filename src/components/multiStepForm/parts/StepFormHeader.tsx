//====여기부터 수정됨====
// 코드의 의미: 멀티스텝 폼의 헤더 컴포넌트
// 왜 사용했는지: 단계 내비게이션 제공
// 수정 이유: hookFormStepObj 전달 제거, 에러 처리 간소화
import type { EachStep } from '@/components/multiStepForm/types/multiStepFormType';
import { useStepForm } from '../hooks/useStepForm';
import type { FieldErrors, FieldError } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import type { FormSchemaType } from '../../../schema/FormSchema';
import { toast } from 'sonner';
// import { cn } from '@/lib/utils';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import type { FormPaths } from '@/stores/multiStepFormState/InitialStepFormState';

// 코드의 의미: 중첩 경로를 단일 키로 변환
// 왜 사용했는지: trigger와 호환되는 키 생성
const convertFieldPathsToKeys = (
  fieldPaths: (FormPaths | undefined)[]
): (keyof FormSchemaType)[] => {
  return fieldPaths
    .filter((path): path is string => typeof path === 'string')
    .map((path) => path.split('.')[0] as keyof FormSchemaType)
    .filter((key, index, self) => self.indexOf(key) === index);
};

// 코드의 의미: 헤더 컴포넌트
// 왜 사용했는지: 단계별 내비게이션 버튼 렌더링
function StepFormHeader({ totalSteps }: { totalSteps: EachStep[] }) {
  const { currentStep, setStep } = useStepForm(totalSteps, null);
  const {
    trigger,
    formState: { errors },
  } = useFormContext<FormSchemaType>();

  // 코드의 의미: 단계 이동 핸들러
  // 왜 사용했는지: 클릭 시 유효성 검사 후 단계 이동
  const handleStepNavigation = async (idx: number, step: EachStep) => {
    if (!totalSteps[currentStep]) return;
    const fields = convertFieldPathsToKeys(
      totalSteps[currentStep].fieldsOfStep
    );
    const res = await trigger(fields, { shouldFocus: true });
    if (!res) {
      const errorMessages = step.fieldsOfStep
        .filter((input): input is string => typeof input === 'string')
        .map((input) => {
          const error = input
            .split('.')
            .reduce(
              (
                obj: FieldErrors<FormSchemaType> | FieldError | undefined,
                key: string
              ) =>
                obj && typeof obj === 'object'
                  ? ((obj as Record<string, unknown>)[key] as
                      | FieldError
                      | undefined)
                  : undefined,
              errors
            );
          return error?.message;
        })
        .filter((msg): msg is string => !!msg)
        .join(', ');
      toast.error('입력 오류', {
        description: errorMessages || '필수 입력 필드를 채워주세요.',
        duration: 5000,
      });
      return;
    }
    setStep(idx);
  };

  // 코드의 의미: 헤더 렌더링
  // 왜 사용했는지: 단계별 버튼과 진행 상태 표시
  return (
    <nav
      className="flex flex-col gap-4 p-4 border-b border-border bg-background"
      role="navigation"
      aria-label="폼 단계 탐색"
    >
      <ul className="flex justify-between gap-3 px-7">
        {totalSteps.map((step, idx) => {
          const isActive = idx <= currentStep;
          const isDisabled = idx > currentStep;
          const isFieldHasError = step.fieldsOfStep.some((key) => {
            if (!key || typeof key !== 'string') return false;
            return (
              key
                .split('.')
                .reduce(
                  (
                    obj: FieldErrors<FormSchemaType> | FieldError | undefined,
                    k: string
                  ) =>
                    obj && typeof obj === 'object'
                      ? ((obj as Record<string, unknown>)[k] as
                          | FieldError
                          | undefined)
                      : undefined,
                  errors
                ) !== undefined
            );
          });

          return (
            <li className="w-[20%]" key={step.stepId}>
              <Button
                type="button"
                disabled={isDisabled}
                onClick={() => handleStepNavigation(idx, step)}
                className={cn(
                  'w-full flex flex-col justify-between text-left gap-4 transition-all duration-300',
                  isActive && !isFieldHasError && 'text-purple-600',
                  isDisabled && 'opacity-50',
                  isFieldHasError &&
                    'text-red-600 ring-2 ring-red-600 rounded-md'
                )}
                role="button"
                aria-label={`Go to step ${step.stepTitle}`}
                aria-describedby={
                  isFieldHasError ? `step-error-${step.stepId}` : undefined
                }
              >
                <p className="text-sm">
                  {idx + 1}. {step.stepTitle}
                </p>
                <motion.div
                  className={cn(
                    'w-full h-3 relative rounded-sm',
                    isFieldHasError ? 'bg-red-600/50' : 'bg-purple-600/50'
                  )}
                >
                  <motion.div
                    initial={{ width: '0%' }}
                    transition={{
                      duration: 0.3,
                      type: 'spring',
                      stiffness: 50,
                    }}
                    animate={{ width: isActive ? '100%' : '0%' }}
                    className={cn(
                      'h-full rounded-sm',
                      isFieldHasError ? 'bg-red-600' : 'bg-purple-600'
                    )}
                  />
                </motion.div>
              </Button>
              {isFieldHasError && (
                <span id={`step-error-${step.stepId}`} className="sr-only">
                  Error in {step.stepTitle}: Please correct the inputs.
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default StepFormHeader;
//====여기까지 수정됨====
