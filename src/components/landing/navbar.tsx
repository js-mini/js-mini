import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function LandingNavbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-black/50 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 overflow-hidden rounded-xl transition-transform group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="Jewelshot®"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Jewelshot<sup className="text-[10px] text-zinc-500">®</sup>
                        </span>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link href="/studio">
                                <Button variant="primary">Stüdyoya Git</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden sm:block">
                                    <Button variant="ghost">Giriş Yap</Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary">Ücretsiz Başla</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
