"use client";

import { useState, useEffect } from "react";
import PipelineSidebar from "./PipelineSidebar";
import LoadingState from "./LoadingState";
import StarfieldBackground from "./StarfieldBackground";

type AgentActionDetailProps = {
    userIntent: string;
    action: any;
    intentData: any;
    onBack: () => void;
    onViewProvenance: () => void;
    network?: string;
    wallet?: string | null;
    isLoading?: boolean;
};

/**
 * Reusable hook untuk copy-to-clipboard dengan state feedback.
 * Menerapkan Heuristik #1 (Visibility of Status) & #5 (Error Prevention).
 */
function useCopyToClipboard() {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const copy = async (text: string, field: string) => {
        if (!text || text === "—") return;
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 1500);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };
    return { copiedField, copy };
}

function shortenAddress(addr: string, head = 6, tail = 4) {
    if (!addr || addr.length < head + tail + 3) return addr;
    return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

export default function AgentActionDetail({
    userIntent,
    action,
    intentData,
    onBack,
    onViewProvenance,
    network = "BSC TESTNET",
    wallet = null,
    isLoading = false,
}: AgentActionDetailProps) {
    const { copiedField, copy } = useCopyToClipboard();

    const recipient = action?.recipient || "—";
    const amount = action?.amount || "—";
    const token = action?.token || "USDT";

    // Heuristik #9: Error Recovery — deteksi field yang tidak lengkap
    const hasRecipient = recipient && recipient !== "—";
    const hasAmount = amount && amount !== "—";
    const hasCompleteAction = hasRecipient && hasAmount;

    // Heuristik #7: Keyboard shortcuts — Esc untuk back, Ctrl+Enter untuk lanjut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onBack();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isLoading && hasCompleteAction) {
                e.preventDefault();
                onViewProvenance();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onBack, onViewProvenance, isLoading, hasCompleteAction]);

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden">
            <StarfieldBackground />

            {/* ─── HEADER ─── */}
            <header className="relative z-20 flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/30 px-4 sm:px-6 backdrop-blur-md">
                {/* Left: Logo + Network */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                        <i className="bi bi-shield-fill-check text-white text-sm" />
                    </div>
                    <span className="font-display text-lg font-bold tracking-wide text-white shrink-0">
                        NETTO<span className="text-blue-400 font-light">AI</span>
                    </span>
                    <span className="hidden md:flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-[10px] tracking-widest text-blue-400 uppercase shrink-0">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                        {network}
                    </span>
                </div>

                {/* Right: Wallet (shortened) + Copy + Status */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Wallet chip dengan copy — Heuristik #6 (Recognition > Recall) */}
                    {wallet && (
                        <button
                            type="button"
                            onClick={() => copy(wallet, "wallet")}
                            title={`Click to copy: ${wallet}`}
                            aria-label="Copy wallet address"
                            className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs text-gray-300 transition-all hover:border-blue-400/40 hover:bg-blue-500/5"
                        >
                            <i className="bi bi-wallet2 text-blue-400 text-xs shrink-0" />
                            <span className="hidden sm:inline">{shortenAddress(wallet)}</span>
                            <i
                                className={`bi ${copiedField === "wallet" ? "bi-check2 text-emerald-400" : "bi-clipboard"
                                    } text-[11px] opacity-60 group-hover:opacity-100 transition-opacity`}
                            />
                        </button>
                    )}

                    {/* Status badge — Heuristik #1 (Visibility of Status) */}
                    <span className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] tracking-widest font-bold text-emerald-400">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                        </span>
                        CONNECTED
                    </span>

                    <button
                        type="button"
                        aria-label="Settings"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 transition-all hover:text-white hover:bg-white/10 shrink-0"
                    >
                        <i className="bi bi-gear text-sm" />
                    </button>
                </div>
            </header>

            {/* ─── BODY ─── */}
            <div className="relative z-10 flex flex-1 overflow-hidden">
                <div className="hidden sm:block">
                    <PipelineSidebar activeStep="agent_action" wallet={wallet} isLoading={isLoading} />
                </div>

                <main className="flex-1 px-4 py-8 sm:px-10 sm:py-12 overflow-y-auto w-full">
                    <div className="mx-auto max-w-5xl">
                        {/* ─── PAGE TITLE — Heuristik #8 (Minimalist) ─── */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-[0.2em] uppercase text-blue-400/70">
                                <span className="h-px w-8 bg-blue-400/40" />
                                Step 2 of 5
                            </div>
                            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                                Agent <span className="gradient-text">Action</span>
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm sm:text-base text-gray-400 font-light leading-relaxed">
                                AI telah menerjemahkan intent kamu menjadi aksi terstruktur. Periksa detail di bawah sebelum melanjutkan ke verifikasi provenance.
                            </p>
                        </div>

                        {/* ─── MAIN COMPARISON GRID — 2 kolom seimbang ─── */}
                        <div className="grid gap-5 lg:grid-cols-2 mb-5">
                            {/* ── Left: User Intent ── */}
                            <section className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                                <header className="flex items-center justify-between mb-4">
                                    <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest font-bold text-gray-400 uppercase">
                                        <i className="bi bi-chat-quote text-blue-400" />
                                        Original Intent
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[9px] tracking-widest text-gray-500 uppercase">
                                        Input
                                    </span>
                                </header>

                                <div className="rounded-xl border border-white/5 bg-black/40 px-5 py-6 min-h-[140px] flex items-center justify-center">
                                    <p className="font-sans text-base italic text-gray-200 font-light leading-relaxed text-center max-w-md">
                                        &quot;{userIntent}&quot;
                                    </p>
                                </div>

                                <p className="mt-4 text-[11px] text-gray-500 font-sans leading-relaxed">
                                    Prompt asli dari kamu, diparsing langsung oleh Guardian AI tanpa modifikasi.
                                </p>
                            </section>

                            {/* ── Right: Generated Action ── */}
                            <section className="glass-panel-strong rounded-2xl p-6 relative overflow-hidden border-blue-400/20">
                                {/* Ambient glow */}
                                <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

                                <header className="relative flex items-center justify-between mb-4">
                                    <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest font-bold text-blue-400 uppercase">
                                        <i className="bi bi-braces" />
                                        Generated Action
                                    </span>
                                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[9px] tracking-widest font-bold text-emerald-400">
                                        READY
                                    </span>
                                </header>

                                {/* Action fields grid */}
                                <div className="relative grid grid-cols-2 gap-3">
                                    <FieldCard label="Function" value="transfer" mono />
                                    <FieldCard
                                        label="Recipient"
                                        value={recipient}
                                        mono
                                        highlight={!hasRecipient}
                                        onCopy={hasRecipient ? () => copy(recipient, "recipient") : undefined}
                                        copied={copiedField === "recipient"}
                                        truncate
                                    />
                                    <FieldCard label="Amount" value={`${amount} ${token}`} mono />
                                    <FieldCard label="Network" value={network} mono />
                                </div>

                                {/* Technical preview — Heuristik #10 (Help) dengan collapsible feel */}
                                <details className="group relative mt-4 rounded-xl border border-white/5 bg-black/60 overflow-hidden">
                                    <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3 hover:bg-white/[0.02] transition-colors">
                                        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                                            <span className="flex gap-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500/60" />
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500/60" />
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                                            </span>
                                            Technical Preview
                                        </span>
                                        <i className="bi bi-chevron-down text-gray-500 text-xs group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="px-4 pb-4 pt-1">
                                        <p className="font-mono text-[11px] text-blue-300/90 break-all leading-relaxed">
                                            <span className="text-purple-400">transfer</span>(
                                            recipient:{" "}
                                            <span className="text-amber-200">{shortenAddress(recipient, 10, 8)}</span>
                                            , amount:{" "}
                                            <span className="text-emerald-300">{amount}</span>{" "}
                                            <span className="text-gray-500">{token}</span>)
                                        </p>
                                        <p className="mt-2 text-[10px] text-gray-500 leading-relaxed">
                                            Function call yang akan dikirim ke smart contract. Ditampilkan untuk transparansi.
                                        </p>
                                    </div>
                                </details>
                            </section>
                        </div>

                        {/* ─── POLICY CHECK CARD ─── */}
                        <section className="glass-panel rounded-2xl p-6 mb-5">
                            <header className="flex items-center justify-between mb-4">
                                <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest font-bold text-gray-400 uppercase">
                                    <i className="bi bi-shield-check text-blue-400" />
                                    Policy Verification
                                </span>
                                {/* Heuristik #1: Status jelas */}
                                <span
                                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-widest uppercase font-bold transition-colors ${isLoading
                                            ? "border-blue-400/40 bg-blue-500/10 text-blue-400"
                                            : hasCompleteAction
                                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                                        }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${isLoading
                                                ? "bg-blue-400 animate-pulse"
                                                : hasCompleteAction
                                                    ? "bg-emerald-400"
                                                    : "bg-amber-400"
                                            }`}
                                    />
                                    {isLoading ? "Checking" : hasCompleteAction ? "Ready" : "Incomplete"}
                                </span>
                            </header>

                            <p className="text-sm font-light text-gray-400 leading-relaxed mb-5 max-w-3xl">
                                {isLoading
                                    ? "Guardian AI sedang menganalisis intent kamu dan menyiapkan rencana eksekusi yang aman."
                                    : hasCompleteAction
                                        ? "Semua field terdeteksi. Aksi siap diverifikasi terhadap batas keamanan eksekusi."
                                        : "Beberapa field belum lengkap. Periksa kembali prompt kamu atau kembali untuk mengulang."}
                            </p>

                            {/* Heuristik #8: hanya tampilkan loading state saat loading */}
                            {isLoading && (
                                <LoadingState label="NettoAI is analyzing" tone="checking" />
                            )}

                            {/* Heuristik #9: Error prevention — tunjukkan field yang hilang */}
                            {!isLoading && !hasCompleteAction && (
                                <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3">
                                    <i className="bi bi-exclamation-triangle text-amber-400 mt-0.5" />
                                    <div className="text-xs text-amber-200/90 leading-relaxed">
                                        <strong className="font-semibold">Field tidak lengkap:</strong>{" "}
                                        {!hasRecipient && <span>recipient alamat tidak terdeteksi. </span>}
                                        {!hasAmount && <span>jumlah transfer tidak terdeteksi.</span>}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ─── FLOW INDICATOR — Heuristik #4 (Consistency) ─── */}
                        <section className="glass-panel rounded-2xl px-6 py-6 mb-8">
                            <div className="flex items-center justify-between gap-4">
                                <FlowNode
                                    icon="bi-chat-quote"
                                    label="Intent"
                                    state="complete"
                                />
                                <FlowConnector state="complete" />
                                <FlowNode
                                    icon="bi-robot"
                                    label="Guardian"
                                    state={isLoading ? "active" : "complete"}
                                    pulse={isLoading}
                                />
                                <FlowConnector state={hasCompleteAction ? "complete" : "pending"} />
                                <FlowNode
                                    icon="bi-code-square"
                                    label="Action"
                                    state={hasCompleteAction ? "active" : "pending"}
                                />
                            </div>
                        </section>

                        {/* ─── ACTION BUTTONS ─── */}
                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <button
                                onClick={onBack}
                                className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 px-6 py-3.5 font-mono text-[11px] uppercase tracking-widest font-bold text-gray-300 transition-all hover:bg-white/5 hover:text-white hover:border-white/20"
                            >
                                <i className="bi bi-arrow-left group-hover:-translate-x-0.5 transition-transform" />
                                Back
                                <kbd className="ml-1 hidden sm:inline rounded border border-white/10 bg-black/40 px-1.5 py-0.5 text-[9px] text-gray-500">
                                    Esc
                                </kbd>
                            </button>

                            <button
                                onClick={onViewProvenance}
                                disabled={isLoading || !hasCompleteAction}
                                title={!hasCompleteAction ? "Field tidak lengkap" : "Lanjut ke verifikasi provenance"}
                                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3.5 font-display font-semibold tracking-wide text-white transition-all hover:from-blue-400 hover:to-indigo-500 shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_30px_rgba(59,130,246,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-indigo-600"
                            >
                                View Provenance
                                <i className="bi bi-arrow-right group-hover:translate-x-1 transition-transform" />
                                <kbd className="ml-1 hidden sm:inline rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[9px]">
                                    ⌘+↵
                                </kbd>
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* ─── FOOTER ─── */}
            <footer className="relative z-20 flex h-12 w-full items-center justify-between border-t border-white/5 bg-black/30 px-4 sm:px-6 backdrop-blur-md">
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-blue-400/70">
                    NettoAI Guardian v1.0.42
                </span>
                <div className="flex items-center gap-4 sm:gap-6 text-[10px] text-gray-500 font-mono">
                    <span className="hidden md:flex gap-1.5">
                        NET: <span className="text-gray-300">{network}</span>
                    </span>
                    <span className="hidden sm:flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-gray-300">24ms</span>
                    </span>
                </div>
            </footer>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS — untuk konsistensi visual (Heuristik #4)
   ──────────────────────────────────────────────────────────────────── */

function FieldCard({
    label,
    value,
    mono = false,
    highlight = false,
    truncate = false,
    onCopy,
    copied = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
    highlight?: boolean;
    truncate?: boolean;
    onCopy?: () => void;
    copied?: boolean;
}) {
    return (
        <div
            className={`group rounded-xl border px-4 py-3 transition-colors ${highlight
                    ? "border-amber-500/30 bg-amber-500/[0.05]"
                    : "border-white/5 bg-black/40 hover:border-white/10"
                }`}
        >
            <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-mono text-[9px] tracking-widest font-bold uppercase text-gray-500">
                    {label}
                </p>
                {onCopy && (
                    <button
                        type="button"
                        onClick={onCopy}
                        aria-label={`Copy ${label}`}
                        className="shrink-0 rounded p-0.5 text-gray-600 transition-colors hover:text-blue-400"
                    >
                        <i
                            className={`bi ${copied ? "bi-check2 text-emerald-400" : "bi-clipboard"
                                } text-[11px]`}
                        />
                    </button>
                )}
            </div>
            <p
                className={`${mono ? "font-mono" : "font-sans"} text-xs sm:text-sm ${highlight ? "text-amber-300" : "text-gray-100"
                    } font-semibold ${truncate ? "truncate" : "break-all"}`}
                title={truncate ? value : undefined}
            >
                {value}
            </p>
            {copied && (
                <p className="mt-1 font-mono text-[9px] text-emerald-400">Copied!</p>
            )}
        </div>
    );
}

function FlowNode({
    icon,
    label,
    state,
    pulse = false,
}: {
    icon: string;
    label: string;
    state: "complete" | "active" | "pending";
    pulse?: boolean;
}) {
    const styles = {
        complete: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
        active: "border-blue-400/60 bg-blue-500/15 text-blue-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]",
        pending: "border-white/10 bg-black/40 text-gray-500",
    };
    return (
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div
                className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border transition-all ${styles[state]} ${pulse ? "animate-pulse" : ""
                    }`}
            >
                <i className={`bi ${icon} text-xl`} />
            </div>
            <span
                className={`font-mono text-[9px] tracking-widest font-bold uppercase ${state === "active"
                        ? "text-blue-400"
                        : state === "complete"
                            ? "text-emerald-400/80"
                            : "text-gray-600"
                    }`}
            >
                {label}
            </span>
        </div>
    );
}

function FlowConnector({ state }: { state: "complete" | "pending" }) {
    return (
        <div className="flex-1 h-px relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10" />
            {state === "complete" && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/60 to-blue-500/60" />
            )}
        </div>
    );
}