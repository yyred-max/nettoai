"use client";

import PipelineSidebar from "./PipelineSidebar";

type ProvenanceField = {
    field: string;
    value: string;
    source: string;
    sourceIcon: string;
    verified: boolean;
};

const PROVENANCE_FIELDS: ProvenanceField[] = [
    { field: "Recipient", value: "Alice", source: "User Input", sourceIcon: "bi-person", verified: true },
    { field: "Amount", value: "50 USDT", source: "User Input", sourceIcon: "bi-person", verified: true },
    { field: "Token", value: "USDT", source: "User Input", sourceIcon: "bi-person", verified: true },
    { field: "Network", value: "BSC Testnet", source: "System", sourceIcon: "bi-gear", verified: true },
];

type TraceField = {
    label: string;
    value: string;
};

const TRACE_FIELDS: TraceField[] = [
    { label: "RECIPIENT", value: "Alice" },
    { label: "AMOUNT", value: "50 USDT" },
    { label: "TOKEN", value: "USDT" },
];

type ProvenanceTableProps = {
    network?: string;
    wallet?: string;
    userInput?: string;
    verifiedCount?: number;
    totalCount?: number;
    onBack?: () => void;
    onContinue?: () => void;
};

export default function ProvenanceTable({
    network = "BSC TESTNET",
    wallet = "0x71C...A92",
    userInput = "Send 50 USDT to Alice",
    verifiedCount = 4,
    totalCount = 4,
    onBack,
    onContinue,
}: ProvenanceTableProps) {
    const unverifiedCount = totalCount - verifiedCount;
    const passed = unverifiedCount === 0;

    return (
        <div className="flex min-h-screen flex-col bg-bg">
            {/* Top nav */}
            <header className="flex h-16 w-full items-center justify-between border-b border-border px-6">
                <span className="font-display text-lg font-extrabold tracking-tight text-accent">
                    NETTOAI
                </span>
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        aria-label="Settings"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:text-accent"
                    >
                        <i className="bi bi-gear text-lg" />
                    </button>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-accent">
                        <i className="bi bi-shield-lock text-sm" />
                    </span>
                </div>
            </header>

            <div className="flex flex-1">
                <PipelineSidebar activeStep="provenance" showConnectButton />

                {/* Main content */}
                <main className="flex-1 px-6 py-14 sm:px-10">
                    <div className="mx-auto max-w-4xl">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h1 className="font-display text-4xl font-extrabold tracking-tight text-gray-100">
                                    FIELD-LEVEL PROVENANCE
                                </h1>
                                <p className="mt-3 text-sm text-muted sm:text-base">
                                    Trace every critical action field back to its source.
                                </p>
                            </div>
                            <span className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-bold text-bg">
                                <i className="bi bi-check-circle-fill" />
                                PROVENANCE VERIFIED
                            </span>
                        </div>

                        {/* Info + stats */}
                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            <div className="rounded-lg border border-border bg-bg-panel/40 p-5">
                                <span className="flex items-center gap-2 font-mono text-xs text-gray-300">
                                    <i className="bi bi-info-circle text-accent" />
                                    WHAT IS FIELD-LEVEL PROVENANCE?
                                </span>
                                <p className="mt-3 text-sm text-muted">
                                    NETTOAI checks whether critical values in the proposed
                                    action can be traced to an identifiable source, such as
                                    the user&apos;s original instruction.
                                </p>
                            </div>

                            <div className="rounded-lg border border-accent/60 bg-bg-panel/40 p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-mono text-xs text-muted">
                                            VERIFIED FIELDS
                                        </p>
                                        <p className="mt-1 font-display text-2xl font-extrabold text-accent">
                                            {verifiedCount}{" "}
                                            <span className="text-base font-normal text-muted">
                                                / {totalCount}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-xs text-muted">
                                            UNVERIFIED FIELDS
                                        </p>
                                        <p className="mt-1 font-display text-2xl font-extrabold text-gray-100">
                                            {unverifiedCount}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-xs text-muted">
                                            OVERALL STATUS
                                        </p>
                                        <p className="mt-1 flex items-center justify-end gap-1.5 font-display text-lg font-extrabold text-accent">
                                            <i className="bi bi-check-circle-fill" />
                                            {passed ? "PROVENANCE PASSED" : "PROVENANCE FAILED"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trace visualization */}
                        <div className="mt-6 rounded-lg border border-border bg-bg-panel/40 p-5">
                            <span className="flex items-center gap-2 font-mono text-xs text-gray-300">
                                <i className="bi bi-diagram-3" />
                                TRACE VISUALIZATION
                            </span>

                            <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-6">
                                <div className="w-full max-w-xs rounded-md border border-accent/50 px-4 py-3">
                                    <p className="font-mono text-[11px] text-accent">USER INPUT</p>
                                    <p className="mt-1 font-mono text-sm italic text-gray-200">
                                        &quot;{userInput}&quot;
                                    </p>
                                </div>

                                <i className="bi bi-arrow-right hidden text-xl text-muted md:block" />
                                <i className="bi bi-arrow-down text-xl text-muted md:hidden" />

                                <div className="flex w-full max-w-xs flex-col gap-3">
                                    {TRACE_FIELDS.map((f) => (
                                        <div
                                            key={f.label}
                                            className="flex items-center justify-between rounded-md border border-border px-4 py-2.5"
                                        >
                                            <span className="font-mono text-[11px] text-muted">
                                                {f.label}
                                            </span>
                                            <span className="flex items-center gap-2 font-mono text-sm text-gray-100">
                                                {f.value}
                                                <i className="bi bi-check-circle-fill text-accent" />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Provenance matrix */}
                        <div className="mt-6 rounded-lg border border-border bg-bg-panel/40 p-5">
                            <span className="flex items-center gap-2 font-mono text-xs text-gray-300">
                                <i className="bi bi-table" />
                                PROVENANCE MATRIX
                            </span>

                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[520px] text-left">
                                    <thead>
                                        <tr className="border-b border-border bg-bg text-[11px] font-mono text-muted">
                                            <th className="px-4 py-3 font-normal">FIELD</th>
                                            <th className="px-4 py-3 font-normal">VALUE</th>
                                            <th className="px-4 py-3 font-normal">SOURCE</th>
                                            <th className="px-4 py-3 text-right font-normal">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PROVENANCE_FIELDS.map((row) => (
                                            <tr key={row.field} className="border-b border-border/60">
                                                <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-100">
                                                    {row.field}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-sm text-gray-300">
                                                    {row.value}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="flex w-fit items-center gap-1.5 rounded border border-border px-2 py-1 font-mono text-xs text-gray-300">
                                                        <i className={`bi ${row.sourceIcon}`} />
                                                        {row.source}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent">
                                                        <i className="bi bi-check-lg" />
                                                        {row.verified ? "VERIFIED" : "UNVERIFIED"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                BACK TO AGENT ACTION
                            </button>
                            <button
                                type="button"
                                onClick={onContinue}
                                className="flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-mono text-xs font-bold text-bg transition-colors hover:bg-accent/90"
                            >
                                CONTINUE TO CONFIRM
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
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
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
