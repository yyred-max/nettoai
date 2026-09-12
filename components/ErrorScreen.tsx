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
        <div className="glass-panel relative overflow-hidden rounded-2xl p-8 text-center max-w-xl mx-auto shadow-2xl ring-1 ring-red-500/20 my-10 animate-fade-in">
            {/* Subtle red ambient glow in the background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 p-3 opacity-20"><i className="bi bi-exclamation-triangle-fill text-6xl text-red-500" /></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/30">
                    <i className="bi bi-x-circle text-3xl text-red-400" />
                </div>
                
                <h2 className="text-xl font-display font-semibold text-gray-100 mb-2">Process Interrupted</h2>
                <p className="text-red-300/90 font-medium text-sm leading-relaxed max-w-md">
                    {error || 'An unknown error occurred during execution.'}
                </p>
                
                {note && (
                    <div className="mt-5 w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-left flex gap-3 items-start">
                        <i className="bi bi-exclamation-circle text-amber-400 mt-0.5" />
                        <p className="text-sm text-amber-200/90 font-medium">
                            {note}
                        </p>
                    </div>
                )}

                {txHash && (
                    <div className="mt-5 w-full text-sm text-gray-300 bg-bg/50 p-5 rounded-xl border border-border text-left shadow-inner">
                        <p className="text-xs uppercase tracking-widest text-muted mb-2 font-semibold">Transaction Found</p>
                        <a 
                            href={`https://testnet.bscscan.com/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover break-all bg-accent/10 px-3 py-2 rounded-lg font-mono text-xs w-full transition-colors border border-accent/20"
                        >
                            <i className="bi bi-box-arrow-up-right" />
                            {txHash}
                        </a>
                        
                        <div className="mt-5 flex items-start gap-3 bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                            <input 
                                type="checkbox" 
                                id="ack-tx"
                                checked={acknowledged}
                                onChange={(e) => setAcknowledged(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent focus:ring-offset-gray-900 cursor-pointer"
                            />
                            <label htmlFor="ack-tx" className="text-xs cursor-pointer select-none text-gray-400">
                                I confirm that I have checked the block explorer and verify this transaction failed or is incorrect. I want to proceed with a retry.
                            </label>
                        </div>
                    </div>
                )}

                <button
                    onClick={onReset}
                    disabled={!!txHash && !acknowledged}
                    className="mt-8 px-8 py-3 w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-red-500/20 font-display font-semibold tracking-wide text-white flex items-center justify-center gap-2 group"
                >
                    <i className="bi bi-arrow-counterclockwise group-hover:-rotate-180 transition-transform duration-500" />
                    Try Again
                </button>
            </div>
        </div>
    );
}