"use client";

import { useState } from "react";
import ConnectWallet from "@/components/ConnectWallet";
import IntentInput from "@/components/IntentInput";
import AgentActionDetail from "@/components/AgentActionDetail";
import ProvenanceTable from "@/components/ProvenanceTable";
import NettoResult from "@/components/NettoResult";
import TransactionConfirmation from "@/components/TransactionConfirmation";
import { SuccessScreen } from "@/components/SuccessScreen";
import PipelineSidebar from "@/components/PipelineSidebar";

type UIStatus =
  | "connect"
  | "idle"
  | "loading"
  | "action_detail"
  | "provenance"
  | "allow"
  | "blocked"
  | "no_action"
  | "confirm"
  | "error";

type ResultData = {
  status: "ALLOW" | "BLOCKED" | "NO_ACTION";
  decisionId: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasons: string[];
  intent: any;
  action: any;
  provenance: any;
};

const DEMO_WALLET_ADDRESS = "0x742D35Cc6634C0532925a3b844Bc9e7598F0b048";

function shortenAddress(addr: string | null | undefined) {
  if (!addr) return "0x...";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Home() {
  const [status, setStatus] = useState<UIStatus>("connect");
  const [intent, setIntent] = useState("");
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [txData, setTxData] = useState<{ txHash: string; block: number } | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    note?: string;
    txHash?: string;
  } | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleCheck = async (userInput: string) => {
    setIntent(userInput);
    setStatus("loading");
    setErrorDetails(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput, walletAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "NettoAI check failed");
      setResultData(data);
      if (data.status === "ALLOW") {
        setStatus("action_detail");
      } else if (data.status === "NO_ACTION") {
        setStatus("no_action");
      } else {
        setStatus("blocked");
      }
    } catch (err: any) {
      setErrorDetails({ message: err.message });
      setStatus("error");
    }
  };

  const handleExecute = async (decisionId: string) => {
    setStatus("loading");

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 1500));
      const mockHash =
        "0x" +
        Array.from({ length: 64 }, () =>
          "0123456789abcdef"[Math.floor(Math.random() * 16)]
        ).join("");
      setTxData({
        txHash: mockHash,
        block: 42_000_000 + Math.floor(Math.random() * 9999),
      });
      setStatus("confirm");
      return;
    }

    try {
      const res = await fetch("/api/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        const statusRes = await fetch(`/api/agent/status?decisionId=${decisionId}`).catch(
          () => null
        );
        if (statusRes && statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.txHash) {
            setTxData({
              txHash: statusData.txHash,
              block: statusData.block ? Number(statusData.block) : 0,
            });
            setStatus("confirm");
            return;
          }
        }
        setErrorDetails({
          message: data.error || "Execution failed",
          note: data.note,
          txHash: data.txHash,
        });
        setStatus("error");
        return;
      }
      setTxData({
        txHash: data.txHash,
        block: data.block ? Number(data.block) : 0,
      });
      setStatus("confirm");
    } catch (err: any) {
      setErrorDetails({ message: err.message });
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setResultData(null);
    setTxData(null);
    setErrorDetails(null);
  };

  const DemoBadge = () =>
    isDemoMode ? (
      <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 font-mono text-[10px] tracking-widest font-bold text-amber-300 backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.2)]">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        DEMO MODE
      </div>
    ) : null;

  switch (status) {
    case "connect":
      return (
        <ConnectWallet
          onConnect={(address) => {
            setWalletAddress(address || null);
            setIsDemoMode(false);
            if (address) setStatus("idle");
          }}
          onEnterDemo={() => {
            setWalletAddress(DEMO_WALLET_ADDRESS);
            setIsDemoMode(true);
            setStatus("idle");
          }}
        />
      );

    case "idle":
      return (
        <>
          <DemoBadge />
          <IntentInput onCheck={handleCheck} wallet={walletAddress ?? undefined} />
        </>
      );

    case "loading":
      return (
        <>
          <DemoBadge />
          <AgentActionDetail
            userIntent={intent}
            action={{}}
            intentData={{}}
            onBack={() => setStatus("idle")}
            onViewProvenance={() => { }}
            wallet={walletAddress ?? undefined}
            isLoading={true}
          />
        </>
      );

    case "action_detail":
      return resultData ? (
        <>
          <DemoBadge />
          <AgentActionDetail
            userIntent={intent}
            action={resultData.action}
            intentData={resultData.intent}
            onBack={() => setStatus("idle")}
            onViewProvenance={() => setStatus("provenance")}
            wallet={walletAddress ?? undefined}
            isLoading={false}
          />
        </>
      ) : null;

    case "provenance":
      return resultData ? (
        <>
          <DemoBadge />
          <ProvenanceTable
            provenance={resultData.provenance}
            onBack={() => setStatus("action_detail")}
            onContinue={() => setStatus("allow")}
            wallet={walletAddress ?? undefined}
          />
        </>
      ) : null;

    case "allow":
      return resultData ? (
        <>
          <DemoBadge />
          <NettoResult
            result="allowed"
            data={resultData}
            onEditIntent={() => setStatus("idle")}
            onViewDetails={() => setStatus("action_detail")}
            onConfirmExecute={() => handleExecute(resultData.decisionId)}
            wallet={walletAddress ?? undefined}
          />
        </>
      ) : null;

    case "blocked":
      return resultData ? (
        <>
          <DemoBadge />
          <NettoResult
            result="blocked"
            data={resultData}
            onViewDetails={() => setStatus("provenance")}
            onTryAgain={handleReset}
            wallet={walletAddress ?? undefined}
          />
        </>
      ) : null;

    // ── NO_ACTION & ERROR: tetap tampilkan PipelineSidebar ──
    case "no_action":
    case "error":
      return (
        <div className="flex min-h-screen flex-col bg-bg">
          <DemoBadge />

          {/* Header dengan status error */}
          <header className="flex h-16 w-full items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-display text-lg font-extrabold tracking-tight text-accent shrink-0">
                NETTOAI
              </span>
              <span className="text-border hidden sm:inline">|</span>
              <span className="font-mono text-xs text-muted hidden sm:inline shrink-0">
                VERIFIED EXECUTION LAYER
              </span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden sm:block text-right">
                <p className="font-mono text-[10px] text-muted">SYSTEM STATUS</p>
                <p className="flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-400">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {status === "no_action" ? "NO ACTION" : "INTERRUPTED"}
                </p>
              </div>
              {walletAddress && (
                <span className="font-mono text-xs text-gray-300 rounded-full border border-border bg-bg-panel/40 px-3 py-1.5">
                  {shortenAddress(walletAddress)}
                </span>
              )}
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/50 text-amber-400">
                <i
                  className={`bi text-sm ${status === "no_action"
                      ? "bi-question-circle"
                      : "bi-exclamation-triangle"
                    }`}
                />
              </span>
            </div>
          </header>

          <div className="flex flex-1">
            {/* ✅ PipelineSidebar tetap terlihat — user paham di tahap mana gagal */}
            <PipelineSidebar activeStep="intent_parsed" wallet={walletAddress} />

            <main className="flex-1 px-6 py-10 sm:px-10 overflow-x-hidden">
              <div className="mx-auto max-w-3xl">
                <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />

                <div className="mt-8 flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10">
                    <i
                      className={`bi text-2xl text-amber-400 ${status === "no_action"
                          ? "bi-question-circle"
                          : "bi-exclamation-triangle"
                        }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <h1 className="font-display text-3xl font-extrabold tracking-tight text-gray-100">
                      {status === "no_action"
                        ? "NO ACTION GENERATED"
                        : "PROCESS INTERRUPTED"}
                    </h1>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                      {status === "no_action"
                        ? "Agent tidak menghasilkan aksi transfer dari input kamu. Coba perjelas permintaan dengan format yang lebih spesifik."
                        : "NettoAI tidak dapat melanjutkan verifikasi. Silakan periksa pesan error di bawah dan coba lagi."}
                    </p>
                  </div>
                </div>

                {/* Detail card */}
                <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-amber-400 mb-2">
                    {status === "no_action" ? "Reason" : "Error Detail"}
                  </p>
                  <p className="text-sm text-gray-100 leading-relaxed break-words">
                    {status === "no_action"
                      ? resultData?.reasons?.[0] ||
                      "Agent tidak memanggil tool transfer."
                      : errorDetails?.message || "An unknown error occurred."}
                  </p>
                  {errorDetails?.note && (
                    <div className="mt-4 rounded-md border-l-2 border-amber-500 bg-amber-500/5 px-4 py-3">
                      <p className="text-xs text-amber-200/90 leading-relaxed">
                        {errorDetails.note}
                      </p>
                    </div>
                  )}
                </div>

                {/* Hint card */}
                <div className="mt-5 rounded-xl border border-border bg-bg-panel/40 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <i className="bi bi-lightbulb" /> Common Fixes
                  </p>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <i className="bi bi-check2 text-emerald-400 mt-0.5 shrink-0" />
                      <span>
                        Pastikan alamat recipient menggunakan format{" "}
                        <code className="font-mono text-xs bg-black/40 px-1.5 py-0.5 rounded">
                          0x
                        </code>{" "}
                        + 40 karakter hex.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="bi bi-check2 text-emerald-400 mt-0.5 shrink-0" />
                      <span>
                        Gunakan format:{" "}
                        <em className="text-gray-100">
                          &quot;Send &lt;amount&gt; &lt;TOKEN&gt; to &lt;address&gt;&quot;
                        </em>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="bi bi-check2 text-emerald-400 mt-0.5 shrink-0" />
                      <span>Jumlah tidak boleh melebihi 1000 USDT per transaksi.</span>
                    </li>
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 rounded-md border border-border px-5 py-3 font-mono text-xs text-gray-300 transition-colors hover:border-accent hover:text-accent"
                  >
                    <i className="bi bi-arrow-left" /> BACK TO INPUT
                  </button>
                  <button
                    onClick={() => {
                      setErrorDetails(null);
                      setStatus("idle");
                    }}
                    className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 font-mono text-xs font-bold text-black transition-all hover:from-amber-400 hover:to-amber-500 shadow-[0_4px_20px_rgba(251,191,36,0.2)]"
                  >
                    <i className="bi bi-arrow-counterclockwise" /> TRY AGAIN
                  </button>
                </div>
              </div>
            </main>
          </div>

          <footer className="flex h-11 w-full items-center justify-between border-t border-border bg-bg-panel/60 px-6 font-mono text-[11px]">
            <span className="text-amber-400/80">
              NETTOAI VERIFIED EXECUTION LAYER v1.0.42
            </span>
            <div className="flex items-center gap-6 text-muted">
              <span>
                Network: <span className="text-gray-300">BSC TESTNET</span>
              </span>
              <span className="text-gray-300">{shortenAddress(walletAddress)}</span>
            </div>
          </footer>
        </div>
      );

    case "confirm":
      return txData ? (
        <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-16">
          <DemoBadge />
          <div className="w-full max-w-xl rounded-lg border border-border p-8 bg-bg-panel/40">
            <SuccessScreen txData={txData} onReset={handleReset} />
          </div>
        </div>
      ) : (
        <TransactionConfirmation
          onCancel={() => setStatus("allow")}
          onConfirmSign={() => console.log("Confirmed")}
          fromAddress={shortenAddress(walletAddress)}
        />
      );

    default:
      return null;
  }
}