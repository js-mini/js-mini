// uploadFile — tek bir File'ı /api/upload'a gönderir ve sonucu döndürür.
// Önceden executeGeneration içinde 4 kez tekrarlanan upload bloğunun
// tek yetkili kaynağı.

type UploadResult = {
    falUrl: string;
    inputStoragePath: string;
};

/**
 * Verilen dosyayı /api/upload'a POST eder.
 * Başarılı olursa { falUrl, inputStoragePath } döndürür.
 * Başarısız olursa null döndürür (hata fırlatmaz — çağıran karar verir).
 */
export async function uploadFile(file: File): Promise<UploadResult | null> {
    const formData = new FormData();
    formData.append("file", file);

    let res: Response;
    try {
        res = await fetch("/api/upload", { method: "POST", body: formData });
    } catch {
        // Network error
        return null;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.falUrl) return null;

    return {
        falUrl: data.falUrl as string,
        inputStoragePath: data.inputStoragePath as string,
    };
}
