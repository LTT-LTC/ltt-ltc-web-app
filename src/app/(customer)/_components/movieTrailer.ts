export const extractYoutubeVideoId = (trailerUrl?: string) => {
    if (!trailerUrl) {
        return "";
    }

    const trimmed = trailerUrl.trim();

    const directMatch = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/i);
    if (directMatch?.[1]) {
        return directMatch[1];
    }

    const embedMatch = trimmed.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/i);
    if (embedMatch?.[1]) {
        return embedMatch[1];
    }

    try {
        const url = new URL(trimmed);
        const queryId = url.searchParams.get("v");
        if (queryId) {
            return queryId;
        }

        const pathSegments = url.pathname.split("/").filter(Boolean);
        const shortId = pathSegments.at(-1);
        if (shortId && /^[A-Za-z0-9_-]{6,}$/.test(shortId)) {
            return shortId;
        }
    } catch {
        const fallbackMatch = trimmed.match(/([A-Za-z0-9_-]{6,})$/);
        if (fallbackMatch?.[1]) {
            return fallbackMatch[1];
        }
    }

    return "";
};
