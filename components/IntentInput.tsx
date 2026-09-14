"use client";

import { useState } from "react";

type PipelineStepId =
  | "intent_parsed"
  | "agent_action"
  | "policy_check"
  | "provenance"
  | "decision";

type PipelineStep = {
  id: PipelineStepId;
  label: string;
  icon: string;
};

const PIPELINE_STEPS: PipelineStep[] = [
  { id: "intent_parsed", label: "Intent Parsed", icon: "bi-cloud-arrow-up" },
  { id: "agent_action", label: "Agent Action", icon: "bi-briefcase" },
  { id: "policy_check", label: "Policy Check", icon: "bi-shield-check" },
  { id: "provenance", label: "Provenance", icon: "bi-shield-lock" },
  { id: "decision", label: "Decision", icon: "bi-hammer" },
];

// ✅ Suggestions dengan alamat valid — bukan "Alice"
const EXAMPLES = [
  {
    label: "Send 50 USDT to 0x742D...F0b048",
    value: "Send 50 USDT to 0x742D35Cc6634C0532925a3b844Bc9e7598F0b048",
    tone: "normal" as const,
  },
  {
    label: "100000 USDT (will be blocked)",
    value: "Send 100000 USDT to 0x742D35Cc6634C0532925a3b844Bc9e7598F0b048",
    tone: "blocked" as const,
  },
  {
    label: "Self-transfer (will be blocked)",
    value: "Send 10 USDT to 0x81eAaDff64c2506D45Df7F7D3d6303b5FD69C228",
    tone: "blocked" as const,
  },
  {
    label: "Zero address (will be blocked)",
    value: "Send 10 USDT to 0x0000000000000000000000000000000000000000",
    tone: "blocked" as const,
  },
];

type IntentInputProps = {
  network?: string;
  wallet?: string | null;
  connected?: boolean;
  latencyMs?: number;
  version?: string;
  activeStep?: PipelineStepId;
  onCheck?: (intent: string) => void;
  onSettingsClick?: () => void;
};

