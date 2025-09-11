'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useUserAccountData } from '@/hooks/useLendingPool';
import { CONTRACT_ADDRESSES, LENDING_POOL_ABI } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, TrendingDown, AlertCircle, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';

interface BorrowFormProps {
  onSuccess?: () => void;
}

export function BorrowForm({ onSuccess }: BorrowFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState<string>(CONTRACT_ADDRESSES.MockUSDC);
  const [interestRateMode, setInterestRateMode] = useState(1); // 1 for stable, 2 for variable
  const [step, setStep] = useState<'idle' | 'borrowing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  const { address } = useAccount();
  const { accountData, refetch, queryKey } = useUserAccountData();
  const { writeContract, isPending, data: borrowHash, error: borrowError } = useWriteContract();
  const { isLoading: isBorrowing, isSuccess: isBorrowSuccess } = useWaitForTransactionReceipt({
    hash: borrowHash,
  });
  const queryClient = useQueryClient();

  // Watch for transaction completion and update step accordingly
  useEffect(() => {
    if (isBorrowSuccess) {
      setStep('success');
      // Immediately refetch user account data after successful borrow
      refetch();
      // Invalidate query cache to force update
      queryClient.invalidateQueries({ queryKey });
      // Additional refetch after a short delay to ensure blockchain state is updated
      setTimeout(() => {
        refetch();
        queryClient.invalidateQueries({ queryKey });
      }, 1000);
      // Close dialog after showing success and allowing time for refetch
      setTimeout(() => {
        setIsOpen(false);
        setAmount('');
        setStep('idle');
        onSuccess?.();
        // Final refetch to ensure all components are updated
        refetch();
        queryClient.invalidateQueries({ queryKey });
      }, 2000);
    } else if (borrowError) {
      setStep('error');
      setErrorMessage(borrowError?.message || 'Borrow transaction failed. Please try again.');
    }
  }, [isBorrowSuccess, borrowError, onSuccess, refetch, queryClient, queryKey]);

  const formatValue = (value: bigint | number, convertToUSDC: boolean = false) => {
    const numValue = typeof value === 'bigint' ? Number(value) / 1e18 : value;
    if (convertToUSDC) {
      // Convert ETH value to USDC equivalent (assuming 1 ETH = 2000 USDC)
      const usdcValue = numValue * 2000;
      return usdcValue.toFixed(2);
    }
    return numValue.toFixed(4);
  };

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
      const maxAmount = Number(accountData.availableBorrowsETH) / 1e18 * 2000;
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

    setStep('borrowing');
    setErrorMessage('');
    setValidationError('');

    const amountInWei = BigInt(Math.floor(parseFloat(amount) * 10 ** 6));
    await writeContract({
      address: CONTRACT_ADDRESSES.LendingPool,
      abi: LENDING_POOL_ABI,
      functionName: 'borrow',
      args: [asset as `0x${string}`, amountInWei, BigInt(interestRateMode), address],
    });
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
      <div className="group p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-300 dark:hover:border-red-600 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600 relative overflow-hidden glass-card hover-lift">
        <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-gradient-danger group-hover:scale-110 transition-transform duration-300 shadow-lg animate-glow">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Borrow Assets</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Borrow against your collateral</p>
            </div>
          </div>
          <DialogTrigger asChild>
            <Button className="bg-gradient-danger hover:bg-gradient-danger/90 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus-ring">
              Borrow
            </Button>
          </DialogTrigger>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Available to borrow:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {accountData ? formatValue(accountData.availableBorrowsETH, true) : '0.00'} USDC
            </span>
          </div>
        </div>
      </div>
      <DialogContent className="sm:max-w-[500px] animate-scale-in glass-card border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-danger shadow-lg">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                Borrow Assets
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                Borrow assets using your deposited collateral as security.
              </DialogDescription>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available to Borrow:</span>
              <span className="font-bold text-lg text-red-600 dark:text-red-400">
                {accountData ? formatValue(accountData.availableBorrowsETH, true) : '0.00'} USDC
              </span>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <div className="p-1.5 rounded-full bg-gradient-primary mr-2">
                  <DollarSign className="h-3 w-3 text-white" />
                </div>
                Asset
              </Label>
              <Select value={asset} onValueChange={setAsset}>
                <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CONTRACT_ADDRESSES.MockUSDC}>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span>USDC</span>
                    </div>
                  </SelectItem>
                  {/* <SelectItem value={CONTRACT_ADDRESSES.MockXFI}>XFI</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <div className="p-1.5 rounded-full bg-gradient-success mr-2">
                  <DollarSign className="h-3 w-3 text-white" />
                </div>
                Amount
              </Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount to borrow"
                    className={`h-12 text-lg border-2 transition-all duration-200 pr-20 ${
                      validationError
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20'
                    } hover:border-gray-300 dark:hover:border-gray-600`}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSetMax}
                    disabled={!accountData}
                    className="absolute right-2 top-2 h-8 px-3 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                  >
                    Max
                  </Button>
                </div>
                {validationError && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{validationError}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Min: 0.01 USDC</span>
                  <span>Max: {accountData ? formatValue(accountData.availableBorrowsETH, true) : '0.00'} USDC</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateMode" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <div className="p-1.5 rounded-full bg-gradient-warning mr-2">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                Interest Rate Mode
              </Label>
              <Select value={interestRateMode.toString()} onValueChange={(value) => setInterestRateMode(parseInt(value))}>
                <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="font-medium">Stable Rate</div>
                        <div className="text-xs text-gray-500">Fixed interest rate</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <div>
                        <div className="font-medium">Variable Rate</div>
                        <div className="text-xs text-gray-500">Rate changes with market</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
                  <span className="font-medium">Borrow transaction successful!</span>
                </div>
              </div>
            )}
            <div className="flex space-x-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 h-12 border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                disabled={isPending || step === 'borrowing'}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || step === 'borrowing' || !!validationError}
                className="flex-1 h-12 bg-gradient-danger hover:bg-gradient-danger/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 'borrowing' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 'borrowing' ? 'Processing...' : 'Borrow Assets'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
