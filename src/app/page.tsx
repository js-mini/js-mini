import Image from "next/image";

export default function HomePage() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Jewelshot®"
            width={64}
            height={64}
            className="rounded-lg"
            priority
          />
        </div>
        <h1 className="text-xl font-semibold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>
          Jewelshot®
        </h1>
        <p className="max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
          Mücevher fotoğraflarınızı Jewelshot® ile profesyonel{" "}
          <span className="whitespace-nowrap">e-ticaret</span> görsellerine dönüştürün.
        </p>
      </div>
    </div>
  );
}
