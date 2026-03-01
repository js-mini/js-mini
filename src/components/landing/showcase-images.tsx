"use client";

import Image from "next/image";

const IMAGES = [
    "https://images.unsplash.com/photo-1599643478514-4a4843477196?auto=format&fit=crop&q=80&w=600&h=800", // Ring
    "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&q=80&w=600&h=800", // Necklace
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600&h=800", // Diamond
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600&h=800", // Luxury Jewelry
    "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=600&h=800", // Earring
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&q=80&w=600&h=800", // More rings
];

export function ShowcaseImages() {
    return (
        <section className="py-16 pb-32 overflow-hidden relative bg-black">
            {/* Edge gradient masks to blend with the dark background */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

            <div className="flex gap-4 md:gap-6 w-max animate-marquee" style={{ animation: "marquee 40s linear infinite" }}>
                {/* Double the array for seamless infinite scroll */}
                {[...IMAGES, ...IMAGES].map((src, index) => (
                    <div
                        key={index}
                        className="relative w-[200px] h-[260px] md:w-[280px] md:h-[360px] rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-900 group"
                    >
                        <Image
                            src={src}
                            alt="Jewelshot® processed jewelry"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 200px, 280px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                            <span className="px-2 py-1 bg-black/80 backdrop-blur-md rounded border border-zinc-700 text-[10px] text-zinc-300 font-medium uppercase tracking-wider">
                                Önce
                            </span>
                            <span className="px-2 py-1 bg-white rounded border border-transparent text-[10px] text-black font-semibold uppercase tracking-wider">
                                Sonra
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom CSS for marquee animation inline */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
        </section>
    );
}
