'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Shield, TrendingUp, Wallet, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps = [
  {
    title: 'Welcome to XiLend',
    description: 'Your decentralized lending platform on Sepolia testnet',
    icon: Shield,
    content: 'XiLend allows you to deposit assets as collateral and borrow against them, or lend your assets to earn interest.',
  },
  {
    title: 'Deposit Collateral',
    description: 'Start by depositing your assets',
    icon: TrendingUp,
    content: 'Deposit USDC or other supported assets as collateral. You can use these assets to borrow against or earn interest by lending them out.',
  },
  {
    title: 'Borrow Assets',
    description: 'Borrow against your collateral',
    icon: Wallet,
    content: 'Once you have collateral deposited, you can borrow assets using your collateral as security. Keep an eye on your health factor!',
  },
  {
    title: 'Monitor Your Health',
    description: 'Stay safe with health factor monitoring',
    icon: AlertTriangle,
    content: 'Your health factor indicates how close you are to liquidation. Maintain a healthy ratio by managing your collateral and debt wisely.',
  },
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const step = onboardingSteps[currentStep];
  const IconComponent = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] animate-fade-in">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-0 right-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-blue-300'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-6">
            <div className="p-4 rounded-full bg-gradient-primary inline-block">
              <IconComponent className="h-12 w-12 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{step.description}</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{step.content}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 transition-colors duration-300 ${
                currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="text-sm text-gray-500">
              {currentStep + 1} of {onboardingSteps.length}
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center text-gray-300 hover:text-gray-900 space-x-2 bg-gradient-primary hover:opacity-90"
            >
              <span>{currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}</span>
              {currentStep < onboardingSteps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* Skip option */}
          {currentStep < onboardingSteps.length - 1 && (
            <div className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Skip tutorial
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
