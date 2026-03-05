import { fal } from "@fal-ai/client";

if (!process.env.FAL_KEY) {
    console.error("[SECURITY BOOT] FAL_KEY is not set. All AI generation calls will fail.");
}

fal.config({
    credentials: process.env.FAL_KEY ?? "",
});

export { fal };
