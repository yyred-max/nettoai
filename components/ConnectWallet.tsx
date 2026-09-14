"use client";

import { useState, useEffect } from "react";

type ConnectWalletProps = {
    onConnect?: (address: string) => void;
    network?: string;
    version?: string;
};

export default function ConnectWallet({
    onConnect,
    network = "BSC TESTNET",
    version = "v1.0.42",
}: ConnectWalletProps) {
    const [address, setAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMetaMask, setIsMetaMask] = useState(false);

    // Cek apakah MetaMask terpasang
    useEffect(() => {
        if (typeof window !== "undefined") {
            const ethereum = (window as any).ethereum;
            setIsMetaMask(!!ethereum?.isMetaMask);
        }
    }, []);

    // Cek koneksi yang sudah ada sebelumnya
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
            // Request account access
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });
            const account = accounts[0];
            setAddress(account);
            if (onConnect) onConnect(account);

            // Cek network (harus BSC Testnet, chainId = 97)
            const chainId = await ethereum.request({ method: "eth_chainId" });
            if (chainId !== "0x61") {
                setError("Please switch to BSC Testnet (Chain ID: 97).");
                try {
                    await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x61" }],
                    });
                } catch (switchError) {
                    // User mungkin menolak switch network
                    console.warn("Network switch rejected", switchError);
                }
            }

            // Listen for account changes
            ethereum.on("accountsChanged", (newAccounts: string[]) => {
                if (newAccounts.length > 0) {
                    setAddress(newAccounts[0]);
                    if (onConnect) onConnect(newAccounts[0]);
                } else {
                    setAddress(null);
                    if (onConnect) onConnect("");
                }
            });

            // Listen for chain changes
            ethereum.on("chainChanged", () => {
                window.location.reload();
            });
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
        <main className="flex min-h-screen flex-col bg-transparent">
            {/* Top nav */}
            <header className="flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/20 px-6 backdrop-blur-md animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 shadow-[0_0_15px_rgba(56,189,248,0.4)] animate-pulse-glow">
                        <i className="bi bi-shield-fill-check text-white text-sm" />
                    </div>
                    <span className="font-display text-xl font-bold tracking-wide text-white">
                        NETTO<span className="text-accent font-light">AI</span>
                    </span>
                    <span className="text-border mx-1">|</span>
                    <span className="font-mono text-xs text-muted/70 tracking-widest uppercase hidden sm:inline">
                        Verified Execution Layer
                    </span>
                </div>

                <div className="hidden items-center gap-3 font-mono text-xs text-white/50 md:flex">
                    <span>
                        Network: <span className="text-white">{network}</span>
                    </span>
                    <span className="text-white/20">|</span>
                    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5">
                        <span className="relative flex h-2 w-2">
                            <span
                                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${address ? "bg-emerald-400 animate-ping" : "bg-red-500"}`}
                            />
                            <span
                                className={`relative inline-flex h-2 w-2 rounded-full ${address ? "bg-emerald-400" : "bg-red-500"}`}
                            />
                        </span>
                        <span className={address ? "text-emerald-400" : "text-red-400"}>
                            {address ? "CONNECTED" : "DISCONNECTED"}
                        </span>
                    </span>
                </div>
            </header>

            {/* Hero / verify session */}
            <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
                {/* Ambient glow behind the hero */}
                <div className="pointer-events-none absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[130px] animate-pulse-glow" />

                {/* Animated shield lock with sonar rings */}
                <div className="relative mb-12 animate-scale-in">
                    <span className="sonar-ring" />
                    <span className="sonar-ring" style={{ animationDelay: "1.3s" }} />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-accent/40 bg-gradient-to-br from-white/10 to-transparent shadow-[0_0_40px_rgba(56,189,248,0.25)] animate-float">
                        <i className={`bi ${address ? "bi-shield-lock-fill" : "bi-unlock"} text-4xl text-accent`} />
                    </div>
                </div>

                <h1 className="font-display text-4xl font-light tracking-tight text-white sm:text-6xl animate-fade-in-up delay-100">
                    Verify Before You{" "}
                    <span className="font-semibold text-gradient-animated">Execute</span>
                </h1>

                <p className="mt-6 max-w-md text-base text-white/60 sm:text-lg animate-fade-in-up delay-200">
                    {address
                        ? `Session established for ${shortenAddress(address)}`
                        : "Connect your wallet to establish a secure verification session."}
                </p>

                {!isMetaMask && (
                    <p className="mt-3 text-sm text-yellow-400 animate-fade-in">
                        MetaMask not detected. Please install the extension.
                    </p>
                )}

                {error && <p className="mt-3 text-sm text-red-400 animate-fade-in">{error}</p>}

                <div className="animate-fade-in-up delay-300">
                    {address ? (
                        <button
                            onClick={disconnectWallet}
                            className="group mt-10 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-mono text-sm font-bold tracking-wide text-white transition-all hover:bg-white/10 hover:border-white/20 focus:outline-none"
                        >
                            <i className="bi bi-box-arrow-right transition-transform group-hover:translate-x-0.5" />
                            DISCONNECT WALLET
                        </button>
                    ) : (
                        <button
                            onClick={connectWallet}
                            disabled={isConnecting || !isMetaMask}
                            className="shimmer group mt-10 flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-blue-600 px-8 py-4 font-mono text-sm font-bold tracking-wide text-white transition-all hover:shadow-[0_0_35px_rgba(56,189,248,0.5)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isConnecting ? (
                                <>
                                    <i className="bi bi-arrow-repeat animate-spin-slow" />
                                    CONNECTING...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-wallet2" />
                                    CONNECT WALLET
                                    <i className="bi bi-arrow-right transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    )}
                </div>

                <p className="mt-6 font-mono text-xs text-white/30 animate-fade-in delay-500">
                    Requires a Web3 compatible browser extension.
                </p>
            </section>

            {/* Status footer */}
            <footer className="flex h-12 w-full items-center justify-between border-t border-white/5 bg-black/20 px-6 font-mono text-[11px] backdrop-blur-md animate-fade-in">
                <span className="text-accent/80 tracking-widest uppercase font-bold">
                    NettoAI Verified Execution Layer {version}
                </span>
                <div className="hidden items-center gap-6 text-white/50 sm:flex">
                    <span>
                        Network: <span className="text-white">{network}</span>
                    </span>
                    <span className="text-white">
                        {address ? shortenAddress(address) : "Not connected"}
                    </span>
                    <span className="flex items-center gap-2">
                        Latency:
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                        </span>
                        <span className="text-white">24ms</span>
                    </span>
                </div>
            </footer>
        </main>
    );
}
