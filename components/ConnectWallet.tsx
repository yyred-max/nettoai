"use client";

import { useState, useEffect } from "react";

type ConnectWalletProps = {
    onConnect?: (address: string) => void;
    onEnterDemo?: () => void;
    network?: string;
    version?: string;
};

export default function ConnectWallet({
    onConnect,
    onEnterDemo,
    network = "BSC TESTNET",
    version = "v1.0.42",
}: ConnectWalletProps) {
    const [address, setAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMetaMask, setIsMetaMask] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const ethereum = (window as any).ethereum;
            setIsMetaMask(!!ethereum?.isMetaMask);
        }
    }, []);

    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window === "undefined") return;
            const ethereum = (window as any).ethereum;
            if (!ethereum) return;
            try {
                const accounts = await ethereum.request({ method: "eth_accounts" });
                if (accounts.length > 0) {
                    setAddress(accounts[0]);
                    if (onConnect) onConnect(accounts[0]);
                }
            } catch (err) {
                console.error("Failed to check connection:", err);
            }
        };
        checkConnection();
    }, [onConnect]);

    const connectWallet = async () => {
        if (typeof window === "undefined") return;
        const ethereum = (window as any).ethereum;
        if (!ethereum) {
            setError("MetaMask not detected. Please install MetaMask extension.");
            return;
        }
        setIsConnecting(true);
        setError(null);
        try {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            const account = accounts[0];
            setAddress(account);
            if (onConnect) onConnect(account);

            const chainId = await ethereum.request({ method: "eth_chainId" });
            if (chainId !== "0x61") {
                setError("Please switch to BSC Testnet (Chain ID: 97).");
                try {
                    await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x61" }],
                    });
                } catch (switchError) {
                    console.warn("Network switch rejected", switchError);
                }
            }

            ethereum.on("accountsChanged", (newAccounts: string[]) => {
                if (newAccounts.length > 0) {
                    setAddress(newAccounts[0]);
                    if (onConnect) onConnect(newAccounts[0]);
                } else {
                    setAddress(null);
                    if (onConnect) onConnect("");
                }
            });
            ethereum.on("chainChanged", () => window.location.reload());
        } catch (err: any) {
            console.error("Connection error:", err);
            if (err.code === 4001) {
                setError("User rejected the connection request.");
            } else {
                setError("Failed to connect wallet. Please try again.");
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAddress(null);
        setError(null);
        if (onConnect) onConnect("");
    };

    const shortenAddress = (addr: string) => {
        if (!addr) return "";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <main className="flex min-h-screen flex-col bg-black">
            {/* Top nav */}
            <header className="flex h-14 w-full items-center justify-between border-b border-white/10 bg-white/5 px-6">
                <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-extrabold tracking-tight text-blue-400">
                        NETTOAI
                    </span>
                    <span className="text-white/20">|</span>
                    <span className="font-mono text-xs text-white/50">
                        Verified Execution Layer
                    </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-white/50">
                    <span>
                        Network: <span className="text-white">{network}</span>
                    </span>
                    <span className="text-white/20">|</span>
                    <span>
                        Wallet:{" "}
                        <span className="text-white">
                            {address ? shortenAddress(address) : "Not connected"}
                        </span>
                    </span>
                    <span className="text-white/20">|</span>
                    <span className="flex items-center gap-1.5">
                        Connection:
                        <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${address ? "bg-green-500" : "bg-red-500"
                                }`}
                        />
                        <span className={address ? "text-green-400" : "text-red-400"}>
                            {address ? "CONNECTED" : "DISCONNECTED"}
                        </span>
                    </span>
                </div>
            </header>

            {/* Hero / verify session */}
            <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-lg border border-blue-400/70 bg-white/5">
                    <i className="bi bi-unlock text-3xl text-blue-400" />
                </div>

                <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    VERIFY BEFORE YOU EXECUTE
                </h1>

                {/* ── Value Proposition (diperjelas) ── */}
                <p className="mt-5 max-w-2xl text-base text-white/80 sm:text-lg leading-relaxed">
                    <strong className="text-white font-semibold">
                        NettoAI memverifikasi setiap field
                    </strong>{" "}
                    dari transaksi AI-agent kamu — recipient, amount, token, chain —
                    <span className="text-blue-300"> sebelum ada satu pun yang dieksekusi on-chain.</span>
                </p>

                <p className="mt-3 max-w-xl text-sm text-white/50 leading-relaxed">
                    Bukan sekadar policy check.{" "}
                    <span className="text-blue-400 font-medium">Field-level provenance</span> memastikan
                    tidak ada nilai yang diubah oleh AI tanpa jejak.
                </p>

                {!isMetaMask && (
                    <p className="mt-4 text-sm text-yellow-400">
                        ⚠️ MetaMask not detected. You can still try Demo Mode below.
                    </p>
                )}

                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

                {address ? (
                    <button
                        onClick={disconnectWallet}
                        className="mt-10 flex items-center gap-2 rounded-md bg-white/10 px-6 py-3 font-mono text-sm font-bold tracking-wide text-white transition-colors hover:bg-white/20 focus:outline-none"
                    >
                        DISCONNECT WALLET
                    </button>
                ) : (
                    <div className="mt-10 flex flex-col items-center gap-4">
                        <button
                            onClick={connectWallet}
                            disabled={isConnecting || !isMetaMask}
                            className="flex items-center gap-2 rounded-md bg-blue-500 px-6 py-3 font-mono text-sm font-bold tracking-wide text-black transition-colors hover:bg-blue-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isConnecting ? "CONNECTING..." : "CONNECT WALLET →"}
                        </button>

                        {/* ── DEMO MODE BUTTON ── */}
                        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-white/30">
                            <span className="h-px w-10 bg-white/10" />
                            atau
                            <span className="h-px w-10 bg-white/10" />
                        </div>

                        <button
                            onClick={onEnterDemo}
                            className="group flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-3 font-mono text-sm font-bold tracking-wide text-white/90 transition-colors hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-white focus:outline-none"
                        >
                            <i className="bi bi-play-circle text-blue-400" />
                            TRY DEMO — TANPA WALLET
                            <i className="bi bi-arrow-right transition-transform group-hover:translate-x-1" />
                        </button>
                        <p className="text-[10px] text-white/40 font-mono">
                            Read-only mode · transaksi tidak akan dieksekusi
                        </p>
                    </div>
                )}

                <p className="mt-6 font-mono text-xs text-white/30">
                    {address
                        ? `Connected: ${shortenAddress(address)}`
                        : "Requires a Web3 compatible browser extension."}
                </p>
            </section>

            {/* Status footer */}
            <footer className="flex h-11 w-full items-center justify-between border-t border-white/10 bg-white/5 px-6 font-mono text-[11px]">
                <span className="text-blue-400">
                    NETTOAI VERIFIED EXECUTION LAYER {version}
                </span>
                <div className="flex items-center gap-6 text-white/50">
                    <span>
                        Network: <span className="text-white">{network}</span>
                    </span>
                    <span className="text-white">
                        {address ? shortenAddress(address) : "Not connected"}
                    </span>
                    <span>
                        Latency: <span className="text-white">24ms</span>
                    </span>
                </div>
            </footer>
        </main>
    );
}