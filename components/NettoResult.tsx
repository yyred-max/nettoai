"use client";

import PipelineSidebar from "./PipelineSidebar";

type ProvenanceRow = {
    field: string;
    value: string;
    source: string;
    sourceIcon: string;
    verified: boolean;
};

type NettoResultProps = {
    result: "allowed" | "blocked";
    network?: string;
    wallet?: string;
    userIntent?: string;
    agentActionCode?: string;
    riskScore?: "LOW" | "MEDIUM" | "HIGH";
    decisionId?: string;
    verifiedCount?: number;
    totalCount?: number;
    blockReasonTitle?: string;
    blockReasonDetail?: string;
    provenanceRows?: ProvenanceRow[];
    onEditIntent?: () => void;
    onConfirmExecute?: () => void;
    onViewDetails?: () => void;
    onTryAgain?: () => void;
};

const DEFAULT_PROVENANCE_ALLOWED: ProvenanceRow[] = [
    { field: "Token", value: "USDT", source: "User Input", sourceIcon: "bi-person", verified: true },
    { field: "Amount", value: "50.00", source: "User Input", sourceIcon: "bi-person", verified: true },
    { field: "Recipient", value: "Alice", source: "User Input", sourceIcon: "bi-person", verified: true },
];

const DEFAULT_PROVENANCE_BLOCKED: ProvenanceRow[] = [
    { field: "Token", value: "USDT", source: "User Input", sourceIcon: "bi-person", verified: true },
    { field: "Amount", value: "50.00", source: "User Input", sourceIcon: "bi-person", verified: true },
    { field: "Recipient", value: "0x8A...91F", source: "Agent Output", sourceIcon: "bi-robot", verified: false },
];

