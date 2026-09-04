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
    showConnectButton?: boolean;
    onConnectClick?: () => void;
};

export default function PipelineSidebar({
    activeStep,
    showConnectButton = false,
    onConnectClick,
}: PipelineSidebarProps) {
    return (
        <aside className="hidden w-64 flex-col justify-between border-r border-border px-5 py-6 sm:flex">
            <div>
                <p className="font-mono text-[11px] tracking-wide text-muted">
                    SECURITY VERIFICATION
                </p>
                <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-accent">
                    PIPELINE
                </p>

                <nav className="mt-6 flex flex-col">
                    {PIPELINE_STEPS.map((step) => {
                        const isActive = step.id === activeStep;
                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-3 border-l-2 px-3 py-3 font-mono text-sm ${isActive
                                        ? "border-accent bg-accent/10 text-accent"
                                        : "border-transparent text-muted"
                                    }`}
                            >
                                <i className={`bi ${step.icon}`} />
                                {step.label}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {showConnectButton && (
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
