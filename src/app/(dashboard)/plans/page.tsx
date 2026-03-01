import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Check, Zap, Sparkles, Gem } from "lucide-react";
import { createCheckoutAction } from "@/lib/payments/actions";

const PLANS = [
    {
        id: "pro",
        name: "Pro",
        description: "Az kullananlar ve butikler için ideal başlangıç.",
        price: "75$",
        billingSuffix: "/ay",
        credits: 25,
        visuals: 25,
        unitPrice: "3.00$",
        features: [
            "Aylık 25 Görsel Üretimi",
            "Tüm Takı Kategorilerine Erişim",
            "Yapay Zeka Destekli Stüdyo Çekimi",
            "Ticari Kullanım Lisansı"
        ],
        icon: Zap,
        popular: false,
    },
    {
        id: "studio",
        name: "Studio",
        description: "Düzenli içerik üreten markalar ve tasarımcılar için.",
        price: "125$",
        billingSuffix: "/ay",
        credits: 50,
        visuals: 50,
        unitPrice: "2.50$",
        features: [
            "Aylık 50 Görsel Üretimi",
            "Sınırsız Stil ve Metal Seçimi",
            "Gelişmiş Aydınlatma Kontrolü",
            "Öncelikli Üretim Sırası",
            "Ticari Kullanım Lisansı"
        ],
        icon: Sparkles,
        popular: false,
    },
    {
        id: "founder",
        name: "Founder",
        badge: "Sadece 25 Kişi",
        description: "Sürekli üretim yapan büyük markalar ve ajanslar için.",
        price: "149$",
        billingSuffix: "/ay",
        credits: 100,
        visuals: 100,
        unitPrice: "1.49$",
        features: [
            "Aylık 100 Görsel Üretimi",
            "Detaylı 8K, 14K, 18K, 22K Renk Seçimi",
            "Kusursuz Zincir ve Yansıma Kontrolü",
            "VIP Sistem Önceliği",
            "Öncelikli Destek"
        ],
        icon: Gem,
        popular: true,
    }
];

export default async function PlansPage({ searchParams }: { searchParams: { error?: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

    return (
        <div className="flex-1 w-full h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                        Kredi Paketleri
                    </h1>
                    {searchParams?.error === "invalid_invite_code" && (
                        <div className="mb-4 p-4 rounded-xl font-medium text-sm border-l-4" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "#ef4444" }}>
                            Girdiğiniz davetiye kodu geçersiz. Founder paketi yalnızca sınırlı davetlilere açıktır.
                        </div>
                    )}
                    {searchParams?.error === "invalid_package" && (
                        <div className="mb-4 p-4 rounded-xl font-medium text-sm border-l-4" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "#ef4444" }}>
                            Seçilen paket geçersiz, lütfen sayfayı yenileyip tekrar deneyin.
                        </div>
                    )}
                    <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                        Jewelshot® ile kusursuz profesyonel takı fotoğrafları üretmek için ihtiyacınız olan paketi seçin.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Mevcut Krediniz:</span>
                        <span className="text-md font-bold text-amber-500">{profile?.credits || 0}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {PLANS.map((plan) => {
                        const Icon = plan.icon;
                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${plan.popular ? 'shadow-xl' : 'shadow-sm'
                                    }`}
                                style={{
                                    backgroundColor: "var(--bg-primary)",
                                    border: `2px solid ${plan.popular ? "var(--text-primary)" : "var(--border)"}`,
                                }}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-bold uppercase tracking-wider rounded-full whitespace-nowrap">
                                        ÖZEL DAVETİYE ALANI
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "var(--bg-secondary)" }}>
                                        <Icon size={24} style={{ color: plan.popular ? "var(--text-primary)" : "var(--text-secondary)" }} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                        {plan.name}
                                        {plan.badge && (
                                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-tertiary)", border: "1px solid var(--border)" }}>
                                                {plan.badge}
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm min-h-[40px]" style={{ color: "var(--text-secondary)" }}>{plan.description}</p>
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>{plan.price}</span>
                                    <span className="text-lg" style={{ color: "var(--text-tertiary)" }}>{plan.billingSuffix}</span>
                                </div>

                                <div className="flex flex-col gap-1 mb-8 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-zinc-400">Görsel Hakkı</span>
                                        <span className="text-sm font-semibold text-zinc-200">{plan.visuals} Adet</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-zinc-400">Görsel Başına Maliyet</span>
                                        <span className="text-sm font-semibold text-zinc-200">{plan.unitPrice}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-zinc-400">Tanımlanacak Kredi</span>
                                        <span className="text-sm font-semibold text-amber-500">{plan.credits} Kredi</span>
                                    </div>
                                </div>

                                <ul className="flex flex-col gap-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check size={18} className="mt-0.5 shrink-0" style={{ color: "var(--success)" }} />
                                            <span className="text-sm leading-tight" style={{ color: "var(--text-secondary)" }}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <form action={createCheckoutAction} className="flex flex-col gap-3">
                                    <input type="hidden" name="packageId" value={plan.id} />

                                    {plan.id === "founder" && (
                                        <input
                                            type="text"
                                            name="inviteCode"
                                            placeholder="Davetiye Kodu"
                                            required
                                            className="w-full px-4 py-3 rounded-xl text-sm transition-all text-center uppercase tracking-widest font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:font-normal"
                                            style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                                        />
                                    )}

                                    <button
                                        type="submit"
                                        className={`w-full py-4 rounded-xl text-sm font-semibold transition-colors flex justify-center items-center gap-2`}
                                        style={
                                            plan.popular
                                                ? { backgroundColor: "var(--text-primary)", color: "var(--bg-primary)" }
                                                : { backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }
                                        }
                                    >
                                        {plan.id === "founder" ? "Davetiye ile Katıl" : "Satın Al"}
                                    </button>
                                </form>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 text-center max-w-2xl mx-auto">
                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                        Tüm ödemeleriniz Creem.io altyapısı ile %100 güvenli bir şekilde olarak gerçekleştirilmektedir. Kredileriniz hesabınıza anında tanımlanır.
                    </p>
                </div>
            </div>
        </div>
    );
}
