// components/SuccessScreen.tsx
export function SuccessScreen({ txData, onReset }: { txData: { txHash: string; block: number }; onReset: () => void }) {
    return (
        <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold">Transaction Executed</h2>
            <p className="text-gray-400">Transaction sent successfully</p>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-400">Transaction Hash</span>
                    <span className="font-mono text-xs truncate max-w-[200px]">{txData.txHash}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Block</span>
                    <span className="font-mono">{txData.block}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Network</span>
                    <span>BSC Testnet</span>
                </div>
            </div>

            <a
                href={`https://testnet.bscscan.com/tx/${txData.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
                View on BscScan ↗
            </a>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left text-sm">
                <h4 className="font-semibold text-gray-400 mb-2">NettoAI Audit</h4>
                <ul className="space-y-1 text-green-400">
                    <li>✅ Intent verified</li>
                    <li>✅ Policy verified</li>
                    <li>✅ Provenance checked</li>
                    <li>✅ Transaction executed</li>
                </ul>
            </div>

            <button
                onClick={onReset}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
                Check another
            </button>
        </div>
    );
}