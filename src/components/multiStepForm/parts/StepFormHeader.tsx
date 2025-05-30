import type { EachStep } from '@/components/multiStepForm/types/multiStepFormType';
import { useStepForm } from '../hooks/useStepForm';
import type { FieldErrors, FieldError } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import type { FormSchemaType } from '../../../schema/FormSchema';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import type { FormPaths } from '../utils/FormPathsUtil';

const convertFieldPathsToKeys = (
  fieldPaths: (FormPaths | undefined)[]
): string[] => {
  const validPaths: string[] = [];

  for (const path of fieldPaths) {
    if (path && typeof path === 'string') {
      const rootKey = path.split('.')[0];
      if (rootKey && !validPaths.includes(rootKey)) {
        validPaths.push(rootKey);
      }
    }
  }

  return validPaths;
};

const getNestedError = (
  errors: FieldErrors<FormSchemaType>,
  path: string
): FieldError | undefined => {
  const keys = path.split('.');
  let current: unknown = errors;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current && typeof current === 'object' && 'message' in current
    ? (current as FieldError)
    : undefined;
};

const getValidFieldPaths = (
  fieldPaths: (FormPaths | undefined)[]
): string[] => {
  const validPaths: string[] = [];

  for (const field of fieldPaths) {
    if (field && typeof field === 'string') {
      validPaths.push(field);
    }
  }

  return validPaths;
};

function StepFormHeader({ totalSteps }: { totalSteps: EachStep[] }) {
  const { currentStep, setStep } = useStepForm(totalSteps, null);
  const {
    trigger,
    formState: { errors },
  } = useFormContext<FormSchemaType>();

  const handleStepNavigation = async (idx: number, step: EachStep) => {
    if (!totalSteps[currentStep]) return;

    const fields = convertFieldPathsToKeys(
      totalSteps[currentStep].fieldsOfStep
    );
    const res = await trigger(fields as (keyof FormSchemaType)[], {
      shouldFocus: true,
    });

    if (!res) {
      const validFields = getValidFieldPaths(step.fieldsOfStep);
      const errorMessages = validFields
        .map((input) => {
          const error = getNestedError(errors, input);
          return error?.message;
        })
        .filter((msg): msg is string => Boolean(msg))
        .join(', ');

      toast.error('입력 오류', {
        description: errorMessages || '필수 입력 필드를 채워주세요.',
        duration: 5000,
      });
      return;
    }
    setStep(idx);
  };

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

          const validFields = getValidFieldPaths(step.fieldsOfStep);
          const isFieldHasError = validFields.some((key) => {
            return getNestedError(errors, key) !== undefined;
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
