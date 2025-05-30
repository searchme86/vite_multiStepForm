//====수정됨====
// StepProgress.tsx: 폼 진행 단계를 시각적으로 표시
// - 의미: 현재 단계와 진행 상황을 사용자에게 보여줌
// - 사용 이유: 사용자 네비게이션과 진행 상태 추적
// - 비유: 등산 경로의 이정표
import React from 'react';
import { Icon } from '@iconify/react';

interface StepProgressProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

function StepProgress({ steps, currentStep, onStepClick }: StepProgressProps) {
  return (
    <div className="w-full py-6" role="navigation" aria-label="Form progress">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          return (
            <React.Fragment key={index}>
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(index)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step}`}
              >
                {isCompleted ? (
                  <Icon icon="lucide:check" className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>
              <div
                className="absolute hidden mt-16 md:block"
                style={{
                  left: `calc(${(100 / (steps.length - 1)) * index}% - ${
                    index === 0
                      ? '0'
                      : index === steps.length - 1
                      ? '100%'
                      : '50%'
                  })`,
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">
                    STEP {index + 1}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isActive
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step}
                  </span>
                  <span className="text-xs text-gray-400">
                    {isCompleted ? '완료' : isActive ? '진행 중' : '대기'}
                  </span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className="relative h-1 bg-gray-200">
                    <div
                      className="absolute h-full bg-blue-600"
                      style={{
                        width: isCompleted ? '100%' : isActive ? '50%' : '0%',
                      }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default StepProgress;
//====수정됨====
