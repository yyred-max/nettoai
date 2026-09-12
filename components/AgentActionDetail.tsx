"use client";

import { useState } from "react";
import PipelineSidebar from "./PipelineSidebar";
import LoadingState from "./LoadingState";

type AgentActionDetailProps = {
    userIntent: string;
    action: any;
    intentData: any;
    onBack: () => void;
    onViewProvenance: () => void;
    network?: string;
    wallet?: string | null;
    isLoading?: boolean; // <-- Prop baru
};

export default function AgentActionDetail({
    userIntent,
    action,
    intentData,
    onBack,
    onViewProvenance,
    network = "BSC TESTNET",
    wallet = null,
    isLoading = false, // <-- Default false
}: AgentActionDetailProps) {
    const displayWallet = wallet || "0x...";
    const recipient = action?.recipient || "—";
    const amount = action?.amount || "—";
    const token = action?.token || "USDT";

    const [copied, setCopied] = useState(false);
    const copyRecipient = async () => {
        if (!recipient || recipient === "—") return;
        try {
            await navigator.clipboard.writeText(recipient);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Failed to copy address:", err);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-transparent">
            <header className="flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/20 px-6 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                        <i className="bi bi-shield-fill-check text-white" />
                    </div>
                    <span className="font-display text-xl font-bold tracking-wide text-white">NETTO<span className="text-accent font-light">AI</span></span>
                    <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-[10px] tracking-widest text-accent uppercase ml-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> {network}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-xs text-gray-300">
                        {displayWallet}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] tracking-widest font-bold text-emerald-400">
                        <i className="bi bi-check-circle" /> CONNECTED
                    </span>
                    <button type="button" aria-label="Settings" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-muted transition-all hover:text-white hover:bg-white/10">
                        <i className="bi bi-gear text-sm" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <div className="hidden sm:block z-10">
                    <PipelineSidebar activeStep="agent_action" wallet={wallet} isLoading={isLoading} />
                </div>
                <main className="flex-1 px-6 py-14 sm:px-10 overflow-y-auto relative z-10 w-full">
                    <div className="mx-auto max-w-4xl relative">
                        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

                        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 bg-gradient-to-r from-accent/5 to-transparent p-6 rounded-2xl border border-white/5">
                            <div>
                                <h1 className="font-display text-4xl font-light tracking-tight text-white">Agent <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">Action</span></h1>
                                <p className="mt-2 text-sm text-gray-400 font-light">Review the structured action generated from your natural language intent.</p>
                            </div>
                            <span className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-[10px] tracking-widest font-bold text-accent shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                                <i className="bi bi-check2-square text-sm" /> ACTION GENERATED
                            </span>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 relative z-10">
                            <div className="glass-panel rounded-2xl p-6 transition-all hover:border-white/20 hover:bg-white/5 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><i className="bi bi-person text-6xl text-white" /></div>
                                <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest font-bold text-gray-400 uppercase mb-5">
                                    <i className="bi bi-person text-accent" /> Original User Intent
                                </span>
                                <div className="rounded-xl border border-white/5 bg-black/40 px-5 py-6 flex items-center justify-center min-h-[120px] shadow-inner relative z-10">
                                    <p className="font-sans text-lg italic text-gray-200 font-light leading-relaxed text-center max-w-sm">&quot;{userIntent}&quot;</p>
                                </div>
                                <p className="mt-5 text-[11px] text-muted/70 font-sans px-1">This is the original prompt parsed directly from your input.</p>
                            </div>

                            <div className="glass-panel rounded-2xl p-6 border-accent/30 bg-gradient-to-b from-accent/5 to-transparent relative shadow-[0_4px_25px_rgba(56,189,248,0.05)]">
                                <div className="flex items-center justify-between mb-5">
                                    <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest font-bold text-accent uppercase">
                                        <i className="bi bi-braces text-accent" /> Generated Action
                                    </span>
                                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] tracking-widest font-bold text-emerald-400">EXECUTION READY</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-white/5 bg-black/40 px-4 py-3 shadow-inner">
                                        <p className="font-mono text-[9px] tracking-widest font-bold uppercase text-muted/70 mb-1">Function</p>
                                        <p className="font-mono text-sm text-gray-100 font-semibold tracking-wide">transfer</p>
                                    </div>
                                    <div className="rounded-xl border border-white/5 bg-black/40 px-4 py-3 shadow-inner">
                                        <div className="mb-1 flex items-center justify-between gap-2">
                                            <p className="font-mono text-[9px] tracking-widest font-bold uppercase text-muted/70">Recipient</p>
                                            <button
                                                type="button"
                                                onClick={copyRecipient}
                                                aria-label="Copy full recipient address"
                                                className="shrink-0 rounded p-0.5 text-muted/60 transition-colors hover:text-accent"
                                            >
                                                <i className={`bi ${copied ? "bi-check2" : "bi-clipboard"} text-[11px]`} />
                                            </button>
                                        </div>
                                        <p className="font-mono text-xs text-accent break-all">{recipient}</p>
                                        {copied && (
                                            <p className="mt-1 font-mono text-[9px] text-emerald-400">Copied to clipboard</p>
                                        )}
                                    </div>
                                    <div className="rounded-xl border border-white/5 bg-black/40 px-4 py-3 shadow-inner">
                                        <p className="font-mono text-[9px] tracking-widest font-bold uppercase text-muted/70 mb-1">Amount</p>
                                        <p className="font-mono text-sm text-gray-100 font-semibold">{amount} {token}</p>
                                    </div>
                                    <div className="rounded-xl border border-white/5 bg-black/40 px-4 py-3 shadow-inner">
                                        <p className="font-mono text-[9px] tracking-widest font-bold uppercase text-muted/70 mb-1">Network</p>
                                        <p className="font-mono text-xs text-gray-100 truncate">{network}</p>
                                    </div>
                                </div>
                                <div className="mt-4 rounded-xl border border-accent/20 bg-black/60 px-5 py-4 font-mono text-xs shadow-inner">
                                    <div className="flex items-center gap-2 text-muted/60 mb-2">
                                        <div className="flex gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-red-500/50" />
                                            <span className="h-2 w-2 rounded-full bg-yellow-500/50" />
                                            <span className="h-2 w-2 rounded-full bg-emerald-500/50" />
                                        </div>
                                        <span className="text-[10px] uppercase">Technical preview (sysout)</span>
                                    </div>
                                    <p className="text-accent/90 break-all leading-relaxed">
                                        <span className="text-purple-400">transfer</span>(recipient: <span className="text-amber-200">{recipient}</span>, amount: <span className="text-emerald-300">{amount}</span> <span className="text-gray-400">{token}</span>)
                                    </p>
                                    <p className="mt-2 text-[10px] text-muted/50 normal-case">
                                        This is the exact function call that will be sent on-chain — shown for transparency, not required reading.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 md:grid-cols-2 relative z-10">
                            <div className="glass-panel rounded-2xl p-6">
                                <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest font-bold text-gray-400 uppercase mb-5">
                                    <i className="bi bi-list-check text-accent" /> Action Field Status
                                </span>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-5 py-4 transition-colors hover:bg-white/5">
                                        <span className="flex items-center gap-3 font-mono text-sm text-gray-200 truncate pr-4">
                                            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                <i className="bi bi-check-lg text-emerald-400 text-xs" />
                                            </div>
                                            <span className="truncate" title={recipient}>Recipient: {recipient}</span>
                                        </span>
                                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[9px] font-bold text-emerald-400 uppercase tracking-widest shrink-0">Detected</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-5 py-4 transition-colors hover:bg-white/5">
                                        <span className="flex items-center gap-3 font-mono text-sm text-gray-200">
                                            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                <i className="bi bi-check-lg text-emerald-400 text-xs" />
                                            </div>
                                            Amount: {amount} {token}
                                        </span>
                                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[9px] font-bold text-emerald-400 uppercase tracking-widest shrink-0">Detected</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── PERBAIKAN DI SINI ─────────────────────────────── */}
                            <div className="glass-panel rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest font-bold text-gray-400 uppercase">
                                        <i className="bi bi-shield-check text-accent" /> Policy Check
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[9px] tracking-widest text-muted uppercase font-bold">
                                        <span className={`h-1.5 w-1.5 rounded-full ${isLoading ? "bg-accent animate-pulse" : "bg-gray-400"}`} />
                                        {isLoading ? "CHECKING" : "PENDING"}
                                    </span>
                                </div>
                                <p className="text-sm font-light text-gray-400 leading-relaxed mb-6">
                                    {isLoading
                                        ? "NettoAI is analyzing your intent and generating the secure execution plan..."
                                        : "The generated action above will now be evaluated against the security execution policy limits before authorization."}
                                </p>
                                {/* Gunakan tone="checking" (biru) jika sedang loading, "pending" (abu-abu) jika tidak */}
                                <LoadingState
                                    label={isLoading ? "NettoAI is analyzing" : "Evaluating policy limits"}
                                    tone={isLoading ? "checking" : "pending"}
                                />
                            </div>
                            {/* ──────────────────────────────────────────────────── */}
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 glass-panel rounded-2xl px-6 py-8 relative z-10">
                            <div className="flex flex-col items-center gap-3 group">
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-muted transition-all group-hover:border-white/20 group-hover:text-gray-300">
                                    <i className="bi bi-people text-2xl" />
                                </div>
                                <span className="font-mono text-[10px] tracking-widest font-bold text-muted/70 uppercase">User Intent</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <div className="flex flex-col items-center gap-3 z-10">
                                <div className={`flex h-16 w-16 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent shadow-[0_0_20px_rgba(56,189,248,0.2)] ${isLoading ? 'animate-pulse' : ''}`}>
                                    <i className="bi bi-robot text-2xl" />
                                </div>
                                <span className="font-mono text-[10px] tracking-widest font-bold text-accent/80 uppercase">Processing</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                            <div className="flex flex-col items-center gap-3 group">
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-accent text-accent bg-accent/5 shadow-inner transition-all group-hover:bg-accent/10">
                                    <i className="bi bi-code-square text-2xl" />
                                </div>
                                <span className="font-mono text-[10px] tracking-widest font-bold text-accent uppercase">Action</span>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 w-full">
                            <button onClick={onBack} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 px-6 py-4 font-mono text-[11px] uppercase tracking-widest font-bold text-gray-300 transition-all hover:bg-white/5 hover:text-white">
                                <i className="bi bi-arrow-left" /> Back to Check
                            </button>
                            <button
                                onClick={onViewProvenance}
                                disabled={isLoading}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-blue-600 px-6 py-4 font-display font-semibold tracking-wide text-white transition-all hover:from-accent hover:to-blue-500 shadow-[0_4px_20px_rgba(56,189,248,0.3)] hover:shadow-[0_4px_25px_rgba(56,189,248,0.5)] group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                View Field Provenance <i className="bi bi-arrow-right group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <footer className="flex h-12 w-full items-center justify-between border-t border-white/5 bg-black/20 px-6 backdrop-blur-md relative z-10">
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-accent/80">NettoAI Guardian v1.0.42</span>
                <div className="flex items-center gap-6 text-xs text-muted/70 font-mono">
                    <span className="flex gap-2 hidden sm:flex">NET: <span className="text-gray-300 font-medium">{network}</span></span>
                    <span className="text-gray-300 font-medium hidden sm:block">{displayWallet}</span>
                    <span className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        <span className="text-gray-300 font-medium">24ms</span>
                    </span>
                </div>
            </footer>
        </div>
    );
}