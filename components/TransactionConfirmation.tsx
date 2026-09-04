"use client";

type TransactionConfirmationProps = {
    onCancel: () => void;
    onConfirmSign: () => void;
    fromAddress?: string;
    toAddress?: string;
    amount?: string;
    token?: string;
    network?: string;
    decisionId?: string;
};

export default function TransactionConfirmation({
    onCancel,
    onConfirmSign,
    fromAddress = "0x71C...A92",
    toAddress = "Alice",
    amount = "50",
    token = "USDT",
    network = "BSC Testnet",
    decisionId = "DEC-8F21...",
}: TransactionConfirmationProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-16">
            <div className="w-full max-w-2xl rounded-lg border border-border p-8">
                <span className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-accent">
                    <i className="bi bi-hammer text-xl" /> CONFIRM TRANSACTION
                </span>
                <p className="mt-2 text-sm text-muted">Review the transaction details before signing.</p>
                <div className="mt-6 border-t border-border" />

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="relative rounded-md border border-accent bg-bg-panel/40 px-4 py-3">
                        <p className="font-mono text-[11px] text-muted">FROM</p>
                        <p className="mt-1 font-mono text-sm text-accent">{fromAddress}</p>
                        <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-muted sm:block"><i className="bi bi-arrow-right" /></span>
                    </div>
                    <div className="rounded-md border border-border bg-bg-panel/40 px-4 py-3">
                        <p className="font-mono text-[11px] text-muted">TO</p>
                        <p className="mt-1 font-mono text-sm text-gray-100">{toAddress}</p>
                    </div>
                    <div className="rounded-md border-t-2 border-accent bg-bg-panel/40 px-4 py-3">
                        <p className="font-mono text-[11px] text-muted">AMOUNT</p>
                        <p className="mt-1 font-display text-2xl font-extrabold text-accent">{amount} <span className="font-mono text-base font-normal text-gray-200">{token}</span></p>
                    </div>
                    <div className="rounded-md border border-border bg-bg-panel/40 px-4 py-3">
                        <p className="font-mono text-[11px] text-muted">NETWORK</p>
                        <p className="mt-1 flex items-center gap-2 font-mono text-sm text-gray-100"><span className="inline-block h-2 w-2 rounded-full bg-blue-400" />{network}</p>
                    </div>
                </div>

                <div className="mt-6 rounded-md bg-bg-panel/60 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="font-mono text-xs font-semibold text-accent">NETTOAI VERIFICATION</p>
                            <ul className="mt-3 flex flex-col gap-2 text-sm">
                                <li className="flex items-center gap-2 text-gray-200"><i className="bi bi-check-circle text-accent" /> Policy Passed</li>
                                <li className="flex items-center gap-2 text-gray-200"><i className="bi bi-check-circle text-accent" /> Provenance Verified</li>
                                <li className="flex items-center gap-2 text-blue-300"><i className="bi bi-clipboard-check" /> User Confirmation Required</li>
                            </ul>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-[11px] text-muted">DECISION ID</p>
                            <p className="mt-1 rounded bg-bg px-2 py-1 font-mono text-xs text-gray-300">{decisionId}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                    <button onClick={onCancel} className="rounded-md border border-border px-6 py-3 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent">CANCEL</button>
                    <button onClick={onConfirmSign} className="flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-mono text-xs font-bold text-bg transition-colors hover:bg-accent/90"><i className="bi bi-pen" /> CONFIRM & SIGN</button>
                </div>
            </div>
        </div>
    );
}