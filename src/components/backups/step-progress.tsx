import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

interface StepProgressProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const StepProgress: React.FC<StepProgressProps> = ({ 
  steps, 
  currentStep,
  onStepClick
}) => {
  return (
    <div className="w-full py-6" role="navigation" aria-label="Form progress">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;
          
          return (
            <React.Fragment key={index}>
              {/* Step circle */}
              <motion.button
                type="button"
                onClick={() => onStepClick && onStepClick(index)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full 
                  ${isCompleted ? 'bg-success text-white' : 
                    isActive ? 'bg-primary text-white' : 
                    'bg-default-100 text-default-500'}`}
                initial={false}
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted ? 'var(--heroui-success)' : 
                                   isActive ? 'var(--heroui-primary)' : 
                                   'var(--heroui-default-100)'
                }}
                transition={{ duration: 0.3 }}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${step}`}
              >
                {isCompleted ? (
                  <Icon icon="lucide:check" className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </motion.button>
              
              {/* Step label */}
              <div className="hidden md:block absolute mt-16" style={{ left: `calc(${(100 / (steps.length - 1)) * index}% - ${index === 0 ? '0' : index === steps.length - 1 ? '100%' : '50%'})` }}>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-default-400">STEP {index + 1}</span>
                  <span className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-default-500'}`}>
                    {step}
                  </span>
                  <span className="text-xs text-default-400">
                    {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className="h-1 relative bg-default-200">
                    <motion.div 
                      className="absolute h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: isCompleted ? "100%" : isActive ? "50%" : "0%",
                        backgroundColor: isCompleted ? 'var(--heroui-success)' : 'var(--heroui-primary)'
                      }}
                      transition={{ duration: 0.5 }}
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
};