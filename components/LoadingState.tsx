"use client";

type LoadingStateProps = {
    /** Text shown next to the spinner, e.g. "Evaluating policy limits" */
    label?: string;
    /** Custom message dari parent component */
    message?: string;
    /** Wallet address untuk ditampilkan (opsional) */
    wallet?: string | null;
    /** "pending" = neutral/waiting (gray), "checking" = active work (accent) */
    tone?: "pending" | "checking";
    /** Show the indeterminate progress bar under the label */
    showBar?: boolean;
};

export default function LoadingState({
    label = "Processing…",
    message,
    wallet,
    tone = "checking",
    showBar = true,
}: LoadingStateProps) {
    // Gunakan message jika disediakan, jika tidak gunakan label default
    const displayText = message || label;

    const colorClasses =
        tone === "checking"
            ? {
                dot: "bg-accent",
                text: "text-accent",
                barFrom: "from-accent/40",
                barVia: "via-accent",
                barTo: "to-accent/40",
                ring: "border-accent/30",
            }
            : {
                dot: "bg-gray-400",
                text: "text-gray-300",
                barFrom: "from-gray-500/40",
                barVia: "via-gray-300",
                barTo: "to-gray-500/40",
                ring: "border-white/20",
            };

    return (
        <div className="flex flex-col gap-3" role="status" aria-live="polite">
            <div className="flex items-center gap-2.5">
                {/* Spinner */}
                <span
                    className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-transparent ${colorClasses.ring} border-t-current ${colorClasses.text}`}
                    aria-hidden="true"
                />
                <span className={`font-mono text-xs tracking-wide ${colorClasses.text}`}>
                    {displayText}
                    <span className="inline-flex w-4 justify-start overflow-hidden align-bottom">
                        <span className="animate-[ellipsis_1.4s_infinite]">...</span>
                    </span>
                </span>
            </div>

            {showBar && (
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/10 shadow-inner">
                    <div
                        className={`absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r ${colorClasses.barFrom} ${colorClasses.barVia} ${colorClasses.barTo} animate-[loading-slide_1.4s_ease-in-out_infinite]`}
                    />
                </div>
            )}

            <style jsx>{`
                @keyframes loading-slide {
                    0% {
                        left: -35%;
                    }
                    50% {
                        left: 60%;
                    }
                    100% {
                        left: 100%;
                    }
                }
                @keyframes ellipsis {
                    0% {
                        clip-path: inset(0 100% 0 0);
                    }
                    33% {
                        clip-path: inset(0 66% 0 0);
                    }
                    66% {
                        clip-path: inset(0 33% 0 0);
                    }
                    100% {
                        clip-path: inset(0 0 0 0);
                    }
                }
            `}</style>
        </div>
    );
}