"use client";

type ConnectWalletProps = {
    network?: string;
    wallet?: string;
    connected?: boolean;
    latencyMs?: number;
    version?: string;
    onConnect?: () => void;
};

export default function ConnectWallet({
    network = "BSC TESTNET",
    wallet = "0x71C...A92",
    connected = true,
    latencyMs = 24,
    version = "v1.0.42",
    onConnect,
}: ConnectWalletProps) {
    const handleConnect = () => {
        if (onConnect) {
            onConnect();
            return;
        }
        // Default: wire up your wallet connection logic here (wagmi, ethers, etc.)
        console.log("Connect wallet clicked");
    };

    return (
        <main className="flex min-h-screen flex-col bg-bg">
            {/* Top nav */}
            <header className="flex h-14 w-full items-center justify-between border-b border-border bg-bg-panel/60 px-6">
                <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-extrabold tracking-tight text-accent">
                        NETTOAI
                    </span>
                    <span className="text-border">|</span>
                    <span className="font-mono text-xs text-muted">
                        Verified Execution Layer
                    </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-muted">
                    <span>
                        Network: <span className="text-gray-200">{network}</span>
                    </span>
                    <span className="text-border">|</span>
                    <span>
                        Wallet: <span className="text-gray-200">{wallet}</span>
                    </span>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1.5">
                        Connection:
                        <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-accent" : "bg-red-500"
                                }`}
                        />
                        <span className={connected ? "text-accent" : "text-red-400"}>
                            {connected ? "CONNECTED" : "DISCONNECTED"}
                        </span>
                    </span>
                </div>
            </header>

            {/* Hero / verify session */}
            <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-lg border border-accent/70 bg-bg-panel/40">
                    <i className="bi bi-unlock text-3xl text-accent" />
                </div>

                <h1 className="font-display text-4xl font-extrabold tracking-tight text-gray-100 sm:text-5xl">
                    VERIFY BEFORE YOU EXECUTE
                </h1>

                <p className="mt-5 max-w-md text-base text-muted sm:text-lg">
                    Connect your wallet to establish a secure verification session.
                </p>

                <button
                    onClick={handleConnect}
                    className="mt-10 flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-mono text-sm font-bold tracking-wide text-bg transition-colors hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                    CONNECT WALLET
                    <i className="bi bi-arrow-right" />
                </button>

                <p className="mt-5 font-mono text-xs text-muted/70">
                    Requires a Web3 compatible browser extension.
                </p>
            </section>

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
                    <span>
                        Latency: <span className="text-gray-300">{latencyMs}ms</span>
                    </span>
                </div>
            </footer>
        </main>
    );
}
