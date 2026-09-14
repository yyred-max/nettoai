"use client";

import { useState } from "react";
import ConnectWallet from "@/components/ConnectWallet";
import IntentInput from "@/components/IntentInput";
import LoadingState from "@/components/LoadingState";
import AgentActionDetail from "@/components/AgentActionDetail";
import ProvenanceTable from "@/components/ProvenanceTable";
import NettoResult from "@/components/NettoResult";
import TransactionConfirmation from "@/components/TransactionConfirmation";
import { SuccessScreen } from "@/components/SuccessScreen";
import ErrorScreen from "@/components/ErrorScreen";

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

/** Alamat demo — read-only, tidak ada private key di baliknya */
const DEMO_WALLET_ADDRESS = "0x742D35Cc6634C0532925a3b844Bc9e7598F0b048";

export default function Home() {
  const [status, setStatus] = useState<UIStatus>("connect");
  const [intent, setIntent] = useState("");
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [txData, setTxData] = useState<{ txHash: string; block: number } | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ message: string; note?: string; txHash?: string } | null>(null);
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

    // ── DEMO MODE: simulasikan eksekusi tanpa panggil API ──
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

    // ── NORMAL MODE ──
    try {
      const res = await fetch("/api/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        const statusRes = await fetch(`/api/agent/status?decisionId=${decisionId}`).catch(() => null);
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

  const shortenAddress = (addr: string | null) => {
    if (!addr) return "0x...";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  /** Badge DEMO MODE yang muncul di semua halaman setelah connect */
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

    case "no_action":
      return (
        <>
          <DemoBadge />
          <ErrorScreen
            error={
              resultData?.reasons?.[0] ||
              'Agent did not produce a transfer action. Try rephrasing your request using the format: "Send <amount> <TOKEN> to <address>"'
            }
            onReset={handleReset}
          />
        </>
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

    case "error":
      return (
        <>
          <DemoBadge />
          <ErrorScreen
            error={errorDetails?.message || null}
            note={errorDetails?.note}
            txHash={errorDetails?.txHash}
            onReset={handleReset}
          />
        </>
      );

    default:
      return null;
  }
}