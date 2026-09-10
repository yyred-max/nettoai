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
  /**
   * ALLOW     → Guardian lulus, menunggu konfirmasi eksekusi user
   * BLOCKED   → Guardian menolak (policy / risk violation)
   * NO_ACTION → Agent tidak memanggil tool (bukan keputusan keamanan)
   */
  status: "ALLOW" | "BLOCKED" | "NO_ACTION";
  decisionId: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasons: string[];
  intent: any;
  action: any;
  provenance: any;
};

export default function Home() {
  const [status, setStatus] = useState<UIStatus>("connect");
  const [intent, setIntent] = useState("");
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [txData, setTxData] = useState<{ txHash: string; block: number } | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ message: string; note?: string; txHash?: string } | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleCheck = async (userInput: string) => {
    setIntent(userInput);
    setStatus("loading");
    setErrorDetails(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
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
    try {
      const res = await fetch("/api/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        // ── Auto Reconciliation fallback ─────────────────────────────────────
        // Jika request gagal atau 409 (misal broadcast_pending atau timeout),
        // poll endpoint /api/agent/status untuk cek apakah txHash sudah tersimpan.
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
          txHash: data.txHash
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

  switch (status) {
    case "connect":
      return (
        <ConnectWallet
          onConnect={(address) => {
            setWalletAddress(address || null);
            if (address) setStatus("idle");
          }}
        />
      );

    case "idle":
      return <IntentInput onCheck={handleCheck} wallet={walletAddress ?? undefined} />;

    case "loading":
      return <LoadingState message="NettoAI is analyzing..." wallet={walletAddress ?? undefined} />;

    case "action_detail":
      return resultData ? (
        <AgentActionDetail
          userIntent={intent}
          action={resultData.action}
          intentData={resultData.intent}
          onBack={() => setStatus("idle")}
          onViewProvenance={() => setStatus("provenance")}
          wallet={walletAddress ?? undefined}
        />
      ) : null;

    case "provenance":
      return resultData ? (
        <ProvenanceTable
          provenance={resultData.provenance}
          onBack={() => setStatus("action_detail")}
          onContinue={() => setStatus("allow")}
          wallet={walletAddress ?? undefined}
        />
      ) : null;

    case "allow":
      return resultData ? (
        <NettoResult
          result="allowed"
          data={resultData}
          onEditIntent={() => setStatus("idle")}
          onViewDetails={() => setStatus("action_detail")}
          onConfirmExecute={() => handleExecute(resultData.decisionId)}
          wallet={walletAddress ?? undefined}
        />
      ) : null;

    case "blocked":
      return resultData ? (
        <NettoResult
          result="blocked"
          data={resultData}
          onViewDetails={() => setStatus("provenance")}
          onTryAgain={handleReset}
          wallet={walletAddress ?? undefined}
        />
      ) : null;

    case "no_action":
      return (
        <ErrorScreen
          error={
            resultData?.reasons?.[0] ||
            "Agent did not produce a transfer action. Try rephrasing your request using the format: \"Send <amount> <TOKEN> to <address>\""
          }
          onReset={handleReset}
        />
      );

    case "confirm":
      return txData ? (
        <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-16">
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
        <ErrorScreen 
          error={errorDetails?.message || null} 
          note={errorDetails?.note}
          txHash={errorDetails?.txHash}
          onReset={handleReset} 
        />
      );

    default:
      return null;
  }
}