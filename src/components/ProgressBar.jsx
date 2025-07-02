import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Lock } from 'lucide-react';

const ProgressBar = ({ currentStage, totalStages, progress }) => {
  const stages = Array.from({ length: totalStages }, (_, i) => i + 1);

  const getStageStatus = (stage) => {
    if (stage < currentStage) return 'completed';
    if (stage === currentStage) return 'current';
    return 'locked';
  };

  const getStageProgress = (stage) => {
    if (stage < currentStage) return 100;
    if (stage === currentStage) return progress[stage] || 0;
    return 0;
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">Progress</h3>
        <span className="text-sm text-gray-400">
          {currentStage}/{totalStages} stages
        </span>
      </div>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStage - 1) / (totalStages - 1)) * 100}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between">
          {stages.map((stage) => {
            const status = getStageStatus(stage);
            const stageProgress = getStageProgress(stage);
            
            return (
              <motion.div
                key={stage}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: stage * 0.1 }}
                className="relative flex flex-col items-center"
              >
                {/* Stage Circle */}
                <div
                  className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : status === 'current'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-400'
                  }`}
                  role="progressbar"
                  aria-valuenow={stageProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`Stage ${stage} progress: ${stageProgress}%`}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" aria-hidden="true" />
                  ) : status === 'current' ? (
                    <span className="text-sm font-bold">{stage}</span>
                  ) : (
                    <Lock className="w-5 h-5" aria-hidden="true" />
                  )}

                  {/* Current Stage Progress Ring */}
                  {status === 'current' && (
                    <svg
                      className="absolute inset-0 w-12 h-12 transform -rotate-90"
                      aria-hidden="true"
                    >
                      <circle
                        cx="24"
                        cy="24"
                        r="22"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-blue-200"
                        opacity="0.3"
                      />
                      <motion.circle
                        cx="24"
                        cy="24"
                        r="22"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        className="text-blue-300"
                        initial={{ strokeDasharray: "0 138" }}
                        animate={{ 
                          strokeDasharray: `${(stageProgress / 100) * 138} 138` 
                        }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                      />
                    </svg>
                  )}
                </div>

                {/* Stage Label */}
                <span className="mt-2 text-xs text-gray-400 text-center">
                  Stage {stage}
                </span>
                
                {/* Stage Progress Percentage for Current Stage */}
                {status === 'current' && stageProgress > 0 && (
                  <span className="text-xs text-blue-300 mt-1">
                    {Math.round(stageProgress)}%
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;