export default function NettoResult({
    result,
    network = "BSC TESTNET",
    wallet = "0x71C...A92",
    userIntent = "Send 50 USDT to Alice",
    agentActionCode = "transfer(Alice, 50 USDT)",
    riskScore = "LOW",
    decisionId = "DEC-8F21...",
    verifiedCount = 3,
    totalCount = 3,
    blockReasonTitle = "The recipient could not be verified from the original user instruction.",
    blockReasonDetail = "NETTOAI cannot verify that the recipient address originated from the user's original intent.",
    provenanceRows,
    onEditIntent,
    onConfirmExecute,
    onViewDetails,
    onTryAgain,
}: NettoResultProps) {
    if (result === "blocked") {
        const rows = provenanceRows ?? DEFAULT_PROVENANCE_BLOCKED;

        return (
            <div className="flex min-h-screen flex-col bg-bg">
                {/* Top nav */}
                <header className="flex h-16 w-full items-center justify-between border-b border-border px-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-rose-500/15 text-rose-400">
                            <i className="bi bi-shield-fill-exclamation" />
                        </span>
                        <div className="leading-tight">
                            <p className="font-display text-sm font-extrabold tracking-tight text-accent">
                                NETTOAI
                            </p>
                            <p className="font-mono text-[10px] text-muted">
                                VERIFIED EXECUTION LAYER
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="font-mono text-[10px] text-muted">SYSTEM STATUS</p>
                            <p className="flex items-center gap-1.5 font-mono text-xs font-semibold text-rose-400">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />
                                INTERVENTION ACTIVE
                            </p>
                        </div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted">
                            <i className="bi bi-person text-sm" />
                        </span>
                        <span className="font-mono text-xs text-gray-200">{wallet}</span>
                        <div className="text-right">
                            <p className="font-mono text-[10px] text-muted">NETWORK</p>
                            <p className="font-mono text-xs text-accent">{network}</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-6 py-10 sm:px-10">
                    <div className="mx-auto max-w-4xl">
                        {/* Blocked banner */}
                        <div className="rounded-lg border border-rose-500/60 bg-rose-950/20 p-6">
                            <div className="flex items-start gap-4">
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white">
                                    <i className="bi bi-slash-circle text-2xl" />
                                </span>
                                <div>
                                    <p className="flex items-center gap-2 font-display text-3xl font-extrabold tracking-tight text-rose-300">
                                        <i className="bi bi-record-circle text-rose-400" />
                                        BLOCKED
                                    </p>
                                    <p className="mt-2 text-base font-semibold text-gray-100">
                                        Transaction was prevented before execution.
                                    </p>
                                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                                        <i className="bi bi-geo-alt" />
                                        No transaction was executed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Why blocked */}
                        <div className="mt-6 rounded-lg border border-border bg-bg-panel/40 p-5">
                            <span className="flex items-center gap-2 font-display text-lg font-bold text-gray-100">
                                <i className="bi bi-info-circle text-rose-400" />
                                WHY WAS THIS BLOCKED?
                            </span>

                            <div className="mt-4 rounded-md border-l-2 border-rose-500 bg-rose-950/30 px-4 py-3">
                                <p className="text-sm text-gray-100">{blockReasonTitle}</p>
                            </div>

                            <p className="mt-4 text-sm text-muted">
                                {blockReasonDetail}{" "}
                                <button
                                    type="button"
                                    onClick={onViewDetails}
                                    className="font-mono text-xs font-semibold text-rose-300 hover:underline"
                                >
                                    VIEW DETAILS →
                                </button>
                            </p>
                        </div>

                        {/* Provenance table */}
                        <div className="mt-6 rounded-lg border border-border bg-bg-panel/40 p-5">
                            <span className="font-display text-lg font-bold text-gray-100">
                                FIELD-LEVEL PROVENANCE
                            </span>

                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[560px] text-left">
                                    <thead>
                                        <tr className="border-b border-border text-[11px] font-mono text-muted">
                                            <th className="px-4 py-3 font-normal">FIELD</th>
                                            <th className="px-4 py-3 font-normal">VALUE</th>
                                            <th className="px-4 py-3 font-normal">SOURCE</th>
                                            <th className="px-4 py-3 text-right font-normal">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row) => (
                                            <tr
                                                key={row.field}
                                                className={`border-b border-border/60 ${!row.verified ? "border-l-2 border-l-rose-500 bg-rose-950/10" : ""
                                                    }`}
                                            >
                                                <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-100">
                                                    {row.field}
                                                </td>
                                                <td
                                                    className={`px-4 py-4 font-mono text-sm ${row.verified ? "text-accent" : "text-gray-300"
                                                        }`}
                                                >
                                                    {row.value}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="flex w-fit items-center gap-1.5 font-mono text-xs text-gray-300">
                                                        <i className={`bi ${row.sourceIcon}`} />
                                                        {row.source}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[11px] font-semibold ${row.verified
                                                                    ? "border-accent/50 text-accent"
                                                                    : "border-rose-500/60 text-rose-300"
                                                                }`}
                                                        >
                                                            <i
                                                                className={`bi ${row.verified ? "bi-check-circle" : "bi-exclamation-triangle"
                                                                    }`}
                                                            />
                                                            {row.verified ? "VERIFIED" : "UNVERIFIED"}
                                                        </span>
                                                        {!row.verified && (
                                                            <button
                                                                type="button"
                                                                onClick={onViewDetails}
                                                                className="rounded border border-border px-2 py-1 font-mono text-[10px] text-muted hover:border-rose-400 hover:text-rose-300"
                                                            >
                                                                VIEW DETAILS →
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className="mt-8 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onViewDetails}
                                className="rounded-md border border-border px-5 py-3 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent"
                            >
                                VIEW DETAILS
                            </button>
                            <button
                                type="button"
                                onClick={onTryAgain}
                                className="rounded-md border border-rose-500/60 px-5 py-3 font-mono text-xs font-bold text-rose-300 transition-colors hover:bg-rose-500/10"
                            >
                                TRY AGAIN
                            </button>
                        </div>
                    </div>
                </main>

                {/* Status footer */}
                <footer className="flex h-11 w-full items-center justify-between border-t border-border bg-bg-panel/60 px-6 font-mono text-[11px]">
                    <span className="text-accent">NETTOAI VERIFIED EXECUTION LAYER v1.0.42</span>
                    <div className="flex items-center gap-6 text-muted">
                        <span>
                            Network: <span className="text-gray-300">{network}</span>
                        </span>
                        <span className="text-gray-300">{wallet}</span>
                        <span>
                            Latency: <span className="text-gray-300">24ms</span>
                        </span>
                    </div>
                </footer>
            </div>
        );
    }

    // ALLOWED
    const rows = provenanceRows ?? DEFAULT_PROVENANCE_ALLOWED;

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
                        VERIFIED EXECUTION LAYER
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <i className="bi bi-bell text-base text-muted transition-colors hover:text-accent" />
                    <i className="bi bi-gear text-base text-muted transition-colors hover:text-accent" />
                    <div className="text-right">
                        <p className="font-mono text-xs text-gray-200">{wallet}</p>
                        <p className="font-mono text-[10px] text-muted">{network}</p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/60 text-accent">
                        <i className="bi bi-shield-lock text-sm" />
                    </span>
                </div>
            </header>

            <div className="flex flex-1">
                <PipelineSidebar activeStep="decision" showConnectButton />

                <main className="flex-1 px-6 py-10 sm:px-10">
                    <div className="mx-auto max-w-4xl">
                        <div className="h-0.5 w-full bg-accent" />

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1.5 rounded border border-accent/60 px-3 py-1.5 font-mono text-xs text-accent">
                                <i className="bi bi-check-circle" />
                                ALLOWED
                            </span>
                            <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-100">
                                VERIFICATION RESULT
                            </h1>
                        </div>
                        <p className="mt-2 text-sm text-muted">
                            This transaction passed policy and provenance verification.
                        </p>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div className="rounded-lg border border-border bg-bg-panel/40 p-5">
                                <span className="font-mono text-xs tracking-wide text-muted">
                                    AGENT ACTION
                                </span>
                                <div className="mt-4 flex items-center justify-between border-b border-border pb-4">
                                    <span className="text-sm text-gray-300">Status</span>
                                    <span className="font-mono text-sm font-bold text-accent">
                                        PASSED
                                    </span>
                                </div>
                                <p className="mt-4 text-sm text-gray-200">
                                    Review generated action
                                </p>
                                <button
                                    type="button"
                                    onClick={onViewDetails}
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-border py-2.5 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent"
                                >
                                    VIEW DETAILS
                                    <i className="bi bi-arrow-right" />
                                </button>

                                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                                    <span className="text-sm text-gray-300">Risk Score</span>
                                    <span className="rounded border border-accent/50 px-2 py-1 font-mono text-[11px] text-accent">
                                        {riskScore}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Decision ID</span>
                                    <span className="font-mono text-sm text-gray-100">
                                        {decisionId}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-bg-panel/40 p-5">
                                <span className="font-mono text-xs tracking-wide text-muted">
                                    COMPARISON ANALYSIS
                                </span>
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                                    <div className="flex-1 rounded-md border border-border px-4 py-3">
                                        <p className="font-mono text-[11px] text-muted">
                                            USER INTENT
                                        </p>
                                        <p className="mt-2 font-mono text-sm italic text-gray-200">
                                            &quot;{userIntent}&quot;
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center text-muted">
                                        <i className="bi bi-arrow-right hidden sm:block" />
                                        <i className="bi bi-arrow-down sm:hidden" />
                                    </div>
                                    <div className="flex-1 rounded-md border border-accent bg-accent/5 px-4 py-3">
                                        <p className="flex items-center gap-1.5 font-mono text-[11px] text-accent">
                                            <i className="bi bi-robot" />
                                            AGENT ACTION
                                        </p>
                                        <p className="mt-2 font-mono text-sm text-gray-100">
                                            {agentActionCode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-lg border border-border bg-bg-panel/40 p-5">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 font-mono text-xs tracking-wide text-muted">
                                    <i className="bi bi-shield-check text-accent" />
                                    FIELD-LEVEL PROVENANCE
                                </span>
                                <span className="rounded border border-accent/50 px-2 py-1 font-mono text-[11px] text-accent">
                                    VERIFIED
                                </span>
                            </div>

                            <p className="mt-4 font-display text-xl font-bold text-gray-100">
                                {verifiedCount}/{totalCount} fields verified
                            </p>
                            <p className="mt-2 text-sm text-muted">
                                All transaction parameters match user intent and policy
                                requirements.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {rows.map((row) => (
                                    <span
                                        key={row.field}
                                        className="rounded border border-border px-2 py-1 font-mono text-[11px] text-gray-300"
                                    >
                                        {row.field}: <span className="text-accent">{row.value}</span>
                                    </span>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={onViewDetails}
                                className="mt-4 flex items-center gap-2 rounded-md border border-border px-4 py-2 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent"
                            >
                                VIEW DETAILS
                                <i className="bi bi-arrow-right" />
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onEditIntent}
                                className="rounded-md border border-border px-5 py-3 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent"
                            >
                                EDIT INTENT
                            </button>
                            <button
                                type="button"
                                onClick={onConfirmExecute}
                                className="flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-mono text-xs font-bold text-bg transition-colors hover:bg-accent/90"
                            >
                                CONFIRM & EXECUTE
                                <i className="bi bi-play-fill" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Status footer */}
            <footer className="flex h-11 w-full items-center justify-between border-t border-border bg-bg-panel/60 px-6 font-mono text-[11px]">
                <span className="text-accent">NETTOAI VERIFIED EXECUTION LAYER V1.0.42</span>
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
