 'use client';

import { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { useUserAccountData } from '@/hooks/useLendingPool';
import { CONTRACT_ADDRESSES, LENDING_POOL_ABI, ERC20_ABI } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, CreditCard, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

interface RepayFormProps {
  onSuccess?: () => void;
}

export function RepayForm({ onSuccess }: RepayFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState<string>(CONTRACT_ADDRESSES.MockUSDC);
  const [step, setStep] = useState<'idle' | 'approving' | 'repaying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  const { address } = useAccount();
  const { accountData } = useUserAccountData();
  const { writeContract, isPending } = useWriteContract();

  const validateAmount = (value: string) => {
    const num = parseFloat(value);
    if (!value || isNaN(num) || num <= 0) {
      return 'Please enter a valid amount greater than 0';
    }
    if (num > 1000000) {
      return 'Amount cannot exceed 1,000,000 USDC';
    }
    return '';
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    setValidationError(validateAmount(value));
  };

  const handleSetMax = () => {
    if (accountData) {
      // Convert from ETH to USDC (assuming 1 ETH = 2000 USDC for simplicity)
      // In a real app, you'd get the actual price from the PriceOracle
      const maxAmount = Number(accountData.totalDebtETH) / 1e18 * 2000;
      setAmount(maxAmount.toFixed(2));
      setValidationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !address) return;

    const validation = validateAmount(amount);
    if (validation) {
      setValidationError(validation);
      return;
    }

    setStep('approving');
    setErrorMessage('');
    setValidationError('');

    try {
      // Approve lending pool to spend tokens
      await writeContract({
        address: asset as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.LendingPool, BigInt(amount) * BigInt(10 ** 6)],
      });

      setStep('repaying');

      // Repay
      await writeContract({
        address: CONTRACT_ADDRESSES.LendingPool,
        abi: LENDING_POOL_ABI,
        functionName: 'repay',
        args: [asset as `0x${string}`, BigInt(amount) * BigInt(10 ** 6), address],
      });

      setStep('success');
      setTimeout(() => {
        setIsOpen(false);
        setAmount('');
        setStep('idle');
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      console.error('Repay failed:', error);
      setStep('error');
      setErrorMessage(error?.message || 'Repay transaction failed. Please try again.');
    }
  };

  const resetForm = () => {
    setStep('idle');
    setErrorMessage('');
    setValidationError('');
    setAmount('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="group p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-gradient-success group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <CreditCard className="h-6 w-6 text-gray-900 dark:text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Repay Loan</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Repay your outstanding debt</p>
            </div>
          </div>
          <DialogTrigger asChild>
            <Button className="bg-gradient-success hover:bg-gradient-success/90 text-gray-900 dark:text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
              Repay
            </Button>
          </DialogTrigger>
        </div>
      </div>
      <DialogContent className="sm:max-w-[500px] animate-fade-in">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-success">
              <CreditCard className="h-5 w-5 text-gray-900 dark:text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Repay Loan</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Repay your borrowed assets to reduce your debt.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="asset" className="text-right">
                Asset
              </Label>
              <Select value={asset} onValueChange={setAsset}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CONTRACT_ADDRESSES.MockUSDC}>USDC</SelectItem>
                  {/* <SelectItem value={CONTRACT_ADDRESSES.MockXFI}>XFI</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Amount
              </Label>
              <div className="col-span-3 flex space-x-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className={`flex-1 transition-all duration-200 ${validationError ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSetMax}
                  disabled={!accountData}
                  className="px-3 py-2 text-xs"
                >
                  Max
                </Button>
                {validationError && (
                  <p className="text-red-500 text-sm mt-1 flex items-center col-span-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationError}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            {step === 'error' && (
              <p className="text-red-600 mb-2">{errorMessage}</p>
            )}
            {step === 'success' && (
              <p className="text-green-600 mb-2 flex items-center">
                <CheckCircle className="mr-1" /> Repay successful!
              </p>
            )}
            {step === 'approving' && (
              <p className="text-blue-600 mb-2 flex items-center">
                <Loader2 className="mr-1 animate-spin" /> Approving tokens...
              </p>
            )}
            {step === 'repaying' && (
              <p className="text-blue-600 mb-2 flex items-center">
                <Loader2 className="mr-1 animate-spin" /> Processing repayment...
              </p>
            )}
            <Button type="submit" disabled={isPending || step === 'approving' || step === 'repaying'}>
              {(step === 'approving' || step === 'repaying') && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Repay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
