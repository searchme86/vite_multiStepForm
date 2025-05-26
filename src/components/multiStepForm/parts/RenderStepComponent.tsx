//====여기부터 수정됨====
// 코드의 의미: 단계별 컴포넌트 렌더링
// 왜 사용했는지: 현재 단계에 맞는 컴포넌트 동적 렌더링
// 수정 이유: hookFormStepObj 전달 제거, 애니메이션 최적화
// import type { EachStep } from '@/components/multiStepForm/types/multiStepFormType';
import type { EachStep } from '../types/multiStepFormType';
import { useStepForm } from '../hooks/useStepForm';
import { motion } from 'framer-motion';

// 코드의 의미: 단계 컴포넌트 렌더링
// 왜 사용했는지: 현재 단계의 컴포넌트를 렌더링
function RenderStepComponent({ totalSteps }: { totalSteps: EachStep[] }) {
  const { currentStep, stepTransitionDirection } = useStepForm(
    totalSteps,
    null
  );
  const { stepComponent: ComponentToRender } = totalSteps[currentStep] || {};

  // 코드의 의미: 컴포넌트 유효성 검사
  // 왜 사용했는지: 유효하지 않은 컴포넌트 렌더링 방지
  if (!ComponentToRender) return null;

  // 코드의 의미: 애니메이션 적용 렌더링
  // 왜 사용했는지: 단계 전환 시 부드러운 애니메이션 제공
  return (
    <motion.div
      key={currentStep}
      initial={{
        opacity: 0,
        x: stepTransitionDirection > 0 ? '10%' : '-10%',
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        type: 'tween',
      }}
      className="flex flex-col gap-4 px-7"
    >
      <ComponentToRender />
    </motion.div>
  );
}

export default RenderStepComponent;
//====여기까지 수정됨====
