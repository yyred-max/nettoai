"use client";

import PipelineSidebar, { PipelineStepId } from "./PipelineSidebar";

type StepStatus = "done" | "in_progress" | "pending";

type PipelineTimelineStep = {
    title: string;
    status: StepStatus;
    description: string;
    logLines?: string[];
};

const TIMELINE: PipelineTimelineStep[] = [
    {
        title: "INTENT PARSED",
        status: "done",
        description: "Natural-language instruction converted into structured intent.",
    },
    {
        title: "AGENT ACTION GENERATED",
        status: "done",
        description: "AI agent generated the proposed blockchain action.",
    },
    {
        title: "POLICY CHECK",
        status: "in_progress",
        description: "Checking transaction against configured execution policy.",
        logLines: [
            "> loading policy rules...",
            "> evaluating contract limits",
            "> simulating execution",
            "> applying whitelist constraints",
        ],
    },
    {
        title: "PROVENANCE VERIFICATION",
        status: "pending",
        description:
            "Checking whether critical action fields can be traced to the original user input.",
    },
    {
        title: "DECISION GENERATED",
        status: "pending",
        description: "Generating final ALLOW/BLOCKED decision.",
    },
];

const STATUS_STYLES: Record<StepStatus, string> = {
    done: "border-border text-gray-100",
    in_progress: "border-accent bg-accent/5 text-gray-100",
    pending: "border-border text-muted",
};

const STATUS_BADGE: Record<StepStatus, string> = {
    done: "border-accent/60 text-accent",
    in_progress: "border-accent/60 text-accent",
    pending: "border-border text-muted",
};

type LoadingStateProps = {
    network?: string;
    wallet?: string;
    activeStep?: PipelineStepId;
};

export default function LoadingState({
    network = "BSC TESTNET",
    wallet = "0x71C...A92",
    activeStep = "policy_check",
}: LoadingStateProps) {
    return (
        <div className="flex min-h-screen flex-col bg-bg">
            {/* Top nav */}
            <header className="flex h-16 w-full items-center justify-between border-b border-border px-6">
                <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-extrabold tracking-tight text-accent">
                        NETTOAI
                    </span>
                    <span className="text-border">|</span>
                    <span className="font-mono text-xs text-muted">
                        SECURITY PIPELINE
                    </span>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs text-muted">
                    <span>
                        Network: <span className="text-gray-200">{network}</span>
                    </span>
                    <span className="text-gray-200">{wallet}</span>
                    <span className="flex items-center gap-1.5 rounded-full border border-accent/60 px-3 py-1 text-accent">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                        LIVE MONITORING
                    </span>
                    <i className="bi bi-gear text-base text-muted transition-colors hover:text-accent" />
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-accent">
                        <i className="bi bi-shield-lock text-sm" />
                    </span>
                </div>
            </header>

            <div className="flex flex-1">
                <PipelineSidebar activeStep={activeStep} showConnectButton />

                {/* Main timeline */}
                <main className="flex-1 px-6 py-14 sm:px-10">
                    <div className="mx-auto max-w-3xl">
                        <div className="flex items-center gap-3">
                            <i className="bi bi-radar text-2xl text-accent" />
                            <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-100 sm:text-4xl">
                                ANALYZING INTENT
                            </h1>
                        </div>
                        <p className="mt-3 text-sm text-muted sm:text-base">
                            Pipeline execution in progress. Verifying origin, constraints,
                            and proposed state changes against enforced security policies.
                        </p>

                        <div className="relative mt-10 flex flex-col gap-6">
                            {/* vertical connector line */}
                            <div className="absolute bottom-4 left-[13px] top-4 w-px bg-border" />

                            {TIMELINE.map((step, idx) => (
                                <div key={step.title} className="relative flex gap-4">
                                    <div
                                        className={`z-10 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-bg ${step.status === "pending"
                                                ? "border-border text-muted"
                                                : "border-accent text-accent"
                                            }`}
                                    >
                                        {step.status === "done" && (
                                            <i className="bi bi-check-lg text-xs" />
                                        )}
                                        {step.status === "in_progress" && (
                                            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                                        )}
                                        {step.status === "pending" && (
                                            <span className="h-2 w-2 rounded-full bg-border" />
                                        )}
                                    </div>

                                    <div
                                        className={`flex-1 rounded-md border px-5 py-4 ${STATUS_STYLES[step.status]}`}
                                    >
                                        <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wide">
                                            <span
                                                className={
                                                    step.status === "pending" ? "text-muted" : "text-accent"
                                                }
                                            >
                                                {step.title}
                                            </span>
                                            <span
                                                className={`rounded border px-1.5 py-0.5 text-[10px] ${STATUS_BADGE[step.status]}`}
                                            >
                                                {step.status === "done"
                                                    ? "DONE"
                                                    : step.status === "in_progress"
                                                        ? "IN PROGRESS"
                                                        : "PENDING"}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-muted">{step.description}</p>

                                        {step.logLines && (
                                            <div className="mt-4 rounded-md border border-border bg-bg px-4 py-3 font-mono text-xs text-accent">
                                                {step.logLines.map((line) => (
                                                    <p key={line}>{line}</p>
                                                ))}
                                                <span className="animate-pulse text-muted">_</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Status footer */}
            <footer className="flex h-11 w-full items-center justify-between border-t border-border bg-bg-panel/60 px-6 font-mono text-[11px]">
                <span className="text-accent">NETTOAI VERIFIED EXECUTION LAYER v1.0.42</span>
                <span className="text-muted">
                    Latency: <span className="text-gray-300">24ms</span>
                </span>
            </footer>
        </div>
    );
}
