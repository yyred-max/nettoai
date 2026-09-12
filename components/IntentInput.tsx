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

const EXAMPLES = [
  "Send 50 USDT to Alice",
  "Transfer 0.1 BNB to 0x...",
  "Swap 100 USDT to BNB",
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
  const displayWallet = wallet || "0x...";

  const handleExampleClick = (example: string) => {
    setIntent(example);
  };

  const handleCheck = () => {
    if (onCheck) {
      onCheck(intent);
      return;
    }
    console.log("NettoAI check:", intent);
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/20 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
             <i className="bi bi-shield-fill-check text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-wide text-white">NETTO<span className="text-accent font-light">AI</span></span>
          <span className="text-border mx-1">|</span>
          <span className="font-mono text-xs text-muted/70 tracking-widest uppercase">{network}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-md">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-red-500"}`} />
            <span className={connected ? "text-emerald-400" : "text-red-400"}>
              {connected ? "LIVE" : "DISCONNECTED"}
            </span>
          </span>

          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 font-mono text-xs text-gray-300 backdrop-blur-md transition-all hover:bg-white/5 cursor-pointer">
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
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-muted/70 uppercase">Security Check</p>
          <p className="mt-1 font-display text-2xl font-light tracking-tight text-white">Pipeline</p>
          <nav className="mt-8 flex flex-col gap-2 relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-white/10 -z-10 rounded-full" />
            {PIPELINE_STEPS.map((step, idx) => {
              const isActive = step.id === activeStep;
              const isPast = PIPELINE_STEPS.findIndex(s => s.id === step.id) < PIPELINE_STEPS.findIndex(s => s.id === activeStep);
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 px-3 py-3 font-sans text-sm rounded-xl transition-all duration-300 ${isActive ? "bg-accent/15 text-accent shadow-[inset_0_0_12px_rgba(56,189,248,0.2)] ring-1 ring-accent/30" : isPast ? "text-gray-300 hover:bg-white/5" : "text-muted/60"
                    }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isActive ? 'bg-accent/20 text-accent ring-1 ring-accent/50 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : isPast ? 'bg-white/10 text-gray-300' : 'bg-black/40 text-muted/40'}`}>
                     <i className={`bi ${step.icon} text-[15px]`} />
                  </div>
                  <span className={isActive ? 'font-medium tracking-wide' : 'font-light'}>{step.label}</span>
                  {isPast && <i className="bi bi-check2 text-emerald-400 ml-auto opacity-70" />}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="text-center z-10 mb-10">
              <h1 className="font-display text-4xl sm:text-6xl font-light tracking-tight text-white mb-4">
                Verify Your <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">Intent</span>
              </h1>
              <p className="max-w-xl text-center text-sm sm:text-base text-gray-400 font-light leading-relaxed">
                Describe what you want to do in natural language. Our sovereign Guardian model will analyze and verify it before execution.
              </p>
          </div>

          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 sm:p-8 animate-fade-in z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-accent uppercase">
                <i className="bi bi-terminal" /> Natural Language
              </span>
              <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] tracking-widest font-bold border transition-colors ${intent ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-black/40 text-muted/60'}`}>
                {intent ? "READY" : "AWAITING"}
              </span>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
              <div className="relative">
                <textarea
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="e.g. 'Transfer 100 USDT to 0x123...'"
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

            <p className="mt-6 mb-3 font-mono text-[10px] uppercase font-bold tracking-widest text-muted/70">Suggestions</p>
            <div className="flex flex-wrap gap-2.5 mb-8">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-sans text-xs font-medium text-gray-300 transition-all hover:bg-accent/10 hover:border-accent/40 hover:text-white"
                >
                  {example}
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
              <i className="bi bi-lock-fill" /> Execution blocked until verified by Guardian model
            </p>
          </div>
        </main>
      </div>

      <footer className="flex h-12 w-full items-center justify-between border-t border-white/5 bg-black/20 px-6 backdrop-blur-md">
        <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-accent/80">NettoAI Guardian {version}</span>
        <div className="flex items-center gap-6 text-xs text-muted/70 font-mono">
          <span className="flex gap-2">NET: <span className="text-gray-300 font-medium">{network}</span></span>
          <span className="text-gray-300 font-medium">{displayWallet}</span>
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