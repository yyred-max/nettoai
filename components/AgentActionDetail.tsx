"use client";

import PipelineSidebar from "./PipelineSidebar";

type FieldStatus = {
    label: string;
    value: string;
    tag: string;
};

const FIELD_STATUS: FieldStatus[] = [
    { label: "Recipient", value: "Alice", tag: "Detected" },
    { label: "Amount", value: "50 USDT", tag: "Detected" },
    { label: "Token", value: "USDT", tag: "Detected" },
];

type AgentActionDetailProps = {
    network?: string;
    wallet?: string;
    userIntent?: string;
    functionName?: string;
    recipient?: string;
    amount?: string;
    onBack?: () => void;
    onViewProvenance?: () => void;
};

export default function AgentActionDetail({
    network = "BSC TESTNET",
    wallet = "0x71C...A92",
    userIntent = "Send 50 USDT to Alice",
    functionName = "transfer",
    recipient = "Alice",
    amount = "50 USDT",
    onBack,
    onViewProvenance,
}: AgentActionDetailProps) {
    return (
        <div className="flex min-h-screen flex-col bg-bg">
            {/* Top nav */}
            <header className="flex h-16 w-full items-center justify-between border-b border-border px-6">
                <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-extrabold tracking-tight text-accent">
                        NETTOAI
                    </span>
                    <span className="flex items-center gap-1.5 rounded-md border border-border bg-bg-panel px-3 py-1.5 font-mono text-xs text-accent">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                        {network}
                    </span>
                    <span className="rounded-md border border-border bg-bg-panel px-3 py-1.5 font-mono text-xs text-gray-300">
                        {wallet}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 rounded-md border border-accent/60 px-3 py-1.5 font-mono text-xs text-accent">
                        <i className="bi bi-check-circle" />
                        CONNECTED
                    </span>
                    <button
                        type="button"
                        aria-label="Settings"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:text-accent"
                    >
                        <i className="bi bi-gear text-lg" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1">
                <PipelineSidebar activeStep="agent_action" showConnectButton />

                {/* Main content */}
                <main className="flex-1 px-6 py-14 sm:px-10">
                    <div className="mx-auto max-w-4xl">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h1 className="font-display text-4xl font-extrabold tracking-tight text-accent">
                                    AGENT ACTION
                                </h1>
                                <p className="mt-3 text-sm text-muted sm:text-base">
                                    Review the structured action generated from your intent.
                                </p>
                            </div>
                            <span className="flex items-center gap-1.5 rounded-md border border-accent/60 px-3 py-1.5 font-mono text-xs text-accent">
                                <i className="bi bi-check2-square" />
                                ACTION GENERATED
                            </span>
                        </div>

                        {/* Intent vs Action */}
                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            <div className="rounded-lg border border-border bg-bg-panel/40 p-5">
                                <span className="flex items-center gap-2 font-mono text-xs text-gray-300">
                                    <i className="bi bi-person" />
                                    ORIGINAL USER INTENT
                                </span>
                                <div className="mt-4 rounded-md bg-bg px-4 py-6 text-center">
                                    <p className="font-mono text-sm italic text-gray-200">
                                        &quot;{userIntent}&quot;
                                    </p>
                                </div>
                                <p className="mt-4 text-xs text-muted">
                                    This is the original instruction provided by the user.
                                </p>
                            </div>

                            <div className="rounded-lg border border-accent/60 bg-bg-panel/40 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 font-mono text-xs text-gray-300">
                                        <i className="bi bi-braces" />
                                        GENERATED ACTION
                                    </span>
                                    <span className="rounded border border-border px-2 py-1 font-mono text-[10px] text-muted">
                                        EXECUTION READY
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-md border border-border px-3 py-2">
                                        <p className="font-mono text-[10px] text-muted">FUNCTION</p>
                                        <p className="font-mono text-sm text-gray-100">{functionName}</p>
                                    </div>
                                    <div className="rounded-md border border-border px-3 py-2">
                                        <p className="font-mono text-[10px] text-muted">RECIPIENT</p>
                                        <p className="font-mono text-sm text-accent">{recipient}</p>
                                    </div>
                                    <div className="rounded-md border border-border px-3 py-2">
                                        <p className="font-mono text-[10px] text-muted">AMOUNT</p>
                                        <p className="font-mono text-sm text-gray-100">{amount}</p>
                                    </div>
                                    <div className="rounded-md border border-border px-3 py-2">
                                        <p className="font-mono text-[10px] text-muted">NETWORK</p>
                                        <p className="font-mono text-sm text-gray-100">{network}</p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-md border border-border bg-bg px-4 py-3 font-mono text-xs">
                                    <p className="flex items-center gap-1.5 text-muted">
                                        <span className="flex gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted/50" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted/50" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted/50" />
                                        </span>
                                        sysout
                                    </p>
                                    <p className="mt-2 text-accent">
                                        {functionName}(recipient: {recipient}, amount:{" "}
                                        {amount.split(" ")[0]}, token: {amount.split(" ")[1] ?? ""})
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Field status + policy check */}
                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div className="rounded-lg border border-border bg-bg-panel/40 p-5">
                                <span className="flex items-center gap-2 font-mono text-xs text-gray-300">
                                    <i className="bi bi-list-check" />
                                    ACTION FIELD STATUS
                                </span>
                                <div className="mt-4 flex flex-col gap-3">
                                    {FIELD_STATUS.map((field) => (
                                        <div
                                            key={field.label}
                                            className="flex items-center justify-between rounded-md border border-border px-4 py-3"
                                        >
                                            <span className="flex items-center gap-2 font-mono text-sm text-gray-200">
                                                <i className="bi bi-check-lg text-accent" />
                                                {field.label} {field.value}
                                            </span>
                                            <span className="rounded border border-accent/50 px-2 py-1 font-mono text-[10px] text-accent">
                                                {field.tag}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-bg-panel/40 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 font-mono text-xs text-gray-300">
                                        <i className="bi bi-shield" />
                                        POLICY CHECK
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded border border-border px-2 py-1 font-mono text-[10px] text-muted">
                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                        PENDING
                                    </span>
                                </div>
                                <p className="mt-4 text-sm text-muted">
                                    The generated action will be evaluated against the
                                    execution policy before authorization.
                                </p>
                                <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-border">
                                    <div className="h-full w-1/3 rounded-full bg-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Flow diagram */}
                        <div className="mt-6 flex items-center justify-center gap-6 rounded-lg border border-border bg-bg-panel/40 px-8 py-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-14 w-14 items-center justify-center rounded-md border border-border text-muted">
                                    <i className="bi bi-people text-xl" />
                                </div>
                                <span className="font-mono text-[11px] text-muted">
                                    USER INTENT
                                </span>
                            </div>
                            <div className="h-px flex-1 bg-border" />
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-14 w-14 items-center justify-center rounded-md border border-accent bg-accent/10 text-accent">
                                    <i className="bi bi-robot text-xl" />
                                </div>
                            </div>
                            <div className="h-px flex-1 bg-border" />
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex h-14 w-14 items-center justify-center rounded-md border border-accent text-accent">
                                    <i className="bi bi-code-square text-xl" />
                                </div>
                                <span className="font-mono text-[11px] text-accent">
                                    GENERATED ACTION
                                </span>
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className="mt-8 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex items-center gap-2 rounded-md border border-border px-5 py-3 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent"
                            >
                                <i className="bi bi-arrow-left" />
                                BACK TO VERIFICATION
                            </button>
                            <button
                                type="button"
                                onClick={onViewProvenance}
                                className="flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-mono text-xs font-bold text-bg transition-colors hover:bg-accent/90"
                            >
                                VIEW FIELD-LEVEL PROVENANCE
                                <i className="bi bi-arrow-right" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Status footer */}
            <footer className="flex h-11 w-full items-center justify-between border-t border-border bg-bg-panel/60 px-6 font-mono text-[11px]">
                <span className="text-accent">NETTOAI VERIFIED EXECUTION LAYER v1.0.42</span>
                <div className="flex items-center gap-6 text-muted">
                    <span>
                        Network: <span className="text-gray-300">{network}</span>
                    </span>
                    <span className="text-gray-300">{wallet}</span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                        Latency: <span className="text-gray-300">24ms</span>
                    </span>
                </div>
            </footer>
        </div>
    );
}
