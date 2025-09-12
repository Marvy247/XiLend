'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Wallet, TrendingUp, TrendingDown, Activity, Eye, EyeOff } from 'lucide-react';
import { useUserAccountData, useHealthFactorWarning } from '@/hooks/useLendingPool';
import { useEthUsdPrice } from '@/hooks/useEthUsdPrice';
import { NotificationAlert } from '@/components/NotificationAlert';
import { DepositForm } from '@/components/DepositForm';
import { BorrowForm } from '@/components/BorrowForm';
import { RepayForm } from '@/components/RepayForm';
import { WithdrawForm } from '@/components/WithdrawForm';
import { ReminderForm } from '@/components/ReminderForm';
import { TransactionHistory } from '@/components/TransactionHistory';
import { useReminders } from '@/hooks/useReminders';
import { OnboardingModal } from '@/components/OnboardingModal';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { formatValue, formatHealthFactor } from '@/lib/utils';

function DashboardCardSkeleton() {
  return (
    <Card className="glass-card p-6">
      <CardHeader className="flex flex-row items-center space-x-4 space-y-0 pb-4 relative">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { accountData, isLoading: isAccountDataLoading, refetch, error: accountError } = useUserAccountData();
  const { reminders, addReminder, removeReminder } = useReminders();
  const healthFactorWarning = useHealthFactorWarning();
  const { ethUsdPrice, isLoading: isPriceLoading, error: priceError } = useEthUsdPrice();

  const isLoading = isAccountDataLoading || isPriceLoading;

  useEffect(() => {
    if (accountData) {
      console.log('Account Data:', accountData);
    }
  }, [accountData]);

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isConnected && !localStorage.getItem('onboardingCompleted')) {
      setShowOnboarding(true);
    }
  }, [isConnected]);

  const [collateralVisible, setCollateralVisible] = useState(true);
  const [debtVisible, setDebtVisible] = useState(true);
  const [borrowVisible, setBorrowVisible] = useState(true);
  const [healthVisible, setHealthVisible] = useState(true);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingCompleted', 'true');
  };

  const getHealthFactorColor = (hf: number) => {
    if (hf < 1.0) return 'destructive';
    if (hf < 1.5) return 'secondary';
    return 'default';
  };

  const getHealthFactorTextColor = (hf: number) => {
    if (hf < 1.0) return 'text-red-600 dark:text-red-400';
    if (hf < 1.5) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getHealthFactorText = (hf: number) => {
    if (hf < 1.0) return 'Critical';
    if (hf < 1.5) return 'Warning';
    return 'Healthy';
  };

  const getHealthFactorBarClasses = (hf: number) => {
    if (hf < 1.0) {
      return 'bg-gradient-to-r from-red-400 to-red-600 opacity-80 group-hover:opacity-100';
    }
    if (hf < 1.5) {
      return 'bg-gradient-to-r from-yellow-400 to-orange-500 opacity-60 group-hover:opacity-100';
    }
    return 'bg-gradient-to-r from-green-400 to-green-600 opacity-60 group-hover:opacity-100';
  };

  const getHealthFactorHoverBg = (hf: number) => {
    if (hf < 1.0) {
      return 'bg-gradient-to-br from-red-400/20 to-red-500/20';
    }
    if (hf < 1.5) {
      return 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20';
    }
    return 'bg-gradient-to-br from-green-400/20 to-green-500/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500 flex flex-col">
      <Header />

      <main className="flex-1 max-w-8xl mx-auto p-6 lg:p-8 min-h-[calc(100vh-200px)]">
        <div className="mb-16 animate-fade-in">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl flex items-center">
            <Activity className="h-6 w-6 mr-4" />
            Manage your lending positions
          </p>
        </div>

        {isConnecting || isReconnecting ? (
          <Card className="text-center p-12 glass animate-fade-in hover:shadow-xl transition-all duration-300 border-0">
            <CardContent>
              <div className="p-6 rounded-full bg-gradient-secondary inline-block mb-8 animate-spin">
                <Wallet className="h-20 w-20 text-foreground" />
              </div>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Connecting Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-xl">
                Please wait while we connect to your wallet...
              </p>
            </CardContent>
          </Card>
        ) : !isConnected ? (
          <Card className="text-center p-12 glass animate-fade-in hover:shadow-xl transition-all duration-300 border-0">
            <CardContent>
              <div className="p-6 rounded-full bg-gradient-secondary inline-block mb-8 animate-bounce-custom">
                <Wallet className="h-20 w-20 text-foreground" />
              </div>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-xl">
                Connect your wallet to view your lending positions and manage your assets securely.
              </p>
              <p className=" text-base text-gray-500 dark:text-gray-400">
                Use the Connect Wallet button in the header to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {accountError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p className="font-bold">Error fetching account data</p>
                <p>{accountError.message}</p>
              </div>
            )}
            {priceError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p className="font-bold">Error fetching price data</p>
                <p>{priceError.message}</p>
              </div>
            )}

            {healthFactorWarning && (
              <NotificationAlert
                level={healthFactorWarning.level}
                message={healthFactorWarning.message}
                healthFactor={Number(accountData?.healthFactor) / 1e18}
              />
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
                <DashboardCardSkeleton />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
                <Card className="glass-card hover-lift transition-all duration-300 border-0 overflow-hidden relative group p-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
                  <CardHeader className="flex flex-row items-center space-x-4 space-y-0 pb-4 relative">
                    <div className="p-3 rounded-full bg-gradient-success shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 flex-1">Total Collateral</CardTitle>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 focus-ring"
                        aria-label="Refresh data"
                        title="Refresh account data"
                      >
                        <svg className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollateralVisible(!collateralVisible)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 focus-ring"
                        aria-label={collateralVisible ? "Hide collateral value" : "Show collateral value"}
                      >
                        {collateralVisible ? <Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" /> : <EyeOff className="h-4 w-4 text-gray-600 dark:text-gray-300" />}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                      {collateralVisible ? (accountData ? formatValue(accountData.totalCollateralETH, true, ethUsdPrice) : '0.00') : '****'} <span className="text-lg font-medium text-gray-600 dark:text-gray-400">ETH</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Your deposited assets</p>
                    <div className="mt-3 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </CardContent>
                </Card>

                <Card className="glass-card hover-lift transition-all duration-300 border-0 overflow-hidden relative group p-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
                  <CardHeader className="flex flex-row items-center space-x-4 space-y-0 pb-4 relative">
                    <div className="p-3 rounded-full bg-gradient-danger shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <TrendingDown className="h-5 w-5 text-foreground" />
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 flex-1">Total Debt</CardTitle>
                    <button
                      type="button"
                      onClick={() => setDebtVisible(!debtVisible)}
                      className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 focus-ring"
                      aria-label={debtVisible ? "Hide debt value" : "Show debt value"}
                    >
                      {debtVisible ? <Eye className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <EyeOff className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
                    </button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                      {debtVisible ? (accountData ? formatValue(accountData.totalDebtETH, true, ethUsdPrice) : '0.00') : '****'} <span className="text-lg font-medium text-gray-600 dark:text-gray-400">USDC</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Outstanding loans</p>
                    <div className="mt-3 h-1 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </CardContent>
                </Card>

                <Card className="glass-card hover-lift transition-all duration-300 border-0 overflow-hidden relative group p-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
                  <CardHeader className="flex flex-row items-center space-x-4 space-y-0 pb-4 relative">
                    <div className="p-3 rounded-full bg-gradient-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Wallet className="h-5 w-5 text-foreground" />
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 flex-1">Available Borrow</CardTitle>
                    <button
                      type="button"
                      onClick={() => setBorrowVisible(!borrowVisible)}
                      className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 focus-ring"
                      aria-label={borrowVisible ? "Hide borrow value" : "Show borrow value"}
                    >
                      {borrowVisible ? <Eye className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <EyeOff className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
                    </button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                      {borrowVisible ? (accountData ? formatValue(accountData.availableBorrowsETH, true, ethUsdPrice) : '0.00') : '****'} <span className="text-lg font-medium text-gray-600 dark:text-gray-400">USDC</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Borrowing power</p>
                    <div className="mt-3 h-1 bg-gradient-to-r from-blue-400 to-sky-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </CardContent>
                </Card>

                <Card className="glass-card hover-lift transition-all duration-300 border-0 overflow-hidden relative group p-6">
                  <div className={`absolute inset-0 ${accountData ? getHealthFactorHoverBg(Number(accountData.healthFactor) / 1e18) : 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl`}></div>
                  <CardHeader className="flex flex-row items-center space-x-4 space-y-0 pb-4 relative">
                    <div className={`p-3 rounded-full bg-gradient-warning shadow-lg group-hover:scale-110 transition-transform duration-300 ${accountData && healthVisible && Number(accountData.healthFactor) / 1e18 < 1.0 ? 'animate-pulse' : ''}`}>
                      <AlertTriangle className="h-5 w-5 text-foreground" />
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 flex-1">Health Factor</CardTitle>
                    <button
                      type="button"
                      onClick={() => setHealthVisible(!healthVisible)}
                      className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 focus-ring"
                      aria-label={healthVisible ? "Hide health factor" : "Show health factor"}
                    >
                      {healthVisible ? <Eye className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <EyeOff className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
                    </button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={`text-4xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300 ${accountData && healthVisible ? getHealthFactorTextColor(Number(accountData.healthFactor) / 1e18) : 'text-gray-900 dark:text-white'} ${accountData && healthVisible && Number(accountData.healthFactor) / 1e18 < 1.0 ? 'animate-pulse' : ''}`}>
                      {healthVisible ? (accountData ? formatHealthFactor(Number(accountData.healthFactor) / 1e18) : '∞') : '****'}
                    </div>
                    {accountData && healthVisible && (
                      <Badge
                        variant={getHealthFactorColor(Number(accountData.healthFactor) / 1e18)}
                        className={`mb-2 animate-fade-in font-semibold px-3 py-1 ${Number(accountData.healthFactor) / 1e18 < 1.0 ? 'animate-bounce shadow-lg' : ''}`}
                      >
                        {getHealthFactorText(Number(accountData.healthFactor) / 1e18)}
                      </Badge>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {accountData && healthVisible && Number(accountData.healthFactor) / 1e18 < 1.0 ? '⚠️ High liquidation risk!' : 'Liquidation risk'}
                    </p>
                    <div className={`mt-3 h-1 rounded-full transition-opacity duration-300 ${accountData && healthVisible ? getHealthFactorBarClasses(Number(accountData.healthFactor) / 1e18) : 'bg-gradient-to-r from-yellow-400 to-orange-500 opacity-60 group-hover:opacity-100'} ${accountData && healthVisible && Number(accountData.healthFactor) / 1e18 < 1.0 ? 'animate-pulse' : ''}`}></div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 animate-fade-in">
              <DepositForm />
              <BorrowForm />
              <RepayForm />
              <WithdrawForm />
            </div>

            <div className="mt-20">
              <ReminderForm onAddReminder={addReminder} />
              {reminders.length > 0 && (
                <div className="mt-8 space-y-6">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-lg">{reminder.title}</p>
                        <p className="text-base text-gray-600 dark:text-gray-400">{reminder.message}</p>
                      </div>
                      <button
                        onClick={() => removeReminder(reminder.id)}
                        className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors text-xl"
                        aria-label={`Remove reminder ${reminder.title}`}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <TransactionHistory />
            </div>
          </>
        )}
      </main>
      <Footer />
      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />
    </div>
  );
}