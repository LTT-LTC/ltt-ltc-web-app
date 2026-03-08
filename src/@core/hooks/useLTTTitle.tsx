import { useEffect } from "react"

const useLTTTitle = (title: string) => {
    useEffect(() => {
        document.title = title;
    }, [title]);
}

export default useLTTTitle;