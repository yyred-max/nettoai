"use client";

import { useEffect, useState } from "react";
import ConnectWallet from "@/components/ConnectWallet";
import IntentInput from "@/components/IntentInput";
import LoadingState from "@/components/LoadingState";
import AgentActionDetail from "@/components/AgentActionDetail";
import ProvenanceTable from "@/components/ProvenanceTable";
import NettoResult from "@/components/NettoResult";
import TransactionConfirmation from "@/components/TransactionConfirmation";

type UIStatus =
  | "connect"
  | "idle"
  | "loading"
  | "action_detail"
  | "provenance"
  | "allow"
  | "blocked"
  | "confirm";

export default function Home() {
  const [status, setStatus] = useState<UIStatus>("connect");
  const [intent, setIntent] = useState("");

  // Demo only: auto-advance past the loading screen after a short delay.
  // Replace with real pipeline polling / websocket updates.
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("action_detail"), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  switch (status) {
    case "connect":
      return <ConnectWallet onConnect={() => setStatus("idle")} />;

    case "idle":
      return (
        <IntentInput
          onCheck={(value) => {
            setIntent(value);
            setStatus("loading");
          }}
        />
      );

    case "loading":
      return <LoadingState />;

    case "action_detail":
      return (
        <AgentActionDetail
          userIntent={intent || "Send 50 USDT to Alice"}
          onBack={() => setStatus("idle")}
          onViewProvenance={() => setStatus("provenance")}
        />
      );

    case "provenance":
      return (
        <ProvenanceTable
          userInput={intent || "Send 50 USDT to Alice"}
          onBack={() => setStatus("action_detail")}
          // Replace with the real ALLOW/BLOCKED decision from the pipeline.
          onContinue={() => setStatus("allow")}
        />
      );

    case "allow":
      return (
        <NettoResult
          result="allowed"
          userIntent={intent || "Send 50 USDT to Alice"}
          onEditIntent={() => setStatus("idle")}
          onViewDetails={() => setStatus("action_detail")}
          onConfirmExecute={() => setStatus("confirm")}
        />
      );

    case "blocked":
      return (
        <NettoResult
          result="blocked"
          userIntent={intent || "Send 50 USDT to Alice"}
          onViewDetails={() => setStatus("provenance")}
          onTryAgain={() => setStatus("idle")}
        />
      );

    case "confirm":
      return (
        <TransactionConfirmation
          onCancel={() => setStatus("allow")}
          onConfirmSign={() => {
            // Next: submit the signed transaction, then show a success/error screen.
            console.log("Transaction confirmed & signed");
          }}
        />
      );

    default:
      return null;
  }
}
