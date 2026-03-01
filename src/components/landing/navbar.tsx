import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function LandingNavbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-black/60 border-b border-zinc-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-9 h-9 overflow-hidden rounded-md transition-transform group-hover:scale-[1.02]">
                            <Image
                                src="/logo.png"
                                alt="Jewelshot®"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-[21px] font-bold tracking-tight text-white flex items-end">
                            Jewelshot<sup className="text-[10px] text-zinc-500 mb-1 ml-[1px]">®</sup>
                        </span>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link href="/studio">
                                <Button variant="outline" size="sm">Stüdyoya Git</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden sm:block text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                                    Giriş Yap
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary" size="sm">Ücretsiz Başla</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
