import React from 'react';
import { CheckCircle, Circle, Lock, Camera, FileText, MessageSquare } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  icon: any;
}

interface TutorOnboardingStatusProps {
  hasPhoto: boolean;
  certCount: number;
  certVerified: boolean;
  aiInterviewCompleted: boolean;
  canAccessCases: boolean;
  onNavigateToStep?: (stepId: string) => void;
}

export const TutorOnboardingStatus: React.FC<TutorOnboardingStatusProps> = ({
  hasPhoto,
  certCount,
  certVerified,
  aiInterviewCompleted,
  canAccessCases,
  onNavigateToStep,
}) => {
  const steps: OnboardingStep[] = [
    {
      id: 'photo',
      title: 'Photo Approved',
      description: 'Upload photo and await approval',
      completed: hasPhoto,
      current: !hasPhoto,
      icon: Camera,
    },
    {
      id: 'certificates',
      title: 'Certificates Uploaded',
      description: `${certCount} certificate${certCount !== 1 ? 's' : ''} uploaded`,
      completed: certCount > 0,
      current: hasPhoto && certCount === 0,
      icon: FileText,
    },
    {
      id: 'verification',
      title: 'Admin Verification',
      description: certVerified ? 'Verified by admin' : 'Pending admin review',
      completed: certVerified,
      current: certCount > 0 && !certVerified,
      icon: CheckCircle,
    },
    {
      id: 'interview',
      title: 'AI Interview',
      description: aiInterviewCompleted ? 'Interview completed' : 'Complete AI interview',
      completed: aiInterviewCompleted,
      current: certVerified && !aiInterviewCompleted,
      icon: MessageSquare,
    },
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 shadow-md">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            Onboarding Progress
          </h2>
          <span className="text-sm font-semibold text-gray-700">
            {completedSteps} / {steps.length} Complete
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      {canAccessCases ? (
        <div className="mb-6 bg-green-100 border border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="text-green-600" size={20} />
            <p className="font-semibold">
              🎉 Onboarding Complete! You can now browse and bid on cases.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Lock className="text-yellow-600" size={20} />
            <p className="font-semibold">
              Complete all steps to access available cases
            </p>
          </div>
        </div>
      )}

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              onClick={() => step.current && onNavigateToStep?.(step.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${step.completed
                  ? 'bg-green-50 border-green-400'
                  : step.current
                  ? 'bg-white border-blue-400 cursor-pointer hover:shadow-md'
                  : 'bg-gray-50 border-gray-300 opacity-60'
                }
              `}
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center text-sm font-bold
                ${step.completed ? 'border-green-500 text-green-600' : 'border-gray-400 text-gray-600'}">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="mb-3">
                {step.completed ? (
                  <CheckCircle className="text-green-600" size={32} />
                ) : step.current ? (
                  <Icon className="text-blue-600" size={32} />
                ) : (
                  <Circle className="text-gray-400" size={32} />
                )}
              </div>

              {/* Content */}
              <h3 className={`font-semibold mb-1 ${step.completed ? 'text-green-900' : 'text-gray-900'}`}>
                {step.title}
              </h3>
              <p className="text-sm text-gray-600">
                {step.description}
              </p>

              {/* Current indicator */}
              {step.current && !step.completed && (
                <div className="mt-3">
                  <span className="text-xs font-semibold text-blue-600 animate-pulse">
                    → Next step
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
