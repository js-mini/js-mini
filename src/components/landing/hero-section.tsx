import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, ArrowRight } from "lucide-react";

export async function HeroSection() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background gradients */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-[600px] h-[600px] rounded-full bg-[#D4AF37]/10 blur-[120px]" />
                <div className="absolute w-[800px] h-[800px] rounded-full bg-[#D4AF37]/5 blur-[150px] translate-x-1/3 -translate-y-1/3" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium mb-8 backdrop-blur-sm">
                    <Sparkles size={14} className="text-[#D4AF37]" />
                    <span>Yeni: Bileklik ve Küpe Desteği Eklendi</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white leading-[1.1] mb-6">
                    Mücevherlerinizi <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                        Kusursuzlaştırın.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                    Telefonunuzla çektiğiniz amatör mücevher fotoğraflarını, gelişmiş
                    yapay zeka teknolojimizle saniyeler içinde büyüleyici, profesyonel
                    e-ticaret görsellerine dönüştürün.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                    {user ? (
                        <Link href="/studio">
                            <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2">
                                Stüdyoya Git
                                <ArrowRight size={18} />
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/register">
                                <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2">
                                    Hemen Başla
                                    <ArrowRight size={18} />
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button size="lg" variant="glass" className="w-full sm:w-auto">
                                    Giriş Yap
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                <div className="mt-12 flex items-center justify-center gap-6 text-sm text-zinc-500 font-medium">
                    <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#D4AF37]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        Kredi Kartı Gerekmez
                    </div>
                    <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#D4AF37]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        1 Ücretsiz Deneme
                    </div>
                </div>

            </div>
        </section>
    );
}
