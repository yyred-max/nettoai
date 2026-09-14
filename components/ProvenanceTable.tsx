"use client";

import { useState } from "react";
import PipelineSidebar from "./PipelineSidebar";

type ProvenanceTableProps = {
    provenance: any;
    onBack: () => void;
    onContinue: () => void;
    network?: string;
    wallet?: string | null;
};

/** Helper: pendekkan alamat agar tidak overflow */
function shortenAddress(addr: string | null | undefined, head = 6, tail = 4) {
    if (!addr || addr.length < head + tail + 3) return addr || "—";
    return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

export default function ProvenanceTable({
    provenance,
    onBack,
    onContinue,
    network = "BSC TESTNET",
    wallet = null,
}: ProvenanceTableProps) {
    const displayWallet = shortenAddress(wallet);
    const fullWallet = wallet || "0x...";

    const [copiedField, setCopiedField] = useState<string | null>(null);
    const copyToClipboard = async (text: string, field: string) => {
        if (!text || text === "—") return;
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 1500);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    // ── Data extraction dengan fallback ──
    const recipient = provenance?.recipient || "unverified";
    const amount = provenance?.amount || "unverified";
    const token = provenance?.token || "unverified";
    const chainId = provenance?.chainId || "unverified";

    const fields = [
        {
            field: "Recipient",
            value: shortenAddress(recipient === "verified" ? "0x81eA...c228" : "—", 10, 8),
            fullValue: recipient === "verified" ? "0x81eAaDff64c2506D45Df7F7D3d6303b5FD69C228" : "—",
            status: recipient,
            source: recipient === "verified" ? "user" : "ai",
        },
        {
            field: "Amount",
            value: amount === "verified" ? "50 USDT" : "—",
            fullValue: amount === "verified" ? "50 USDT" : "—",
            status: amount,
            source: amount === "verified" ? "user" : "ai",
        },
        {
            field: "Token",
            value: token === "verified" ? "USDT" : "—",
            fullValue: token === "verified" ? "USDT" : "—",
            status: token,
            source: token === "verified" ? "user" : "ai",
        },
        {
            field: "Chain ID",
            value: chainId === "verified" ? "97 (BSC Testnet)" : "—",
            fullValue: chainId === "verified" ? "97" : "—",
            status: chainId,
            source: chainId === "verified" ? "user" : "ai",
        },
    ];

    const verifiedCount = fields.filter((f) => f.status === "verified").length;
    const totalCount = fields.length;
    const allVerified = verifiedCount === totalCount;

    return (
        <div className="flex min-h-screen flex-col bg-bg">
            <header className="flex h-16 w-full items-center justify-between border-b border-border px-6">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="font-display text-lg font-extrabold tracking-tight text-accent shrink-0">
                        NETTOAI
                    </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {wallet && (
                        <button
                            type="button"
                            onClick={() => copyToClipboard(fullWallet, "wallet")}
                            title={`Click to copy: ${fullWallet}`}
                            className="group flex items-center gap-2 rounded-full border border-border bg-bg-panel/40 px-3 py-1.5 font-mono text-xs text-gray-300 transition-all hover:border-accent/40 hover:bg-accent/5"
                        >
                            <i className="bi bi-wallet2 text-accent text-[11px]" />
                            <span>{displayWallet}</span>
                            <i
                                className={`bi ${copiedField === "wallet"
                                        ? "bi-check2 text-emerald-400"
                                        : "bi-clipboard"
                                    } text-[11px] opacity-60 group-hover:opacity-100`}
                            />
                        </button>
                    )}
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
                <PipelineSidebar activeStep="provenance" wallet={wallet} />
                <main className="flex-1 px-6 py-14 sm:px-10 overflow-x-hidden">
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
                            <span
                                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs font-bold ${allVerified
                                        ? "bg-accent text-bg"
                                        : "bg-rose-500/20 text-rose-300"
                                    }`}
                            >
                                <i
                                    className={`bi ${allVerified
                                            ? "bi-check-circle-fill"
                                            : "bi-exclamation-triangle"
                                        }`}
                                />
                                {allVerified ? "PROVENANCE VERIFIED" : "PROVENANCE FAILED"}
                            </span>
                        </div>

                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            <div className="rounded-lg border border-border bg-bg-panel/40 p-5">
                                <span className="flex items-center gap-2 font-mono text-xs text-gray-300">
                                    <i className="bi bi-info-circle text-accent" /> WHAT IS FIELD-LEVEL PROVENANCE?
                                </span>
                                <p className="mt-3 text-sm text-muted leading-relaxed">
                                    NettoAI checks whether critical values in the proposed action can be
                                    traced to an <strong className="text-blue-400">identifiable source</strong> —
                                    the user's original instruction, or the AI agent.
                                </p>
                                <p className="mt-3 text-xs text-amber-300/80 leading-relaxed border-l-2 border-amber-500/40 pl-3">
                                    <strong>Diferensiasi:</strong> Policy check biasa hanya menilai apakah
                                    transaksi aman. Provenance menilai apakah <em>AI agent jujur</em> —
                                    tidak ada field yang diubah tanpa jejak.
                                </p>
                            </div>

                            <div className="rounded-lg border border-accent/60 bg-bg-panel/40 p-5">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div>
                                        <p className="font-mono text-xs text-muted">VERIFIED FIELDS</p>
                                        <p className="mt-1 font-display text-2xl font-extrabold text-accent">
                                            {verifiedCount}{" "}
                                            <span className="text-base font-normal text-muted">
                                                / {totalCount}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-xs text-muted">UNVERIFIED FIELDS</p>
                                        <p className="mt-1 font-display text-2xl font-extrabold text-gray-100">
                                            {totalCount - verifiedCount}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-xs text-muted">OVERALL STATUS</p>
                                        <p
                                            className={`mt-1 flex items-center justify-end gap-1.5 font-display text-lg font-extrabold ${allVerified ? "text-accent" : "text-rose-400"
                                                }`}
                                        >
                                            <i
                                                className={`bi ${allVerified
                                                        ? "bi-check-circle-fill"
                                                        : "bi-exclamation-triangle"
                                                    }`}
                                            />
                                            {allVerified ? "PASSED" : "FAILED"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-lg border border-border bg-bg-panel/40 p-5">
                            <span className="flex items-center gap-2 font-mono text-xs text-gray-300">
                                <i className="bi bi-table" /> PROVENANCE MATRIX
                            </span>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[640px] text-left">
                                    <thead>
                                        <tr className="border-b border-border bg-bg text-[11px] font-mono text-muted">
                                            <th className="px-4 py-3 font-normal">FIELD</th>
                                            <th className="px-4 py-3 font-normal">VALUE</th>
                                            <th className="px-4 py-3 font-normal">SOURCE</th>
                                            <th className="px-4 py-3 font-normal">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fields.map((f) => (
                                            <tr
                                                key={f.field}
                                                className={`border-b border-border/60 ${f.status !== "verified"
                                                        ? "border-l-2 border-l-rose-500 bg-rose-950/10"
                                                        : ""
                                                    }`}
                                            >
                                                <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-100">
                                                    {f.field}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-xs text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <span className="break-all" title={f.fullValue}>
                                                            {f.value}
                                                        </span>
                                                        {f.status === "verified" && f.fullValue !== "—" && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    copyToClipboard(f.fullValue, f.field)
                                                                }
                                                                aria-label={`Copy ${f.field}`}
                                                                className="shrink-0 text-muted/60 hover:text-accent transition-colors"
                                                            >
                                                                <i
                                                                    className={`bi ${copiedField === f.field
                                                                            ? "bi-check2 text-emerald-400"
                                                                            : "bi-clipboard"
                                                                        } text-[11px]`}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {f.source === "user" ? (
                                                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400">
                                                            <i className="bi bi-person-check" /> User Input
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-amber-400">
                                                            <i className="bi bi-robot" /> AI-Generated
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {f.status === "verified" ? (
                                                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent">
                                                            <i className="bi bi-check-circle" /> VERIFIED
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-rose-300">
                                                            <i className="bi bi-exclamation-triangle" /> UNVERIFIED
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <button
                                onClick={onBack}
                                className="flex items-center justify-center gap-2 rounded-md border border-border px-5 py-3 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent"
                            >
                                <i className="bi bi-arrow-left" /> BACK TO AGENT ACTION
                            </button>
                            <button
                                onClick={onContinue}
                                disabled={!allVerified}
                                title={!allVerified ? "Cannot continue: unverified fields present" : undefined}
                                className="flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 font-mono text-xs font-bold text-bg transition-colors hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                CONTINUE TO CONFIRM <i className="bi bi-arrow-right" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <footer className="flex h-11 w-full items-center justify-between border-t border-border bg-bg-panel/60 px-6 font-mono text-[11px]">
                <span className="text-accent">NETTOAI VERIFIED EXECUTION LAYER v1.0.42</span>
                <div className="flex items-center gap-6 text-muted">
                    <span>
                        Network: <span className="text-gray-300">{network}</span>
                    </span>
                    <span className="text-gray-300">{displayWallet}</span>
                    <span>
                        Latency: <span className="text-gray-300">24ms</span>
                    </span>
                </div>
            </footer>
        </div>
    );
}