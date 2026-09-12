"use client";

import { useEffect, useState } from "react";

type LandingPageProps = {
    onLaunchApp: () => void;
};

export default function LandingPage({ onLaunchApp }: LandingPageProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0B0E14] font-sans text-white">
            {/* ── Background Layers (Meniru langit 1inch) ── */}
            <div className="absolute inset-0 z-0">
                {/* Gradasi dasar langit malam */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E14] via-[#1A103C] to-[#0B0E14]" />

                {/* Cahaya nebula / aurora di belakang */}
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />

                {/* Bintang-bintang (CSS pattern sederhana) */}
                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: `radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), 
                                      radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), 
                                      radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), 
                                      radial-gradient(1.5px 1.5px at 90px 40px, #ffffff, rgba(0,0,0,0)), 
                                      radial-gradient(1px 1px at 130px 80px, #ffffff, rgba(0,0,0,0))`,
                    backgroundSize: '200px 200px'
                }} />

                {/* Siluet pegunungan di bagian bawah (opsional, bisa diganti SVG) */}
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0B0E14] to-transparent" />
            </div>

            {/* ── Navbar ── */}
            <nav className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-12 backdrop-blur-md bg-black/10 border-b border-white/5">
                <div className="flex items-center gap-3">
                    {/* Logo NettoAI */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                        <i className="bi bi-shield-fill-check text-white text-lg" />
                    </div>
                    <span className="font-display text-xl font-bold tracking-wide">
                        NETTO<span className="text-blue-400 font-light">AI</span>
                    </span>
                </div>

                {/* Menu Navigasi */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
                        Products <i className="bi bi-chevron-down text-xs" />
                    </a>
                    <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
                        Developers <i className="bi bi-chevron-down text-xs" />
                    </a>
                    <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
                        Governance <i className="bi bi-chevron-down text-xs" />
                    </a>
                    <a href="#" className="hover:text-white transition-colors">About</a>
                    <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
                        Blog <i className="bi bi-box-arrow-up-right text-xs" />
                    </a>
                </div>

                {/* Tombol Kanan */}
                <div className="flex items-center gap-4">
                    <span className="hidden sm:flex items-center gap-1 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                        <i className="bi bi-globe" /> EN
                    </span>
                    <button
                        onClick={onLaunchApp}
                        className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                    >
                        Launch dApp <i className="bi bi-arrow-right" />
                    </button>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <main className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 pt-20 pb-32 max-w-7xl mx-auto">

                {/* Sisi Kiri: Teks & Tombol */}
                <div className={`flex-1 max-w-2xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
                        One-stop access
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            to verified execution
                        </span>
                    </h1>

                    <p className="mt-6 text-lg sm:text-xl text-gray-400 font-light max-w-lg leading-relaxed">
                        NettoAI memverifikasi setiap niat on-chain Anda sebelum dieksekusi. Aman, transparan, dan didukung oleh AI.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <button
                            onClick={onLaunchApp}
                            className="flex items-center gap-2 rounded-xl bg-blue-500 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)]"
                        >
                            Launch dApp <i className="bi bi-arrow-right" />
                        </button>

                        <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30">
                            <i className="bi bi-apple text-lg" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] text-gray-400">Download on the</span>
                                <span>App Store</span>
                            </div>
                        </button>

                        <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30">
                            <i className="bi bi-google-play text-lg" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] text-gray-400">Get it on</span>
                                <span>Google Play</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Sisi Kanan: Ilustrasi (Placeholder) */}
                <div className={`hidden md:flex flex-1 justify-center items-center relative transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                    {/* Ganti div ini dengan <Image /> jika kamu punya ilustrasi 3D */}
                    <div className="relative w-[400px] h-[400px]">
                        {/* Efek glow di belakang ilustrasi */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 rounded-full blur-[80px]" />

                        {/* Placeholder ilustrasi */}
                        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                            <i className="bi bi-shield-lock-fill text-[120px] text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500 drop-shadow-[0_0_30px_rgba(56,189,248,0.5)]" />
                            <span className="mt-4 font-mono text-xs text-gray-500 tracking-widest uppercase">Guardian Model</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Footer / Trust Badges (Opsional) ── */}
            <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-md py-6">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 font-mono">
                    <span>NETTOAI VERIFIED EXECUTION LAYER v1.0.42</span>
                    <div className="flex items-center gap-6">
                        <span>Network: <span className="text-gray-300">BSC TESTNET</span></span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            System Online
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}