// components/IntentVsActionTable.tsx
export function IntentVsActionTable({ intent, action }: { intent: any; action: any }) {
    const fields = [
        { name: 'Recipient', intentValue: intent.recipient, actionValue: action.recipient },
        { name: 'Amount', intentValue: `${intent.maxAmount} ${intent.token}`, actionValue: `${action.amount} ${action.token}` },
        { name: 'Token', intentValue: intent.token, actionValue: action.token },
        { name: 'Chain ID', intentValue: intent.chainId, actionValue: action.chainId },
    ];

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                <h4 className="text-sm font-semibold">Intent vs Action</h4>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-white/5 text-gray-400">
                        <tr>
                            <th className="px-4 py-2 text-left">Field</th>
                            <th className="px-4 py-2 text-left">Your Intent</th>
                            <th className="px-4 py-2 text-left">AI Proposal</th>
                            <th className="px-4 py-2 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {fields.map((field) => {
                            const match = field.intentValue === field.actionValue;
                            return (
                                <tr key={field.name}>
                                    <td className="px-4 py-2 font-medium">{field.name}</td>
                                    <td className="px-4 py-2 font-mono text-xs truncate max-w-[150px]">{field.intentValue}</td>
                                    <td className="px-4 py-2 font-mono text-xs truncate max-w-[150px]">{field.actionValue}</td>
                                    <td className="px-4 py-2 text-center">
                                        {match ? (
                                            <span className="text-green-400">✅ Match</span>
                                        ) : (
                                            <span className="text-red-400">❌ Mismatch</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}