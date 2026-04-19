import { useEffect, useRef } from "react";
import useDebouncedValue from "./useDebouncedValue";

export default function useDebouncedListQuery(
    search: string,
    onQuery: (keyword: string) => void,
    deps: readonly unknown[] = [],
    delay = 300
) {
    const debouncedSearch = useDebouncedValue(search, delay);
    const queryRef = useRef(onQuery);

    useEffect(() => {
        queryRef.current = onQuery;
    }, [onQuery]);

    useEffect(() => {
        queryRef.current(debouncedSearch);
    }, [debouncedSearch, ...deps]);

    return debouncedSearch;
}
