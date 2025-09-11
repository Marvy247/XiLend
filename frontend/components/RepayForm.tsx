'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useUserAccountData } from '@/hooks/useLendingPool';
import { useEthUsdPrice } from '@/hooks/useEthUsdPrice';
import { CONTRACT_ADDRESSES, LENDING_POOL_ABI, ERC20_ABI } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
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
  const [step, setStep] = useState<'idle' | 'approving' | 'approve-waiting' | 'repaying' | 'repay-waiting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  const { address } = useAccount();
  const { accountData, refetch, queryKey } = useUserAccountData();
  const { ethUsdPrice, isLoading: isPriceLoading } = useEthUsdPrice();
  const queryClient = useQueryClient();

  const { writeContract: approve, data: approveHash, error: approveError, isPending: isApproving } = useWriteContract();
  const { isLoading: isApproveWaiting, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: repay, data: repayHash, error: repayError, isPending: isRepaying } = useWriteContract();
  const { isLoading: isRepayWaiting, isSuccess: isRepaySuccess } = useWaitForTransactionReceipt({ hash: repayHash });

  useEffect(() => {
    if (isApproveSuccess && step === 'approve-waiting') {
      setStep('repaying');
      repay({
        address: CONTRACT_ADDRESSES.LendingPool,
        abi: LENDING_POOL_ABI,
        functionName: 'repay',
        args: [asset as `0x${string}`, BigInt(amount) * BigInt(10 ** 6), address],
      });
    }
  }, [isApproveSuccess, step]);

  useEffect(() => {
    if (isRepaySuccess && step === 'repay-waiting') {
      setStep('success');
      refetch();
      queryClient.invalidateQueries({ queryKey });
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
        onSuccess?.();
      }, 2000);
    }
  }, [isRepaySuccess, step]);

  useEffect(() => {
    if (approveError) {
      setStep('error');
      setErrorMessage(approveError.message);
    }
    if (repayError) {
      setStep('error');
      setErrorMessage(repayError.message);
    }
  }, [approveError, repayError]);

  useEffect(() => {
    if (approveHash && step === 'approving') {
      setStep('approve-waiting');
    }
  }, [approveHash, step]);

  useEffect(() => {
    if (repayHash && step === 'repaying') {
      setStep('repay-waiting');
    }
  }, [repayHash, step]);

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
    if (accountData && ethUsdPrice) {
      const maxAmount = Number(accountData.totalDebtETH) / 1e18 * ethUsdPrice;
      setAmount(maxAmount.toFixed(2));
      setValidationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !address || !!validateAmount(amount)) return;
    setStep('approving');
    setErrorMessage('');
    setValidationError('');
    approve({
      address: asset as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.LendingPool, BigInt(amount) * BigInt(10 ** 6)],
    });
  };

  const resetForm = () => {
    setStep('idle');
    setErrorMessage('');
    setValidationError('');
    setAmount('');
  };

  const isPending = isApproving || isApproveWaiting || isRepaying || isRepayWaiting;

  const handleOpenChange = (open: boolean) => {
    if (isPending) return;
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
                {step === 'approving' && 'Please approve the token spend in your wallet.'}
                {step === 'approve-waiting' && 'Waiting for approval confirmation...'}
                {step === 'repaying' && 'Please confirm the repayment in your wallet.'}
                {step === 'repay-waiting' && 'Waiting for repayment confirmation...'}
                {step === 'success' && 'Repayment successful!'}
                {step === 'error' && (errorMessage || 'An error occurred.')}
                {step === 'idle' && 'Repay your borrowed assets to reduce your debt.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="asset" className="text-right">Asset</Label>
              <Select value={asset} onValueChange={setAsset} disabled={isPending}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={CONTRACT_ADDRESSES.MockUSDC}>USDC</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right flex items-center"><DollarSign className="h-4 w-4 mr-1" />Amount</Label>
              <div className="col-span-3 flex space-x-2">
                <Input id="amount" type="number" step="0.01" value={amount} onChange={handleAmountChange} placeholder="0.00" className={`flex-1 transition-all duration-200 ${validationError ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`} required disabled={isPending} />
                <Button type="button" variant="outline" size="sm" onClick={handleSetMax} disabled={!accountData || isPriceLoading} className="px-3 py-2 text-xs">Max</Button>
                {validationError && <p className="text-red-500 text-sm mt-1 flex items-center col-span-2"><AlertCircle className="h-3 w-3 mr-1" />{validationError}</p>}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
            {step === 'error' && (
              <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              </div>
            )}
            {step === 'success' && (
              <div className="w-full p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-scale-in">
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Repay transaction successful!</span>
                </div>
              </div>
            )}
            <div className="flex space-x-3 w-full">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1 h-12 border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200" disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending || !!validationError} className="flex-1 h-12 bg-gradient-success hover:bg-gradient-success/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 'approving' && 'Check Wallet...'}
                {step === 'approve-waiting' && 'Approving...'}
                {step === 'repaying' && 'Check Wallet...'}
                {step === 'repay-waiting' && 'Repaying...'}
                {step === 'idle' && 'Repay'}
                {step === 'error' && 'Try Again'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
