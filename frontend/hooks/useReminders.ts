'use client';

import { useState, useEffect } from 'react';

export interface Reminder {
  id: string;
  title: string;
  message: string;
  date: Date;
  type: 'repayment' | 'liquidation' | 'custom';
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Load reminders from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('xilend-reminders');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const remindersWithDates = parsed.map((r: Reminder) => ({
          ...r,
          date: new Date(r.date)
        }));
        setReminders(remindersWithDates);
      } catch (error) {
        console.error('Error parsing reminders from localStorage:', error);
      }
    }
  }, []);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('xilend-reminders', JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString()
    };
    setReminders(prev => [...prev, newReminder]);
  };

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, ...updates } : r
    ));
  };

  // Get active reminders (not expired)
  const activeReminders = reminders.filter(r => r.date > new Date());

  // Get expired reminders
  const expiredReminders = reminders.filter(r => r.date <= new Date());

  return {
    reminders,
    activeReminders,
    expiredReminders,
    addReminder,
    removeReminder,
    updateReminder
  };
}
