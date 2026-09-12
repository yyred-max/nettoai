"use client";

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
}: PipelineSidebarProps) {
    const isConnected = Boolean(wallet);
    const activeIndex = PIPELINE_STEPS.findIndex((s) => s.id === activeStep);

    return (
        <aside className="hidden w-64 flex-col justify-between border-r border-border px-5 py-6 sm:flex">
            <div>
                <p className="font-mono text-[11px] tracking-wide text-muted">
                    SECURITY VERIFICATION
                </p>
                <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-accent">
                    PIPELINE
                </p>

                {/* Visibility of system status: tell the user where they are
                   in the 5-step flow, not just which single step is active. */}
                <p className="mt-1 font-mono text-[10px] tracking-wide text-muted/60">
                    Step {activeIndex + 1} of {PIPELINE_STEPS.length}
                </p>

                <nav className="mt-6 flex flex-col" aria-label="Verification pipeline steps">
                    {PIPELINE_STEPS.map((step, index) => {
                        const isActive = step.id === activeStep;
                        const isComplete = index < activeIndex;
                        return (
                            <div
                                key={step.id}
                                aria-current={isActive ? "step" : undefined}
                                className={`flex items-center gap-3 border-l-2 px-3 py-3 font-mono text-sm transition-colors ${isActive
                                        ? "border-accent bg-accent/10 text-accent"
                                        : isComplete
                                            ? "border-emerald-500/50 text-gray-300"
                                            : "border-transparent text-muted"
                                    }`}
                            >
                                <i
                                    className={`bi ${isComplete ? "bi-check-circle-fill text-emerald-400" : step.icon
                                        }`}
                                />
                                {step.label}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Consistency & standards: once a wallet is connected (per the
               header's CONNECTED state), never show a "Connect Wallet" CTA
               again — replace it with a compact, disconnect-capable status
               chip instead of duplicating the action. */}
            {isConnected ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 font-mono text-xs">
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
                    className="flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent"
                >
                    <i className="bi bi-credit-card" />
                    CONNECT WALLET
                </button>
            )}
        </aside>
    );
}