export default function IntentInput({
  network = "BSC TESTNET",
  wallet = null,
  connected = true,
  latencyMs = 24,
  version = "V1.0.42",
  activeStep = "intent_parsed",
  onCheck,
  onSettingsClick,
}: IntentInputProps) {
  const [intent, setIntent] = useState("");
  const displayWallet = wallet
    ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
    : "0x...";

  const handleExampleClick = (example: string) => {
    setIntent(example);
  };

  const handleCheck = () => {
    if (onCheck && intent.trim()) onCheck(intent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCheck();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/20 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-accent to-blue-600 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <i className="bi bi-shield-fill-check text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-wide text-white shrink-0">
            NETTO<span className="text-accent font-light">AI</span>
          </span>
          <span className="text-border mx-1 hidden sm:inline">|</span>
          <span className="font-mono text-xs text-muted/70 tracking-widest uppercase hidden sm:inline">
            {network}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-red-500"
                }`}
            />
            <span className={connected ? "text-emerald-400" : "text-red-400"}>
              {connected ? "LIVE" : "DISCONNECTED"}
            </span>
          </span>

          <span className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 font-mono text-xs text-gray-300 backdrop-blur-md">
            <i className="bi bi-wallet2 text-accent" />
            {displayWallet}
          </span>

          <button
            type="button"
            onClick={onSettingsClick}
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-muted transition-all hover:text-white hover:bg-white/10"
          >
            <i className="bi bi-gear text-sm" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className="hidden w-72 flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl px-6 py-8 sm:flex z-10">
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-muted/70 uppercase">
            Security Check
          </p>
          <p className="mt-1 font-display text-2xl font-light tracking-tight text-white">
            Pipeline
          </p>
          <nav className="mt-8 flex flex-col gap-2 relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-white/10 -z-10 rounded-full" />
            {PIPELINE_STEPS.map((step) => {
              const isActive = step.id === activeStep;
              const isPast =
                PIPELINE_STEPS.findIndex((s) => s.id === step.id) <
                PIPELINE_STEPS.findIndex((s) => s.id === activeStep);
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 px-3 py-3 font-sans text-sm rounded-xl transition-all duration-300 ${isActive
                      ? "bg-accent/15 text-accent shadow-[inset_0_0_12px_rgba(56,189,248,0.2)] ring-1 ring-accent/30"
                      : isPast
                        ? "text-gray-300 hover:bg-white/5"
                        : "text-muted/60"
                    }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${isActive
                        ? "bg-accent/20 text-accent ring-1 ring-accent/50 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                        : isPast
                          ? "bg-white/10 text-gray-300"
                          : "bg-black/40 text-muted/40"
                      }`}
                  >
                    <i className={`bi ${step.icon} text-[15px]`} />
                  </div>
                  <span className={isActive ? "font-medium tracking-wide" : "font-light"}>
                    {step.label}
                  </span>
                  {isPast && (
                    <i className="bi bi-check2 text-emerald-400 ml-auto opacity-70" />
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="text-center z-10 mb-10">
            <h1 className="font-display text-4xl sm:text-6xl font-light tracking-tight text-white mb-4">
              Verify Your{" "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">
                Intent
              </span>
            </h1>
            <p className="max-w-xl text-center text-sm sm:text-base text-gray-400 font-light leading-relaxed">
              Describe what you want to do in natural language. Our sovereign Guardian
              model will analyze and verify it before execution.
            </p>
          </div>

          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 sm:p-8 animate-fade-in z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-accent uppercase">
                <i className="bi bi-terminal" /> Natural Language
              </span>
              <span
                className={`px-2.5 py-1 rounded-full font-mono text-[10px] tracking-widest font-bold border transition-colors ${intent
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-white/10 bg-black/40 text-muted/60"
                  }`}
              >
                {intent ? "READY" : "AWAITING"}
              </span>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
              <div className="relative">
                <textarea
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. 'Send 50 USDT to 0x742D...'"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/60 px-5 py-4 text-base text-gray-100 placeholder:text-gray-600 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all shadow-inner font-sans"
                />
                <button
                  type="button"
                  aria-label="Voice input"
                  className="absolute bottom-4 right-4 h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-accent/20 hover:text-accent transition-all text-sm border border-white/5"
                >
                  <i className="bi bi-mic-fill" />
                </button>
              </div>
            </div>

            {/* ── SUGGESTIONS dengan tone normal/blocked ── */}
            <div className="mt-6 mb-3 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted/70">
                Suggestions
              </p>
              <p className="font-mono text-[10px] text-muted/50">
                <span className="text-emerald-400">●</span> allow ·{" "}
                <span className="text-rose-400">●</span> blocked demo
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 mb-8">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => handleExampleClick(example.value)}
                  className={`group rounded-full border px-4 py-2 font-sans text-xs font-medium transition-all ${example.tone === "blocked"
                      ? "border-rose-500/20 bg-rose-500/5 text-rose-300/80 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-200"
                      : "border-white/10 bg-white/5 text-gray-300 hover:bg-accent/10 hover:border-accent/40 hover:text-white"
                    }`}
                >
                  {example.tone === "blocked" && (
                    <i className="bi bi-shield-exclamation mr-1.5 text-[10px]" />
                  )}
                  {example.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCheck}
              disabled={!intent.trim()}
              className="group relative w-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-accent/90 to-blue-600/90 py-4 font-display text-lg font-semibold tracking-wide text-white transition-all hover:from-accent hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                <i className="bi bi-shield-check" /> Execute Check
              </span>
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 font-sans text-xs text-muted/60 font-medium">
              <i className="bi bi-lock-fill" /> Execution blocked until verified by
              Guardian model
              <span className="ml-2 font-mono text-muted/40 hidden sm:inline">⌘ + Enter</span>
            </p>
          </div>
        </main>
      </div>

      <footer className="flex h-12 w-full items-center justify-between border-t border-white/5 bg-black/20 px-6 backdrop-blur-md">
        <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-accent/80">
          NettoAI Guardian {version}
        </span>
        <div className="flex items-center gap-6 text-xs text-muted/70 font-mono">
          <span className="hidden sm:flex gap-2">
            NET: <span className="text-gray-300 font-medium">{network}</span>
          </span>
          <span className="text-gray-300 font-medium hidden sm:block">{displayWallet}</span>
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-gray-300 font-medium">{latencyMs}ms</span>
          </span>
        </div>
      </footer>
    </div>
  );
}