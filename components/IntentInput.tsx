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
  wallet?: string;
  connected?: boolean;
  latencyMs?: number;
  version?: string;
  activeStep?: PipelineStepId;
  onCheck?: (intent: string) => void;
  onSettingsClick?: () => void;
};

export default function IntentInput({
  network = "BSC TESTNET",
  wallet = "0x71C...A92",
  connected = true,
  latencyMs = 24,
  version = "V1.0.42",
  activeStep = "intent_parsed",
  onCheck,
  onSettingsClick,
}: IntentInputProps) {
  const [intent, setIntent] = useState("");

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
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Top nav */}
      <header className="flex h-16 w-full items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-3">
          <i className="bi bi-shield-fill-check text-xl text-accent" />
          <span className="font-display text-lg font-extrabold tracking-tight text-accent">
            NETTOAI
          </span>
          <span className="text-border">|</span>
          <span className="font-mono text-xs text-muted">{network}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-md border border-border bg-bg-panel px-3 py-1.5 font-mono text-xs">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-red-500"
                }`}
            />
            <span className={connected ? "text-emerald-400" : "text-red-400"}>
              {connected ? "CONNECTED" : "DISCONNECTED"}
            </span>
          </span>

          <span className="flex items-center gap-1.5 rounded-md border border-border bg-bg-panel px-3 py-1.5 font-mono text-xs text-gray-300">
            <i className="bi bi-wallet2 text-accent" />
            {wallet}
          </span>

          <button
            type="button"
            onClick={onSettingsClick}
            aria-label="Settings"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:text-accent"
          >
            <i className="bi bi-gear text-lg" />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Pipeline sidebar */}
        <aside className="hidden w-64 flex-col border-r border-border px-5 py-6 sm:flex">
          <p className="font-mono text-[11px] tracking-wide text-muted">
            SECURITY VERIFICATION
          </p>
          <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-accent">
            PIPELINE
          </p>

          <nav className="mt-6 flex flex-col">
            {PIPELINE_STEPS.map((step) => {
              const isActive = step.id === activeStep;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 border-l-2 px-3 py-3 font-mono text-sm ${isActive
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-transparent text-muted"
                    }`}
                >
                  <i className={`bi ${step.icon}`} />
                  {step.label}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main workspace */}
        <main className="flex flex-1 flex-col items-center px-6 py-14">
          <h1 className="text-center font-display text-4xl font-extrabold tracking-tight text-accent sm:text-5xl">
            VERIFY YOUR INTENT
          </h1>
          <p className="mt-4 max-w-xl text-center text-sm text-muted sm:text-base">
            Tell NETTOAI what you want to do. Your instruction will be
            analyzed before any transaction is executed.
          </p>

          <div className="mt-10 w-full max-w-2xl rounded-lg border border-border bg-bg-panel/40 p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-xs text-gray-300">
                <i className="bi bi-keyboard" />
                NATURAL LANGUAGE INPUT
              </span>
              <span className="rounded border border-accent/60 px-2 py-1 font-mono text-[10px] text-accent">
                {intent ? "READY" : "AWAITING INPUT"}
              </span>
            </div>

            <div className="relative mt-3">
              <textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="Describe your transaction in natural language..."
                rows={5}
                className="w-full resize-none rounded-md border border-border bg-bg px-4 py-3 text-sm text-gray-100 placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                aria-label="Voice input"
                className="absolute bottom-3 right-3 text-muted transition-colors hover:text-accent"
              >
                <i className="bi bi-mic" />
              </button>
            </div>

            <p className="mt-5 font-mono text-xs text-muted">EXAMPLES:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent"
                >
                  &quot;{example}&quot;
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCheck}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-accent py-3.5 font-display text-lg font-extrabold tracking-tight text-bg transition-colors hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <i className="bi bi-shield-fill-check" />
              NETTOAI CHECK
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[11px] text-muted">
              <i className="bi bi-info-circle" />
              NOTHING WILL BE EXECUTED DURING THIS CHECK.
            </p>
          </div>
        </main>
      </div>

      {/* Status footer */}
      <footer className="flex h-11 w-full items-center justify-between border-t border-border bg-bg-panel/60 px-6 font-mono text-[11px]">
        <span className="text-accent">
          NETTOAI VERIFIED EXECUTION LAYER {version}
        </span>
        <div className="flex items-center gap-6 text-muted">
          <span>
            Network: <span className="text-gray-300">{network}</span>
          </span>
          <span className="text-gray-300">{wallet}</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Latency: <span className="text-gray-300">{latencyMs}ms</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
