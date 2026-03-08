'use client';

import { useState } from "react";

const useLTTInitLoading = (isLoading: boolean) => {
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    if (!isLoading && !hasLoadedOnce) {
        setHasLoadedOnce(true);
    }

    return isLoading && !hasLoadedOnce;
};

export default useLTTInitLoading;