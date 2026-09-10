// components/ErrorScreen.tsx
import { useState } from "react";

interface ErrorScreenProps {
    error: string | null;
    note?: string;
    txHash?: string;
    onReset: () => void;
}

export default function ErrorScreen({ error, note, txHash, onReset }: ErrorScreenProps) {
    const [acknowledged, setAcknowledged] = useState(false);

    return (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center max-w-lg mx-auto">
            <p className="text-red-400 font-medium">❌ {error || 'An unknown error occurred'}</p>
            
            {note && (
                <p className="mt-3 text-sm text-yellow-300 bg-yellow-900/20 p-3 rounded">
                    ⚠️ {note}
                </p>
            )}

            {txHash && (
                <div className="mt-4 text-sm text-gray-300 bg-black/20 p-3 rounded border border-gray-700">
                    <p className="mb-2">Transaction Hash found:</p>
                    <a 
                        href={`https://testnet.bscscan.com/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 break-all underline"
                    >
                        {txHash}
                    </a>
                    
                    <div className="mt-4 flex items-start text-left gap-2">
                        <input 
                            type="checkbox" 
                            id="ack-tx"
                            checked={acknowledged}
                            onChange={(e) => setAcknowledged(e.target.checked)}
                            className="mt-1 flex-shrink-0"
                        />
                        <label htmlFor="ack-tx" className="text-sm cursor-pointer select-none">
                            I have checked BscScan and I am sure the transaction failed or is not what I wanted. I want to try again.
                        </label>
                    </div>
                </div>
            )}

            <button
                onClick={onReset}
                disabled={!!txHash && !acknowledged}
                className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-white"
            >
                Try Again
            </button>
        </div>
    );
}