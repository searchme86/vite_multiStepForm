//====여기부터 수정됨====
// 코드의 의미: 멀티스텝 폼의 메인 컨테이너
// 왜 사용했는지: 폼 상태와 컴포넌트를 통합 관리
// 수정 이유: useFormSetup 임포트 경로 수정, 타입 가드 강화로 TS2677, TS18048 에러 해결
import { FormProvider } from 'react-hook-form';
// import { Form } from '../../components/ui/form';
import { Form } from '../../components/ui/form';
import StepFormHeader from './parts/StepFormHeader';
import StepFormFooter from './parts/StepFormFooter';
import RenderStepComponent from './parts/RenderStepComponent';
import { FormSchema } from '../../schema/FormSchema';
import { useFormSetup } from './hooks/useFormSetup'; // 올바른 경로로 수정
import { useStepForm } from './hooks/useStepForm';
import { toast } from 'sonner';
import type { FormSchemaType } from '@/schema/FormSchema';
import { totalSteps } from './utils/multistepPath';

// 코드의 의미: 메인 컨테이너 컴포넌트
// 왜 사용했는지: 폼과 단계 컴포넌트를 렌더링
// 실행 매커니즘: useFormSetup으로 폼 초기화, useStepForm으로 단계 관리
function StepFormContainer() {
  // 코드의 의미: 폼 설정
  // 왜 사용했는지: react-hook-form 초기화
  // 실행 매커니즘: useFormSetup이 zod 스키마로 폼 설정 및 기본값 제공
  const methods = useFormSetup(FormSchema);

  // 코드의 의미: 단계 관리 훅
  // 왜 사용했는지: Zustand 스토어와 폼 상태 통합
  // 실행 매커니즘: useStepForm이 단계 이동과 상태 관리 제공
  const formControls = useStepForm(totalSteps, methods);

  // 코드의 의미: totalSteps 유효성 검사
  // 왜 사용했는지: 유효하지 않은 steps로 인한 렌더링 에러 방지
  // 실행 매커니즘: totalSteps가 없으면 에러 메시지 렌더링
  if (!totalSteps || totalSteps.length === 0) {
    return <div className="text-red-600">폼을 로드할 수 없습니다.</div>;
  }

  // 코드의 의미: 폼 제출 핸들러
  // 왜 사용했는지: 최종 데이터 제출 및 에러 처리
  // 실행 매커니즘: 데이터 콘솔 출력, 에러 시 토스트 표시
  const onSubmit = async (values: FormSchemaType) => {
    console.log('Form submitted:', values);
    const errors = methods.formState.errors;
    const currentStepIndex = formControls.currentStep;

    if (errors && totalSteps[currentStepIndex]) {
      const errorMessages = totalSteps[currentStepIndex].fieldsOfStep
        .filter(
          (input): input is NonNullable<typeof input> =>
            typeof input === 'string'
        ) // ✅ undefined 제거 + 타입 보장
        .map((input) => {
          // ✅ 'input'이 문자열이라는 것을 filter에서 보장받음
          const error = input.split('.').reduce((obj: unknown, key: string) => {
            if (!obj || typeof obj !== 'object') return undefined;
            return (obj as Record<string, unknown>)[key];
          }, errors);

          return error && typeof error === 'object' && 'message' in error
            ? (error as { message: string }).message
            : undefined;
        })
        .filter((msg): msg is string => !!msg)
        .join(', ');

      if (errorMessages) {
        toast.error('입력 오류', {
          description: errorMessages,
          duration: 5000,
        });
      }
    }
  };

  // 코드의 의미: 폼 렌더링
  // 왜 사용했는지: FormProvider와 shadcn/ui Form으로 폼 구조 구성
  // 실행 매커니즘: FormProvider로 폼 컨텍스트 제공, Form으로 UI 구성
  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="flex flex-col justify-between py-20 space-y-8"
        >
          {/* 코드의 의미: 단계 헤더 */}
          <StepFormHeader totalSteps={totalSteps} />
          {/* 코드의 의미: 단계별 컴포넌트 렌더링 */}
          <RenderStepComponent totalSteps={totalSteps} />
          {/* 코드의 의미: 단계 푸터 */}
          <StepFormFooter totalSteps={totalSteps} />
        </form>
      </Form>
    </FormProvider>
  );
}

export default StepFormContainer;
//====여기까지 수정됨====
