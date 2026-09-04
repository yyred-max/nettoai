// components/Header.tsx
export function Header() {
    return (
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
            <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">🛡 NettoAI</span>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">MVP</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <a href="#" className="hover:text-white transition">Docs</a>
                    <a href="#" className="hover:text-white transition">How it works</a>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono">
                        0x742D...8F21
                    </span>
                </div>
            </div>
        </header>
    );
}