"use client";

import PipelineSidebar from "./PipelineSidebar";

type ProvenanceTableProps = {
    provenance: any;
    onBack: () => void;
    onContinue: () => void;
    network?: string;
    wallet?: string;
};

export default function ProvenanceTable({
    provenance,
    onBack,
    onContinue,
    network = "BSC TESTNET",
    wallet = "0x71C...A92",
}: ProvenanceTableProps) {
    const fields = [
        { field: "Recipient", status: provenance?.recipient || "unverified" },
        { field: "Amount", status: provenance?.amount || "unverified" },
        { field: "Token", status: provenance?.token || "unverified" },
        { field: "Chain ID", status: provenance?.chainId || "unverified" },
    ];

    const verifiedCount = fields.filter((f) => f.status === "verified").length;
    const totalCount = fields.length;
    const allVerified = verifiedCount === totalCount;

    return (
        <div className="flex min-h-screen flex-col bg-bg">
            <header className="flex h-16 w-full items-center justify-between border-b border-border px-6">
                <span className="font-display text-lg font-extrabold tracking-tight text-accent">NETTOAI</span>
                <div className="flex items-center gap-4">
                    <button type="button" aria-label="Settings" className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:text-accent">
                        <i className="bi bi-gear text-lg" />
                    </button>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-accent">
                        <i className="bi bi-shield-lock text-sm" />
                    </span>
                </div>
            </header>

            <div className="flex flex-1">
                <PipelineSidebar activeStep="provenance" showConnectButton />

                <main className="flex-1 px-6 py-14 sm:px-10">
                    <div className="mx-auto max-w-4xl">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h1 className="font-display text-4xl font-extrabold tracking-tight text-gray-100">FIELD-LEVEL PROVENANCE</h1>
                                <p className="mt-3 text-sm text-muted sm:text-base">Trace every critical action field back to its source.</p>
                            </div>
                            <span className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs font-bold ${allVerified ? "bg-accent text-bg" : "bg-rose-500/20 text-rose-300"}`}>
                                <i className={`bi ${allVerified ? "bi-check-circle-fill" : "bi-exclamation-triangle"}`} />
                                {allVerified ? "PROVENANCE VERIFIED" : "PROVENANCE FAILED"}
                            </span>
                        </div>

                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            <div className="rounded-lg border border-border bg-bg-panel/40 p-5">
                                <span className="flex items-center gap-2 font-mono text-xs text-gray-300"><i className="bi bi-info-circle text-accent" /> WHAT IS FIELD-LEVEL PROVENANCE?</span>
                                <p className="mt-3 text-sm text-muted">NETTOAI checks whether critical values in the proposed action can be traced to an identifiable source, such as the user's original instruction.</p>
                            </div>

                            <div className="rounded-lg border border-accent/60 bg-bg-panel/40 p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-mono text-xs text-muted">VERIFIED FIELDS</p>
                                        <p className="mt-1 font-display text-2xl font-extrabold text-accent">{verifiedCount} <span className="text-base font-normal text-muted">/ {totalCount}</span></p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-xs text-muted">UNVERIFIED FIELDS</p>
                                        <p className="mt-1 font-display text-2xl font-extrabold text-gray-100">{totalCount - verifiedCount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-xs text-muted">OVERALL STATUS</p>
                                        <p className={`mt-1 flex items-center justify-end gap-1.5 font-display text-lg font-extrabold ${allVerified ? "text-accent" : "text-rose-400"}`}>
                                            <i className={`bi ${allVerified ? "bi-check-circle-fill" : "bi-exclamation-triangle"}`} />
                                            {allVerified ? "PROVENANCE PASSED" : "PROVENANCE FAILED"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-lg border border-border bg-bg-panel/40 p-5">
                            <span className="flex items-center gap-2 font-mono text-xs text-gray-300"><i className="bi bi-table" /> PROVENANCE MATRIX</span>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[520px] text-left">
                                    <thead>
                                        <tr className="border-b border-border bg-bg text-[11px] font-mono text-muted">
                                            <th className="px-4 py-3 font-normal">FIELD</th>
                                            <th className="px-4 py-3 font-normal">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fields.map((f) => (
                                            <tr key={f.field} className={`border-b border-border/60 ${f.status !== "verified" ? "border-l-2 border-l-rose-500 bg-rose-950/10" : ""}`}>
                                                <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-100">{f.field}</td>
                                                <td className="px-4 py-4">
                                                    {f.status === "verified" ? (
                                                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent"><i className="bi bi-check-circle" /> VERIFIED</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-rose-300"><i className="bi bi-exclamation-triangle" /> UNVERIFIED</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <button onClick={onBack} className="flex items-center gap-2 rounded-md border border-border px-5 py-3 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent">
                                <i className="bi bi-arrow-left" /> BACK TO AGENT ACTION
                            </button>
                            <button onClick={onContinue} className="flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-mono text-xs font-bold text-bg transition-colors hover:bg-accent/90">
                                CONTINUE TO CONFIRM <i className="bi bi-arrow-right" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <footer className="flex h-11 w-full items-center justify-between border-t border-border bg-bg-panel/60 px-6 font-mono text-[11px]">
                <span className="text-accent">NETTOAI VERIFIED EXECUTION LAYER v1.0.42</span>
                <div className="flex items-center gap-6 text-muted">
                    <span>Network: <span className="text-gray-300">{network}</span></span>
                    <span className="text-gray-300">{wallet}</span>
                    <span>Latency: <span className="text-gray-300">24ms</span></span>
                </div>
            </footer>
        </div>
    );
}