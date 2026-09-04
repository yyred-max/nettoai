// components/RiskScoreRing.tsx
export function RiskScoreRing({ score, level }: { score: number; level: string }) {
    const color = level === 'CRITICAL' ? 'text-red-500' : level === 'HIGH' ? 'text-orange-500' : 'text-green-500';
    const percentage = Math.min(score, 100);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-24 h-24">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-700" />
                    <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        className={color}
                        strokeDasharray="263.89"
                        strokeDashoffset={263.89 * (1 - percentage / 100)}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">{score}</span>
            </div>
            <span className={`text-xs font-semibold mt-1 ${color}`}>{level}</span>
        </div>
    );
}