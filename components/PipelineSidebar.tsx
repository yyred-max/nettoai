"use client";

import { useState, useEffect } from "react";

export type PipelineStepId =
    | "intent_parsed"
    | "agent_action"
    | "policy_check"
    | "provenance"
    | "decision";

type PipelineStep = {
    id: PipelineStepId;
    label: string;
    icon: string;
};

export const PIPELINE_STEPS: PipelineStep[] = [
    { id: "intent_parsed", label: "Intent Parsed", icon: "bi-cloud-arrow-up" },
    { id: "agent_action", label: "Agent Action", icon: "bi-briefcase" },
    { id: "policy_check", label: "Policy Check", icon: "bi-shield-check" },
    { id: "provenance", label: "Provenance", icon: "bi-shield-lock" },
    { id: "decision", label: "Decision", icon: "bi-hammer" },
];

type PipelineSidebarProps = {
    activeStep: PipelineStepId;
    /** Current connected wallet address, or null/undefined when not connected. */
    wallet?: string | null;
    onConnectClick?: () => void;
    onDisconnectClick?: () => void;
    /** Status loading untuk memicu animasi */
    isLoading?: boolean;
};

function shortenAddress(addr: string) {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function PipelineSidebar({
    activeStep,
    wallet,
    onConnectClick,
    onDisconnectClick,
    isLoading = false,
}: PipelineSidebarProps) {
    const isConnected = Boolean(wallet);

    // State untuk simulasi progres langkah saat loading
    const [visualStep, setVisualStep] = useState<PipelineStepId>(activeStep);

    useEffect(() => {
        if (isLoading) {
            let currentIndex = 0;
            setVisualStep(PIPELINE_STEPS[0].id); // Mulai dari awal saat loading

            const interval = setInterval(() => {
                currentIndex = (currentIndex + 1) % PIPELINE_STEPS.length;
                setVisualStep(PIPELINE_STEPS[currentIndex].id);
            }, 1200); // Ganti langkah setiap 1.2 detik

            return () => clearInterval(interval);
        } else {
            setVisualStep(activeStep); // Kembalikan ke langkah sebenarnya jika tidak loading
        }
    }, [isLoading, activeStep]);

    const activeIndex = PIPELINE_STEPS.findIndex((s) => s.id === visualStep);

    return (
        <aside className="hidden w-64 flex-col justify-between border-r border-border px-5 py-6 sm:flex relative">
            <div>
                <p className="font-mono text-[11px] tracking-wide text-muted">
                    SECURITY VERIFICATION
                </p>
                <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-accent">
                    PIPELINE
                </p>

                <p className="mt-1 font-mono text-[10px] tracking-wide text-muted/60">
                    Step {activeIndex + 1} of {PIPELINE_STEPS.length}
                </p>

                <nav className="mt-6 flex flex-col relative" aria-label="Verification pipeline steps">
                    {/* Garis Penghubung Vertikal (Pipa) */}
                    <div
                        className={`absolute left-[15px] top-6 bottom-6 w-[2px] -z-10 rounded-full transition-colors duration-500 ${isLoading
                                ? 'bg-gradient-to-b from-transparent via-accent to-transparent bg-[length:100%_200%] animate-pipe-flow'
                                : 'bg-white/10'
                            }`}
                    />

                    {PIPELINE_STEPS.map((step, index) => {
                        const isActive = step.id === visualStep;
                        const isComplete = index < activeIndex;

                        return (
                            <div
                                key={step.id}
                                aria-current={isActive ? "step" : undefined}
                                className={`flex items-center gap-4 px-3 py-3 font-mono text-sm rounded-xl transition-all duration-300 mb-1 ${isActive
                                        ? "bg-accent/10 text-accent ring-1 ring-accent/30 shadow-[inset_0_0_12px_rgba(56,189,248,0.1)]"
                                        : isComplete
                                            ? "text-gray-300"
                                            : "text-muted"
                                    }`}
                            >
                                {/* Bulatan Node */}
                                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isActive
                                        ? 'bg-accent/20 text-accent ring-1 ring-accent shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                                        : isComplete
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-black/40 text-muted/40'
                                    }`}>
                                    {/* Animasi Putaran (Spinner) hanya pada step yang aktif saat loading */}
                                    {isActive && isLoading && (
                                        <span className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                                    )}

                                    <i className={`bi ${isComplete && !isActive ? "bi-check-lg" : step.icon
                                        } text-[15px]`} />
                                </div>

                                <span className={isActive ? 'font-medium tracking-wide' : 'font-light'}>
                                    {step.label}
                                </span>

                                {isComplete && !isActive && (
                                    <i className="bi bi-check2 text-emerald-400 ml-auto opacity-70" />
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Bagian Wallet tetap sama */}
            {isConnected ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 font-mono text-xs mt-6">
                    <span className="flex items-center gap-2 text-emerald-400 min-w-0">
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                        <span className="truncate" title={wallet ?? undefined}>
                            {shortenAddress(wallet as string)}
                        </span>
                    </span>
                    {onDisconnectClick && (
                        <button
                            type="button"
                            onClick={onDisconnectClick}
                            aria-label="Disconnect wallet"
                            className="shrink-0 text-muted/70 transition-colors hover:text-red-400"
                        >
                            <i className="bi bi-box-arrow-right" />
                        </button>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={onConnectClick}
                    className="flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent mt-6"
                >
                    <i className="bi bi-credit-card" />
                    CONNECT WALLET
                </button>
            )}

            {/* CSS Keyframes untuk efek aliran darah di pipa */}
            <style jsx>{`
                @keyframes pipe-flow {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 0% 200%; }
                }
                .animate-pipe-flow {
                    animation: pipe-flow 2s linear infinite;
                }
            `}</style>
        </aside>
    );
}