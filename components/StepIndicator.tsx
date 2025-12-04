import React from 'react';
import { AppStep } from '../types';
import { Check, ClipboardList, BrainCircuit, PenTool } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { icon: ClipboardList, label: '입력' },
    { icon: BrainCircuit, label: '분석' },
    { icon: PenTool, label: '주제' },
    { icon: Check, label: '결과' },
  ];

  const getStepStatus = (index: number) => {
    // Input step maps to index 0
    // Analysis/Review maps to index 1
    // Input Topic maps to index 2
    // Generating/Result maps to index 3
    
    let activeIndex = 0;
    if (currentStep >= AppStep.ANALYZING) activeIndex = 1;
    if (currentStep >= AppStep.INPUT_TOPIC) activeIndex = 2;
    if (currentStep >= AppStep.GENERATING) activeIndex = 3;

    if (index < activeIndex) return 'completed';
    if (index === activeIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-500 transition-all duration-500 ease-in-out -z-10 rounded-full"
          style={{ width: `${(Math.min(currentStep, 5) / 5) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const Icon = step.icon;
          
          return (
            <div key={index} className="flex flex-col items-center gap-2 bg-slate-900 px-2">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${status === 'completed' ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                ${status === 'active' ? 'bg-slate-900 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : ''}
                ${status === 'pending' ? 'bg-slate-900 border-slate-700 text-slate-600' : ''}
              `}>
                <Icon size={18} />
              </div>
              <span className={`text-xs font-medium uppercase tracking-wider ${status === 'pending' ? 'text-slate-600' : 'text-slate-300'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;