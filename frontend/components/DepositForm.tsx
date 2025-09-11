'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useUserAccountData } from '@/hooks/useLendingPool';
import { CONTRACT_ADDRESSES, LENDING_POOL_ABI, ERC20_ABI } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface DepositFormProps {
  onSuccess?: () => void;
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState<string>(CONTRACT_ADDRESSES.MockUSDC);
  const [useAsCollateral, setUseAsCollateral] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState<'form' | 'approving' | 'approve-waiting' | 'depositing' | 'deposit-waiting' | 'success' | 'error'>('form');

  const { address } = useAccount();
  const { refetch, queryKey } = useUserAccountData();
  const queryClient = useQueryClient();
  
  const { writeContract: approve, data: approveHash, error: approveError, isPending: isApproving } = useWriteContract();
  const { isLoading: isApproveWaiting, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: deposit, data: depositHash, error: depositError, isPending: isDepositing } = useWriteContract();
  const { isLoading: isDepositWaiting, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });

  useEffect(() => {
    if (isApproveSuccess && step === 'approve-waiting') {
      setStep('depositing');
      deposit({
        address: CONTRACT_ADDRESSES.LendingPool,
        abi: LENDING_POOL_ABI,
        functionName: 'deposit',
        args: [asset as `0x${string}`, BigInt(Math.floor(parseFloat(amount) * 10 ** 6)), address as `0x${string}`, useAsCollateral],
      });
    }
  }, [isApproveSuccess, step]);

  useEffect(() => {
    if (isDepositSuccess && step === 'deposit-waiting') {
      setStep('success');
      refetch();
      queryClient.invalidateQueries({ queryKey });
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
        onSuccess?.();
      }, 3000);
    }
  }, [isDepositSuccess, step]);

  useEffect(() => {
    if (approveError) {
      setStep('error');
      setErrors({ submit: approveError.message });
    }
    if (depositError) {
      setStep('error');
      setErrors({ submit: depositError.message });
    }
  }, [approveError, depositError]);

  useEffect(() => {
    if (approveHash && step === 'approving') {
      setStep('approve-waiting');
    }
  }, [approveHash, step]);

  useEffect(() => {
    if (depositHash && step === 'depositing') {
      setStep('deposit-waiting');
    }
  }, [depositHash, step]);

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
    setStep('approving');
    approve({
      address: asset as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.LendingPool, BigInt(Math.floor(parseFloat(amount) * 10 ** 6))],
    });
  };

  const resetForm = () => {
    setAmount('');
    setErrors({});
    setStep('form');
  };

  const isPending = isApproving || isApproveWaiting || isDepositing || isDepositWaiting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (isPending) return;
      setIsOpen(open);
    }}>
      <div className="group p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-gradient-primary group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Plus className="h-6 w-6 text-gray-900 dark:text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Deposit Collateral</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add assets to earn interest</p>
            </div>
          </div>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-gradient-primary/90 text-gray-900 dark:text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
              Deposit
            </Button>
          </DialogTrigger>
        </div>
      </div>
      <DialogContent className="sm:max-w-[425px] animate-slide-in">
        <DialogHeader>
          <DialogTitle>
            {step === 'approving' && 'Approving Token Spend'}
            {step === 'approve-waiting' && 'Waiting for Approval'}
            {step === 'depositing' && 'Depositing Assets'}
            {step === 'deposit-waiting' && 'Waiting for Deposit'}
            {step === 'success' && 'Deposit Successful'}
            {step === 'error' && 'Deposit Failed'}
            {step === 'form' && 'Deposit Assets'}
          </DialogTitle>
          <DialogDescription>
            {step === 'approving' && 'Please sign the approval transaction in your wallet.'}
            {step === 'approve-waiting' && 'Waiting for the approval transaction to be confirmed.'}
            {step === 'depositing' && 'Please sign the deposit transaction in your wallet.'}
            {step === 'deposit-waiting' && 'Waiting for the deposit transaction to be confirmed.'}
            {step === 'success' && 'Your assets have been successfully deposited.'}
            {step === 'error' && (errors.submit || 'An error occurred.')}
            {step === 'form' && 'Deposit your assets to be used as collateral.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${step !== 'form' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step === 'depositing' || step === 'deposit-waiting' || step === 'success' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step === 'success' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          </div>

          {step !== 'success' && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset" className="text-right">Asset</Label>
                <Select value={asset} onValueChange={setAsset} disabled={isPending}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={CONTRACT_ADDRESSES.MockUSDC}>USDC</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Amount</Label>
                <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="col-span-3" aria-invalid={!!errors.amount} required disabled={isPending} />
                {errors.amount && <p className="col-span-4 text-red-600 text-sm mt-1" role="alert">{errors.amount}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="collateral" className="text-right">Use as Collateral</Label>
                <input id="collateral" type="checkbox" checked={useAsCollateral} onChange={(e) => setUseAsCollateral(e.target.checked)} className="col-span-3" disabled={isPending} />
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{amount} USDC</div>
              <p className="text-gray-600 dark:text-gray-400">Successfully deposited as collateral</p>
            </div>
          )}
          <DialogFooter>
            {step === 'success' ? (
              <Button onClick={() => setIsOpen(false)} className="w-full">Close</Button>
            ) : (
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 'approving' && 'Check Wallet...'}
                {step === 'approve-waiting' && 'Approving...'}
                {step === 'depositing' && 'Check Wallet...'}
                {step === 'deposit-waiting' && 'Depositing...'}
                {step === 'form' && 'Deposit'}
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