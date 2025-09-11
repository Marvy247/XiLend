'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface NotificationAlertProps {
  level: 'warning' | 'critical';
  message: string;
  healthFactor: number;
  onDismiss?: () => void;
}

export function NotificationAlert({
  level,
  message,
  healthFactor,
  onDismiss,
}: NotificationAlertProps) {
  const [open, setOpen] = useState(true);
  const [showTime, setShowTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setOpen(false);
    onDismiss?.();
  };

  if (!open) return null;

  const isCritical = level === 'critical';
  const title = isCritical ? 'Critical Health Factor Alert' : 'Health Factor Warning';
  const icon = isCritical ? AlertTriangle : AlertCircle;
  const bgColor = isCritical ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20';
  const borderColor = isCritical ? 'border-red-200 dark:border-red-800' : 'border-yellow-200 dark:border-yellow-800';
  const iconColor = isCritical ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskLevel = (hf: number) => {
    if (hf < 1.0) return { text: 'High Risk', color: 'text-red-600 dark:text-red-400' };
    if (hf < 1.5) return { text: 'Medium Risk', color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: 'Low Risk', color: 'text-green-600 dark:text-green-400' };
  };

  const riskLevel = getRiskLevel(healthFactor);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className={`sm:max-w-[500px] ${bgColor} ${borderColor} animate-fade-in`}>
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isCritical ? 'bg-red-100 dark:bg-red-800' : 'bg-yellow-100 dark:bg-yellow-800'}`}>
                {React.createElement(icon, { className: `h-6 w-6 ${iconColor}` })}
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Shown for {formatTime(showTime)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <span className="font-medium">Health Factor:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold block">{healthFactor.toFixed(2)}</span>
                  <span className={`text-sm font-medium ${riskLevel.color} block`}>{riskLevel.text}</span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{message}</p>
              {isCritical && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    ⚠️ Immediate action required to avoid liquidation
                  </p>
                </div>
              )}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            Dismiss
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDismiss}
            className={`w-full sm:w-auto ${isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
          >
            {isCritical ? 'Take Action' : 'Acknowledge'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
