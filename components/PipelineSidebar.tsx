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
    description: string;
};

export const PIPELINE_STEPS: PipelineStep[] = [
    { id: "intent_parsed", label: "Intent Parsed", icon: "bi-cloud-arrow-up", description: "Natural language parsed" },
    { id: "agent_action", label: "Agent Action", icon: "bi-briefcase", description: "Structured action generated" },
    { id: "policy_check", label: "Policy Check", icon: "bi-shield-check", description: "Security limits evaluated" },
    { id: "provenance", label: "Provenance", icon: "bi-shield-lock", description: "Field source verified" },
    { id: "decision", label: "Decision", icon: "bi-hammer", description: "Final authorization" },
];

type PipelineSidebarProps = {
    activeStep: PipelineStepId;
    wallet?: string | null;
    onConnectClick?: () => void;
    onDisconnectClick?: () => void;
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
    const [visualStep, setVisualStep] = useState<PipelineStepId>(activeStep);

    useEffect(() => {
        if (isLoading) {
            let currentIndex = 0;
            setVisualStep(PIPELINE_STEPS[0].id);
            const interval = setInterval(() => {
                currentIndex = (currentIndex + 1) % PIPELINE_STEPS.length;
                setVisualStep(PIPELINE_STEPS[currentIndex].id);
            }, 1400);
            return () => clearInterval(interval);
        } else {
            setVisualStep(activeStep);
        }
    }, [isLoading, activeStep]);

    const activeIndex = PIPELINE_STEPS.findIndex((s) => s.id === visualStep);

    return (
        <aside className="hidden w-64 flex-col justify-between border-r border-border bg-black/20 px-5 py-6 sm:flex relative overflow-hidden">
            {/* Ambient glow di belakang */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
                <p className="font-mono text-[10px] tracking-[0.2em] text-muted/60 uppercase">
                    Security Verification
                </p>
                <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-accent">
                    PIPELINE
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-wide text-muted/50">
                    Step {activeIndex + 1} of {PIPELINE_STEPS.length}
                </p>

                <nav className="mt-8 flex flex-col relative" aria-label="Verification pipeline steps">
                    {/* Progress Rail — garis vertikal yang terisi secara bertahap */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`w-full rounded-full transition-all duration-700 ease-out ${isLoading
                                    ? "bg-gradient-to-b from-accent via-accent to-accent/30 animate-pipe-flow"
                                    : "bg-gradient-to-b from-accent via-accent/60 to-transparent"
                                }`}
                            style={{
                                height: isLoading
                                    ? "100%"
                                    : `${((activeIndex + 1) / PIPELINE_STEPS.length) * 100}%`,
                            }}
                        />
                    </div>

                    {PIPELINE_STEPS.map((step, index) => {
                        const isActive = step.id === visualStep;
                        const isComplete = index < activeIndex;
                        const isPending = index > activeIndex;

                        return (
                            <div
                                key={step.id}
                                aria-current={isActive ? "step" : undefined}
                                className={`group relative flex items-start gap-4 px-3 py-3.5 rounded-xl transition-all duration-300 mb-0.5 ${isActive
                                        ? "bg-accent/[0.08]"
                                        : "hover:bg-white/[0.03]"
                                    }`}
                            >
                                {/* Node Indicator */}
                                <div className="relative shrink-0 mt-0.5">
                                    {/* Glow ring saat aktif */}
                                    {isActive && (
                                        <span className={`absolute -inset-1 rounded-full ${isLoading ? "animate-pulse-ring" : ""}`}>
                                            <span className="absolute inset-0 rounded-full bg-accent/20 blur-sm" />
                                        </span>
                                    )}

                                    <div
                                        className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ${isActive
                                                ? "bg-accent/20 text-accent ring-[1.5px] ring-accent shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                                                : isComplete
                                                    ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40"
                                                    : "bg-white/[0.03] text-muted/30 ring-1 ring-white/5"
                                            }`}
                                    >
                                        {/* Spinner saat loading di node aktif */}
                                        {isActive && isLoading && (
                                            <span className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                                        )}

                                        <i className={`bi ${isComplete && !isActive
                                                ? "bi-check-lg text-sm"
                                                : step.icon
                                            } text-[14px]`} />
                                    </div>
                                </div>

                                {/* Label & Status */}
                                <div className="flex flex-col min-w-0 pt-1">
                                    <span className={`font-mono text-[13px] leading-tight transition-colors duration-300 ${isActive
                                            ? "text-accent font-medium"
                                            : isComplete
                                                ? "text-gray-300"
                                                : "text-muted/50"
                                        }`}>
                                        {step.label}
                                    </span>

                                    {/* Status Badge */}
                                    <span className={`mt-1 inline-flex items-center gap-1 font-mono text-[9px] tracking-widest uppercase font-bold ${isActive
                                            ? "text-accent/70"
                                            : isComplete
                                                ? "text-emerald-400/60"
                                                : "text-muted/30"
                                        }`}>
                                        {isActive && isLoading ? (
                                            <>
                                                <span className="h-1 w-1 rounded-full bg-accent animate-pulse" />
                                                Checking
                                            </>
                                        ) : isActive ? (
                                            <>
                                                <span className="h-1 w-1 rounded-full bg-accent" />
                                                Active
                                            </>
                                        ) : isComplete ? (
                                            <>
                                                <i className="bi bi-check2 text-[10px]" />
                                                Done
                                            </>
                                        ) : (
                                            <>
                                                <span className="h-1 w-1 rounded-full bg-muted/30" />
                                                Pending
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Wallet section */}
            <div className="relative z-10 mt-6">
                {isConnected ? (
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-3 font-mono text-xs backdrop-blur-sm">
                        <span className="flex items-center gap-2 text-emerald-400 min-w-0">
                            <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                            </span>
                            <span className="truncate text-[11px]" title={wallet ?? undefined}>
                                {shortenAddress(wallet as string)}
                            </span>
                        </span>
                        {onDisconnectClick && (
                            <button
                                type="button"
                                onClick={onDisconnectClick}
                                aria-label="Disconnect wallet"
                                className="shrink-0 text-muted/50 transition-colors hover:text-red-400"
                            >
                                <i className="bi bi-box-arrow-right text-xs" />
                            </button>
                        )}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onConnectClick}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-[11px] text-gray-300 transition-all hover:border-accent/40 hover:text-accent hover:bg-accent/5"
                    >
                        <i className="bi bi-credit-card text-xs" />
                        CONNECT WALLET
                    </button>
                )}
            </div>

            {/* CSS Keyframes */}
            <style jsx>{`
                @keyframes pipe-flow {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 0% 200%; }
                }
                .animate-pipe-flow {
                    animation: pipe-flow 2.5s linear infinite;
                    background-size: 100% 200%;
                }
                @keyframes pulse-ring {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.15); }
                }
                .animate-pulse-ring {
                    animation: pulse-ring 2s ease-in-out infinite;
                }
            `}</style>
        </aside>
    );
}