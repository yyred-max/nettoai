// components/ErrorScreen.tsx
export function ErrorScreen({ error, onReset }: { error: string | null; onReset: () => void }) {
    return (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
            <p className="text-red-400">❌ {error || 'An unknown error occurred'}</p>
            <button
                onClick={onReset}
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
                Try Again
            </button>
        </div>
    );
}