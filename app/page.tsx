// app/page.tsx
'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { IntentInput } from '@/components/IntentInput';
import { NettoResult } from '@/components/NettoResult';
import { SuccessScreen } from '@/components/SuccessScreen';
import { LoadingState } from '@/components/LoadingState';
import { ErrorScreen } from '@/components/ErrorScreen';

type UIStatus = 'idle' | 'loading' | 'allow' | 'blocked' | 'executing' | 'success' | 'error';

type ResultData = {
  status: 'ALLOW' | 'BLOCKED';
  decisionId: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  intent: any;
  action: any;
  provenance: any;
};

export default function Home() {
  const [uiStatus, setUiStatus] = useState<UIStatus>('idle');
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [txData, setTxData] = useState<{ txHash: string; block: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (userInput: string) => {
    setUiStatus('loading');
    setError(null);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'NettoAI check failed');
      setResultData(data);
      setUiStatus(data.status === 'ALLOW' ? 'allow' : 'blocked');
    } catch (err: any) {
      setError(err.message);
      setUiStatus('error');
    }
  };

  const handleExecute = async (decisionId: string) => {
    setUiStatus('executing');
    try {
      const res = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');
      setTxData({ txHash: data.txHash, block: data.block });
      setUiStatus('success');
    } catch (err: any) {
      setError(err.message);
      setUiStatus('error');
    }
  };

  const handleReset = () => {
    setUiStatus('idle');
    setResultData(null);
    setTxData(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="container max-w-3xl mx-auto px-4 py-12">
        {uiStatus === 'idle' && <IntentInput onSubmit={handleCheck} />}
        {uiStatus === 'loading' && <LoadingState message="NettoAI is analyzing your request..." />}
        {(uiStatus === 'allow' || uiStatus === 'blocked') && resultData && (
          <NettoResult
            data={resultData}
            onExecute={() => handleExecute(resultData.decisionId)}
            onTryAgain={handleReset}
          />
        )}
        {uiStatus === 'executing' && <LoadingState message="Sending transaction to BSC Testnet..." />}
        {uiStatus === 'success' && txData && <SuccessScreen txData={txData} onReset={handleReset} />}
        {uiStatus === 'error' && <ErrorScreen error={error} onReset={handleReset} />}
      </div>
    </main>
  );
}