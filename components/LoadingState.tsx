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
    done: "border-white/10 glass-panel text-gray-100",
    in_progress: "border-accent/40 bg-accent/10 shadow-[0_0_15px_rgba(56,189,248,0.15)] text-gray-100 backdrop-blur-xl",
    pending: "border-white/5 bg-black/20 text-muted opacity-60",
};

const STATUS_BADGE: Record<StepStatus, string> = {
    done: "border-accent/40 bg-accent/10 text-accent",
    in_progress: "border-accent/60 bg-accent/20 text-accent",
    pending: "border-white/10 bg-black/40 text-muted",
};

type LoadingStateProps = {
    network?: string;
    wallet?: string;
    activeStep?: PipelineStepId;
    message?: string; // ✅ tambahan
};

export default function LoadingState({
    network = "BSC TESTNET",
    wallet = "0x71C...A92",
    activeStep = "policy_check",
    message = "NettoAI is analyzing your request...",
}: LoadingStateProps) {
    return (
        <div className="flex min-h-screen flex-col bg-transparent">
            <header className="flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/20 px-6 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                        <i className="bi bi-shield-fill-check text-white" />
                    </div>
                    <span className="font-display text-xl font-bold tracking-wide text-white">
                        NETTO<span className="text-accent font-light">AI</span>
                    </span>
                    <span className="text-border mx-1">|</span>
                    <span className="font-mono text-xs text-muted/70 tracking-widest uppercase">
                        PIPELINE
                    </span>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs text-muted">
                    <span className="hidden sm:inline">
                        NET: <span className="text-gray-200">{network}</span>
                    </span>
                    <span className="hidden sm:inline text-gray-200 bg-white/5 px-2 py-1 rounded border border-white/5">{wallet}</span>
                    <span className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-[10px] text-accent tracking-widest uppercase font-bold shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        ANALYZING
                    </span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <div className="hidden sm:block z-10">
                    <PipelineSidebar activeStep={activeStep} showConnectButton />
                </div>

                <main className="flex-1 px-6 py-14 sm:px-10 relative z-10 overflow-y-auto w-full">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="mx-auto max-w-3xl relative">
                        <div className="glass-panel rounded-2xl p-8 mb-8 flex items-center gap-5 border border-white/10 bg-gradient-to-r from-black/40 to-transparent">
                            <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center ring-1 ring-accent/30 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                                <i className="bi bi-radar text-2xl text-accent animate-pulse" />
                            </div>
                            <div>
                                <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight text-white">
                                    Analyzing <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">Intent</span>
                                </h1>
                                <p className="mt-1 text-sm text-gray-400 font-light">
                                    {message}
                                </p>
                            </div>
                        </div>

                        <div className="relative flex flex-col gap-6 pl-4">
                            <div className="absolute bottom-4 left-[29px] top-4 w-[2px] bg-white/5 rounded-full" />

                            {TIMELINE.map((step, idx) => (
                                <div key={step.title} className="relative flex gap-6">
                                    <div
                                        className={`z-10 mt-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-bg ${step.status === "pending"
                                            ? "border-white/10 text-muted/40 bg-black/40"
                                            : step.status === "done" ? "border-accent text-accent bg-accent/10 shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                                            : "border-accent text-accent bg-accent/20 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                                            }`}
                                    >
                                        {step.status === "done" && (
                                            <i className="bi bi-check-lg text-sm" />
                                        )}
                                        {step.status === "in_progress" && (
                                            <span className="h-2 w-2 animate-ping rounded-full bg-accent" />
                                        )}
                                        {step.status === "pending" && (
                                            <span className="h-2 w-2 rounded-full bg-white/20" />
                                        )}
                                    </div>

                                    <div
                                        className={`flex-1 rounded-xl border px-6 py-5 transition-all duration-300 ${STATUS_STYLES[step.status]} ${step.status === 'in_progress' ? 'ring-1 ring-accent/20' : ''}`}
                                    >
                                        <div className="flex items-center justify-between font-mono text-xs font-semibold tracking-wide">
                                            <span
                                                className={
                                                    step.status === "pending" ? "text-muted/60" : step.status === "done" ? "text-accent/80 font-bold" : "text-accent font-bold"
                                                }
                                            >
                                                {step.title}
                                            </span>
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-[9px] tracking-widest ${STATUS_BADGE[step.status]}`}
                                            >
                                                {step.status === "done"
                                                    ? "VERIFIED"
                                                    : step.status === "in_progress"
                                                        ? "ANALYZING..."
                                                        : "PENDING"}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-sm font-light text-gray-400">{step.description}</p>

                                        {step.logLines && (
                                            <div className="mt-5 rounded-lg border border-accent/20 bg-black/60 px-5 py-4 font-mono text-[11px] text-accent/80 shadow-inner">
                                                {step.logLines.map((line) => (
                                                    <p key={line} className="mb-1 last:mb-0 opacity-80">{line}</p>
                                                ))}
                                                <span className="inline-block mt-1 animate-pulse text-accent">█</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <footer className="flex h-12 w-full items-center justify-between border-t border-white/5 bg-black/20 px-6 backdrop-blur-md">
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-accent/80">NettoAI Guardian v1.0.42</span>
                <span className="text-muted/70 font-mono text-xs">
                    Latency: <span className="text-gray-300 font-medium">24ms</span>
                </span>
            </footer>
        </div>
    );
}