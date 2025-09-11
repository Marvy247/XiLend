import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatEther } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatValue = (value: bigint | number, convertToUSDC: boolean = false, ethUsdPrice?: number | null) => {
  const numValue = typeof value === 'bigint' ? parseFloat(formatEther(value)) : value;
  if (convertToUSDC) {
    if (!ethUsdPrice) return '0.00';
    const usdcValue = numValue * ethUsdPrice;
    return usdcValue.toFixed(2);
  }
  return numValue.toFixed(4);
};

export const formatHealthFactor = (hf: number) => {
  if (hf > 999999) return '∞';
  if (hf > 9999) return hf.toExponential(2);
  return hf.toFixed(2);
};