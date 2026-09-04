"use client";

import PipelineSidebar from "./PipelineSidebar";

type ResultData = {
    status: "ALLOW" | "BLOCKED";
    decisionId: string;
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    reasons: string[];
    intent: any;
    action: any;
    provenance: any;
};

type NettoResultProps = {
    result: "allowed" | "blocked";
    data: ResultData;
    onEditIntent?: () => void;
    onViewDetails?: () => void;
    onConfirmExecute?: () => void;
    onTryAgain?: () => void;
    network?: string;
    wallet?: string | null;
};

export default function NettoResult({
    result,
    data,
    onEditIntent,
    onViewDetails,
    onConfirmExecute,
    onTryAgain,
    network = "BSC TESTNET",
    wallet = null,
}: NettoResultProps) {
    const displayWallet = wallet || "0x...";
    const isAllow = result === "allowed";
    const riskColor =
        data.riskLevel === "CRITICAL" ? "text-rose-400" :
            data.riskLevel === "HIGH" ? "text-orange-400" :
                "text-green-400";

    if (!isAllow) {
        return (
            <div className="flex min-h-screen flex-col bg-bg">
                <header className="flex h-16 w-full items-center justify-between border-b border-border px-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-rose-500/15 text-rose-400">
                            <i className="bi bi-shield-fill-exclamation" />
                        </span>
                        <div className="leading-tight">
                            <p className="font-display text-sm font-extrabold tracking-tight text-accent">NETTOAI</p>
                            <p className="font-mono text-[10px] text-muted">VERIFIED EXECUTION LAYER</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="font-mono text-[10px] text-muted">SYSTEM STATUS</p>
                            <p className="flex items-center gap-1.5 font-mono text-xs font-semibold text-rose-400">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" /> INTERVENTION ACTIVE
                            </p>
                        </div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted">
                            <i className="bi bi-person text-sm" />
                        </span>
                        <span className="font-mono text-xs text-gray-200">{displayWallet}</span>
                        <div className="text-right">
                            <p className="font-mono text-[10px] text-muted">NETWORK</p>
                            <p className="font-mono text-xs text-accent">{network}</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-6 py-10 sm:px-10">
                    <div className="mx-auto max-w-4xl">
                        <div className="rounded-lg border border-rose-500/60 bg-rose-950/20 p-6">
                            <div className="flex items-start gap-4">
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white">
                                    <i className="bi bi-slash-circle text-2xl" />
                                </span>
                                <div>
                                    <p className="flex items-center gap-2 font-display text-3xl font-extrabold tracking-tight text-rose-300">
                                        <i className="bi bi-record-circle text-rose-400" />BLOCKED
                                    </p>
                                    <p className="mt-2 text-base font-semibold text-gray-100">Transaction was prevented before execution.</p>
                                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted"><i className="bi bi-geo-alt" />No transaction was executed.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-lg border border-border bg-bg-panel/40 p-5">
                            <span className="flex items-center gap-2 font-display text-lg font-bold text-gray-100">
                                <i className="bi bi-info-circle text-rose-400" />WHY WAS THIS BLOCKED?
                            </span>
                            <div className="mt-4 rounded-md border-l-2 border-rose-500 bg-rose-950/30 px-4 py-3">
                                <p className="text-sm text-gray-100">{data.reasons?.join("; ") || "Policy violation detected."}</p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-lg border border-border bg-bg-panel/40 p-5">
                            <span className="font-display text-lg font-bold text-gray-100">FIELD-LEVEL PROVENANCE</span>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[560px] text-left">
                                    <thead>
                                        <tr className="border-b border-border text-[11px] font-mono text-muted">
                                            <th className="px-4 py-3 font-normal">FIELD</th>
                                            <th className="px-4 py-3 text-right font-normal">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(data.provenance || {})
                                            .filter(([key]) => key !== "summary")
                                            .map(([field, status]) => {
                                                const statusStr = String(status);
                                                return (
                                                    <tr key={field} className={`border-b border-border/60 ${statusStr !== "verified" ? "border-l-2 border-l-rose-500 bg-rose-950/10" : ""}`}>
                                                        <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-100 capitalize">{field}</td>
                                                        <td className="px-4 py-4 text-right">
                                                            {statusStr === "verified" ? (
                                                                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent"><i className="bi bi-check-circle" /> VERIFIED</span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-rose-300"><i className="bi bi-exclamation-triangle" /> UNVERIFIED</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-3">
                            <button onClick={onViewDetails} className="rounded-md border border-border px-5 py-3 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent">VIEW DETAILS</button>
                            <button onClick={onTryAgain} className="rounded-md border border-rose-500/60 px-5 py-3 font-mono text-xs font-bold text-rose-300 transition-colors hover:bg-rose-500/10">TRY AGAIN</button>
                        </div>
                    </div>
                </main>

                <footer className="flex h-11 w-full items-center justify-between border-t border-border bg-bg-panel/60 px-6 font-mono text-[11px]">
                    <span className="text-accent">NETTOAI VERIFIED EXECUTION LAYER v1.0.42</span>
                    <div className="flex items-center gap-6 text-muted">
                        <span>Network: <span className="text-gray-300">{network}</span></span>
                        <span className="text-gray-300">{displayWallet}</span>
                        <span>Latency: <span className="text-gray-300">24ms</span></span>
                    </div>
                </footer>
            </div>
        );
    }

    // ALLOWED
    return (
        <div className="flex min-h-screen flex-col bg-bg">
            <header className="flex h-16 w-full items-center justify-between border-b border-border px-6">
                <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-extrabold tracking-tight text-accent">NETTOAI</span>
                    <span className="text-border">|</span>
                    <span className="font-mono text-xs text-muted">VERIFIED EXECUTION LAYER</span>
                </div>
                <div className="flex items-center gap-4">
                    <i className="bi bi-bell text-base text-muted transition-colors hover:text-accent" />
                    <i className="bi bi-gear text-base text-muted transition-colors hover:text-accent" />
                    <div className="text-right">
                        <p className="font-mono text-xs text-gray-200">{displayWallet}</p>
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
                            <span className="flex items-center gap-1.5 rounded border border-accent/60 px-3 py-1.5 font-mono text-xs text-accent"><i className="bi bi-check-circle" />ALLOWED</span>
                            <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-100">VERIFICATION RESULT</h1>
                        </div>
                        <p className="mt-2 text-sm text-muted">This transaction passed policy and provenance verification.</p>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div className="rounded-lg border border-border bg-bg-panel/40 p-5">
                                <span className="font-mono text-xs tracking-wide text-muted">AGENT ACTION</span>
                                <div className="mt-4 flex items-center justify-between border-b border-border pb-4">
                                    <span className="text-sm text-gray-300">Status</span>
                                    <span className="font-mono text-sm font-bold text-accent">PASSED</span>
                                </div>
                                <p className="mt-4 text-sm text-gray-200">Review generated action</p>
                                <button onClick={onViewDetails} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-border py-2.5 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent">
                                    VIEW DETAILS <i className="bi bi-arrow-right" />
                                </button>
                                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                                    <span className="text-sm text-gray-300">Risk Score</span>
                                    <span className={`rounded border px-2 py-1 font-mono text-[11px] ${riskColor} border-current`}>{data.riskScore}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Risk Level</span>
                                    <span className={`font-mono text-sm font-semibold ${riskColor}`}>{data.riskLevel}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Decision ID</span>
                                    <span className="font-mono text-sm text-gray-100">{data.decisionId}</span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-bg-panel/40 p-5">
                                <span className="font-mono text-xs tracking-wide text-muted">COMPARISON ANALYSIS</span>
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                                    <div className="flex-1 rounded-md border border-border px-4 py-3">
                                        <p className="font-mono text-[11px] text-muted">USER INTENT</p>
                                        <p className="mt-2 font-mono text-sm italic text-gray-200">&quot;{data.intent?.recipient || "Alice"}&quot;</p>
                                    </div>
                                    <div className="flex items-center justify-center text-muted">
                                        <i className="bi bi-arrow-right hidden sm:block" />
                                        <i className="bi bi-arrow-down sm:hidden" />
                                    </div>
                                    <div className="flex-1 rounded-md border border-accent bg-accent/5 px-4 py-3">
                                        <p className="flex items-center gap-1.5 font-mono text-[11px] text-accent"><i className="bi bi-robot" />AGENT ACTION</p>
                                        <p className="mt-2 font-mono text-sm text-gray-100">transfer({data.action?.recipient || "—"}, {data.action?.amount || "—"} {data.action?.token || "USDT"})</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-lg border border-border bg-bg-panel/40 p-5">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 font-mono text-xs tracking-wide text-muted"><i className="bi bi-shield-check text-accent" />FIELD-LEVEL PROVENANCE</span>
                                <span className="rounded border border-accent/50 px-2 py-1 font-mono text-[11px] text-accent">VERIFIED</span>
                            </div>
                            <p className="mt-4 font-display text-xl font-bold text-gray-100">All fields verified</p>
                            <p className="mt-2 text-sm text-muted">All transaction parameters match user intent and policy requirements.</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {Object.entries(data.provenance || {})
                                    .filter(([key]) => key !== "summary")
                                    .map(([field, status]) => {
                                        const statusStr = String(status);
                                        return (
                                            <span key={field} className="rounded border border-border px-2 py-1 font-mono text-[11px] text-gray-300">
                                                {field}: <span className={statusStr === "verified" ? "text-accent" : "text-rose-300"}>{statusStr}</span>
                                            </span>
                                        );
                                    })}
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-3">
                            <button onClick={onEditIntent} className="rounded-md border border-border px-5 py-3 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent">EDIT INTENT</button>
                            <button onClick={onConfirmExecute} className="flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-mono text-xs font-bold text-bg transition-colors hover:bg-accent/90">CONFIRM & EXECUTE <i className="bi bi-play-fill" /></button>
                        </div>
                    </div>
                </main>
            </div>

            <footer className="flex h-11 w-full items-center justify-between border-t border-border bg-bg-panel/60 px-6 font-mono text-[11px]">
                <span className="text-accent">NETTOAI VERIFIED EXECUTION LAYER V1.0.42</span>
                <div className="flex items-center gap-6 text-muted">
                    <span>Network: <span className="text-gray-300">{network}</span></span>
                    <span className="text-gray-300">{displayWallet}</span>
                    <span>Latency: <span className="text-gray-300">24ms</span></span>
                </div>
            </footer>
        </div>
    );
}