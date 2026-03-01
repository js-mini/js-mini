import { getRecentGenerations } from "@/lib/gallery/actions";
import { MasonryGrid } from "@/components/gallery/masonry-grid";

export const metadata = {
    title: "Galeri - JewelShot",
    description: "Geçmiş üretimlerinizi görüntüleyin.",
};

export default async function GalleryPage() {
    // Fetch latest generations on the server-side
    const { data: images, error } = await getRecentGenerations(30);

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
            {error && (
                <div className="p-4 mx-4 mt-4 text-sm text-center rounded-md" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--error)" }}>
                    {error}
                </div>
            )}

            <MasonryGrid images={images || []} />
        </div>
    );
}
