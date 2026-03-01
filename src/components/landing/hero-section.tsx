import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, ArrowRight } from "lucide-react";

export async function HeroSection() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-zinc-900">
            {/* Vercel-style subtle top grid background */}
            <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
                    backgroundSize: '4rem 4rem',
                    maskImage: 'linear-gradient(to bottom, white, transparent 70%)'
                }}
            />

            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#D4AF37]/5 blur-[120px] rounded-[100%] pointer-events-none z-0" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">

                {/* Pill announcement */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-[13px] mb-8 hover:bg-zinc-800 transition-colors backdrop-blur-md cursor-pointer">
                    <Sparkles size={14} className="text-[#D4AF37]" />
                    <span>Yeni: Bileklik ve Küpe Desteği Eklendi</span>
                    <ArrowRight size={14} className="ml-1 text-zinc-500" />
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.05] mb-6">
                    Mücevherlerinizi <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-500">
                        Kusursuzlaştırın.
                    </span>
                </h1>

                <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-normal font-normal">
                    Telefonunuzla çektiğiniz amatör mücevher fotoğraflarını, yapay zeka ile
                    saniyeler içinde stüdyo kalitesinde e-ticaret görsellerine dönüştürün.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                    {user ? (
                        <Link href="/studio">
                            <Button size="lg" variant="primary" className="w-full sm:w-auto min-w-[160px]">
                                Stüdyoya Git
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/register">
                                <Button size="lg" variant="primary" className="w-full sm:w-auto min-w-[160px]">
                                    Ücretsiz Başla
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[160px]">
                                    Giriş Yap
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                <div className="mt-12 flex items-center justify-center gap-6 text-sm text-zinc-500 font-medium">
                    <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-zinc-500" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Kredi Kartı Gerekmez
                    </div>
                    <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-zinc-500" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        1 Ücretsiz Deneme
                    </div>
                </div>

            </div>
        </section>
    );
}
