"use client";

import { useState } from "react";
import ConnectWallet from "@/components/ConnectWallet";
import IntentInput from "@/components/IntentInput";
import LoadingState from "@/components/LoadingState";
import AgentActionDetail from "@/components/AgentActionDetail";
import ProvenanceTable from "@/components/ProvenanceTable";
import NettoResult from "@/components/NettoResult";
import TransactionConfirmation from "@/components/TransactionConfirmation";
import ErrorScreen from "@/components/ErrorScreen";

type UIStatus =
  | "connect"
  | "idle"
  | "loading"
  | "action_detail"
  | "provenance"
  | "allow"
  | "blocked"
  | "confirm"
  | "error";

type ResultData = {
  status: "ALLOW" | "BLOCKED";
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
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleCheck = async (userInput: string) => {
    setIntent(userInput);
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "NettoAI check failed");
      setResultData(data);
      setStatus(data.status === "ALLOW" ? "action_detail" : "blocked");
    } catch (err: any) {
      setError(err.message);
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
      if (!res.ok) throw new Error(data.error || "Execution failed");
      console.log("TX Hash:", data.txHash);
      setStatus("confirm");
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setResultData(null);
    setError(null);
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

    case "confirm":
      return (
        <TransactionConfirmation
          onCancel={() => setStatus("allow")}
          onConfirmSign={() => console.log("Confirmed")}
          fromAddress={shortenAddress(walletAddress)}
        />
      );

    case "error":
      return <ErrorScreen error={error} onReset={handleReset} />;

    default:
      return null;
  }
}