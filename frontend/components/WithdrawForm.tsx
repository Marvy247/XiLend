'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useUserAccountData } from '@/hooks/useLendingPool';
import { useEthUsdPrice } from '@/hooks/useEthUsdPrice';
import { CONTRACT_ADDRESSES, LENDING_POOL_ABI, COLLATERAL_MANAGER_ABI } from '@/lib/contracts';
import { Address } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, ArrowDown, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

interface WithdrawFormProps {
  onSuccess?: () => void;
}

export function WithdrawForm({ onSuccess }: WithdrawFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState<Address>(CONTRACT_ADDRESSES.MockUSDC);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState<'form' | 'withdrawing' | 'waiting' | 'success' | 'error'>('form');

  const { address } = useAccount();
  const { accountData, refetch } = useUserAccountData();
  const { writeContract, data: withdrawHash, error: withdrawError, isPending } = useWriteContract();
  const { ethUsdPrice, isLoading: isPriceLoading } = useEthUsdPrice();

  const { data: userCollateral } = useReadContract({
    address: CONTRACT_ADDRESSES.CollateralManager,
    abi: COLLATERAL_MANAGER_ABI,
    functionName: 'userCollateral',
    args: address && asset ? [address, asset] : undefined,
  });

  const { isLoading: isWithdrawing, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  useEffect(() => {
    if (isWithdrawSuccess) {
      setStep('success');
      refetch();
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
        onSuccess?.();
      }, 3000);
    } else if (withdrawError) {
      setStep('error');
      setErrors({ submit: withdrawError.message });
    }
  }, [isWithdrawSuccess, withdrawError]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    if (parseFloat(amount) > 1000000) {
      newErrors.amount = 'Amount cannot exceed 1,000,000 USDC';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !address) return;
    setErrors({});
    setStep('withdrawing');
    writeContract({
      address: CONTRACT_ADDRESSES.LendingPool,
      abi: LENDING_POOL_ABI,
      functionName: 'withdraw',
      args: [asset as `0x${string}`, BigInt(Math.floor(parseFloat(amount) * 10 ** 6)), address as `0x${string}`],
    });
  };

  const handleSetMax = () => {
    if (userCollateral) {
      const maxAmount = Number(userCollateral) / 1e6; // USDC has 6 decimals
      setAmount(Math.max(0, maxAmount).toFixed(2));
      setErrors({});
    }
  };

  const resetForm = () => {
    setAmount('');
    setErrors({});
    setStep('form');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (isPending || isWithdrawing) return;
      setIsOpen(open);
    }}>
      <div className="group p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-300 dark:hover:border-red-600 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <ArrowDown className="h-6 w-6 text-foreground" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Withdraw Collateral</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Remove assets from collateral</p>
            </div>
          </div>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium px-3 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
              Withdraw
            </Button>
          </DialogTrigger>
        </div>
      </div>
      <DialogContent className="sm:max-w-[425px] animate-slide-in">
        <DialogHeader>
          <DialogTitle>
            {step === 'withdrawing' && 'Withdrawing Assets'}
            {step === 'waiting' && 'Waiting for Confirmation'}
            {step === 'success' && 'Withdraw Successful'}
            {step === 'error' && 'Withdraw Failed'}
            {step === 'form' && 'Withdraw Assets'}
          </DialogTitle>
          <DialogDescription>
            {step === 'withdrawing' && 'Please sign the withdraw transaction in your wallet.'}
            {step === 'waiting' && 'Waiting for the transaction to be confirmed.'}
            {step === 'success' && 'Your assets have been successfully withdrawn.'}
            {step === 'error' && (errors.submit || 'An error occurred.')}
            {step === 'form' && 'Withdraw your assets from collateral.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          {step !== 'success' && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset" className="text-right">Asset</Label>
                  <Select value={asset} onValueChange={(value) => setAsset(value as Address)} disabled={isPending || isWithdrawing}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={CONTRACT_ADDRESSES.MockUSDC}>USDC</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right flex items-center"><DollarSign className="h-4 w-4 mr-1" />Amount</Label>
                <div className="col-span-3 flex space-x-2">
                  <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="flex-1" aria-invalid={!!errors.amount} required disabled={isPending || isWithdrawing} />
                  <Button type="button" variant="outline" size="sm" onClick={handleSetMax} disabled={!accountData || isPriceLoading} className="px-3 py-2 text-xs">Max</Button>
                </div>
                {errors.amount && <p id="amount-error" className="col-span-4 text-red-600 text-sm mt-1" role="alert">{errors.amount}</p>}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{amount} USDC</div>
              <p className="text-gray-600 dark:text-gray-400">Successfully withdrawn from collateral</p>
            </div>
          )}
          <DialogFooter>
            {step === 'success' ? (
              <Button onClick={() => setIsOpen(false)} className="w-full">Close</Button>
            ) : (
              <Button type="submit" disabled={isPending || isWithdrawing} className="w-full">
                {(isPending || isWithdrawing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Check Wallet...' : isWithdrawing ? 'Waiting...' : 'Withdraw'}
                {step === 'error' && 'Try Again'}
              </Button>
            )}
          </DialogFooter>
          {errors.submit && step === 'error' && (
            <div className="mt-2 text-red-600 text-sm flex items-center space-x-2" role="alert">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.submit}</span>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}