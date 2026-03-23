import { Cow, MilkingRecord, FarmEvent } from '@/types';

export const genId = (prefix: string, list: any[]): string => 
  `${prefix}-${String(list.length + 1).padStart(3, '0')}`;

export const todayStr = (): string => new Date().toISOString().split('T')[0];

export const isOverdue = (followUp: string): boolean => {
  if (!followUp || followUp === '-') return false;
  return followUp < todayStr();
};
