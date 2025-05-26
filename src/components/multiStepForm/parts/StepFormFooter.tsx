//====여기부터 수정됨====
// 코드의 의미: 멀티스텝 폼의 푸터 컴포넌트
// 왜 사용했는지: 단계 이동 버튼 제공
// 수정 이유: subItems 에러 디버깅을 위해 toast와 로그 개선, 사용자 친화적 메시지 추가
import type { EachStep } from '../types/multiStepFormType';
import { useStepForm } from '../../multiStepForm/hooks/useStepForm';
import { Button } from '../../ui/button';
import { useFormContext } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
// import type { FormSchemaType } from '@/schema/FormSchema';
import type { FormSchemaType } from '../../../schema/FormSchema';

// 코드의 의미: 푸터 컴포넌트
// 왜 사용했는지: 이전/다음/제출 버튼 렌더링
// 실행 매커니즘: useStepForm으로 단계 상태 가져오고, 버튼 클릭 시 단계 이동
function StepFormFooter({ totalSteps }: { totalSteps: EachStep[] }) {
  // 코드의 의미: 폼 컨텍스트 가져오기
  // 왜 사용했는지: 폼 상태와 메서드 접근
  // 실행 매커니즘: useFormContext로 FormProvider의 컨텍스트 가져옴
  const methods = useFormContext<FormSchemaType>();

  // 코드의 의미: 폼 상태에서 isSubmitting과 errors 추출
  // 왜 사용했는지: 제출 상태와 에러 확인
  // 실행 매커니즘: methods.formState에서 필요한 속성 참조
  const { isSubmitting, errors } = methods.formState;

  // 코드의 의미: 단계 상태와 함수 가져오기
  // 왜 사용했는지: 단계 이동 제어
  // 실행 매커니즘: useStepForm이 Zustand 스토어에서 상태와 함수 제공
  const {
    nextStep,
    prevStep,
    isNextStepExisted,
    isPrevStepExisted,
    isCurrentStepFinal,
  } = useStepForm(totalSteps, methods);

  // 코드의 의미: 다음 버튼 핸들러
  // 왜 사용했는지: 유효성 검사 후 다음 단계 이동
  // 실행 매커니즘: nextStep 호출, 에러 시 토스트 표시
  const handleNext = async () => {
    console.log('[StepFormFooter] handleNext called'); // 디버깅: 함수 실행 확인
    console.log('[StepFormFooter] isNextStepExisted:', isNextStepExisted); // 디버깅: 버튼 활성화 상태
    console.log('[StepFormFooter] form errors:', errors); // 디버깅: 폼 에러 상태
    try {
      await nextStep();
      console.log('[StepFormFooter] nextStep completed'); // 디버깅: nextStep 성공
    } catch (error) {
      console.error('[StepFormFooter] nextStep error:', error); // 디버깅: nextStep 에러
      console.log(
        '[StepFormFooter] form errors after validation:',
        methods.formState.errors
      ); // 디버�ING: 검증 후 에러 상태
      console.log(
        '[StepFormFooter] tocItems value:',
        JSON.stringify(methods.getValues('tocItems'), null, 2)
      ); // 디버깅: tocItems 입력값 (자세히 출력)
      toast.error('목차 입력 오류', {
        description: methods.formState.errors.tocItems
          ? '각 목차 항목에 최소 1개의 하위 항목을 추가해주세요.'
          : '필수 입력 필드를 확인해주세요.',
        duration: 5000,
      });
    }
  };

  // 코드의 의미: 푸터 렌더링
  // 왜 사용했는지: 버튼과 상태에 따라 UI 제공
  // 실행 매커니즘: 조건에 따라 이전/다음/제출 버튼 렌더링
  return (
    <div className="flex justify-between w-full p-4 border-t px-7 border-border bg-background">
      <Button
        type="button"
        onClick={() => {
          console.log('[StepFormFooter] prevStep clicked'); // 디버깅: 이전 버튼 클릭
          prevStep();
        }}
        disabled={!isPrevStepExisted}
        aria-label="이전"
        className={cn(
          'transition-all duration-300',
          !isPrevStepExisted && 'opacity-50 cursor-not-allowed'
        )}
      >
        이전
      </Button>
      {isCurrentStepFinal ? (
        <Button
          type="submit"
          disabled={isSubmitting}
          aria-label="제출"
          className="transition-all duration-300 bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '제출'}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleNext}
          disabled={!isNextStepExisted}
          aria-label="다음"
          className={cn(
            'bg-primary hover:bg-primary/90 transition-all duration-300',
            !isNextStepExisted && 'opacity-50 cursor-not-allowed'
          )}
        >
          다음
        </Button>
      )}
    </div>
  );
}

export default StepFormFooter;
//====여기까지 수정됨====
